/*
 * @Author: EDwin
 * @Date: 2021-12-10 13:39:42
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-01-04 14:23:43
 * @FilePath: \负极二期\功能模块代码\质检任务生成.js
 */
/**
 * @description: 实现生成原材料质检任务，半成品取样任务，半成品质检任务，成品取样任务，成品质检任务函数
 * @param {Number} taskType - 任务类型 1：原材料质检 2：半成品取样 3：半成品质检 4：成品取样 5：成品质检
 * @param {string} exeCutor - 当前步骤执行人
 * @param {string} bigBatch - 大批次号(若质检规则为全检则该参数为空)
 * @param {string} smallBatch - 小批次号(若质检规则为首检则该参数为空)
 * @param {object} privateTaskObj - 质检任务私有成员对象，根据任务类型需要存入不同的数据
 *                              原材料质检：入库单号，入库时间，供应商名称，供应商代码，物料名称，物料代码，物料型号，规格类型
 *                              半成品取样：工序名称，产线，站点，设备名称，产品代码
 *                              半成品质检：工序名称，产线，站点，设备名称，产品代码
 *                              成品取样：工序名称，产线，站点，设备名称，产品代码
 *                              成品质检：工序名称，产线，站点，设备名称，产品代码
 * @param {object} rule - 质检规则 1：全检 2：首检  {type: 2, intervalNum：10, integer：1}质检规则为首检，每10个小批次取第一个小批次进行质检，向下取整 type：质检规则，intervalNum：取样间隔，integer：取整规则（1为向下取整，2为向上取整）  {type: 1}质检规则为全检
 * @return {number} {errorCode: 0, message: ''}
 */
function QCtaskGenrate(taskType, exeCutor, bigBatch, smallBatch, privateTaskObj, rule) {
    var result = {
        errorCode: 0,
        message: '',
    };
    var dataBase = ['[dbo].[QC_RealTimeTask]', '[dbo].[QC_HistoryTask]', '[dbo].[storage_batch]']; //数据库表完整路径名称(必须包含数据库名称)，第一张表为实时任务表，第二张表为历史任务表，第三张表为原材料批次信息表
    var taskId = $Function.getID(taskType + 1); //根据任务类型获取任务ID号
    var nowData = $Function.GetDataTimeFunc();
    var taskNum;
    try {
        //查询任务次数和ERP批次号
        var res = {};
        SyncSQLExecute($System.BTR, 0, `SELECT (SELECT COUNT(smallBatch) FROM '${dataBase[1]}' WHERE taskType = '${taskType}') AS Num, (SELECT ERPbatch FROM '${dataBase[2]}' WHERE BTRbigBatch = '${bigBatch}' OR BTRsmallBatch = '${smallBatch}') AS ERPbatch`, res);
        if (res.errorCode != 0) throw '查询质检任务失败！';
        var data = res.data.records;
        taskNum = data[0].Num + 1;
        var sqlStr = `INSERT INTO '${dataBase[0]}' ([taskid], [tasktype], [taskstatus], [starttime], [exeCutor], [smallBatch], [bigBatch], [privateTaskObj], [taskNum], [rule], [ERPbatch]) VALUES `;
        if (rule.type == 1) {
            //质检规则为全检，不考虑大批次，对所有输入的小批次生成取样和质检任务
            sqlStr += `('${taskId}', '${taskType}', 0, '${nowData}', '${exeCutor}', '${smallBatch}', ${bigBatch}, '${JSON.stringify(privateTaskObj)}', '${taskNum}', '${rule.type}', '${res.records[0].ERPbatch}')`;
            SyncSQLExecute($System.BTR, 1, sqlStr, res);
            if (res.errorCode != 0) throw '生成质检任务失败！' + sqlStr;
        } else if (rule.type == 2) {
            //质检规则为首检，从大批次中按质检规则抽取未质检的小批次，生成质检任务
            SyncSQLExecute($System.BTR, 1, `SELECT * FROM '${dataBase[2]}' WHERE BTRbigBatch = '${bigBatch}' AND QCresult == '' ORDER BY 包号`, res);
            if (res.errorCode != 0) throw sqlStr + '执行失败！';
            //样本数量
            var sampleNum = res.data.records.length;
            //样本数量小于待检数量
            if (sampleNum < rule.content) {
                return 0;
            } else {
                var taskNum;
                switch (rule.integer) {
                    //向下取整
                    case 1:
                        taskNum = Math.floor(sampleNum / rule.intervalNum);
                        break;
                    //向上取整
                    case 2:
                        taskNum = Math.ceil(sampleNum / rule.intervalNum);
                        break;
                }
                for (var i = 0; i < taskNum; i++) {
                    sqlStr += `('${taskId}', '${taskType}', 0, '${nowData}', '${exeCutor}', '${result1.records[rule.intervalNum * i]}', ${bigBatch}, '${privateTaskObj}', '${taskNum}', '${rule.type}'), `;
                }
                sqlStr.substring(0, sqlStr.length - 2);
                SyncSQLExecute($System.BTR, 1, sqlStr, res);
                if (res.errorCode != 0) throw '生成质检任务失败！' + sqlStr;
            }
        }
    } catch (e) {
        result.errorCode = 1;
        result.message = e;
    } finally {
        return result;
    }
}
