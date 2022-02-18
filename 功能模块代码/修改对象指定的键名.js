/*
 * @Author: EDwin
 * @Date: 2021-12-30 08:58:12
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 15:51:09
 */
/**
 * @type: KP自定义脚本
 * @description: 修改对象指定的键名
 * 函数本身是一个深拷贝，通过对其每层中对象的“键”做匹配替换即实现了多层的“键”替换，另外这里如果传空数组此函数就是一个深拷贝。
 * @param {object[object]} obj - 需要修改键名的数组对象
 * @param {object[object]} typeArr - [{key: '原键名', value: '修改后的键名'}, {key: '原键名', value: '修改后的键名'}]
 * @return {object[object]}
 */
function copyTrans(obj, typeArr) {
    var result;
    var toString = Object.prototype.toString;
    if (toString.call(obj) === '[object Array]') {
        result = [];
        for (var i = 0; i < obj.length; i++) {
            result[i] = copyTrans(obj[i], arguments[1]);
        }
    } else if (toString.call(obj) === '[object Object]') {
        result = {};
        for (var _key in obj) {
            if (obj.hasOwnProperty(_key)) {
                var flag = 0,
                    _value = null;
                for (var j = 0; j < arguments[1].length; j++) {
                    if (arguments[1][j].key === _key) {
                        flag = 1;
                        _value = arguments[1][j].value;
                    }
                }
                if (flag) result[_value] = copyTrans(obj[_key], arguments[1]);
                else result[_key] = copyTrans(obj[_key], arguments[1]);
            }
        }
    } else {
        return obj;
    }
    return result;
}
