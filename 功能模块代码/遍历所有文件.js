/*
 * @Author: EDwin
 * @Date: 2022-01-31 11:07:46
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-31 14:02:40
 */
/**
 * @type: KP自定义脚本
 * @description: 遍历指定路径下的所有文件
 * @param {string} filePath - 指定路径
 * @return {*} 文件路径+文件名+后缀 数组
 */
function fileDisplay(filePath, keyWord, extname) {
    try {
        var fs = require('fs');
        var path = require('path');
        //根据文件路径读取文件，返回文件列表
        fs.readdir(filePath, function (err, files) {
            if (err) throw '读取文件夹错误！';
            //遍历读取到的文件列表
            files.forEach(function (filename) {
                //获取当前文件的绝对路径
                var filedir = path.join(filePath, filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, function (eror, stats) {
                    if (eror) throw '获取文件stats失败';
                    var isFile = stats.isFile(); //是文件
                    var isDir = stats.isDirectory(); //是文件夹
                    if (isFile) {
                        var suffix = path.extname(filedir); //获取文件后缀名
                        if ((extname === undefined || suffix == extname) && filedir.indexOf('Data') !== -1) {
                            fs.readFile(filedir, function (err, data) {
                                if (err) throw err;
                                data = data.toString();
                                var patt = new RegExp(keyWord, 'i');
                                if (patt.test(data)) console.log(filedir);
                            });
                        }
                    }
                    if (isDir) {
                        fileDisplay(filedir, keyWord, extname); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
                    }
                });
            });
        });
    } catch (e) {
        console.log(e);
        return false;
    }
}
module.exports = {
    fileDisplay,
};
fileDisplay("F:\\steam\\steamapps\\common\\Sid Meier's Civilization VI\\DLC", 'panama', '.xml');
