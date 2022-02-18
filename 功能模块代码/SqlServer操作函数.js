/*
 * @Author: EDwin
 * @Date: 2021-12-10 13:56:01
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 19:50:48
 */
/**
 * @description: 执行数据库操作函数(异步)
 * @param {object[]} config - 数据库连接参数配置，例如[数据库服务器地址, 用户名, 密码, 数据库名称]
 * @param {string} sqlStr - SQL语句
 * @return {object} 返回执行结果对象{errorcode: 0, message: '错误信息', data: [{返回的结果集}]}
 */
async function DBExecute(config, sqlStr) {
    debugger;
    //请求调用mssql
    var sql = require('mssql');
    //数据库连接配置信息
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
    var data = await sqlExecute(req, sqlStr);
    console.log(data);
}
async function sqlExecute(req, sqlStr) {
    debugger;
    return new Promise(function (resolve, reject) {
        req.query(sqlStr, function (err, recordreset) {
            if (err) {
                resolve({ errorCode: 1, message: err });
            } else {
                resolve(recordreset.recordset === undefined ? { errorCode: 0 } : { errorCode: 0, data: JSON.parse(JSON.stringify(recordreset.recordset)) });
            }
        });
    });
}
DBExecute(['127.0.0.1', 'sa', 'Sa123', 'serial_number'], `SELECT * FROM [dbo].[serial_number]`);
