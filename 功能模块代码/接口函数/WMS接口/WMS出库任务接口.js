/*
 * @Author: EDwin
 * @Date: 2022-01-19 16:04:33
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-22 10:55:08
 */
/**
 * @type: KC请求式脚本
 * @description: 手动生成一条出库任务下发至WMS出库指令接口表中
 * @param {object[object]} InParam.outInfo - 出库信息 [{jobIDS: '小批次号', endLocation: '结束地址'}, ...]
 * @return {boolean}
 */
async function WMS_outTask(outInfo) {
    debugger;
    var Func = require('e:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/KP自定义函数');
    var dataBase = ['[dbo].[WMS_outstore_order]', '[dbo].[storage_batch]', '[dbo].[storage_task]'];
    try {
        var outOrder = []; //出库指令数组对象
        var jobIDS_arr = [];
        outInfo.forEach(function (item) {
            jobIDS_arr.push("'" + item.jobIDS + "'");
        });
        //查库存表
        var storage_batch = await Func.toDataSet(global.BTR, `SELECT * FROM ${dataBase[1]} WHERE jobIDS IN (${jobIDS_arr.join(',')})`);
        if (!storage_batch) throw '库存信息查询失败！';
        if (storage_batch == '') throw '库存中没有查询到该批次的库存信息！';
        storage_batch = Func.toMap(['jobIDS'], storage_batch); //转换成字典
        //查出入库任务表中的入库任务
        var WMS_outstore_order = await Func.toDataSet(global.BTR, `SELECT * FROM ${dataBase[0]}`); //查询是否存在该小批次的出库任务
        if (!WMS_outstore_order) throw 'WMS出库指令接口表查询失败！';
        var existOrder = [];
        outInfo.forEach(async function (item) {
            var a = Func.dataFilter(WMS_outstore_order, [{ field: 'Package_Code', value: item.jobIDS, match: '=' }]);
            if (a.length > 0) {
                //若WMS出库指令表中有该小批次的出库指令，则不重复生成出库指令，做提示
                var obj = { taskID: a[0].Order_Code, jobIDS: a[0].Package_Code };
                existOrder.push(obj);
            } else {
                //若不存在该小批次指令，则插入该小批次出库指令
                var QCresult;
                if (storage_batch[item.jobIDS].QCresult == 1) {
                    //合格状态
                    QCresult = '00';
                } else if (storage_batch[item.jobIDS].QCresult == 2) {
                    //不合格状态
                    QCresult = '20';
                } else {
                    //待检状态
                    QCresult = '10';
                }
                var outTaskObj = {
                    Order_Code: Func.getID(3),
                    Order_Type: '20',
                    Item_No: storage_batch[item.jobIDS].stockcode,
                    Package_Code: item.jobIDS,
                    Plan_Number: '1.00',
                    Quality_Result: QCresult,
                    Begin_Location: 'A1001',
                    End_Location: item.endLocation,
                    Sync_Time: Func.GetDataTimeFunc(),
                };
                outOrder.push(outTaskObj);
            }
        });
        var res = Func.SqlInsert(outOrder, dataBase[0]);
        if (!res) throw 'WMS出库指令插入失败！';
        return true;
    } catch (e) {
        // logWrite(dirname, text);
        console.log(e);
        return false;
    } finally {
        if (existOrder.length > 0) {
            var id;
            var taskID;
            existOrder.forEach(function (item) {
                id += item.jobIDS + ',';
                taskID += item.taskID + ',';
            });
            console.log('小批次号为：' + id + '的物料已存在出库任务，出库单号为：' + taskID);
        }
    }
}
