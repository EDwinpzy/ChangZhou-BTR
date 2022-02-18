/*
 * @Author: EDwin
 * @Date: 2021-12-30 08:59:35
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 18:13:28
 */
/**
 * @type: KP自定义函数
 * @description: 聚合函数，分组统计，实现GROUP BY SUM功能
 * @param {object[object]} dataSet - 数据集
 * @param {object[]} sumField - 需要求和名且保留展示的字段
 * @param {object[]} groupField - 需要分组的字段名（GROUP BY后的字段名称）
 * @return {object[]} 数组对象
 */
function sqlGroupby(dataSet, sumField, groupField) {
    try {
        var map = {};
        var resData = [];
        for (var i = 0; i < dataSet.length; i++) {
            var key = '';
            groupField.forEach(function (item) {
                if (dataSet[i][item] === undefined) throw item + '字段名未定义！';
                key += dataSet[i][item];
            });
            if (map[key] === undefined) {
                if (sumField.length <= 0) throw '求和数组参数不能为空！';
                var obj = {};
                groupField.forEach(function (item) {
                    obj[item] = dataSet[i][item];
                });
                sumField.forEach(function (item) {
                    obj[item] = dataSet[i][item];
                });
                map[key] = obj;
            } else {
                sumField.forEach(function (item) {
                    map[key][item] += dataSet[i][item];
                });
            }
        }
        for (var key in map) {
            resData.push(map[key]);
        }
    } catch (e) {
        console.log(e);
        return;
    } finally {
        return resData;
    }
}
