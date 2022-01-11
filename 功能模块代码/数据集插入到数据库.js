/*
 * @Author: EDwin
 * @Date: 2022-01-10 15:10:05
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-01-11 10:24:20
 */
/**
 * @description: 将数据集插入到数据库中
 * @param {object[object]} dataSet - 需要插入的数据集
 * @param {string} dataBaseName - 数据库名称
 * @return {boolean}
 */
function SqlInsert(dataSet, dataBaseName) {
    var field = [];
    for (var key in dataSet[0]) field.push(key);
    var sqlStr = `INSERT INTO ${dataBaseName} (${field.join(',')}) VALUES `;
    dataSet.forEach(function (item) {
        var value = [];
        for (var key in item) {
            value.push("'" + item[key] + "'");
        }
        sqlStr += `(${value.join(',')}),`;
    });
    sqlStr.substring(0, sqlStr.length - 1);
    var res = $Function.toDataSet($System.BTR, sqlStr);
    return res;
}
