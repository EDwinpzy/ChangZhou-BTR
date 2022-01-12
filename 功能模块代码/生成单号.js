/*
 * @Author: EDwin
 * @Date: 2021-12-30 08:57:48
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-01-12 10:03:40
 */
/**
 * @description: 获取各种表单、任务编号 规则：类型 + 日期 + 流水号
 * @param {number} type - 编号类型 1:工单号 2：原材料质检 3：半成品取样 4：半成品质检 5：成品取样 6：成品质检 7: MRB
 * @return {string} id - 单号
 */
function getID(type) {
    //单号前缀配置数组
    var TaskIdConfig = ['GD'];
    var dataBaseName = '[dbo].[serial_number]';
    var field = 'num' + type; //该类型单号对应的字段名
    var num; //流水号
    var sqlStr = `SELECT ${field} FROM ${dataBaseName} WHERE DT = '${$Function.GetDataFunc()}'`;
    SQLExecute1($System.BTR, 0, sqlStr, function (res) {
        if (res.errorCode == 0) {
            var resData = res.data.records;
            if ((resData.length = 0)) {
                SyncSQLExecute($System.BTR, 1, `INSERT INTO ${dataBaseName} (DT) VALUES ('${$Function.GetDataFunc()}')`);
                num = 1;
            }
            num = resData[0][field];
            var data = {};
            //将当日流水号加1
            SyncSQLExecute($System.BTR, 1, `UPDATE ${dataBaseName} SET num${type} = '${num + 1}' WHERE DT = '${$Function.GetDataFunc()}'`, data);
            if (data.errorCode == 0) {
                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
                var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                num < 10 ? (num += '0') : 1;
                return TaskIdConfig[type - 1] + '-' + year + month + day + '-' + num;
            } else {
                return '';
            }
        } else {
            return '';
        }
    });
}
