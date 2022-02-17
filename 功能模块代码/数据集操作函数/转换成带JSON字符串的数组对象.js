/*
 * @Author: EDwin
 * @Date: 2022-01-10 16:40:17
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-17 15:43:28
 */
/**
 * @description: 将数据集转换成带私有成员对象JSON字符串的数据集用于直接存入数据库
 * @param {object[object]} dataSet - 需要更新的数据集
 * @param {object[string]} field - JSON字符串字段名 [{field: 'privateObj', key: ['字段名1', '字段名2', ...]}, ...]
 * @return {object[object]} 成功则返回数据集，失败返回false
 */
function dataSet_to_JSON(dataSet, field) {
    debugger;
    try {
        for (var i = 0; i < dataSet.length; i++) {
            field.forEach(function (item) {
                var arrKey = item.key;
                var obj = {};
                arrKey.forEach(function (val) {
                    obj[val] = dataSet[i][val];
                    delete dataSet[i][val];
                });
                dataSet[i][item.field] = JSON.stringify(obj);
            });
        }

        return dataSet;
    } catch (e) {
        console.log(e);
        return false;
    }
}
