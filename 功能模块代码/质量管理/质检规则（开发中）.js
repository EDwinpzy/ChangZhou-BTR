/*
 * @Author: EDwin
 * @Date: 2022-01-12 10:44:10
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-12 13:43:11
 */
/**
 * @description:
 * @param {object} rule - 质检规则 1：全检 2：首检  {type: 2, intervalNum：10, integer：1}质检规则为首检，每10个小批次取第一个小批次进行质检，向下取整 type：质检规则，intervalNum：取样间隔，integer：取整规则（1为向下取整，2为向上取整）  {type: 1}质检规则为全检
 * @return {*}
 */

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
