/*
 * @Author: EDwin
 * @Date: 2022-02-18 15:11:59
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 15:38:27
 */
/**
 * @type: KP自定义脚本
 * @description: post方式调用KC请求式脚本
 * @param {string} scriptName - 请求式脚本名称（也就是函数名）
 * @param {object} InParam - 传入参数结构体
 * @param {function} callback - 回调函数
 * @return {*}
 */
function KCrequest(scriptName, InParam, callback) {
    var host = 'http://192.168.3.123:1230';
    var api = '/' + scriptName; //KC请求式计算的脚本名称
    var type = 'post';
    var postType = 'JSON';
    var kcdata = {
        InParam: InParam, //传入到KC的参数
        RequestType: 'normal',
        RequestID: $Function.GUID(),
    };
    var iclient = KMClientInterface.getInstance();
    iclient.httpRequestExec(host, api, type, kcdata, postType, function (resData) {
        callback(resData);
    });
}
