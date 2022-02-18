/*
 * @Author: EDwin
 * @Date: 2021-12-30 09:03:49
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 15:45:12
 */
/**
 * @type: KC请求式脚本
 * @description: 投料/收料 计划/实际 批次生成，投料按原材料小批次投，收料按工单（mes大批次收料）
 * @param {object[object]} InParam.jobID - 制令单号/配比单号（工单号,MES成品批次号）
 * @param {number} rule - 投料收料批次生成规则 1：按ERP工作中心生成  2：按工序生成  3：按设备生成
 * @return {*}
 */
function FeedAndReceipt(InParam, OutParam, RequestID, Token) {
    var jobID = InParam.jobID;
    //数据库基础信息配置数组['生产工单表', '投料实时计划表', '收料历史计划表', '物料排产批次信息表', '工作中心表']
    var dataBaseConfig = ['productOrder_realTime', 'put_realTime', 'get_realTime', 'materialObj', 'basic_center'];

    try {
        /**************************查询工单信息表，获取投料和收料信息************************/
        var productOrder_realTime = toDataSet(global.BTR, `SELECT * FROM ${dataBaseConfig[0]} WHERE jobID = '${jobID}'`);
        if (!productOrder_realTime) throw '工单信息表' + dataBaseConfig[0] + '查询失败！';
        productOrder_realTime = productOrder_realTime[0]; //对象

        /*******************************查询物料排产批次表******************************* */
        var materialObj = toDataSet(global.BTR, `SELECT * FROM ${dataBaseConfig[3]} WHERE jobID = '${jobID}'`);
        if (!materialObj) throw '物料排产批次表' + dataBaseConfig[3] + '查询失败！';

        /**********************************查询工作中心信息******************************* */
        var basic_center = toDataSet(global.BTR, `SELECT * FROM ${dataBaseConfig[4]}`);
        if (!basic_center) throw '工作中心表' + dataBaseConfig[4] + '查询失败！';

        /**********************投料表字段配置  键为投料表字段名 值为 数据来源表.字段名 一一对应关系*********************/
        var putField = {
            ERPorder: 'productOrder_realTime.ERPorder', //ERP生产订单号
            ERPbatch: 'productOrder_realTime.ERPbatch', //ERP批次号
            jobID: 'productOrder_realTime.jobID', //工单号
            materialSmallBatch: 'materialObj.materialSmallBatch', //原材料小批次
            putName: 'materialObj.materialName', //投料名称（原材料名称）
            putCode: 'materialObj.materialCode', //投料代码（原材料代码）
            planLine: 'productOrder_realTime.line', //计划线别（产线：天然还是人造）
            planWeight: 'materialObj.planWeight', //计划投料重量
            planDateTime: 'productOrder_realTime.planStartTime', //计划投料时间
            planCenter: 'basic_center.centerCode', //计划工作中心
            processCode: 'basic_center.planProcess', //计划工序
            equipCode: 'basic_center.planEquip', //计划设备/站点
        };
        var putField_field = []; //插入投料表字段名
        for (var key in putField) {
            //投料表字段名
            putField_field.push(key);
        }
        /***********************收料表字段配置  键为收料表字段名 值为工单信息表字段名 一一对应关系***********************/
        //判断工单类型
        var getField = {
            ERPorder: 'productOrder_realTime.ERPorder', //ERP生产订单号
            ERPbatch: 'productOrder_realTime.ERPbatch', //ERP批次号
            jobID: 'productOrder_realTime.jobID', //工单号
            productSmallBatch: '',
            getName: productOrder_realTime.type == 1 ? 'ByProductName' : 'productName',
            getCode: productOrder_realTime.type == 1 ? 'ByProductCode' : 'productCode',
            planCenter: 'basic_center.centerCode', //计划工作中心
            processCode: 'basic_center.planProcess', //计划工序
            equipCode: 'basic_center.planEquip', //计划设备/站点
        };

        var sqlStr = `INSERT INTO ${dataBaseConfig[1]} (${putField_field.join(',')}) VALUES `; //投料表SQL语句
        var sqlStr1 = `INSERT INTO ${dataBaseConfig[2]} (${field.join(',')}) VALUES (${value.join(',')})`; //收料表SQL语句
        basic_center = dataFilter(basic_center, [{ field: 'centerCode', value: productOrder_realTime.ERPGZZX, match: '=' }]);
        switch (rule) {
            case 1:
                basic_center = sqlDistinct(basic_center, ['centerCode']); //对工作中心去重
                basic_center.forEach(function (item) {
                    item.processCode = ''; //将工序赋值为空
                    item.equipCode = ''; //将设备赋值为空
                });
                break;
            case 2:
                basic_center = sqlDistinct(basic_center, ['processCode']); //对工序去重
                basic_center.forEach(function (item) {
                    item.equipCode = '';
                });
                break;
        }
        basic_center.forEach(function (item) {
            putField_field.forEach(function (field) {
                item[field] = eval(putField[field].split('.')[0])[putField[field].split('.')[1]];
            });
        });
        basic_center.forEach(function (basic_center, index) {
            //每种原料都要生成一条投料收料计划
            for (var i = 0; i < materialObj.length; i++) {
                //生成值数组
                var putField_value = [];
                var getField_value = [];
                //投料
                putField_field.forEach(function (field) {
                    if (eval(putField[field].split('.')[0])[putField[field].split('.')[1]] == undefined) {
                        putField_value.push(eval(putField[field].split('.')[0])[i][putField[field].split('.')[1]]);
                    } else {
                        putField_value.push("'" + eval(putField[field].split('.')[0])[putField[field].split('.')[1]] + "'");
                    }
                });
                //收料
                getField_field.forEach(function (field) {
                    //生成收料小批次
                    if (field == 'productSmallBatch') {
                        index += 1;
                        getField_value.push("'" + basic_center.centerCode + basic_center.processCode + basic_center.equipCode + '-' + index + "'");
                    } else {
                        getField_value.push("'" + eval(getField[field].split('.')[0])[getField[field].split('.')[1]] + "'");
                    }
                });
            }
            sqlStr += `(${putField_value.join(',')}),`;
            sqlStr1 += `(${getField_value.join(',')}),`;
        });
        sqlStr.substring(0, sqlStr - 1);
        sqlStr1.substring(0, sqlStr1 - 1);
        var res = toDataSet(global.BTR, sqlStr);
        var res1 = toDataSet(global.BTR, sqlStr1);
        if (!res || !res1) throw '投料/收料计划生成失败！';
        OutParam.result = true;
    } catch (e) {
        logWrite(dirname, text);
        OutParam.result = false;
        OutParam.message = e;
    } finally {
        endResponse(RequestID);
    }
}
