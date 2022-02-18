/*
 * @Author: EDwin
 * @Date: 2021-12-30 08:57:48
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 17:20:36
 */
/**
 * @type: KP自定义脚本
 * @description: 获取各种表单号、任务编号 规则：类型 + 日期 + 流水号
 * @param {number} type - 编号类型 1:工单号 2：原材料质检 3：成品出库单 4：半成品质检 5：XXXXXX 6：成品质检 7: MRB 8：退库单 9：成品入库单 10：领料单
 * @return {string} id - 单号
 */
function getID(type) {
    //单号前缀配置数组
    var TaskIdConfig = ['GD'];
    var dataBaseName = '[dbo].[serial_number]';
    var field = 'num' + type; //该类型单号对应的字段名
    var num; //流水号
    try {
        var sqlStr = `SELECT ${field} FROM ${dataBaseName} WHERE DT = '${GetDataFunc()}'`;
        var resData = toDataSet(global.BTR, sqlStr);
        if ((resData.length = 0)) {
            toDataSet(global.BTR, `INSERT INTO ${dataBaseName} (DT) VALUES ('${GetDataFunc()}')`);
            num = 1;
        }
        num = resData[0][field];
        //将当日流水号加1
        var data = toDataSet(global.BTR, `UPDATE ${dataBaseName} SET num${type} = '${num + 1}' WHERE DT = '${GetDataFunc()}'`);
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        num < 10 ? (num += '0') : 1;
        return TaskIdConfig[type - 1] + '-' + year + month + day + '-' + num;
    } catch (e) {
        console.log(e);
        return false;
    }
}
