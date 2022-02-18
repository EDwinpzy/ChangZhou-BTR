/*
 * @Author: EDwin
 * @Date: 2022-01-19 16:04:18
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 15:47:28
 */
/**
 * @type: KC请求式脚本
 * @description: 手动生成一条入库任务下发至WMS入库指令接口表中
 * @param {object[object]} InParam.inInfo - 入库信息 [{jobIDS: '小批次号', orderType: '10（正常入库） 20（退料入库）', beginLocation: '开始地址'}, ...]
 * @return {boolean}
 */
function WMS_outTask(InParam, OutParam, RequestID, Token) {
    var inInfo = InParam.inInfo;
    var dataBase = ['[dbo].[WMS_instore_order]', '[dbo].[storage_batch]', '[dbo].[storage_task]', '[dbo].[get_history]'];
    var inOrder = []; //入库指令数组对象

    try {
        var jobIDS_arr = [];
        inInfo.forEach(function (item) {
            jobIDS_arr.push("'" + item.jobIDS + "'");
        });
        //查库存表
        var storage_batch = toDataSet(global.BTR, `SELECT * FROM ${dataBase[1]} WHERE jobIDS IN (${jobIDS_arr.join(',')})`);
        if (!storage_batch) throw '库存信息查询失败！';
        storage_batch = toMap(['jobIDS'], storage_batch); //转换成字典
        //查出入库任务表中的入库任务
        var WMS_outstore_order = toDataSet(global.BTR, `SELECT * FROM ${dataBase[0]} WHERE Package_Code IN (${jobIDS_arr.join(',')}) AND in_or _out = 1`); //查询该小批次的入库任务
        if (!WMS_outstore_order) throw 'WMS入库指令接口表查询失败！';
        //查生产工单历史表get_history
        var get_history = toDataSet(global.BTR, `SELECT * FROM ${dataBase[3]} WHERE jobID IN (${jobIDS_arr.join(',')})`); //查询该小批次的入库任务
        if (!get_history) throw '该小批次' + jobIDS_arr + '未生产完成！无法入库！';
        get_history = toMap(['jobIDS'], get_history); //转换成字典
        var existOrder = [];
        inInfo.forEach(function (item) {
            var a = dataFilter(WMS_outstore_order, [{ field: 'Package_Code', value: item, match: '=' }]);
            if (a.length > 0) {
                //若WMS入库指令表中有该小批次的入库指令，则不重复生成入库指令，做提示
                var obj = { taskID: a[0].Order_Code, jobIDS: a[0].Package_Code };
                existOrder.push(obj);
            } else {
                //若不存在该小批次指令，则插入该小批次入库指令
                var QCresult;
                if (storage_batch[item.jobIDS].QCresult == 0 || storage_batch[item.jobIDS].QCresult == 3) {
                    //待检状态
                    QCresult = '10';
                } else if (storage_batch[item.jobIDS].QCresult == 1) {
                    //合格状态
                    QCresult = '00';
                } else if (storage_batch[item.jobIDS].QCresult == 2) {
                    //不合格状态
                    QCresult = '20';
                }
                var outTaskObj = {
                    Order_Code: getID(3),
                    Order_Type: item.orderType,
                    Item_No: storage_batch[item.jobIDS].stockcode,
                    Package_Code: item.jobIDS,
                    Erp_Batch: storage_batch[item.jobIDS].ERPbatch,
                    Batch_No: storage_batch[item.jobIDS].jobID,
                    SecondBatch_No: storage_batch[item.jobIDS].jobIDS,
                    Produced_Date: get_history[item.jobIDS].actualDateTime,
                    Plan_Number: '1.00',
                    Quality_Request: QCresult,
                    Begin_Location: item.beginLocation,
                    End_Location: 'A1001',
                };
                inOrder.push(outTaskObj);
            }
        });
        var res = SqlInsert(inOrder, dataBase[0]);
        if (!res) throw 'WMS入库指令插入失败！';
        OutParam.result = true;
    } catch (e) {
        logWrite(dirname, text);
        OutParam.result = false;
        OutParam.message = e;
    } finally {
        if (existOrder.length > 0) {
            var id;
            var taskID;
            existOrder.forEach(function (item) {
                id += item.jobIDS + ',';
                taskID += item.taskID + ',';
            });
            OutParam.tip = '小批次号为：' + id + '的物料已存在出库任务，出库单号为：' + taskID;
        }
        endResponse(RequestID);
    }
}
