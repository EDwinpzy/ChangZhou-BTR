/*
 * @Author: EDwin
 * @Date: 2021-12-30 08:59:09
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-31 10:53:28
 */
/**
 * @type: KP自定义函数
 * @description: 数据联合，实现inner JOIN功能
 * @param {object[]} dataSetLeft - 左表数据集
 * @param {object[]} dataSetRight - 右表数据集
 * @param {object[]} field - 联合的字段['左表字段', '右表字段']
 * @return {object[]} 数组对象
 */
function sqlInnerjoin(dataSetLeft, dataSetRight, field) {
    //将右表中与左表同名的字段名称后面加个1
    var leftField = [];
    var rightField = [];
    for (var key in dataSetLeft[0]) {
        leftField.push(key);
    }
    for (var key in dataSetRight[0]) {
        rightField.push(key);
    }
    leftField.forEach(function (item) {
        for (var i = 0; i < rightField; i++) {
            if (item == rightField[i]) {
                copyTrans(dataSetRight, [{ key: rightField[i], value: rightField[i] + '1' }]);
                rightField[i] = rightField[i] + '1';
            }
        }
    });
    //将右表的字段名称加入到左表的对象键名中
    dataSetLeft.forEach(function (item) {
        for (var i = 0; i < rightField; i++) {
            item[rightField[i]] = null;
        }
    });
    var resData = [];
    dataSetLeft.forEach(function (item) {
        for (var i = 0; i < dataSetRight.length; i++) {
            //ON后面的联合条件
            if (item[field[0]] == dataSetRight[i][field[1]]) {
                flag = 1;
                //将右表对象中的值赋给左表对象
                var obj = item;
                rightField.forEach(function (key) {
                    obj[key] = dataSetRight[i][key];
                });
                resData.push(obj);
            }
        }
    });
    return resData;
}
