/*
 * @Author: EDwin
 * @Date: 2021-12-28 15:08:31
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-29 17:49:41
 */
/**
 * @description: 工单关闭/废弃函数，更新工单信息表productOrder_realTime的标志位，并将工单信息表productOrder_realTime、投料实时表put_realTime、收料实时表get_realTime 存如历史表中，并删除实时表中的数据。
 * @param {object[string]} jobID - 制令单号/配比单号（工单号,MES批次号）
 * @param {number} mode - 0：完成后关闭 1：废弃（取消）
 * @return {object} {errorCode: 0, message: ''}
 */
function CloseProductOrder(jobID, mode) {
    try {
        var config = [
            ['productOrder_realTime', 'put_realTime', 'get_realTime'],
            ['productOrder_history', 'put_history', 'get_history'],
        ];
        var result = {
            errorCode: 0,
            message: '',
        };
        //将数组内的工单号加一个''，并拼接成数组
        var field = [];
        jobID.forEach(function (item) {
            field.push("'" + item + "'");
        });
        var status;
        if (mdoe == 0) {
            status = 3;
        } else if (mode == 1) {
            status = 4;
        } else {
            throw '输入第二个参数有误！';
        }
        //更新工单实时表productOrder_realTime标志位
        var res = $Function.toDataSet($System.BTR, `UPDATE ${config[0][0]} SET status = '${status}', realEndTime = '${$Function.GetDataTimeFunc()}' WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw '工单信息表' + config[0][0] + '标志位更新失败！';
        //将工单实时表数据插入历史表并删除原数据
        var res = $Function.toDataSet($System.BTR, `INSERT INTO ${config[1][0]} SELECT * FROM ${config[0][0]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw '工单信息历史表' + config[1][0] + '插入失败！';
        var res = $Function.toDataSet($System.BTR, `DELETE FROM ${config[0][0]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw '工单信息表' + config[0][0] + '删除失败！';
        //更新投料实时表标志位
        var res = $Function.toDataSet($System.BTR, `UPDATE ${config[0][1]} SET status = '${status}', actualDateTime = '${$Function.GetDataTimeFunc()}' WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw '投料实时表' + config[0][1] + '标志位更新失败！';
        //将投料实时表数据插入历史表并删除原数据
        var res = $Function.toDataSet($System.BTR, `INSERT INTO ${config[1][1]} SELECT * FROM ${config[0][1]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw '投料历史表' + config[1][1] + '插入失败！';
        var res = $Function.toDataSet($System.BTR, `DELETE FROM ${config[0][1]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw '投料实时表' + config[0][1] + '删除失败！';
        //更新收料实时表标志位
        var res = $Function.toDataSet($System.BTR, `UPDATE ${config[0][2]} SET status = '${status}', actualDateTime = '${$Function.GetDataTimeFunc()}' WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw '投料实时表' + config[0][2] + '标志位更新失败！';
        //将收料实时表数据插入历史表并删除原数据
        var res = $Function.toDataSet($System.BTR, `INSERT INTO ${config[1][2]} SELECT * FROM ${config[0][2]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw '收料历史表' + config[1][2] + '插入失败！';
        var res = $Function.toDataSet($System.BTR, `DELETE FROM ${config[0][2]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw '收料实时表' + config[0][2] + '删除失败！';
    } catch (e) {
        result = 1;
        result.message = e;
    } finally {
        return result;
    }
}
