/*
 * @Author: EDwin
 * @Date: 2021-12-16 16:51:33
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 15:44:32
 */
/**
 * @type: KC请求式脚本
 * @description: 执行仓库成品出入库任务，并通过接口传给WMS
 * @param {object[object]} content - 单据内容,格式按storage_task表的结构传入
 * @return {*}
 */
function TaskGenerate(content) {
    content.forEach(function (item) {
        var sqlStr = `INSERT INTO [dbo].[storage_task] SET `;
        for (var key in item) {
            sqlStr += `${key} = '${item[key]}',`;
        }
        sqlStr.substring(0, sqlStr.length - 1);
        var data = {};
        SyncSQLExecute($System.BTR, 1, sqlStr, data);

        if (data.errorCode != 0) {
            return {
                errorCode: 1,
                message: 'SQL语句执行错误   ' + sqlStr,
            };
        }
    });
    return {
        errorCode: 0,
        message: '单据生成成功！',
    };
}
