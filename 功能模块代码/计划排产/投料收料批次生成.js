/*
 * @Author: EDwin
 * @Date: 2021-12-30 09:03:49
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-14 19:00:46
 */
/**
 * @description: 投料/收料 计划/实际 批次生成，投料按原材料小批次投，收料按工单（mes大批次收料）
 * @param {object[object]} jobID - 制令单号/配比单号（工单号,MES成品批次号）
 * @param {number} rule - 投料收料批次生成规则 1：按ERP工作中心生成  2：按工序生成  3：按设备生成
 * @return {*}
 */
function FeedAndReceipt(jobID) {
    //数据库基础信息配置数组['生产工单表', '投料实时计划表', '收料历史计划表', '物料排产批次信息表', '工作中心表']
    var dataBaseConfig = ['productOrder_realTime', 'put_realTime', 'get_realTime', 'materialObj', 'basic_center'];

    try {
        /**************************查询工单信息表，获取投料和收料信息************************/
        var productOrder_realTime = $Function.toDataSet($System.BTR, `SELECT * FROM ${dataBaseConfig[0]} WHERE jobID = '${jobID}'`);
        if (!productOrder_realTime) throw '工单信息表' + dataBaseConfig[0] + '查询失败！';
        productOrder_realTime = productOrder_realTime[0];

        /*******************************查询物料排产批次表******************************* */
        var materialObj = $Function.toDataSet($System.BTR, `SELECT * FROM ${dataBaseConfig[3]} WHERE jobID = '${jobID}'`);
        if (!materialObj) throw '物料排产批次表' + dataBaseConfig[3] + '查询失败！';

        /**********************************查询工作中心信息******************************* */
        var basic_center = $Function.toDataSet($System.BTR, `SELECT * FROM ${dataBaseConfig[4]}`);
        if (!basic_center) throw '工作中心表' + dataBaseConfig[4] + '查询失败！';
        //生成工作中心树状结构体
        var center = [];
        var arr = $Function.sqlDistinct(basic_center, ['centerCode']);
        arr.forEach(function (item) {
            center.push(item.centerCode);
        });
        var centerObj = {}; //工作中心结构体
        center.forEach(function (centerCode) {
            centerObj[centerCode] = {};
            //获取当前工作中心下的数组对象
            var centerArr = $Function.dataFilter(basic_center, [{ field: 'centerCode', value: centerCode, match: '=' }]);
            //按照工序去重，获取当前工作中心下的工序代码
            centerArr = $Function.sqlDistinct(centerArr, ['processCode']);
            var process = [];
            centerArr.forEach(function (center_Arr) {
                process.push(center_Arr.processCode);
            });
            process.forEach(function (processCode) {
                //获取当前工序下的数组对象
                var processArr = $Function.dataFilter(basic_center, [
                    { field: 'centerCode', value: centerCode, match: '=' },
                    { field: 'processCode', value: processCode, match: '=' },
                ]);
                //按照设备去重，获取当前工序下的设备
                processArr = $Function.sqlDistinct(centerArr, ['equipCode']);
                var equip = [];
                processArr.forEach(function (process_Arr) {
                    equip.push(process_Arr.equipCode);
                });
                centerObj[centerCode][processCode] = equip;
            });
        });

        /**********************投料表字段配置  键为投料表字段名 值为 数据来源表.字段名 一一对应关系*********************/
        var putField = {
            ERPorder: 'productOrder_realTime.ERPorder',
            ERPbatch: 'productOrder_realTime.ERPbatch',
            jobID: 'productOrder_realTime.jobID',
            materialSmallBatch: 'materialObj.materialSmallBatch',
            putName: 'materialObj.materialName',
            putCode: 'materialObj.materialCode',
            planLine: 'productOrder_realTime.line',
            planProcess: 'productOrder_realTime.process',
            planCenter: 'productOrder_realTime.ERPGZZX',
            planWeight: 'materialObj.planWeight',
            planDateTime: 'productOrder_realTime.planStartTime',
        };

        /***********************收料表字段配置  键为收料表字段名 值为工单信息表字段名 一一对应关系***********************/
        //判断工单类型
        var getField = {
            ERPorder: 'ERPorder',
            ERPbatch: 'ERPbatch',
            jobID: 'jobID',
            materialSmallBatch: 'materialObj.materialSmallBatch',
            getName: productOrder_realTime.type == 1 ? 'ByProductName' : 'productName',
            getCode: productOrder_realTime.type == 1 ? 'ByProductCode' : 'productCode',
        };

        

        /*******************************生成投料批次表***************************** */
        var field = []; //插入投料表字段名
        var sqlStr = `INSERT INTO ${dataBaseConfig[1]} (${field.join(',')}) VALUES `;
        for (var key in putField) {
            //投料表字段名
            field.push(key);
        }
        materialObj.forEach(function (materialObj) {
            var value = []; //插入投料表字段值
            for (var key in putField) {
                var text = eval(putField[key].split('.')[0])[putField[key].split('.')[1]];
                value.push("'" + text + "'");
            }
            sqlStr += `(${value.join(',')}),`;
        });
        sqlStr.substring(0, sqlStr.length - 1);

        /****************************生成收料批次表******************************* */
        // for (var key in getField) {
        //     //收料表字段名
        //     field.push(key);
        //     //判断是否为私有成员对象字段
        //     if (putField[key].includes('.')) {
        //         var objKey = putField[key].split('.')[0];
        //         var objValue = putField[key].split('.')[1];
        //         //将私有成员对象反格式化
        //         var obj = JSON.parse(data[0][objKey]);
        //         value.push("'" + obj[objValue] + "'");
        //     } else {
        //         value.push("'" + data[0][putField[key]] + "'");
        //     }
        // }
        var sqlStr1 = `INSERT INTO ${dataBaseConfig[2]} (${field.join(',')}) VALUES (${value.join(',')})`;
        var res = $Function.toDataSet($System.BTR, sqlStr);
        var res1 = $Function.toDataSet($System.BTR, sqlStr1);
        if (!res) throw '已存在该制令单/配比单的收料计划！请先删除！';
        if (!res1) throw res.errorCode + ':' + res.message + '   收料批次生成失败失败！';
    } catch (e) {
        result.errorCode = 1;
        result.message = e;
        $Function.tip('error', e);
    } finally {
        return result;
    }
}
