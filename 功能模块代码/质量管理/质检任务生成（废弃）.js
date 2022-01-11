/*
 * @Author: EDwin
 * @Date: 2021-12-10 13:39:42
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-01-11 16:53:43
 * @FilePath: \负极二期\功能模块代码\质检任务生成.js
 */
/**
 * @description: 实现生成原材料质检任务，半成品取样任务，半成品质检任务，成品取样任务，成品质检任务函数
 * @param {Number} taskType - 任务类型 1：原材料质检 2：半成品取样 3：半成品质检 4：成品取样 5：成品质检
 * @param {string} exesponsor - 发起人
 * @param {object[]} info - 传入的原材料/半成品/成品信息(数组对象)
    *                         [{
                                    ERPorder: 'ERP订单号（若为原材料质检则该字段为ERP采购订单号）',
                                    ERPbatch: 'ERP批次号（一个ERP订单号对应多个ERP批次号，ERP批次号和MES批次号/ 制令单号/配比单号/工单号一一对应）（原材料则为ERP原材料大批次，成品则为根据MES大批次项ERP申请的ERP成品批次号）',
                                    jobID: '制令单号/配比单号（工单号，MES大批次号）----与MES大批次号一一对应（若为原材料则该字段为空）',
                                    jobIDS: '小批次号(若质检规则为首检则该参数为空)（原材料小批次或投料小批次）',
                                    rule: '质检规则 1：全检 2：首检',(若不传入则默认为全检)
                                    exesponsorv: '发起人',
                                    remark: '备注',
                                    ****************************若为原材料质检需要加入如下对象******************************
                                    privateTaskObj: {
                                        taskid: '入库单号',
                                        starttime: '入库时间',
                                        supplierName: '供应商名称',
                                        supplierNumber: '供应商代码',
                                        WLMC: '物料名称',
                                        stockcode: '物料代码',
                                        stockmodel: '物料型号',
                                        GGXH: '规格类型',
                                        GYSPCH: '供应商批次号',
                                    }
                                    ***********************若为半成品取样/半成品质检/成品取样/成品质检需要加入如下字段***************************
                                   privateTaskObj: {
                                        processpath: '工序名称',
                                        line: '产线',
                                        station: '站点',
                                        supplierNumber: '设备名称',
                                        productCode: '产品代码',
                                   }
                                }, ...]    
 * @param {object} rule - 质检规则 1：全检 2：首检  {type: 2, intervalNum：10, integer：1}质检规则为首检，每10个小批次取第一个小批次进行质检，向下取整 type：质检规则，intervalNum：取样间隔，integer：取整规则（1为向下取整，2为向上取整）  {type: 1}质检规则为全检
 * @return {number} {errorCode: 0, message: ''}
 */
function QCtaskGenrate(taskType, exeCutor, info) {
    //数据库表完整路径名称(必须包含数据库名称)['质检实时任务表', '质检结果表', '质检项表', '库存批次信息表', 'ERP采购订单接口表']
    var dataBase = ['[dbo].[QC_RealTimeTask]', '[dbo].[QC_result]', '[dbo].[QC_testitem]', '[dbo].[storage_batch]'];
    try {
        var result = {
            errorCode: 0,
            message: '',
        };
        var nowData = $Function.GetDataTimeFunc(); //获取任务生成时间
        QC_testitem = $Function.toDataSet;
        /*************************生成质检任务单****************************** */
        var field = []; //字段名数组
        for (var key in info[0]) {
            field.push(key);
        }
        var sqlStr = `INSERT INTO ${dataBase[0]} (${field.join(',')}, taskid, tasktype) VALUES `;
        info.forEach(function (item) {
            var value = [];
            field.forEach(function (key) {
                if (key == privateTaskObj) item[key] = JSON.stringify(item[key]); //私有成员对象转换成JSON字符串
                value.push("'" + item[key] + "'");
                value.push("'" + $Function.getID(taskType + 1) + "'");
                value.push("'" + taskType + "'");
            });
            sqlStr += `(${value.join(',')}),`;
        });
        sqlStr.substring(0, sqlStr.length - 1);
        var res = $Function.toDataSet($System.BTR, sqlStr);
        if (!res) throw '原材料质检任务生成失败！';
        var taskNum;
        //查询任务次数和ERP批次号
        var res = {};
        $Function.toDataSet($System.BTR, `SELECT (SELECT COUNT(smallBatch) FROM '${dataBase[1]}' WHERE taskType = '${taskType}') AS Num, (SELECT ERPbatch FROM '${dataBase[2]}' WHERE BTRbigBatch = '${bigBatch}' OR BTRsmallBatch = '${smallBatch}') AS ERPbatch`);
        if (res.errorCode != 0) throw '查询质检任务失败！';
        var data = res.data.records;
        taskNum = data[0].Num + 1;
        var sqlStr = `INSERT INTO '${dataBase[0]}' ([taskid], [tasktype], [taskstatus], [starttime], [exeCutor], [smallBatch], [bigBatch], [privateTaskObj], [taskNum], [rule], [ERPbatch]) VALUES `;
        if (rule.type == 1) {
            //质检规则为全检，不考虑大批次，对所有输入的小批次生成取样和质检任务
            sqlStr += `('${taskId}', '${taskType}', 0, '${nowData}', '${exeCutor}', '${smallBatch}', ${bigBatch}, '${JSON.stringify(privateTaskObj)}', '${taskNum}', '${rule.type}', '${res.records[0].ERPbatch}')`;
            $Function.toDataSet($System.BTR, 1, sqlStr, res);
            if (res.errorCode != 0) throw '生成质检任务失败！' + sqlStr;
        } else if (rule.type == 2) {
            //质检规则为首检，从大批次中按质检规则抽取未质检的小批次，生成质检任务
            $Function.toDataSet($System.BTR, 1, `SELECT * FROM '${dataBase[2]}' WHERE BTRbigBatch = '${bigBatch}' AND QCresult == '' ORDER BY 包号`, res);
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
                $Function.toDataSet($System.BTR, 1, sqlStr, res);
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
