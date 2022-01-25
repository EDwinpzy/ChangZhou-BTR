/*
 * @Author: EDwin
 * @Date: 2022-01-18 13:58:11
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-21 10:56:06
 */
/**
 * @description: 轮询WMS_instore_order表，若有新的入库指令，则在前端页面做提示
 * @param {*}
 * @return {object[string]} 小批次数组
 */
function inRequire() {
    var dataBase = ['WMS_in_require'];
    try {
        var res = $Function.toDataSet($System.BTR, `SELECT * FROM ${dataBase[0]}`);
        if (!res) throw '入库请求表查询失败！';
        var arr = [];
        res.forEach(function (item) {
            arr.push(item.Package_Code);
        });
    } catch (e) {}
}
