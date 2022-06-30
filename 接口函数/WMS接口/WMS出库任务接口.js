/*
 * @Author: EDwin
 * @Date: 2022-01-19 16:04:33
 * @LastEditors: EDwin
 * @LastEditTime: 2022-03-15 16:38:02
 */
/**
 * @type: KC请求式脚本
 * @description: 手动生成一条出库任务下发至WMS出库指令接口表中
 * @param {object[object]} outInfo - 出库信息 [{jobIDS: '小批次号', endLocation: '结束地址'}, ...]
 * @return {boolean}
 */
async function WMS_outTask(outInfo) {
    var Func = require('e:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/KP自定义函数');
    var dataBase = ['[dbo].[WMS_outstore_order]', '[dbo].[storage_batch]', '[dbo].[storage_task]'];
    var errorCode = 0;
    try {
        var outOrder = []; //出库指令数组对象
        var jobIDS_arr = [];
        outInfo.forEach(function (item) {
            jobIDS_arr.push("'" + item.jobIDS + "'");
        });
        //查库存表
        var storage_batch = await Func.toDataSet(global.BTR, `SELECT * FROM ${dataBase[1]} WHERE jobIDS IN (${jobIDS_arr.join(',')})`);
        if (!storage_batch) throw new Error('[WMS_outTask] 库存信息查询失败！');
        if (storage_batch == '') throw new Error('[WMS_outTask] 库存中没有查询到该批次的库存信息！');
        storage_batch = Func.toMap(['jobIDS'], storage_batch); //转换成字典
        //查出出库任务表中的出库任务
        var WMS_outstore_order = await Func.toDataSet(global.BTR, `SELECT * FROM ${dataBase[0]}`); //查询是否存在该小批次的出库任务
        if (!WMS_outstore_order) throw new Error('[WMS_outTask] WMS出库指令接口表查询失败！');
        var existOrder = [];
        for (var i = 0; i < outInfo.length; i++) {
            if (WMS_outstore_order.length > 0) {
                var a = Func.dataFilter(WMS_outstore_order, [{ field: 'Package_Code', value: outInfo[i].jobIDS, match: '=' }]);
                if (a.length > 0) {
                    //若WMS出库指令表中有该小批次的出库指令，则不重复生成出库指令，做提示
                    var obj = { taskID: a[0].Order_Code, jobIDS: a[0].Package_Code };
                    existOrder.push(obj);
                } else {
                    //若不存在该小批次指令，则插入该小批次出库指令
                    var QCresult;
                    if (storage_batch[outInfo[i].jobIDS].QCresult == 1) {
                        //合格状态
                        QCresult = '00';
                    } else if (storage_batch[outInfo[i].jobIDS].QCresult == 2) {
                        //不合格状态
                        QCresult = '20';
                    } else {
                        //待检状态
                        QCresult = '10';
                    }
                    var pathId = await Func.getID(3);
                    var outTaskObj = {
                        Order_Code: pathId,
                        Order_Type: '20',
                        Item_No: storage_batch[outInfo[i].jobIDS].stockcode,
                        Package_Code: outInfo[i].jobIDS,
                        Plan_Number: '1.00',
                        Quality_Request: QCresult,
                        Begin_Location: 'A1001',
                        End_Location: outInfo[i].endLocation,
                        Sync_Time: Func.GetDataTimeFunc(),
                    };
                    outOrder.push(outTaskObj);
                }
            }
        }
        if (outOrder.length > 0) {
            var res = await Func.SqlInsert(outOrder, dataBase[0]);
            if (!res) throw new Error('[WMS_outTask] WMS出库指令插入失败！');
        }
    } catch (e) {
        // logWrite(dirname, text);
        console.log(e);
        errorCode = 1;
    } finally {
        //打印出已存在出库任务的物料批次
        if (existOrder.length > 0) {
            var id = '';
            var taskID = '';
            existOrder.forEach(function (item) {
                id += item.jobIDS + '  ';
                taskID += item.taskID + '  ';
            });
            console.log('以下批次已存在出库任务：');
            console.log('小批次号为：' + id);
            console.log('出库单号为：' + taskID);
        }
        return {
            errorCode: errorCode, //0成功 1失败
            message: existOrder,
        };
    }
}
