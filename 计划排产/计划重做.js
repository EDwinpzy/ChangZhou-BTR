/*
 * @Author: EDwin
 * @Date: 2022-03-03 20:40:42
 * @LastEditors: EDwin
 * @LastEditTime: 2022-03-04 15:13:44
 */
/**
 * @type:
 * @description: 计划重排
 * @param {object[string]} jobIDArr 工单数组
 * @return {*}
 */
async function rePlan(jobIDArr) {
    debugger;
    try {
        var func = require('E:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/KP自定义函数');
        var config = ['productOrder_realTime', 'put_realTime', 'get_realTime', 'materialObj'];

        //将数组内的工单号加一个''，并拼接成数组
        var field = [];
        jobIDArr.forEach(function (item) {
            field.push("'" + item + "'");
        });
        var res = await func.toDataSet('global.BTR', `DELETE FROM ${config[1]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[rePlan] 投料实时表' + config[1] + '删除失败！');

        var res = await func.toDataSet('global.BTR', `DELETE FROM ${config[2]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[rePlan] 收料实时表' + config[2] + '删除失败！');

        var res = await func.toDataSet('global.BTR', `DELETE FROM ${config[3]} WHERE jobID IN (${field.join(',')})`);
        if (res === false) throw new Error('[rePlan] 收料实时表' + config[2] + '删除失败！');

        //更新工单实时表productOrder_realTime标志位
        var res = true;
        jobIDArr.forEach((item) => {
            var res = await func.toDataSet('global.BTR', `UPDATE ${config[0]} SET status = '0', auditFlag = '0', pickFlag = '0', materialPlanFlag = '0', stationPlanFlag = '0', BOM = '', ERPGZZX = '', ERPGXMS = '', planStartTime = '', planEndTime = '', planStartDT = '0' WHERE jobID = (${item})`);
        });
        if (res === false) throw new Error('[rePlan] 工单信息表' + config[0] + '重排计划失败！更新标志位失败');
        return true;
    } catch (e) {
        // logWrite(dirname, text);
        console.log(e);
        return false;
    }
}
