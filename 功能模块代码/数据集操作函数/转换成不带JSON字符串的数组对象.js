/*
 * @Author: EDwin
 * @Date: 2022-01-11 09:46:24
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-14 15:36:19
 */
/**
 * @description: 将带JSON字符串的数据集转换成能直接在数据网格展示的数据集
 * @param {object[object]} dataSet - 需要更新的数据集
 * @param {object[]} field - JSON字符串字段名 {'私有成员字段名1': ['字段名1', '字段名2', '', ...], '私有成员字段名2': ['字段名3', '字段名4', '', ...], ...}
 * @return {object[object]} 成功则返回数据集，失败返回false
 */
function JSON_to_dataSet(dataSet, field) {
    try {
        for (var key in field) {
            var obj = {};
            field[key].forEach(function (item) {
                obj[item] = dataSet[item];
                delete dataSet[item];
            });
            dataSet[key] = JSON.stringify(obj);
        }
        dataSet.forEach(function (item) {
            field.forEach(function (objField) {
                var obj = JSON.parse(item[objField]);
                for (var key in obj) {
                    item[key] = obj[key];
                }
            });
        });
        return dataSet;
    } catch (e) {
        console.log(e);
        return false;
    }
}
