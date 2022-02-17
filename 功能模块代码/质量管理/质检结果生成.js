/*
 * @Author: EDwin
 * @Date: 2022-01-12 13:54:33
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-17 17:56:01
 */
/**
 * @description: 根据自动判定标识生成质检结果，在手动输入质检项结果，或接收质检中心传过来的质检项结果后，自动生成质检项结果和质检任务结果。
 * @param {string} InParam.taskId - 质检任务ID
 * @param {object} InParam.QC_testitem_result 质检项检测结果
                *                      [{
                                            testvalue: '检测值',
                                            result: '质检项检测结果（0为不合格1为合格）',
                                            innerCode: '质检项内码',
                                        }, {}, {}, ...]
 * @param {number} InParam.taskResult - 质检任务结果 0：不合格 1：合格 若省略该参数，则按照自动判定规则生成质检任务结果
 * @return {boolean} 成功返回true，失败返回false并在控制台打印错误信息
 */
function QCresultGenerate(InParam, OutParam, RequestID, Token) {
    var taskId = InParam.taskId;
    var QC_testitem_result = InParam.QC_testitem_result;
    var taskResult = InParam.taskResult;
    //数据库配置信息['质检结果表']
    var dataBase = ['[dbo].[QC_result]', '[dbo].[QC_RealTimeTask]'];
    try {
        var QC_result = toDataSet(global.BTR, `SELECT * FROM ${dataBase[0]} WHERE taskid = '${taskId}`); //获取当前质检任务结果表信息
        if (!QC_result) throw '质检任务' + taskId + '不存在！';
        QC_RealTimeTask = JSON_to_dataSet(QC_RealTimeTask, ['privateTaskObj']);
        var WL_PDFLAG = QC_result[0].WL_PDFLAG; //物料自动判定标识
        if (WL_PDFLAG == 0) throw '该质检任务对应的物料不需要自动判定！';
        var QC_testitem_result_map = toMap(['innerCode'], QC_testitem_result);
        var QC_result_map = toMap(['innerCode'], QC_result);
        var QCresult = 1; //若所有必须的质检项都已有检测结果则为0，否则为1
        var taskstatus = 3;
        //将传入的质检项结果和查询出来的质检项结果数据集做对比和合并
        for (var innerCode in QC_result_map) {
            if (QC_testitem_result_map[innerCode] != undefined) {
                QC_result_map[innerCode].testvalue = QC_testitem_result_map[innerCode].testvalue;
                //质检项需要自动判定,且传入的质检项检测值不为空
                if (QC_result_map[innerCode].PDFLAG == 1 && QC_testitem_result_map[innerCode].testvalue != '' && QC_testitem_result_map[innerCode].testvalue != undefined) {
                    var upper_limit = QC_result_map[innerCode].upper_limit == undefined || QC_result_map[innerCode].upper_limit == '' ? Infinity : QC_result_map[innerCode].upper_limit; //若上限值没有则赋值无穷大
                    var lower_limit = QC_result_map[innerCode].lower_limit == undefined || QC_result_map[innerCode].lower_limit == '' ? -Infinity : QC_result_map[innerCode].lower_limit; //若下限值没有则赋值无穷小
                    //若在范围内则赋值质检结果为1，否则为0
                    if (QC_testitem_result_map[innerCode].testvalue > lower_limit && QC_testitem_result_map[innerCode].testvalue < upper_limit) {
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
            if (QC_result_map[innerCode].mustFlag == 1 && (QC_result_map[innerCode].result == '' || QC_result_map[innerCode].result == undefined)) {
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
        //判断是否传入质检任务结果
        taskResult == undefined ? 1 : (QCresult = taskResult);
        //质检任务更新语句
        var task_sqlStr = `UPDATE ${dataBase[1]} SET taskstatus = ${taskstatus}, exeCutor = '系统自动判定', endtime = '${GetDataTimeFunc()}', QCresult = ${QCresult}`;
        //质检项结果更新语句
        for (var innerCode in QC_result_map) {
            var testitem_sqlStr = `UPDATE ${dataBase[0]} SET testvalue = '${QC_result_map[innerCode].testvalue}', result = ${QC_result_map[innerCode].result} WHERE taskid = '${taskId}' AND innerCode = '${innerCode}'`;
            var res = toDataSet(global.BTR, testitem_sqlStr);
            if (!res) throw '质检项' + innerCode + '结果更新失败！';
        }
        var res = toDataSet(global.BTR, task_sqlStr);
        if (!res) throw '质检任务' + taskId + '结果更新失败！';

        //质检结果回传,若有质检任务结果则执行回传函数
        if (QCresult) {
            //质检回传信息
            var QC_RealTimeTask = toDataSet(global.BTR, `SELECT * FROM ${dataBase[1]} WHERE taskid = '${taskId}`); //获取当前质检任务表信息
            if (!QC_RealTimeTask) throw '质检任务信息获取失败！质检结果未推送！';
            var QCinfo = {
                stockcode: QC_RealTimeTask.stockcode == undefined ? QC_RealTimeTask.productCode : QC_RealTimeTask.stockcode,
                jobID: QC_RealTimeTask.tasktype == 1 ? QC_RealTimeTask.ERPbatch : QC_RealTimeTask.jobID, //若为成品/半成品则是MES大批次，若为原材料则是ERP大批次
                jobIDS: QC_RealTimeTask.jobIDS,
                QCresult: QCresult,
            };
            var res = QCresultBack(QCinfo);
            if (!res) throw '质检结果推送失败！';
        }
        OutParam.result = true;
    } catch (e) {
        logWrite(dirname, text);
        OutParam.result = false;
        OutParam.message = e;
    } finally {
        endResponse(RequestID);
    }
}
