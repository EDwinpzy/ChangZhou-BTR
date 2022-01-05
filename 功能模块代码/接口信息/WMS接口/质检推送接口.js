/*
 * @Author: EDwin
 * @Date: 2022-01-04 15:50:20
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-01-04 17:40:45
 */
/**
 * @description: 质检信息推送接口
 * @param {object} data - 请求内容
 * @param {function callBack(res) {
     
 }}
 * @return {object} 返回一个对象，若校验错误则返回false
 */
async function WMS_QCpush(data, callBack) {
    try {
        var dataConfig = ['Item_No', 'Batch_No', 'SecondBatch_No', 'Quality_Result', 'Sync_Time'];
        var host = 'http://192.168.30.122:3020';
        var api = 'kPxianshi/test';
        var type = 'post';
        var postType = 'JSON';
        var data1 = {};
        dataConfig.forEach(function (item) {
            if (data[item] === undefined) throw '传入参数有误！';
            data1[item] = data[item];
        });
        data1 = JSON.stringify(data1);
        httpRequestExec(host, api, type, data1, postType, function (res) {
            callBack(JSON.parse(res));
        });
    } catch (e) {
        console.log(e);
    }
}
