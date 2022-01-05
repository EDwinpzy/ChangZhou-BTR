/*
 * @Author: EDwin
 * @Date: 2021-12-30 09:03:49
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-31 08:51:23
 */
/**
 * @description: 投料/收料 计划/实际 批次生成，投料按原材料小批次投，收料按工单（mes大批次收料）
 * @param {object[object]} jobID - 制令单号/配比单号（工单号,MES成品批次号）
 * @return {*}
 */
function FeedAndReceipt(jobID) {
    try {
        //数据库基础信息配置数组
        var dataBaseConfig = ['productOrder_realTime', 'put_realTime', 'get_realTime'];

        /**********************投料表字段配置  键为投料表字段名 值为工单信息表字段名 一一对应关系*********************/
        var putField = {
            ERPorder: 'ERPorder',
            ERPbatch: 'ERPbatch',
            jobID: 'jobID',
            materialSmallBatch: 'materialObj.materialSmallBatch',
            putName: 'materialObj.materialName',
            putCode: 'materialObj.materialCode',
            planLine: 'line',
            planProcess: 'process',
            planStation: 'ERPGZZX',
            planWeight: 'materialObj.planWeight',
            planDateTime: 'planStartTime',
        };

        //返回对象
        var result = {
            errorCode: 0,
            message: '',
        };
        var res = {};
        var field = []; //插入投料表字段名
        var value = []; //插入投料表字段值

        /**************************查询工单、获取投料和收料信息************************/
        var sqlStr = `SELECT * FROM ${dataBaseConfig[0]} WHERE jobID = '${jobID}'`;
        SyncSQLExecute($System.BTR, 0, sqlStr, res);
        if (res.errorCode != 0) throw res.errorCode + ':' + res.message + '   工单信息查询失败！';
        var data = res.data.records;

        /***********************收料表字段配置  键为收料表字段名 值为工单信息表字段名 一一对应关系***********************/
        //判断工单类型
        var a = data[0].type;
        var getField = {
            ERPorder: 'ERPorder',
            ERPbatch: 'ERPbatch',
            jobID: 'jobID',
            materialSmallBatch: 'materialObj.materialSmallBatch',
            getName: a == 1 ? 'ByProductName' : 'productName',
            getCode: a == 1 ? 'ByProductCode' : 'productCode',
        };

        /*******************************生成投料批次表***************************** */
        for (var key in putField) {
            //投料表字段名
            field.push(key);
            //判断是否为私有成员对象字段
            if (putField[key].includes('.')) {
                var objKey = putField[key].split('.')[0];
                var objValue = putField[key].split('.')[1];
                //将私有成员对象反格式化
                var obj = JSON.parse(data[0][objKey]);
                value.push("'" + obj[objValue] + "'");
            } else {
                value.push("'" + data[0][putField[key]] + "'");
            }
        }
        sqlStr = `INSERT INTO ${dataBaseConfig[1]} (${field.join(',')}) VALUES (${value.join(',')})`;
        SyncSQLExecute($System.BTR, 1, sqlStr, res);
        if (res.errorCode != 0 && res.message.includes('PRIMARY')) throw '已存在该制令单/配比单的投料计划！请先删除！';
        if (res.errorCode != 0 && !res.message.includes('PRIMARY')) throw res.errorCode + ':' + res.message + '   投料批次生成失败失败！';

        /****************************生成收料批次表*********************************** */
        for (var key in getField) {
            //收料表字段名
            field.push(key);
            //判断是否为私有成员对象字段
            if (putField[key].includes('.')) {
                var objKey = putField[key].split('.')[0];
                var objValue = putField[key].split('.')[1];
                //将私有成员对象反格式化
                var obj = JSON.parse(data[0][objKey]);
                value.push("'" + obj[objValue] + "'");
            } else {
                value.push("'" + data[0][putField[key]] + "'");
            }
        }
        sqlStr = `INSERT INTO ${dataBaseConfig[2]} (${field.join(',')}) VALUES (${value.join(',')})`;
        SyncSQLExecute($System.BTR, 1, sqlStr, res);
        if (res.errorCode != 0 && res.message.includes('PRIMARY')) throw '已存在该制令单/配比单的收料计划！请先删除！';
        if (res.errorCode != 0 && !res.message.includes('PRIMARY')) throw res.errorCode + ':' + res.message + '   收料批次生成失败失败！';
    } catch (e) {
        result.errorCode = 1;
        result.message = e;
        $Function.tip('error', e);
    } finally {
        return result;
    }
}
