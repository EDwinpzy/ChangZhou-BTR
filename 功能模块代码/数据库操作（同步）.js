/*
 * @Author: EDwin
 * @Date: 2021-12-30 08:57:16
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 15:50:50
 */
/**
 * @type: KP自定义脚本
 * @description: 执行SQL语句
 * @param {string} dataSource - 数据源名称
 * @param {string} sqlStr - SQL语句
 * @return {*} 若为查询则返回数据集（数组对象），若为增删查则返回true/false，若查询失败则返回false且弹窗提示，控制台打印错误信息
 */
function toDataSet(dataSource, sqlStr) {
    try {
        var res = {};
        //select校验
        var reg = eval('/' + 'select' + '/ig');
        if (reg.test(sqlStr)) {
            //查询语句
            SyncSQLExecute(dataSource, 0, sqlStr, res);
            if (res.errorCode != 0) throw 'SQL语句执行失败： ' + sqlStr;
            var data = res.data.records;
            if (data.length == 0) {
                $Function.tip('warning', '查询无数据！ SQL语句为：' + sqlStr);
            }
            return data;
        } else {
            //增删改语句
            SyncSQLExecute(dataSource, 1, sqlStr, res);
            if (res.errorCode != 0) throw 'SQL语句执行失败： ' + sqlStr;
            return true;
        }
    } catch (e) {
        $Function.logWrite($System.errorLogPath, e); //写入错误日志
        console.log(e);
        $Function.tip('error', e);
        return false;
    }
}
