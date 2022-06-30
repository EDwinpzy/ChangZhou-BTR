/*
 * @Author: EDwin
 * @Date: 2022-05-26 14:22:10
 * @LastEditors: EDwin
 * @LastEditTime: 2022-06-30 15:37:42
 */
debugger;
var func = require('E:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/KP自定义函数.js');
async function a() {
    var res = await func.toDataSet(123, `SELECT * FROM SAP_errorInfo`);
    console.log(res.length);
}
var b = '';
console.log(b);
