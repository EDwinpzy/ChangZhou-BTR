/*
 * @Author: EDwin
 * @Date: 2022-04-01 09:40:30
 * @LastEditors: EDwin
 * @LastEditTime: 2022-04-01 16:36:19
 */
var func = require('E:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/验证使用/globalFunction.js');
//定义单据父对象
class Document {
    constructor() {
        this.id = func.Guid(); //单据唯一号
        this.dataTime = func.GetDataTimeFunc(); //单据创建时间
        this.status = '00'; //单据状态  初始00
    }
}
//定义人员对象
class Person {
    constructor(name, departMent) {
        this.name = name; //姓名
        this.departMent = departMent; //部门
    }
}
var pzy = new Person('彭致远', 'IT部门');
console.log(pzy.name);
