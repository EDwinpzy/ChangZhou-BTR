/*
 * @Author: EDwin
 * @Date: 2022-01-19 11:14:04
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-19 17:31:14
 */
/**
 * @description: 轮询数据库表QC_RealTimeTask，将已生成质检结果且未推送的信息推送给ERP、WMS、MES
 * @param {*}
 * @return {*}
 */
function QCresultPush() {
    try {
        var dataBase = ['[dbo].[QC_RealTimeTask]'];
        var QC_RealTimeTask = toDataSet(globa.BTR, `SELECT * FROM ${dataBase[0]} WHERE QCresult <> '' AND (ERPflag = 0 OR WMSflag = 0 OR MESflag = 0)`);
        if (!QC_RealTimeTask) throw dataBase[0] + '数据库查询失败！';
        /**************************回传至WMS系统（只回传成品的质检结果）******************** */
        var productQcInfo = dataFilter(QC_RealTimeTask, { field: 'tasktype', value: '5', match: '=' }); //筛选出成品质检任务
        productQcInfo = JSON_to_dataSet(productQcInfo, ['privateTaskObj']);
        var nowDataTime = GetDataTimeFunc();
        var WMS_arr = [];
        var ERP_arr = []
        productQcInfo.forEach(function (item) {
            var WMS_obj = {
                Item_No: item.productCode,
                Batch_No: item.jobID,
                SecondBatch_No: item.jobIDS,
                Quality_Result: item.QCresult == 0 ? '20' : '00',
                Sync_Time: nowDataTime,
            };
            WMS_arr.push(WMS_obj);
            var ERP_arr = {
                ZID: 
            };
        });
        var res = SqlInsert(WMS_arr, '[dbo].[WMS_QCinfo]');

        /*********************************** 回传至ERP系统 ********************************/

        if (!res) throw 'WMS质检回传失败！';
    } catch (e) {}
}
