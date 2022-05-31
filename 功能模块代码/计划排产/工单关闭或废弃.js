/*
 * @Author: EDwin
 * @Date: 2021-12-28 15:08:31
 * @LastEditors: EDwin
 * @LastEditTime: 2022-04-29 13:43:09
 */
/**
 * @type: KC请求式脚本
 * @description: 工单关闭/废弃函数，更新工单信息表productOrder_realTime的标志位，并将工单信息表productOrder_realTime、投料实时表put_realTime、收料实时表get_realTime 存如历史表中，并删除实时表中的数据。
 *               注意！！！！！只有领料单审核前的状态才能够废弃，函数不做校验，默认传入的工单号都满足废弃条件！！！！
 * @param {object[string]} jobID - 制令单号/配比单号（工单号,MES批次号）
 * @param {number} mode - 0：完成后结单 1：废弃（取消）
 * @return {boolean}
 */
function CloseProductOrder(jobID, mode) {
    try {
        //计划模块表
        var config = [
            ['productOrder_realTime', 'put_realTime', 'get_realTime'],
            ['productOrder_history', 'put_history', 'get_history'],
        ];
        var MES_dataBase = ['materialObj', 'storage_task', 'storage_batch', 'Order_information', '[192.168.0.230].[负极服务器].[dbo].[PlanMaterialBatch6_to_4]']
        //将数组内的工单号加一个''，并拼接成数组
        var field = [];
        jobID.forEach(function (item) {
            field.push("'" + item + "'");
        });
        var status;
        if (mode == 0) {
            status = 3;
        } else if (mode == 1) {
            status = 5;
            for (var i = 0; i < jobID.length; i++) {
                //更新Order_information已排产重量
                var productOrder_realTime = $Function.toDataSet($System.BTR, `SELECT * FROM ${config[0][0]} WHERE jobID = '${jobID[i]}'`);
                if (productOrder_realTime === false) throw new Error('[CloseProductOrder] 工单信息表' + config[0][0] + '查询失败！');
                var yield = parseInt(productOrder_realTime[0].yield) //工单排产重量
                var ERPorder = productOrder_realTime[0].ERPorder //ERP生产订单号
                var res = $Function.toDataSet($System.BTR, `UPDATE ${MES_dataBase[3]} SET useweight = useweight - ${yield}, Reweight = Reweight + ${yield} WHERE job = '${ERPorder}'`);
                if (res === false) throw new Error('[CloseProductOrder] 生产订单表' + MES_dataBase[3] + '重量更新失败！');
                //更新storage_batch表已排产重量
                var materialObj = $Function.toDataSet($System.BTR, `SELECT * FROM ${MES_dataBase[0]} WHERE jobID = '${jobID[i]}'`);
                if (materialObj === false) throw new Error('[CloseProductOrder] 原料批次计划表' + MES_dataBase[0] + '查询失败！');
                if (materialObj.length === 0) continue; //若还未生成原材料批次计划，则跳过该次循环
                materialObj = $Function.toMap(['materialSmallBatch'], materialObj)
                for (var key in materialObj) {
                    if (materialObj[key].ascription == 'FJ1') {
                        //四号物料
                        var res = $Function.toDataSet($System.BTR, `INSERT INTO ${MES_dataBase[4]} (PC, PC_flag) VALUES ('${key}', 'M')`);
                        if (res === false) throw new Error('[CloseProductOrder] 转移表' + MES_dataBase[4] + '插入失败！');
                    } else if (materialObj[key].ascription == 'FJ2') {
                        //六号物料
                        var weight = materialObj[key].planWeight //计划排产重量
                        var res = $Function.toDataSet($System.BTR, `UPDATE ${MES_dataBase[2]} SET preScheduledWeight = preScheduledWeight - ${weight} WHERE jobIDS = '${key}'`);
                        if (res === false) throw new Error('[CloseProductOrder] 库存表' + MES_dataBase[2] + '重量更新失败！');
                    } else {
                        throw new Error('[CloseProductOrder] 原料批次信息表' + MES_dataBase[0] + key + '物料归属为空！请检查！');
                    }
                }
            }
        } else {
            throw new Error('[CloseProductOrder] 输入参数mode有误！');
        }
        //更新工单实时表productOrder_realTime标志位
        var res = $Function.toDataSet($System.BTR, `UPDATE ${config[0][0]} SET status = '${status}', realEndTime = '${$Function.GetDataTimeFunc()}' WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[CloseProductOrder] 工单信息表' + config[0][0] + '标志位更新失败！');
        //将工单实时表数据插入历史表并删除原数据
        var res = $Function.toDataSet($System.BTR, `INSERT INTO ${config[1][0]} SELECT * FROM ${config[0][0]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[CloseProductOrder] 工单信息历史表' + config[1][0] + '插入失败！');
        var res = $Function.toDataSet($System.BTR, `DELETE FROM ${config[0][0]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[CloseProductOrder] 工单信息表' + config[0][0] + '删除失败！');
        //更新投料实时表标志位
        var res = $Function.toDataSet($System.BTR, `UPDATE ${config[0][1]} SET status = '${status}', actualDateTime = '${$Function.GetDataTimeFunc()}' WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[CloseProductOrder] 投料实时表' + config[0][1] + '标志位更新失败！');
        //将投料实时表数据插入历史表并删除原数据
        var res = $Function.toDataSet($System.BTR, `INSERT INTO ${config[1][1]} SELECT * FROM ${config[0][1]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[CloseProductOrder] 投料历史表' + config[1][1] + '插入失败！');
        var res = $Function.toDataSet($System.BTR, `DELETE FROM ${config[0][1]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[CloseProductOrder] 投料实时表' + config[0][1] + '删除失败！');
        //更新收料实时表标志位
        var res = $Function.toDataSet($System.BTR, `UPDATE ${config[0][2]} SET status = '${status}', actualDateTime = '${$Function.GetDataTimeFunc()}' WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[CloseProductOrder] 投料实时表' + config[0][2] + '标志位更新失败！');
        //将收料实时表数据插入历史表并删除原数据
        var res = $Function.toDataSet($System.BTR, `INSERT INTO ${config[1][2]} SELECT * FROM ${config[0][2]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[CloseProductOrder] 收料历史表' + config[1][2] + '插入失败！');
        var res = $Function.toDataSet($System.BTR, `DELETE FROM ${config[0][2]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[CloseProductOrder] 收料实时表' + config[0][2] + '删除失败！');
        if (mode == 1) {
            //删除materialObj表数据
            var res = $Function.toDataSet($System.BTR, `DELETE FROM ${MES_dataBase[0]} WHERE jobID IN (${field.join(',')})`);
            if (res === false) throw new Error('[CloseProductOrder] 原料批次计划表' + MES_dataBase[0] + '删除失败！');
            //更新领料单状态
            var res = $Function.toDataSet($System.BTR, `UPDATE ${MES_dataBase[1]} SET taskstatus = 2 WHERE type = 10 AND jobID IN (${field.join(',')})`);
            if (res === false) throw new Error('[CloseProductOrder] 领料单状态' + MES_dataBase[1] + '更新失败！');
        }
        return true;
    } catch (e) {
        // logWrite(dirname, text);
        console.log(e);
        return false;
    }
}