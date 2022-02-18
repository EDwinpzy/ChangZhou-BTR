/*
 * @Author: EDwin
 * @Date: 2021-12-30 08:58:12
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 16:59:18
 */
/**
 * @type: KP自定义脚本
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
