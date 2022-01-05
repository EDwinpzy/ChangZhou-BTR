/*
 * @Author: EDwin
 * @Date: 2021-12-30 09:00:22
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-30 09:00:22
 */
/**
 * @description: 生成随机GUID码
 * @return {string} 返回GUID码
 */
function Guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}