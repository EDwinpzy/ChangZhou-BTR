/*
 * @Author: EDwin
 * @Date: 2022-04-01 10:07:54
 * @LastEditors: EDwin
 * @LastEditTime: 2022-05-27 14:46:16
 */

/**
 * @type:
 * @description: 生成随机数GUID码
 * @param {*}
 * @return {string} GUID
 */
function Guid() {
    var guid = '';
    for (var i = 1; i <= 32; i++) {
        var n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if (i == 8 || i == 12 || i == 16 || i == 20) guid += '-';
    }
    return guid;
}
module.exports = {
    Guid,
};
/*
 * @Author: EDwin
 * @Date: 2022-02-21 11:34:51
 * @LastEditors: EDwin
 * @LastEditTime: 2022-03-11 16:33:42
 */
/**
 * @type: KP自定义函数
 * @description 对数据集进行筛选
 * @param {object} dataSet 数据集
 * @param {object[object]} filter - 筛选条件[{field: '字段名1', value: '字段值1', match: '='}, {field: 字段名2, value: '字段值2,字段值3,字段值4,...', match: 'in'}, ...]，匹配条件可为 =、!=、<、>、<=、>=、in、not in、like（模糊查询），此处条件连接均未AND，若条件连接未OR，则使用两次该函数，将两次执行的结果合并(concat)成一个数据集即可
 * @return {object} 筛选后的数组对象
 */
function dataFilter(dataSet, filter) {
    try {
        if (filter.length === undefined) throw new Error('[dataFilter]  传入参数filter类型错误！');
        var indataSet = dataSet;
        for (var j = 0; j < filter.length; j++) {
            var len = indataSet.length;
            if (filter[j].value == '全部' || filter[j].value === '') {
                continue;
            } else {
                switch (filter[j].match) {
                    case '=':
                        for (var i = len - 1; i >= 0; i--) {
                            if (indataSet[i][filter[j].field] != filter[j].value) {
                                indataSet.splice(i, 1);
                            }
                        }
                        continue;
                    case '!=':
                        for (var i = len - 1; i >= 0; i--) {
                            if (indataSet[i][filter[j].field] == filter[j].value) {
                                indataSet.splice(i, 1);
                            }
                        }
                        continue;
                    case '>':
                        for (var i = len - 1; i >= 0; i--) {
                            if (indataSet[i][filter[j].field] <= filter[j].value) {
                                indataSet.splice(i, 1);
                            }
                        }
                        continue;
                    case '>=':
                        for (var i = len - 1; i >= 0; i--) {
                            if (indataSet[i][filter[j].field] < filter[j].value) {
                                indataSet.splice(i, 1);
                            }
                        }
                        continue;
                    case '<':
                        for (var i = len - 1; i >= 0; i--) {
                            if (indataSet[i][filter[j].field] >= filter[j].value) {
                                indataSet.splice(i, 1);
                            }
                        }
                        continue;
                    case '<=':
                        for (var i = len - 1; i >= 0; i--) {
                            if (indataSet[i][filter[j].field] > filter[j].value) {
                                indataSet.splice(i, 1);
                            }
                        }
                        continue;
                    case 'like':
                        for (var i = len - 1; i >= 0; i--) {
                            var reg = eval('/' + filter[j].value + '/ig');
                            if (reg.test(indataSet[i][filter[j].field]) === false) {
                                indataSet.splice(i, 1);
                            }
                        }
                        continue;
                    case 'in':
                        for (var i = len - 1; i >= 0; i--) {
                            var value = filter[j].value.split(',');
                            var flag = 0;
                            value.forEach(function (item) {
                                if (item == indataSet[i][filter[j].field]) flag = 1;
                            });
                            if (flag === 0) indataSet.splice(i, 1);
                        }
                        continue;
                }
            }
        }
        return indataSet;
    } catch (e) {
        console.log(e);
        return false;
    }
}
/**
 * @type: KP自定义函数
 * @description: 将数据集插入到数据库中
 * @param {object[object]} dataSet - 需要插入的数据集
 * @param {string} dataBaseName - 数据库名称
 * @return {boolean}
 */
async function SqlInsert(dataSet, dataBaseName) {
    try {
        if (dataSet.constructor === Array && dataSet.length > 0) {
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
            sqlStr = sqlStr.substring(0, sqlStr.length - 1);
            var res = await toDataSet('$System.BTR', sqlStr);
            if (res === true) {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error('[SqlInsert] 传入的数据集为空或格式错误！');
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}
/**
 * @type: KP自定义函数
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
/**
 * @type: KP自定义函数
 * @description: 将带JSON字符串的数据集转换成能直接在数据网格展示的数据集
 * @param {object[object]} dataSet - 需要更新的数据集
 * @param {object[]} field - JSON字符串字段名 ['私有成员对象字段名1'， ...] (其中私有成员对象字段值格式化之后应该是一个对象而不是数组对象！)
 * @return {object[object]} 成功则返回数据集，失败返回false
 */
function JSON_to_dataSet(dataSet, field) {
    try {
        var indataSet = dataSet;
        for (var i = 0; i < indataSet.length; i++) {
            field.forEach(function (item) {
                if (indataSet[i][item] === undefined) {
                    throw new Error('[JSON_to_dataSet]  私有成员对象名' + item + '不存在！');
                } else if (indataSet[i][item] == '' || indataSet[i][item] == null) {
                    //若私有成员对象字段为空，则直接删除
                    delete indataSet[i][item];
                } else {
                    //判断私有成员对象字段是否为正确的JSON格式字符串
                    if (!isJSON(indataSet[i][item])) {
                        //throw new Error('[JSON_to_dataSet]  第' + i + '个对象JSON字符串格式不正确！' + indataSet[i][item]);
                        delete indataSet[i][item];
                    } else {
                        var obj = JSON.parse(indataSet[i][item]);
                        delete indataSet[i][item];
                        for (var key in obj) {
                            if (indataSet[i][key] != undefined) throw new Error('[JSON_to_dataSet]  第' + i + '个对象的' + key + '键名重复！');
                            indataSet[i][key] = obj[key];
                        }
                    }
                }
            });
        }

        return indataSet;
    } catch (e) {
        console.log(e);
        return false;
    }
}
/**
 * @type: KP自定义函数
 * @description: 将数据集转换成带私有成员对象JSON字符串的数据集用于直接存入数据库
 * @param {object[object]} dataSet - 需要更新的数据集
 * @param {object[string]} field - JSON字符串字段名 [{field: 'privateObj', key: ['字段名1', '字段名2', ...]}, ...]
 * @return {object[object]} 成功则返回数据集，失败返回false
 */
function dataSet_to_JSON(dataSet, field) {
    try {
        var indataSet = dataSet;
        for (var i = 0; i < indataSet.length; i++) {
            field.forEach(function (item) {
                var arrKey = item.key;
                var obj = {};
                arrKey.forEach(function (val) {
                    obj[val] = indataSet[i][val];
                    delete indataSet[i][val];
                });
                indataSet[i][item.field] = JSON.stringify(obj);
            });
        }

        return indataSet;
    } catch (e) {
        console.log(e);
        return false;
    }
}
/**
 * @type: KP自定义函数
 * @description: 数据去重，代替sql中的distinct
 * @param {object[object]} dataSet - 数据集数组对象
 * @param {object[]} field - 需要去重的字段名称['字段名', ...] 只有当所有字段值都一样时才会认为是重复项而去掉
 * @return {object[]} 数组对象
 */
function sqlDistinct(dataSet, field) {
    var map = {};
    var resData = [];
    for (var i = 0; i < dataSet.length; i++) {
        var key = '';
        field.forEach(function (item) {
            key += dataSet[i][item];
        });
        if (map[key] === undefined) {
            map[key] = 1;
            resData.push(dataSet[i]);
        }
    }
    return resData;
}
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
/**
 * @type: KP自定义函数
 * @description: 数据联合，实现inner JOIN功能
 * @param {object[]} outDataSetLeft - 左表数据集
 * @param {object[]} outDataSetRightArr - [ 右表数据集1, 右表数据集2, 右表数据集3, ... ]
 * @param {object[]} fieldArr - 联合的字段[['左表1字段', '右表1字段'], ['左表2字段', '右表2字段'], ['左表3字段', '右表3字段'], ...] (ON左右两侧的字段名)
 * @return {object[]} 数组对象
 */
function sqlInnerjoin(outDataSetLeft, outDataSetRightArr, fieldArr) {
    //存中间变量
    var dataSetLeft = outDataSetLeft;
    var dataSetRightArr = outDataSetRightArr;
    if (dataSetRightArr.length !== fieldArr.length) throw new Error('[sqlLeftjoin] 数据集数量和联合字段数量不一致！');
    if (dataSetRightArr != '' && fieldArr != '') {
        dataSetRight = dataSetRightArr[0];
        field = fieldArr[0];
        var leftField = [];
        var rightField = [];
        //保存左右数据集的键名
        for (var key in dataSetLeft[0]) {
            leftField.push(key);
        }
        for (var key in dataSetRight[0]) {
            rightField.push(key);
        }
        var resData = [];
        outside: dataSetLeft.forEach(function (leftItem) {
            inside: for (var i = 0; i < dataSetRight.length; i++) {
                //若左表和右表字段匹配则存入左表数据（ON后面的联合条件），否则存入null
                if (leftItem[field[0]] == dataSetRight[i][field[1]]) {
                    flag = 1;
                    rightField.forEach(function (key) {
                        //若字段名不重复，则直接赋值，否则字段名+’1‘后再赋值
                        if (leftItem[key] === undefined) {
                            leftItem[key] = dataSetRight[i][key];
                        } else {
                            leftItem[key + '1'] = dataSetRight[i][key];
                        }
                    });
                    resData.push(leftItem);
                } else {
                    continue inside;
                }
            }
        });
        dataSetRightArr.splice(0, 1);
        fieldArr.splice(0, 1);
        dataSetLeft = sqlInnerjoin(resData, dataSetRightArr, fieldArr);
    } else {
        return dataSetLeft;
    }
    return dataSetLeft;
}
/**
 * @type: KP自定义函数
 * @description: 数据联合，实现LEFT JOIN功能
 * @param {object[]} outDataSetLeft - 左表数据集
 * @param {object[]} outDataSetRightArr - [ 右表数据集1, 右表数据集2, 右表数据集3, ... ]
 * @param {object[]} fieldArr - 联合的字段[['左表1字段', '右表1字段'], ['左表2字段', '右表2字段'], ['左表3字段', '右表3字段'], ...] (ON左右两侧的字段名)
 * @return {object[]} 数组对象
 */
function sqlLeftjoin(outDataSetLeft, outDataSetRightArr, fieldArr) {
    //存中间变量
    var dataSetLeft = outDataSetLeft;
    var dataSetRightArr = outDataSetRightArr;
    if (dataSetRightArr.length !== fieldArr.length) throw new Error('[sqlLeftjoin] 数据集数量和联合字段数量不一致！');
    if (dataSetRightArr != '' && fieldArr != '') {
        dataSetRight = dataSetRightArr[0];
        field = fieldArr[0];
        var leftField = [];
        var rightField = [];
        //保存左右数据集的键名
        for (var key in dataSetLeft[0]) {
            leftField.push(key);
        }
        for (var key in dataSetRight[0]) {
            rightField.push(key);
        }
        var resData = [];
        outside: dataSetLeft.forEach(function (leftItem) {
            var flag = 0; //看右表中有没有和左表某一行匹配的行的标志位
            inside: for (var i = 0; i < dataSetRight.length; i++) {
                //若左表和右表字段匹配则存入左表数据（ON后面的联合条件），否则存入null
                if (leftItem[field[0]] == dataSetRight[i][field[1]]) {
                    flag = 1;
                    rightField.forEach(function (key) {
                        //若字段名不重复，则直接赋值，否则字段名+’1‘后再赋值
                        if (leftItem[key] === undefined) {
                            leftItem[key] = dataSetRight[i][key];
                        } else {
                            leftItem[key + '1'] = dataSetRight[i][key];
                        }
                    });
                    resData.push(leftItem);
                } else {
                    continue inside;
                }
            }
            if (flag == 0) {
                //右表中没有与左表某一行匹配的行，需要键右表中的字段加到左表中并赋值为null
                rightField.forEach(function (key) {
                    if (leftItem[key] === undefined) {
                        leftItem[key] = null;
                    } else {
                        leftItem[key + '1'] = null;
                    }
                });
                resData.push(leftItem);
            }
        });
        dataSetRightArr.splice(0, 1);
        fieldArr.splice(0, 1);
        dataSetLeft = sqlLeftjoin(resData, dataSetRightArr, fieldArr);
    } else {
        return dataSetLeft;
    }
    return dataSetLeft;
}

/**
 * @type: KP自定义函数
 * @description: 排序，实现ORDER BY功能
 * @param {object[object]} dataSet - 数据集
 * @param {object[object]} field - 排序字段及规则 [{name: '字段名1', rule: 'ASC'}, {name: '字段名2', rule: 'DESC'}]
 * @return {object[]} 数组对象
 */
function sqlOrder(dataSet, field) {
    var resData = [];
    for (var i = 0; i < field; i++) {
        resData = dataSet.sort(function (a, b) {
            if (field[i].rule === 'ASC') {
                return a[field[i].name] > b[field[i].name] ? 1 : a[field[i].name] < b[field[i].name] ? -1 : 0;
            } else if (field[i].rule === 'DESC') {
                return a[field[i].name] > b[field[i].name] ? -1 : a[field[i].name] < b[field[i].name] ? 1 : 0;
            }
        });
    }
    return resData;
}
/**
 * @description: 遍历指定路径下的所有文件
 * @param {string} filePath - 指定路径
 * @param {string} keyWord - 指定文件中的关键字
 * @param {string} extname - 指定文件扩展名(.xml)
 * @param {string} exclude - 排除文件中的关键字
 * @param {string}
 * @return {*} 文件路径+文件名+后缀 数组
 */
function fileDisplay(filePath, keyWord, extname, exclude) {
    try {
        var fs = require('fs');
        var path = require('path');
        //根据文件路径读取文件，返回文件列表
        fs.readdir(filePath, function (err, files) {
            if (err) throw '读取文件夹错误！';
            //遍历读取到的文件列表
            files.forEach(function (filename) {
                //获取当前文件的绝对路径
                var filedir = path.join(filePath, filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, function (eror, stats) {
                    if (eror) throw '获取文件stats失败';
                    var isFile = stats.isFile(); //是文件
                    var isDir = stats.isDirectory(); //是文件夹
                    if (isFile) {
                        var suffix = path.extname(filedir); //获取文件后缀名
                        if (extname === undefined || suffix == extname) {
                            fs.readFile(filedir, function (err, data) {
                                if (err) throw err;
                                data = data.toString();
                                var patt = new RegExp(keyWord, 'i');
                                if (patt.test(data)) console.log(filedir);
                            });
                        }
                    }
                    if (isDir) {
                        fileDisplay(filedir, keyWord, extname); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
                    }
                });
            });
        });
    } catch (e) {
        console.log(e);
        return false;
    }
}
/**
 * @description: 按控件内容筛选函数
 * @param {object[object]} OCX - 控件名称及对应的字段名 [{name: 'Combobox1', field: 'taskID', match: '='}, ...] 匹配条件可为 =、!=、<、>、<=、>=、like（模糊查询）
 *                               若需要对单选框的文本内容进行筛选，则name属性需为 '控件名称_text' 这种形式
 *                                若需要对单选框的索引进行筛选，则name属性需为 '控件名称_index' 这种形式
 * @param {object[object]} dataSet - 数据集
 * @param {object[object]} PageName - 画面名称
 * @return {object[object]} 筛选后的数据集
 */
function OcxFiltering(OCX, dataSet, PageName) {
    try {
        var condition = []; //筛选条件数组对象
        for (var i = 0; i < OCX.length; i++) {
            //控件名字
            var OCXName = OCX[i].name;
            var obj = {
                field: OCX[i].field,
                match: OCX[i].match,
            };

            var name1 = $System.$PicManager[PageName].$Children[OCXName].prototypeName;
            //判断控件类型  Combobox Textbox UIRadioButtonGroup DateBox DateTimeBox
            switch (name1) {
                case 'Combobox':
                    obj.value = $System.$PicManager[PageName].$Children[OCXName].GetCurrentText();
                    break;
                case 'Textbox':
                    obj.value = $System.$PicManager[PageName].$Children[OCXName].Text;
                    break;
                case 'UIRadioButtonGroup':
                    if (OCXName.indexOf(text) != -1) {
                        obj.value = $System.$PicManager[PageName].$Children[OCXName].SelectedText;
                    } else if (OCXName.indexOf(index) != -1) {
                        obj.value = $System.$PicManager[PageName].$Children[OCXName].SelectedIndex;
                    }
                    break;
                case 'DateBox':
                    obj.value = $System.$PicManager[PageName].$Children[OCXName].Value;
                    break;
                case 'DateTimeBox':
                    obj.value = $System.$PicManager[PageName].$Children[OCXName].Value;
                    break;
                default:
                    return;
            }
            condition.push(obj);
        }
        return dataFilter(dataSet, condition);
    } catch (e) {
        console.log(e);
        return false;
    }
}
/**

 * @description: 创建多级目录（同步函数）以递归的方式
 * @param {string} dirname - 绝对路径
 * @return {boolean} 若成功或已存在则返回true
 */
function mkDirsSync(dirname) {
    const fs = require('fs');
    const path = require('path');
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkDirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
/**

 * @description: post方式调用KC请求式脚本
 * @param {string} scriptName - 请求式脚本名称（也就是函数名）
 * @param {object} InParam - 传入参数结构体
 * @param {function} callback - 回调函数
 * @return {*}
 */
function KCrequest(scriptName, InParam, callback) {
    var host = 'http://192.168.3.123:1230';
    var api = '/' + scriptName; //KC请求式计算的脚本名称
    var type = 'post';
    var postType = 'JSON';
    var kcdata = {
        InParam: InParam, //传入到KC的参数
        RequestType: 'normal',
        RequestID: $Function.GUID(),
    };
    var iclient = KMClientInterface.getInstance();
    iclient.httpRequestExec(host, api, type, kcdata, postType, function (resData) {
        callback(resData);
    });
}
/**

 * @description: 获取当前日期函数
 * @return {string} 返回格式为"2021-01-11"
 */
function GetDataFunc() {
    var date = new Date();
    var year = date.getFullYear();
    /* 在日期格式中，月份是从0开始的，因此要加0
     * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
     * */
    var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    // 拼接
    return year + '-' + month + '-' + day;
}
/**

 * @description: 获取当前日期时间函数
 * @return {string} 返回格式为"2021-01-11 18:06:53"
 */
function GetDataTimeFunc() {
    var date = new Date();
    var year = date.getFullYear();
    /* 在日期格式中，月份是从0开始的，因此要加0
     * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
     * */
    var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    var seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    // 拼接
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}
/**

 * @description: 写入日志信息(同步函数)
 * @param {*}
 * @return {*}
 */
function logWrite(dirname, text) {
    const fs = require('fs');
    const path = require('path');
    if (!fs.existsSync(dirname)) {
        if (mkDirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
        }
    }
    fs.writeFileSync(path, GetDataTimeFunc() + '  操作人：' + $System.userName + '\r\n', {
        flag: 'a',
        encoding: 'utf-8',
        mode: '0666'
    });
    fs.writeFileSync(path, text, {
        flag: 'a',
        encoding: 'utf-8',
        mode: '0666'
    });
    fs.writeFileSync(path, '\r\n\r\n', {
        flag: 'a',
        encoding: 'utf-8',
        mode: '0666'
    });
}
/**

 * @description: 获取各种表单号、任务编号 规则：类型 + 日期 + 流水号
 * @param {string} type - 编号类型 1:工单号 2：原材料质检 3：成品出库单 4：半成品质检 5：出库单（移动类型包含成本中心领用，委外...） 6：成品质检 7: MRB 8：退库单 9：成品入库单 10：领料单 11：成本中心退料单 12：物权转移单
 * @return {string} id - 单号
 */
async function getID(type) {
    //单号前缀配置数组
    var TaskIdConfig = ['6#', 'YLZJ', 'CPCK', 'BCPZJ', 'CKD', 'CPZJ', 'MRB', 'TKD', 'CPRKD', 'LLD', 'CBZXTL'];
    var dataBaseName = '[dbo].[serial_number]';
    try {
        //获取年月日
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var field = 'num' + type; //该类型单号对应的字段名
        var num = 1; //流水号
        var startTime = year + '-' + month + '-01';
        var endTime = '';
        if (parseInt(month) + 1 > 12) {
            endTime = year + 1 + '-01-01';
        } else {
            endTime = year + '-' + (parseInt(month) + 1 < 10 ? '0' + (parseInt(month) + 1) : parseInt(month) + 1) + '-01';
        }
        var sqlStr = `SELECT ${field} FROM ${dataBaseName} WHERE DT < '${endTime}' AND DT >= '${startTime}'`;
        var resData = await toDataSet('BTR', sqlStr);
        if (resData.length == 0) {
            await toDataSet('BTR', `INSERT INTO ${dataBaseName} (DT) VALUES ('${GetDataFunc()}')`);
            num = 1;
        } else {
            resData.forEach(function (item) {
                item[field] > num ? (num = item[field]) : 1;
            });
        }
        //将当日流水号加1
        var data = await toDataSet('BTR', `UPDATE ${dataBaseName} SET num${type} = '${num + 1}' WHERE DT < '${endTime}' AND DT >= '${startTime}'`);
        num < 10 ? (num = '0' + num) : 1;
        return TaskIdConfig[type - 1] + year + month + num;
    } catch (e) {
        console.log(e);
        return false;
    }
}
/**

 * @description:
 * @param {*} type
 * @param {*} msg
 * @return {*}
 */
function tip(type, msg) {
    var msg1, type1;
    var duration1 = 1500;
    switch (msg) {
        case undefined:
            msg1 = '提交成功';
            if (type === undefined) {
                type = 'success';
            }
            break;
        default:
            msg1 = msg;
    }
    switch (type) {
        case undefined:
            type1 = 'info';
            break;
        case 'success':
            type1 = type;
            break;
        case 'error':
            type1 = type;
            duration1 = 4000;
            break;
        case 'warning':
            type1 = type;
            duration1 = 2500;
            break;
        default:
            type1 = 'info';
    }

    var options = {
        type: type1,
        message: msg1,
        offset: 20,
        duration: duration1,
        showClose: true,
    };
    ShowMessage(options);
    return;
}
/**

 * @description: 修改对象指定的键名
 * 函数本身是一个深拷贝，通过对其每层中对象的“键”做匹配替换即实现了多层的“键”替换，另外这里如果传空数组此函数就是一个深拷贝。
 * @param {object[object]} data - 需要修改键名的数组对象
 * @param {object[]} keyMap - {旧键名1：'新键名1', 旧键名2：'新键名2', 旧键名3：'新键名3'}
 * @return {object[object]}
 */
function copyTrans(data, keyMap) {
    try {
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            for (var key in obj) {
                var newKey = keyMap[key];
                if (newKey) {
                    obj[newKey] = obj[key];
                    delete obj[key];
                }
            }
        }
        return data;
    } catch (e) {
        console.log(e);
        return false;
    }
}
/**

 * @description: 忽略大小写判断字符串str是否包含subStr
 * @param subStr 子字符串
 * @param str 父字符串
 * @returns boolean
 */
function coverString(subStr, str) {
    var reg = eval('/' + subStr + '/ig');
    return reg.test(str);
}
/**

 * @description: 生成随机GUID码
 * @return {string} 返回GUID码
 */
function Guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
/**

 * @description: KP执行SQL语句
 * @param {string} dataSource - 数据源名称
 * @param {string} sqlStr - SQL语句
 * @return {*} 若为查询则返回数据集（数组对象），若为增删查则返回true/false，若查询失败则返回false且弹窗提示，控制台打印错误信息
 */
function KPtoDataSet(dataSource, sqlStr) {
    try {
        //select校验
        var reg = eval('/' + 'select' + '/ig');
        if (reg.test(sqlStr)) {
            //查询语句
            var res = SyncSQLExecute(dataSource, 0, sqlStr, res);
            if (res.errorCode != 0) throw 'SQL语句执行失败： ' + sqlStr;
            var data = res.data.records;
            if (data.length == 0) {
                $Function.tip('warning', '查询无数据！ SQL语句为：' + sqlStr);
            }
            return data;
        } else {
            //增删改语句
            var res = SyncSQLExecute(dataSource, 1, sqlStr, res);
            if (res.errorCode != 0) throw 'SQL语句执行失败： ' + sqlStr;
            return true;
        }
    } catch (e) {
        console.log(e);
        $Function.tip('error', e);
        return false;
    }
}
/**
 * @description: 执行数据库操作函数(异步)
 * @param {object[]} dataSource - 数据源名称
 * @param {string} sqlStr - SQL语句
 * @return {object} 若为查询则返回数据集（数组对象），若为增删查则返回true/false，若查询失败则返回false且弹窗提示，控制台打印错误信息
 */
async function toDataSet(dataSource, sqlStr) {
    //请求调用mssql
    var sql = require('mssql');
    //数据库连接配置信息
    var config = ['10.102.165.122', 'sa', 'Sa123', 'BTR'];
    var DBconfig = {
        server: config[0],
        authentication: {
            type: 'default',
            options: {
                userName: config[1],
                password: config[2],
            },
        },
        options: {
            database: config[3],
            encrypted: false,
            trustedConnection: true,
            encrypt: false,
            enableArithAbort: true,
            trustServerCertificate: true,
        },
        pool: {
            min: 0,
            max: 10,
            idleTimeoutMillis: 3000,
        },
    };
    //申请连接池
    var conn = new sql.ConnectionPool(DBconfig);
    var req = new sql.Request(conn);
    await conn.connect();
    return new Promise(function (resolve, reject) {
        req.query(sqlStr, function (err, recordreset) {
            if (err) {
                console.log(err);
                resolve(false);
            } else {
                resolve(recordreset.recordset === undefined ? true : JSON.parse(JSON.stringify(recordreset.recordset)));
            }
        });
    });
}
/**
 * @description: 判断是否为正确的JSON格式字符串
 * @param {string} str - JSON字符串
 * @return {*}
 */
function isJSON(str) {
    if (typeof str == 'string') {
        try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
}
/**
 * @description: 将字典转换成数据集
 * @param {object[]} map - 需要转换的字典
 * @return {object[object]} 返回数据集
 */
function toArray(map) {
    var dataSet = [];
    for (var key in map) {
        dataSet.push(item);
    }
    return dataSet;
}
/**
 * @description: 导入函数
 * @param {object} config - 字段配置对象{ excel字段名1：数据网格field字段名1，...}
 * @param {string} datagridName - 数据网格名字
 * @param {string} dataBaseName - 数据库名字（若为空则不存数据库）（按数据网格字段名存数据库）
 * @param {function} callback - 回调函数
 * @return {*}
 */
function importExcel(config, datagridName, dataBaseName, callback) {
    try {
        ImportByExcel(function (data) {
            if (!data) throw new Error('[importExcel]  导入数据为空！');
            copyTrans(data, config);
            $(eval(datagridName).id).datagrid({
                data: data,
            });
            if (dataBaseName != '') {
                var res = $Function.SqlInsert(data, dataBaseName);
                if (!res) throw new Error('[importExcel]  导入字段与数据库字段不匹配！存入数据库失败！');
                callback(res);
            }
        });
    } catch (e) {
        callback(e);
    }
}
/**
 * @description: 导入函数
 * @param {*}
 * @return {*}
 */
module.exports = {
    fileDisplay,
    OcxFiltering,
    mkDirsSync,
    KCrequest,
    GetDataFunc,
    GetDataTimeFunc,
    logWrite,
    getID,
    tip,
    copyTrans,
    coverString,
    Guid,
    toDataSet,
    dataFilter,
    SqlInsert,
    JSON_to_dataSet,
    toMap,
    dataSet_to_JSON,
    sqlDistinct,
    sqlDistinct,
    sqlGroupby,
    sqlInnerjoin,
    sqlLeftjoin,
    sqlOrder,
    isJSON,
    toArray,
};