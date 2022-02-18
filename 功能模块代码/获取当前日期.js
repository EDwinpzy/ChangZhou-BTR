/*
 * @Author: EDwin
 * @Date: 2021-12-30 09:00:01
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-30 09:00:05
 */
/**
 * @type: KP自定义脚本
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
