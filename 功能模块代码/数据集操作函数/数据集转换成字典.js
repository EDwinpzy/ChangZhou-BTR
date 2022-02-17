/*
 * @Author: EDwin
 * @Date: 2021-12-30 08:56:46
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-17 11:09:08
 */
/**
 * @description: 将数据集转换成字典MAP
 * @param {object[string]} primaryKey - 主键名数组
 * @param {object[object]} dataSet - 数据集
 * @return {map} 返回字典，若失败则返回false
 */
function toMap(primaryKey, dataSet) {
    if (primaryKey.length > 0) {
        var map = {};
        dataSet.forEach(function (item) {
            var key = '';
            for (var i = 0; i < primaryKey.length; i++) {
                key += item[primaryKey[i]];
            }
            map[key] = item;
        });
        return map;
    } else {
        return fales;
    }
}
