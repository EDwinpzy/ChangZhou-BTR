/*
 * @Author: EDwin
 * @Date: 2021-12-30 09:00:12
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-30 09:00:12
 */
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