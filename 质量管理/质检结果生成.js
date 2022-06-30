/*
 * @Author: EDwin
 * @Date: 2022-01-12 13:54:33
 * @LastEditors: EDwin
 * @LastEditTime: 2022-05-23 14:52:19
 */
/**
 * @description: 根据自动判定标识生成质检结果，在手动输入质检项结果，或接收质检中心传过来的质检项结果后，自动生成质检项结果和质检任务结果。
 * @param {string} taskId - 质检任务ID
 * @param {object} QC_testitem_result 质检项检测结果
                *                      [{
                                            testvalue: '检测值',
                                            result: '质检项检测结果（0为不合格1为合格）',
                                            innerCode: '质检项内码',
                                        }, {}, {}, ...]
 * @param {number}  type  - 回传类型 1：原材料 2：半成品/成品
 * @param {number} taskResult - 质检任务结果 0：不合格 1：合格 若省略该参数，则按照自动判定规则生成质检任务结果
 * @return {boolean} 成功返回true，失败返回false并在控制台打印错误信息
 */
//数据库配置信息['质检结果表']
var dataBase = ['[dbo].[QC_result]', '[dbo].[QC_RealTimeTask]'];
try {
    var QC_result = $Function.toDataSet($System.BTR, `SELECT * FROM ${dataBase[0]} WHERE taskid = '${taskId}'`); //获取当前质检任务结果表信息
    if (!QC_result) throw new Error('[QCresultGenerate] 质检任务' + taskId + '不存在！');

    var WL_PDFLAG = QC_result[0].WL_PDFLAG; //物料自动判定标识
    if (taskResult !== undefined) { //不需要自动判定
        // 1. 质检任务更新
        // 2. 质检项结果更新
        // 3. 质检结果回传
        var QC_testitem_result_map = $Function.toMap(['innerCode'], QC_testitem_result);
        var QC_result_map = $Function.toMap(['innerCode'], QC_result);

        //判断是否传入质检任务结果参数
        if (taskResult === undefined) {
            throw new Error('[QCresultGenerate] 质检任务' + taskId + '无需自动判定！需要输入质检任务结果！');
        }
        var QCresult = taskResult;

        var task_sqlStr = `UPDATE ${dataBase[1]} SET taskstatus = 3, exeCutor = '${GetCurrentUser()}', endtime = '${$Function.GetDataTimeFunc()}', QCresult = '${QCresult}' where taskid = '${taskId}'`; //质检任务更新语句
        for (var innerCode in QC_result_map) {
            var testitem_sqlStr = `UPDATE ${dataBase[0]} SET testvalue = '${QC_result_map[innerCode].testvalue}', result = '${QC_result_map[innerCode].result}' WHERE taskid = '${taskId}' AND innerCode = '${innerCode}'`; //质检项结果更新语句
            var res = $Function.toDataSet($System.BTR, testitem_sqlStr);
            if (!res) throw new Error('[QCresultGenerate] 质检项' + innerCode + '结果更新失败！');
        }
        var res = $Function.toDataSet($System.BTR, task_sqlStr);
        if (!res) throw new Error('[QCresultGenerate] 质检任务' + taskId + '结果更新失败！');

        //质检结果回传,若有质检任务结果则执行回传函数
        if (QCresult !== null && QCresult !== '') {
            //质检回传信息
            var QC_RealTimeTask = $Function.toDataSet($System.BTR, `SELECT * FROM ${dataBase[1]} WHERE taskid = '${taskId}'`); //获取当前质检任务表信息
            if (!QC_RealTimeTask) throw new Error('[QCresultGenerate] 质检任务信息获取失败！质检结果未推送！');
            QC_RealTimeTask = $Function.JSON_to_dataSet(QC_RealTimeTask, ['privateTaskObj']);
            var row = $Function.toDataSet($System.BTR, `SELECT * FROM [dbo].[storage_batch] WHERE jobIDS = '${QC_RealTimeTask[0].jobIDS}'`);
            var row1 = $Function.toDataSet($System.BTR, `SELECT * FROM [dbo].[WMS_batch] WHERE jobIDS = '${QC_RealTimeTask[0].jobIDS}'`);
            if (!row) throw new Error('[QCresultGenerate] 库存表stroage_batch查询失败！');
            if (!row1) throw new Error('[QCresultGenerate] 库存表WMS_batch查询失败！');
            var system = [];
            if (row.length > 0) {
                system.push(3);
            }
            if (row1.length > 0) {
                system.push(2);
            }
            if (type == 2) {
                system.push(1);
            }
            var QCinfo = {
                stockcode: (QC_RealTimeTask[0].stockcode === undefined || QC_RealTimeTask[0].stockcode === '' || QC_RealTimeTask[0].stockcode === null) ? QC_RealTimeTask[0].productCode : QC_RealTimeTask[0].stockcode,
                jobID: QC_RealTimeTask[0].tasktype == 1 ? QC_RealTimeTask[0].ERPbatch : QC_RealTimeTask[0].jobID, //若为成品/半成品则是MES大批次，若为原材料则是ERP大批次
                jobIDS: QC_RealTimeTask[0].jobIDS,
                QCresult: QCresult,
                systematic: system,
                stocktype: type == 1 ? 1 : 2
            };
            var res = $Function.QCresultBack(QCinfo);
            if (!res) throw '质检结果推送失败！';
        }
    } else if (taskResult === undefined) { //系统自动判定
        var QC_testitem_result_map = $Function.toMap(['innerCode'], QC_testitem_result);
        var QC_result_map = $Function.toMap(['innerCode'], QC_result);
        var QCresult = 1; //若所有必须的质检项都已有检测结果则为0，否则为1
        var taskstatus = 3; //质检任务状态默认已完成
        //将传入的质检项结果和查询出来的质检项结果数据集做对比和合并
        for (var innerCode in QC_result_map) { //对质检项配置表中所有需要的质检项进行遍历，若没有传入某个质检项，则跳过
            if (QC_testitem_result_map[innerCode] != undefined) {
                QC_result_map[innerCode].result = QC_testitem_result_map[innerCode].result;
                QC_result_map[innerCode].testvalue = QC_testitem_result_map[innerCode].testvalue;
                //质检项需要自动判定,且传入的质检项检测值不为空
                if (QC_result_map[innerCode].PDFLAG == 1 && QC_testitem_result_map[innerCode].testvalue != '' && QC_testitem_result_map[innerCode].testvalue != undefined) {
                    var upper_limit = QC_result_map[innerCode].upper_limit == undefined || QC_result_map[innerCode].upper_limit == '' ? Infinity : parseFloat(QC_result_map[innerCode].upper_limit); //若上限值没有则赋值无穷大
                    var lower_limit = QC_result_map[innerCode].lower_limit == undefined || QC_result_map[innerCode].lower_limit == '' ? -Infinity : parseFloat(QC_result_map[innerCode].lower_limit); //若下限值没有则赋值无穷小
                    //若在范围内则赋值质检结果为1，否则为0
                    if (parseFloat(QC_testitem_result_map[innerCode].testvalue) > lower_limit && parseFloat(QC_testitem_result_map[innerCode].testvalue) < upper_limit) {
                        QC_result_map[innerCode].result = 1;
                    } else {
                        QC_result_map[innerCode].result = 0;
                    }
                }
            } else {
                continue;
            }
        }
        //更新任务状态和质检任务结果
        for (var innerCode in QC_result_map) {
            if (QC_result_map[innerCode].mustFlag == 1 && (QC_result_map[innerCode].result === '' || QC_result_map[innerCode].result === undefined)) {
                //若质检项必须且质检项结果为空，则任务为进行中的状态，质检任务结果为null
                QCresult = null;
                taskstatus = 2;
            } else if (QC_result_map[innerCode].mustFlag == 1 && QC_result_map[innerCode].result == 0) {
                //若质检项必须且质检项结果为不合格，则质检任务结果为0
                QCresult = 0;
            } else if (QC_result_map[innerCode].mustFlag == 0) {
                //若质检项非必须
                if (QC_result_map[innerCode].result == 0) {
                    //若质检项不合格，则质检任务也不合格
                    QCresult = 0;
                }
            }
            if (QC_testitem_result_map[innerCode] == undefined) {
                //无需更新未传入的质检项结果，所以从QC_result_map中剔除掉
                delete QC_result_map[innerCode];
            }
        }
        //判断是否传入质检任务结果参数
        taskResult == undefined ? 1 : (QCresult = taskResult);
        //质检任务更新语句
        var task_sqlStr = `UPDATE ${dataBase[1]} SET taskstatus = '${taskstatus}', exeCutor = '系统自动判定', endtime = '${$Function.GetDataTimeFunc()}', QCresult = '${QCresult === undefined ? 2 : QCresult}' where taskid = '${taskId}'`;
        //质检项结果更新语句
        for (var innerCode in QC_result_map) {
            var testitem_sqlStr = `UPDATE ${dataBase[0]} SET testvalue = '${QC_result_map[innerCode].testvalue}', result = '${QC_result_map[innerCode].result}' WHERE taskid = '${taskId}' AND innerCode = '${innerCode}'`;
            var res = $Function.toDataSet($System.BTR, testitem_sqlStr);
            if (!res) throw new Error('[QCresultGenerate] 质检项' + innerCode + '结果更新失败！');
        }
        var res = $Function.toDataSet($System.BTR, task_sqlStr);
        if (!res) throw new Error('[QCresultGenerate] 质检任务' + taskId + '结果更新失败！');

        //质检结果回传,若有质检任务结果则执行回传函数
        if (QCresult !== null && QCresult !== '') {
            //质检回传信息
            var QC_RealTimeTask = $Function.toDataSet($System.BTR, `SELECT * FROM ${dataBase[1]} WHERE taskid = '${taskId}'`); //获取当前质检任务表信息
            if (!QC_RealTimeTask) throw new Error('[QCresultGenerate] 质检任务信息获取失败！质检结果未推送！');
            QC_RealTimeTask = $Function.JSON_to_dataSet(QC_RealTimeTask, ['privateTaskObj']);
            var row = $Function.toDataSet($System.BTR, `SELECT * FROM [dbo].[storage_batch] WHERE jobIDS = '${QC_RealTimeTask[0].jobIDS}'`);
            var row1 = $Function.toDataSet($System.BTR, `SELECT * FROM [dbo].[WMS_batch] WHERE jobIDS = '${QC_RealTimeTask[0].jobIDS}'`);
            if (!row) throw new Error('[QCresultGenerate] 库存表stroage_batch查询失败！');
            if (!row1) throw new Error('[QCresultGenerate] 库存表WMS_batch查询失败！');
            var system = [];
            if (row.length > 0) {
                system.push(3);
            }
            if (row1.length > 0) {
                system.push(2);
            }
            if (type == 2) {
                system.push(1);
            }
            var QCinfo = {
                stockcode: (QC_RealTimeTask[0].stockcode === undefined || QC_RealTimeTask[0].stockcode === '' || QC_RealTimeTask[0].stockcode === null) ? QC_RealTimeTask[0].productCode : QC_RealTimeTask[0].stockcode,
                jobID: QC_RealTimeTask[0].tasktype == 1 ? QC_RealTimeTask[0].ERPbatch : QC_RealTimeTask[0].jobID, //若为成品/半成品则是MES大批次，若为原材料则是ERP大批次
                jobIDS: QC_RealTimeTask[0].jobIDS,
                QCresult: QCresult,
                systematic: system,
                stocktype: type == 1 ? 1 : 2
            };
            var res = $Function.QCresultBack(QCinfo);
            if (!res) throw '质检结果推送失败！';
        }
    }
    return true;
} catch (e) {
    console.log(e);
    return false;
}