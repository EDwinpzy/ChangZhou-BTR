/*
 * @Author: EDwin
 * @Date: 2021-12-30 09:00:48
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 15:51:16
 */
/**
 * @type: KP自定义脚本
 * @description: 忽略大小写判断字符串str是否包含subStr
 * @param subStr 子字符串
 * @param str 父字符串
 * @returns boolean
 */
function coverString(subStr, str) {
    var reg = eval('/' + subStr + '/ig');
    return reg.test(str);
}
