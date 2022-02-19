/*
 * @Author: EDwin
 * @Date: 2022-01-18 13:58:11
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-19 17:20:45
 */
/**
 * @type: KP周期性脚本
 * @description: 轮询WMS_instore_order表，若有新的入库指令，则在前端页面做提示，放在定时器脚本中执行
 * @param {*}
 * @return {*}
 */
var dataBase = ['[dbo].[WMS_in_require]'];
try {
    var res = $Function.toDataSet($System.BTR, `SELECT Package_Code FROM ${dataBase[0]}`);
    if (!res) throw '入库请求表查询失败！';
    $System.入库请求任务 = JSON.stringify(res);
    return true;
} catch (e) {
    console.log(e);
    return false;
}
