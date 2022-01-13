/*
 * @Author: EDwin
 * @Date: 2021-12-27 09:40:33
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-13 11:37:22
 */
/**
 * @description: 质检结果回传，将结果更新到ERP接口表，WMS接口表，MES内部库存表
 * @param {object[]} QCinfo - WMS质检推送信息
 *                                  {
                                        stockcode: '物料编号',
                                        Batch_No: 'MES大批次',
                                        SecondBatch_No: '原材料小批次/成品半成品小批次（收料小批次）',
                                        Quality_Result: '质检结果00：合格（默认）10：待检20：不合格',
                                    },键可以多不能少
 * @return {boolean} 成功返回true，失败返回false并在控制台打印错误信息
 */
function QCresultBack(wmsConfig) {
    //WMS接口表信息['质检信息推送接口表']
    var WMS_dataBase = ['WMS_QCinfo'];
    var result = { errorCode: 0, message: '' };
    try {
        /*******************************WME质检信息推送接口*************************** */
        //WMS质检推送信息
        var WMS_config = {
            Item_No: wmsConfig.Item_No,
            Batch_No: wmsConfig.Batch_No,
            SecondBatch_No: wmsConfig.SecondBatch_No,
            Quality_Result: wmsConfig.Quality_Result,
            Sync_Time: $Function.GetDataTimeFunc(),
        };
        var WMS_field = [];
        var WMS_value = [];
        for (var key in WMS_config) {
            WMS_field.push(key);
            WMS_value.push("'" + WMS_config[key] + "'");
        }
        var res = $Function.toDataSet($System.BTR, `INSERT INTO ${WMS_dataBase[0]} (${WMS_field.join(',')}) VALUES (${WMS_value.join(',')})`);
        if (!res) throw 'WMS质检信息接口表插入失败！';
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
