/*
 * @Author: EDwin
 * @Date: 2021-12-14 10:42:26
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-01-10 19:22:48
 */
/**
 * @description 对数据集进行筛选
 * @param {object} dataSet 数据集
 * @param {object[object]} filter - 筛选条件[{field: 字段名1, value: '字段值1', match: '='}, {field: 字段名2, value: '字段值2,字段值3,字段值4,...', match: 'in'}, ...]，匹配条件可为 =、!=、<、>、<=、>=、in、like（模糊查询），此处条件连接均未AND，若条件连接未OR，则使用两次该函数，将两次执行的结果合并成一个数据集即可
 * @return {object} 筛选后的数组对象
 */
function dataFilter(dataSet, filter) {
    try {
        for (var j = 0; j < filter.length; j++) {
            switch (filter[j].match) {
                case '=':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][filter[j].field] != filter[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case '!=':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][filter[j].field] == filter[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case '>':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][filter[j].field] <= filter[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case '>=':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][filter[j].field] < filter[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case '<':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][filter[j].field] >= filter[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case '<=':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][filter[j].field] > filter[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case 'like':
                    for (var i = 0; i < dataSet.length; i++) {
                        var reg = eval('/' + filter[j].value + '/ig');
                        if (!reg.test(dataSet[i][filter[j].field])) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case 'in':
                    for (var i = 0; i < dataSet.length; i++) {
                        var value = filter[j].value.split(',');
                        if (value.indexOf(dataSet[i][filter[j].field]) <= -1) {
                            dataSet.splice(i, 1);
                        }
                    }
            }
            return dataSet;
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}
