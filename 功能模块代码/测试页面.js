/*
 * @Author: EDwin
 * @Date: 2022-05-26 14:22:10
 * @LastEditors: EDwin
 * @LastEditTime: 2022-05-31 14:28:53
 */
debugger
var func = require('E:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/KP自定义函数.js')
async function a() {
    var a = await func.toDataSet(112, `SELECT * from storage_task`);
    func.sqlOrder(a, [{
        name: 'starttime',
        rule: 'ASC'
    }])
    console.log(a)
}
a()