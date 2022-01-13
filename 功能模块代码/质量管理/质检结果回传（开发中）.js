/*
 * @Author: EDwin
 * @Date: 2021-12-27 09:40:33
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-13 09:25:07
 */
/**
 * @description: 质检结果回传，将结果更新到ERP接口表，WMS接口表，MES内部库存表
 * @param {object[object[string]]} corresPondence - 更新字段对应关系二维数组
 *                                                  [
                                                        ['更新模式（insert或者update,第一行随便写）', '质检结果检索条件值1（value）', '质检结果值(value)', '质检结果值(value)', '质检结果值(value)', '质检结果值(value)', '质检结果值(value)'],
                                                        ['更新模式（insert或者update,第一行随便写）', '回传结果检索条件字段1（field，若为insert方式此项可不填）', '回传结果字段2（可为空,field）', '回传结果字段3（可为空,field）', '回传结果字段4（可为空,field）', '回传结果字段5（可为空,field）', '回传结果字段6（可为空,field）'],
                                                        ['更新模式（insert或者update,第一行随便写）', '回传结果检索条件字段1（field，若为insert方式此项可不填）', '回传结果字段2（可为空,field）', '回传结果字段3（可为空,field）', '回传结果字段4（可为空,field）', '回传结果字段5（可为空,field）', '回传结果字段6（可为空,field）'],
                                                    ];
 * @return {object} 执行结果{errorCode: 0, message: ''} 0：成功 1：完全失败 2：部分失败
 */
function QCresultBack (corresPondence) {
    //WMS接口表信息
    var WMS_dataBase = ['']
    var result = { errorCode: 0, message: '' };
    try {
        /*******************************WME质检信息推送接口************************ */


        //校验输入参数
        if (corresPondence.length - database.length != 1) throw '数据库表数量和更新字段数量不一致！';
        //对每个回传数据库表进行更新
        for (var i = 0; i < database.length; i++) {
            if (corresPondence[i + 1][0].toLowerCase() == 'UPDATE'.toLowerCase()) {
                //回传模式为更新
                var sqlStr = `UPDATE ${database[i].name} SET `;
                //筛选二维数组中为空的
                for (var j = 2; j < corresPondence[i + 1].length; j++) {
                    //若不为空则需要更新该字段
                    corresPondence[i + 1][j] != '' ? `${corresPondence[i + 1][j]} = '${corresPondence[0][j]}',` : 1;
                }
                sqlStr.substring(0, sqlStr.length - 1);
                var res = {};
                SyncSQLExecute(database[i].source, 1, sqlStr, res);
                if (res.errorCode != 0) {
                    result.errorCode = 2;
                    result.message += database[i].name + '更新失败！  ';
                }
            } else if (corresPondence[i + 1][0].toLowerCase() == 'update'.toLowerCase()) {
                //回传模式为插入
                var arr1 = []; //不为的空字段名
                var arr2 = []; //不为空的值
                //生成插入内容的二维数组（剔除掉corresPondence中为空的）
                for (var j = 0; j < corresPondence[i + 1].length; j++) {
                    if (corresPondence[i + 1][j] == '') {
                        arr1.push(corresPondence[i + 1][j]);
                        arr2.push(corresPondence[0][j]);
                    }
                }
                var sqlStr = `INSERT INTO ${database[i].name} (`;
                arr1.forEach(function (item) {
                    sqlStr += `${item},`;
                });
                sqlStr.substring(0, sqlStr.length - 1);
                sqlStr += `) VALUES (`;
                arr2.forEach(function (item) {
                    sqlStr += `'${item}',`;
                });
                sqlStr.substring(0, sqlStr.length - 1);
                sqlStr += `)`;
                var res = {};
                SyncSQLExecute(database[i].source, 1, sqlStr, res);
                if (res.errorCode != 0) {
                    result.errorCode = 2;
                    result.message += database[i].name + '更新失败！  ';
                }
            } else {
                result.errorCode = 2;
                result.message += database[i].name + ' 更新模式有误，请检查第二个参数！  ';
                break;
            }
        }
    } catch (e) {
        result.errorCode = 1;
        result.message = e;
    } finally {
        return result;
    }
}
