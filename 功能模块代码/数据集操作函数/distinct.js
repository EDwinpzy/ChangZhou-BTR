/*
 * @Author: EDwin
 * @Date: 2021-12-30 08:59:47
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-14 18:26:19
 */
/**
 * @description: 数据去重，代替sql中的distinct
 * @param {object[object]} dataSet - 数据集数组对象
 * @param {object[]} field - 需要去重的字段名称['字段名', ...]
 * @return {object[]} 数组对象
 */
function sqlDistinct(dataSet, field) {
    debugger;
    var map = {};
    var resData = [];
    for (var i = 0; i < dataSet.length; i++) {
        var key = '';
        field.forEach(function (item) {
            key += dataSet[i][item];
        });
        if (map[key] === undefined) {
            map[key] = 1;
            resData.push(dataSet[i]);
        }
    }
    return resData;
}
