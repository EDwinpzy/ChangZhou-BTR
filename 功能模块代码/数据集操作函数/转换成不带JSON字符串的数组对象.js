/*
 * @Author: EDwin
 * @Date: 2022-01-11 09:46:24
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-17 15:37:24
 */
/**
 * @description: 将带JSON字符串的数据集转换成能直接在数据网格展示的数据集
 * @param {object[object]} dataSet - 需要更新的数据集
 * @param {object[]} field - JSON字符串字段名 ['私有成员对象字段名1'， ...]
 * @return {object[object]} 成功则返回数据集，失败返回false
 */
function JSON_to_dataSet(dataSet, field) {
    debugger;
    try {
        for (var i = 0; i < dataSet.length; i++) {
            field.forEach(function (item) {
                var obj = JSON.parse(dataSet[i][item]);
                delete dataSet[i][item];
                for (var key in obj) {
                    if (dataSet[i][key] != undefined) throw '键名重复！';
                    dataSet[i][key] = obj[key];
                }
            });
        }

        return dataSet;
    } catch (e) {
        console.log(e);
        return false;
    }
}
