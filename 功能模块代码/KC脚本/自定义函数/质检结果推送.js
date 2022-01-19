/*
 * @Author: EDwin
 * @Date: 2022-01-19 11:14:04
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-19 16:17:55
 */
/**
 * @description: 轮询数据库表QC_RealTimeTask，将已生成质检结果且未推送的信息推送给ERP、WMS、MES
 * @param {*}
 * @return {*}
 */
function QCresultPush () {
    var dataBase = ['[dbo].[QC_RealTimeTask]'];
    var QC_RealTimeTask = toDataSet(globa.BTR, `SELECT * FROM ${dataBase[0]} WHERE QCresult <> '' AND (ERPflag = 0 OR WMSflag = 0 OR MESflag = 0)`);
    /**************************回传至WMS系统（只回传成品的质检结果）******************** */
    var productQcInfo = dataFilter(QC_RealTimeTask, { field: 'tasktype', value: '5', match: '=' });//筛选出成品质检任务
    var WMS_obj = []
    productQcInfo.forEach(function (item) {
        var obj = {
            Item_No: item.
Batch_No
SecondBatch_No
Quality_Result
Sync_Time
Retain_01
Retain_02
Retain_03

        }
    })
}