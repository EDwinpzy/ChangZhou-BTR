/*
 * @Author: EDwin
 * @Date: 2021-12-10 13:56:01
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-19 17:40:42
 */
/**
 * @description: 执行数据库操作函数(异步)
 * @param {object[]} config - 数据库连接参数配置，例如[数据库服务器地址, 用户名, 密码, 数据库名称]
 * @param {string} sqlStr - SQL语句
 * @return {object} 返回执行结果对象{errorcode: 0, message: '错误信息', data: [{返回的结果集}]}
 */
async function toDataSet(sqlStr) {
    //请求调用mssql
    var sql = require('mssql');
    //数据库连接配置信息
    var config = ['127.0.0.1', 'sa', 'Sa123', 'BTR'];
    var DBconfig = {
        server: config[0],
        authentication: {
            type: 'default',
            options: {
                userName: config[1],
                password: config[2],
            },
        },
        options: {
            database: config[3],
            encrypted: false,
            trustedConnection: true,
            encrypt: true,
            enableArithAbort: true,
            trustServerCertificate: true,
        },
        pool: {
            min: 0,
            max: 10,
            idleTimeoutMillis: 3000,
        },
    };
    //申请连接池
    var conn = new sql.ConnectionPool(DBconfig);
    var req = new sql.Request(conn);
    await conn.connect();
    return new Promise(function (resolve, reject) {
        req.query(sqlStr, function (err, recordreset) {
            if (err) {
                console.log(err);
                resolve(false);
            } else {
                resolve(recordreset.recordset === undefined ? true : JSON.parse(JSON.stringify(recordreset.recordset)));
            }
        });
    });
}
module.exports = {
    toDataSet,
};
