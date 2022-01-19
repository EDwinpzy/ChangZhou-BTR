/*
 * @Author: EDwin
 * @Date: 2022-01-10 15:10:05
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-19 16:35:28
 */
/**
 * @description: 将数据集插入到数据库中
 * @param {object[object]} dataSet - 需要插入的数据集
 * @param {string} dataBaseName - 数据库名称
 * @return {boolean}
 */
function SqlInsert(dataSet, dataBaseName) {
    try {
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
        if (!res) throw 'SQL插入失败：' + sqlStr;
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
