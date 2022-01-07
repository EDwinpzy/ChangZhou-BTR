/*
 * @Author: EDwin
 * @Date: 2021-12-14 10:42:26
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-01-04 18:27:38
 */
/**
 * @description 对数据集进行筛选
 * @param {object} dataSet 数据集
 * @param {object[object]} filter - 筛选条件[{field: 字段名, value: [字段值],...}, ...]
 * @return {object} 筛选后的数组对象
 */
function dataFilter(dataSet, filter) {
    try {
        if (filter.length <= 0 || filter.length == undefined || typeof filter != Object || dataSet.length <= 0 || dataSet.length == undefined || typeof dataSet != Object) throw '输入参数有误！';
        var result = [];
        for (var j = 1; j < dataSet.length; j++) {
            for (var i = 0; i < filter.length; i++) {
                if (dataSet[j][filter[i].field] == undefined) throw filter[i].field + '字段不存在！';
                if (dataSet[j][filter[i].field] != filter[i].value) break;
                result.push(dataSet[j]);
            }
        }
        return result;
    } catch (e) {
        console.log(e);
        return false;
    }
}
