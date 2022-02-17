/*
 * @Author: EDwin
 * @Date: 2022-01-19 16:04:33
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-17 17:46:49
 */
/**
 * @description: 手动生成一条出库任务下发至WMS出库指令接口表中
 * @param {object[object]} InParam.outInfo - 出库信息 [{jobIDS: '小批次号', endLocation: '结束地址'}, ...]
 * @return {boolean}
 */
function WMS_outTask(InParam, OutParam, RequestID, Token) {
    var outInfo = InParam.outInfo;
    var dataBase = ['[dbo].[WMS_outstore_order]', '[dbo].[storage_batch]', '[dbo].[storage_task]'];
    var outOrder = []; //出库指令数组对象

    try {
        var jobIDS_arr = [];
        outInfo.forEach(function (item) {
            jobIDS_arr.push("'" + item.jobIDS + "'");
        });
        //查库存表
        var storage_batch = toDataSet(global.BTR, `SELECT * FROM ${dataBase[1]} WHERE jobIDS IN (${jobIDS_arr.join(',')})`);
        if (!storage_batch) throw '库存信息查询失败！';
        storage_batch = toMap(['jobIDS'], storage_batch); //转换成字典
        //查出入库任务表中的入库任务
        var WMS_outstore_order = toDataSet(global.BTR, `SELECT * FROM ${dataBase[0]} WHERE Package_Code IN (${jobIDS_arr.join(',')}) AND in_or _out = 2`); //查询该小批次的出库任务
        if (!WMS_outstore_order) throw 'WMS出库指令接口表查询失败！';
        var existOrder = [];
        outInfo.forEach(function (item) {
            var a = dataFilter(WMS_outstore_order, [{ field: 'Package_Code', value: item, match: '=' }]);
            if (a.length > 0) {
                //若WMS出库指令表中有该小批次的出库指令，则不重复生成出库指令，做提示
                var obj = { taskID: a[0].Order_Code, jobIDS: a[0].Package_Code };
                existOrder.push(obj);
            } else {
                //若不存在该小批次指令，则插入该小批次出库指令
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
                    Order_Type: '20',
                    Item_No: storage_batch[item.jobIDS].stockcode,
                    Package_Code: item.jobIDS,
                    Plan_Number: '1.00',
                    Quality_Request: QCresult,
                    Begin_Location: 'A1001',
                    End_Location: item.endLocation,
                    Sync_Time: GetDataTimeFunc(),
                };
                outOrder.push(outTaskObj);
            }
        });
        var res = SqlInsert(outOrder, dataBase[0]);
        if (!res) throw 'WMS出库指令插入失败！';
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
