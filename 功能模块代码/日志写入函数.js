/*
 * @Author: EDwin
 * @Date: 2022-01-10 13:25:09
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-31 10:52:35
 */
/**
 * @description: 写入日志信息(同步函数)
 * @param {*}
 * @return {*}
 */
function logWrite(dirname, text) {
    const fs = require('fs');
    const path = require('path');
    if (!fs.existsSync(dirname)) {
        if (mkDirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
        }
    }
    fs.writeFileSync(path, GetDataTimeFunc() + '  操作人：' + $System.userName + '\r\n', { flag: 'a', encoding: 'utf-8', mode: '0666' });
    fs.writeFileSync(path, text, { flag: 'a', encoding: 'utf-8', mode: '0666' });
    fs.writeFileSync(path, '\r\n\r\n', { flag: 'a', encoding: 'utf-8', mode: '0666' });
}
