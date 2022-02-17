/*
 * @Author: EDwin
 * @Date: 2022-01-18 14:05:05
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-20 14:15:35
 */
/**
 * @description: 成品入库成功执行完成，收到WMS成功反馈后，生成质检任务,定时查询指令执行反馈(WMS_feedback)表。
 * @param {*}
 * @return {*}
 */
function QCtaskPush() {
    var dataBase = ['[dbo].[WMS_instore_order]', '[dbo].[storage_batch]'];
    try {
        var WMS_instore_order = toDataSet(globa.BTR, `SELECT * FROM ${dataBase[0]}`);
        if (!WMS_instore_order) throw 'WMS接口表WMS_instore_order查询失败！';
        WMS_instore_order = dataFilter(WMS_instore_order, [
            { field: 'Handle_Code', value: '000', match: '=' },
            { field: 'Order_Type', value: '10', match: '=' },
        ]); //筛选出出库成功的
        var storage_batch = toDataSet(globa.BTR, `SELECT * FROM ${dataBase[1]} WHERE position = '3' AND stocktype = '3' AND QCresult = '3'`); //查询已生成成品批次且未生成质检任务的成品库存
        if (!storage_batch) throw '库存表storage_batch查询失败！';
        var QCtaskInfo = sqlInnerjoin(WMS_instore_order, storage_batch, ['Package_Code', 'jobIDS']); //获取到已完成出库指令且质检任务未生成的成品库存信息
        var info = [];
        QCtaskInfo.forEach(function (item) {
            var obj = {
                ERPorder: item.ERPorder,
                ERPbatch: item.ERPbatch,
                jobID: item.jobID,
                jobIDS: item.jobIDS,
                rule: 1,
                exesponsor: '系统自动生成',
                privateTaskObj: {
                    processpath: '',
                    line: '',
                    station: '',
                    equipName: '',
                    productCode: item.stockcode,
                    productName: item.stockname,
                },
            };
            info.push(obj);
        });
        var res = QCtaskGenrate(5, info);
        if (!res) throw '质检任务生成失败！';
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
