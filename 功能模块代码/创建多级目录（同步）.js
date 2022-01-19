/*
 * @Author: EDwin
 * @Date: 2022-01-18 16:44:52
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-18 16:58:15
 */
/**
 * @description: 创建多级目录（同步函数）以递归的方式
 * @param {string} dirname - 绝对路径
 * @return {boolean} 若成功或已存在则返回true
 */
function mkDirsSync(dirname) {
    const fs = require('fs');
    const path = require('path');
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkDirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
