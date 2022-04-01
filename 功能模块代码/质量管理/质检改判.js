/*
 * @Author: EDwin
 * @Date: 2022-03-28 10:43:12
 * @LastEditors: EDwin
 * @LastEditTime: 2022-03-30 21:08:17
 */
/**
 * @type: KP函数
 * @description: 质检改判，改判结果回传ERP、MES、WMS，其中ERP按照大批次重量回传；调用该函数之前需要判断改判结果是否和原结果不一致，函数默认认为改判结果不一致
 * @param {object[]} QCtaskid - 质检任务单号数组
 * @param {number} overQCresult - 改判结果 0:不合格，1:合格
 * @return {boolean} 回传结果
 */

async function OverQC(QCtaskid, overQCresult) {
    try {
        var func = require('e:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/KP自定义函数');
        //质检任务表
        var QC_dataBase = ['QC_RealTimeTask'];
        //WMS接口表信息['质检信息推送接口表', '立库库存']
        var WMS_dataBase = ['WMS_QCinfo', '[10.102.178.99].[BTRWMCS_CATHODE].[dbo].[V_Inventory_All]'];
        //MES内部表信息['库存批次信息表']
        var MES_dataBase = ['storage_batch'];
        //ERP接口表信息['质检任务结果', '质检任务结果历史']
        var ERP_dataBase = ['QC_determination', 'QC_determination_history'];
        var errorLog = {};

        //将质检任务单号数组加上单引号
        var QCtaskid_colon = [];
        QCtaskid.forEach(function (item) {
            QCtaskid_colon.push("'" + item + "'");
        });
        var theLine_colon = []; //线边仓小批次数组加上引号
        var WMS_colon = []; //立库库存小批次加上引号
        //获取质检任务单信息
        var QC_RealTimeTask = await func.toDataSet('$System.BTR', `SELECT * FROM ${QC_dataBase[0]} WHERE taskid IN (${QCtaskid_colon.join(',')})`);
        if (!QC_RealTimeTask) throw new Error('[OverQC] 查询质检任务失败！');
        QC_RealTimeTask = func.toMap(['taskid'], QC_RealTimeTask);
        QCtaskid_colon.length = 0;
        var theLine_QCtask = {}; //线边仓库存的质检任务单信息
        var WMS_QCtask = {}; //立库库存的质检任务单信息
        var storage_batch = {}; //线边仓库存信息
        //剔除出已改判过的，并将其返回到errorLog中
        for (var taskid in QC_RealTimeTask) {
            if (QC_RealTimeTask[taskid].changeNum > 0) {
                errorLog[taskid] = '该任务单已改判过，不能再次改判！';
                delete QC_RealTimeTask[taskid];
            } else {
                QCtaskid_colon.push("'" + taskid + "'");
                //区分该批次是在线边仓还是立库
                var res1 = await func.toDataSet('$System.BTR', `SELECT * FROM ${MES_dataBase[0]} WHERE jobIDS = '${QC_RealTimeTask[taskid].jobIDS}'`);
                if (res1.length > 0) {
                    storage_batch[res1[0].jobIDS] = res1[0];
                    theLine_QCtask[taskid] = QC_RealTimeTask[taskid]; //在线边仓
                    theLine_colon.push("'" + QC_RealTimeTask[taskid].jobIDS + "'");
                } else {
                    var res2 = await func.toDataSet('$System.BTR', `SELECT * FROM ${WMS_dataBase[1]} WHERE secondBatch = '${QC_RealTimeTask[taskid].jobIDS}'`);
                    if (res2.length > 0) {
                        WMS_QCtask[taskid] = QC_RealTimeTask[taskid]; //在立库
                        WMS_colon.push("'" + QC_RealTimeTask[taskid].jobIDS + "'");
                    } else {
                        errorLog[taskid] = '立库和线边仓中查询不到该批次库存信息！'; //即不在立库也不在线边仓
                    }
                }
            }
        }

        /**************************MES************************ */
        var res3 = await func.toDataSet('$System.BTR', `UPDATE ${QC_dataBase[0]} SET QCresult = ${overQCresult} AND changeNum = 1 WHERE taskid IN (${QCtaskid_colon.join(',')});UPDATE ${MES_dataBase[0]} SET QCresult = ${overQCresult} WHERE jobIDS IN (${theLine_colon.join(',')})`);
        //需不需要该storage_batch表的ERP库位

        /***************************WMS************************ */
        var WMS_insertArr = [];
        for (var taskid in WMS_QCtask) {
            var obj = {
                //WMS接口表字段信息及对应的值
                Item_No: WMS_QCtask[taskid].productCode,
                Batch_No: WMS_QCtask[taskid].jobID,
                SecondBatch_No: WMS_QCtask[taskid].jobID,
                Quality_Result: overQCresult == 0 ? 20 : 00,
                Sync_Time: func.GetDataTimeFunc(),
            };
            WMS_insertArr.push(obj);
        }
        var res4 = func.SqlInsert(WMS_insertArr, WMS_dataBase[0]);
        if (!res4) throw new Error('[OverQC] 改判结果回传至WMS失败！');

        /***************************ERP*************************** */
        var ERP_insertArr = {}; //合格/不合格重量字典,按大批次来统计
        for (var taskid in QC_RealTimeTask) {
            if (QC_RealTimeTask[taskid].tasktype == 1) {
                //原材料
                if (ERP_insertArr[QC_RealTimeTask[taskid].jobID] === undefined) {
                    //查询被改判的记录
                    var QC_determination_history = await func.toDataSet('$System.BTR', `SELECT * FROM ${ERP_dataBase} WHERE CHARG = '${QC_RealTimeTask[taskid].jobID}' TOP 1`);
                    //按大批次统计合格/不合格重量，以下是需要修改的字段
                    ERP_insertArr[QC_RealTimeTask[taskid].jobID] = {
                        BUDAT: func.GetDataFunc().replace(new RegExp('-', 'g'), ''),
                        GAMNG: QC_RealTimeTask[taskid].weight,
                        LGORT: storage_batch[QC_RealTimeTask[taskid].jobIDS].ERPStockposition,
                        LGORT1: overQCresult === 0 ? '4603' : '1601',
                        BWART: '311',
                        MJAHR: QC_RealTimeTask[taskid].weight,
                        ZQCUD: overQCresult === 0 ? 2 : 1,
                        ACTIONTYPE: 'M',
                        ZID_OLD: QC_determination_history[0].ZID,
                    };
                    //将改判记录不需要修改的字段放入需要插入的对象中
                    for (var key in QC_determination_history[0]) {
                        ERP_insertArr[QC_RealTimeTask[taskid].jobID][key] === undefined ? (ERP_insertArr[QC_RealTimeTask[taskid].jobID][key] = QC_determination_history[0][key]) : 1;
                    }
                } else {
                    ERP_insertArr[QC_RealTimeTask[taskid].jobID].GAMNG += QC_RealTimeTask[taskid].weight;
                }
            } else if (QC_RealTimeTask[taskid].tasktype == 3 || QC_RealTimeTask[taskid].tasktype == 5) {
                //成品或半成品
                //查询被改判的记录
                var QC_determination_history = await func.toDataSet('$System.BTR', `SELECT * FROM ${ERP_dataBase} WHERE reserved5 = '${QC_RealTimeTask[taskid].jobIDS}' TOP 1`);
                ERP_insertArr[QC_RealTimeTask[taskid].jobIDS] = QC_determination_history[0];
                //根据旧的记录更新改判回传的字段
                ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].BUDAT = func.GetDataFunc().replace(new RegExp('-', 'g'), '');
                ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].LGORT = storage_batch[QC_RealTimeTask[taskid].jobIDS].ERPStockposition;
                ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].LGORT1 = overQCresult === 0 ? '4603' : storage_batch[QC_RealTimeTask[taskid].jobIDS].ERPStockposition;
                ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].BWART = '311';
                ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].ZQCUD = overQCresult === 0 ? 2 : 1;
                ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].ACTIONTYPE = 'M';
                ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].ZID_OLD = QC_determination_history[0].ZID;
            }
        }
        ERP_insertArr = func.toArray(ERP_insertArr);
        var res5 = func.SqlInsert(ERP_insertArr, ERP_dataBase[0]);
        if (!res5) throw new Error('[OverQC] 改判结果回传至ERP失败！');
        return errorLog == '' ? true : errorLog;
    } catch (e) {
        console.log(e);
        return false;
    }
}
