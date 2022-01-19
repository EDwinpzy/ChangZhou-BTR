/*
 * @Author: EDwin
 * @Date: 2022-01-19 11:14:04
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-19 15:44:21
 */
/**
 * @description: 轮询数据库表QC_RealTimeTask，将已生成质检结果且未推送的信息推送给ERP、WMS、MES
 * @param {*}
 * @return {*}
 */
function QCresultPush() {
    var dataBase = ['[dbo].[QC_RealTimeTask]'];
    var QC_RealTimeTask = toDataSet(globa.BTR, `SELECT * FROM ${dataBase[0]} WHERE QCresult <> '' AND (ERPflag = 0 OR WMSflag = 0 OR MESflag = 0)`);
}
