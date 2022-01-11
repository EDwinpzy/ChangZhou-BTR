/*
 * @Author: EDwin
 * @Date: 2022-01-11 09:46:24
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-01-11 10:03:10
 */
/**
 * @description: 将数据集转换成带JSON字符串的数据集
 * @param {object[object]} dataSet - 需要更新的数据集
 * @param {object[string]} field - JSON字符串字段名['XXXX', 'XXXXXX', .....]
 * @return {object[object]} 成功则返回数据集，失败返回false
 */
function JSON_to_dataSet(dataSet, field) {
    try {
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
