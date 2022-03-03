/*
 * @Author: EDwin
 * @Date: 2021-12-30 09:03:49
 * @LastEditors: EDwin
 * @LastEditTime: 2022-03-01 15:26:44
 */
/**
 * @type: KC请求式脚本
 * @description: 投料/收料 计划/实际 批次生成，投料按原材料小批次投，收料按工单（mes大批次收料）
 * @param {string} jobID - 制令单号/配比单号（工单号,MES成品批次号）
 * @param {number} rule - 投料收料批次生成规则 1：按ERP工作中心生成  2：按工序生成  3：按设备生成
 * @return {*}
 */
async function FeedAndReceipt(jobID, rule) {
    debugger;
    var func = require('E:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/KP自定义函数');
    //数据库基础信息配置数组['生产工单表', '投料实时计划表', '收料历史计划表', '物料排产批次信息表', '工作中心表']
    var dataBaseConfig = ['productOrder_realTime', 'put_realTime', 'get_realTime', 'materialObj', 'basic_center'];
    try {
        /**************************查询工单信息表，获取投料和收料信息************************/
        var productOrder_realTime = await func.toDataSet('global.BTR', `SELECT * FROM ${dataBaseConfig[0]} WHERE jobID = '${jobID}'`);
        if (!productOrder_realTime) throw new Error('[FeedAndReceipt] 工单信息表' + dataBaseConfig[0] + '查询失败！');
        productOrder_realTime = productOrder_realTime[0]; //对象

        /*******************************查询物料排产批次表******************************* */
        var materialObj = await func.toDataSet('global.BTR', `SELECT * FROM ${dataBaseConfig[3]} WHERE jobID = '${jobID}'`);
        if (!materialObj) throw new Error('[FeedAndReceipt] 物料排产批次表' + dataBaseConfig[3] + '查询失败！');

        /**********************************查询工作中心信息******************************* */
        var basic_center = await func.toDataSet('global.BTR', `SELECT * FROM ${dataBaseConfig[4]}`);
        if (!basic_center) throw new Error('[FeedAndReceipt] 工作中心表' + dataBaseConfig[4] + '查询失败！');
        basic_center = await func.dataFilter(basic_center, [{ field: 'centerCode', value: productOrder_realTime.ERPGZZX, match: '=' }]); //筛选当前工单的工作中心信息
        switch (rule) {
            case 1:
                //若按工作中心生成
                basic_center = await func.sqlDistinct(basic_center, ['centerCode']);
                break;
            case 2:
                //若按工序生成
                basic_center = await func.sqlDistinct(basic_center, ['processCode']);
                break;
            case 3:
                //若按设备生成
                basic_center = await func.sqlDistinct(basic_center, ['equipCode']);
                break;
        }
        var putDataSet = []; //投料表数据集
        var getDataSet = []; //收料表数据集
        for (var i = 0; i < basic_center.length; i++) {
            for (var j = 0; j < materialObj.length; j++) {
                //投料
                var putObj = {
                    ERPorder: productOrder_realTime.ERPorder, //ERP生产订单号
                    ERPbatch: productOrder_realTime.ERPbatch, //ERP批次号
                    jobID: productOrder_realTime.jobID, //工单号
                    materialSmallBatch: materialObj[j].materialSmallBatch, //原材料小批次
                    putName: materialObj[j].materialName, //投料名称（原材料名称）
                    putCode: materialObj[j].materialNumber, //投料代码（原材料代码）
                    planLine: productOrder_realTime.line, //计划线别（产线：天然还是人造）
                    planCenter: basic_center[i].centerCode, //计划工作中心
                    planProcess: basic_center[i].processCode, //计划工序
                    planEquip: basic_center[i].equipCode, //计划设备/站点
                    planDateTime: productOrder_realTime.planStartTime, //计划投料时间
                    planWeight: materialObj[j].planWeight, //计划投料重量
                    planYieldRate: '0.9',
                };
                putDataSet.push(putObj);
                //收料
                var getObj = {
                    ERPorder: productOrder_realTime.ERPorder, //ERP生产订单号
                    ERPbatch: productOrder_realTime.ERPbatch, //ERP批次号
                    jobID: productOrder_realTime.jobID, //工单号
                    getName: productOrder_realTime.productName == '' ? productOrder_realTime.ByProductName : productOrder_realTime.productName, //收料名称（成品/半成品名称）
                    getCode: productOrder_realTime.productCode == '' ? productOrder_realTime.ByProductCode : productOrder_realTime.productCode, //收料代码（成品/半成品代码）
                    planCenter: basic_center[i].centerCode, //计划工作中心
                    planProcess: basic_center[i].processCode, //计划工序
                    planEquip: basic_center[i].equipCode, //计划设备/站点
                    planYieldRate: '0.9',
                };
                getDataSet.push(getObj);
            }
        }
        var res1 = await func.SqlInsert(putDataSet, 'put_realTime');
        var res2 = await func.SqlInsert(getDataSet, 'get_realTime');
        if (!res1 || !res2) throw new Error('[FeedAndReceipt] 投料/收料计划生成失败！');
        return true;
    } catch (e) {
        // logWrite(dirname, text);
        console.log(e);
        return false;
    }
}
