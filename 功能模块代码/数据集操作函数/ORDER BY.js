/*
 * @Author: EDwin
 * @Date: 2021-12-30 08:58:57
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-31 10:54:34
 */
/**
 * @description: 排序，实现ORDER BY功能
 * @param {object[object]} dataSet - 数据集
 * @param {object[object]} field - 排序字段及规则 [{name: '字段名1', rule: 'ASC'}, {name: '字段名2', rule: 'DESC'}]
 * @return {object[]} 数组对象
 */
function sqlOrder(dataSet, field) {
    var resData = [];
    for (var i = 0; i < field; i++) {
        resData = dataSet.sort(function (a, b) {
            if (field[i].rule === 'ASC') {
                return a[field[i].name] > b[field[i].name] ? 1 : a[field[i].name] < b[field[i].name] ? -1 : 0;
            } else if (field[i].rule === 'DESC') {
                return a[field[i].name] > b[field[i].name] ? -1 : a[field[i].name] < b[field[i].name] ? 1 : 0;
            }
        });
    }
    return resData;
}
