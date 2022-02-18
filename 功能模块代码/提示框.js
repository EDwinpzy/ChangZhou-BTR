/*
 * @Author: EDwin
 * @Date: 2022-01-04 11:27:00
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 15:51:02
 */
/**
 * @type: KP自定义脚本
 * @description:
 * @param {*} type
 * @param {*} msg
 * @return {*}
 */
function tip(type, msg) {
    var msg1, type1;
    var duration1 = 1500;
    switch (msg) {
        case undefined:
            msg1 = '提交成功';
            if (type === undefined) {
                type = 'success';
            }
            break;
        default:
            msg1 = msg;
    }
    switch (type) {
        case undefined:
            type1 = 'info';
            break;
        case 'success':
            type1 = type;
            break;
        case 'error':
            type1 = type;
            duration1 = 4000;
            break;
        case 'warning':
            type1 = type;
            duration1 = 2500;
            break;
        default:
            type1 = 'info';
    }

    var options = {
        type: type1,
        message: msg1,
        offset: 20,
        duration: duration1,
        showClose: true,
    };
    ShowMessage(options);
    return;
}
