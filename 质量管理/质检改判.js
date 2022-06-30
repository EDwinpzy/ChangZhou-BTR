/*
 * @Author: EDwin
 * @Date: 2022-03-28 10:43:12
 * @LastEditors: EDwin
 * @LastEditTime: 2022-05-23 14:15:49
 */
/**
 * @type: KP函数
 * @description: 质检改判，改判结果回传ERP、MES、WMS，其中ERP按照大批次重量回传；调用该函数之前需要判断改判结果是否和原结果不一致，函数默认认为改判结果不一致
 * @param {object[]} QCtaskid - 质检任务单号数组
 * @param {number} overQCresult - 改判结果 0:不合格，1:合格
 * @return {object} 回传结果，若为空对象则改判成功
 */


try {

    //质检任务表
    var QC_dataBase = ['QC_RealTimeTask'];
    //WMS接口表信息['质检信息推送接口表', '立库库存']
    var WMS_dataBase = ['WMS_QCinfo', '[10.102.178.99].[BTRWMCS_CATHODE].[dbo].[V_Inventory_All]'];
    //MES内部表信息['库存批次信息表']
    var MES_dataBase = ['storage_batch', 'WMS_batch'];
    //ERP接口表信息['质检任务结果', '质检任务结果历史']
    var ERP_dataBase = ['QC_determination', 'QC_determination_history'];

    //变量声明
    var errorLog = {};
    var theLine_colon = []; //线边仓小批次数组加上引号
    var WMS_colon = []; //立库库存小批次加上引号
    var theLine_QCtask = {}; //线边仓库存的质检任务单信息
    var WMS_QCtask = {}; //立库库存的质检任务单信息
    var storage_batch = {}; //线边仓库存信息
    var WMS_batch = {}; //立库存信息

    //将质检任务单号数组加上单引号
    var QCtaskid_colon = [];
    QCtaskid.forEach(function (item) {
        QCtaskid_colon.push("'" + item + "'");
    });
    //获取质检任务单信息
    var QC_RealTimeTask = $Function.toDataSet($System.BTR, `SELECT * FROM ${QC_dataBase[0]} WHERE taskid IN (${QCtaskid_colon.join(',')})`);
    if (!QC_RealTimeTask || QC_RealTimeTask.length === 0) throw new Error('[OverQC] 查询质检任务失败！');
    QC_RealTimeTask = $Function.toMap(['taskid'], QC_RealTimeTask);

    //剔除出已改判过的，并将其返回到errorLog中
    QCtaskid_colon.length = 0;
    for (var taskid in QC_RealTimeTask) {
        if (StrToInt(QC_RealTimeTask[taskid].changeNum) > 0) {
            errorLog[taskid] = '任务单已改判过，不能再次改判！';
            delete QC_RealTimeTask[taskid];
        } else {
            QCtaskid_colon.push("'" + taskid + "'");
            //区分该批次是在线边仓还是立库,两种可能都会有
            var res1 = $Function.toDataSet($System.BTR, `SELECT * FROM ${MES_dataBase[0]} WHERE jobIDS = '${QC_RealTimeTask[taskid].jobIDS}'`);
            var reswms = $Function.toDataSet($System.BTR, `SELECT * FROM ${MES_dataBase[1]} WHERE jobIDS = '${QC_RealTimeTask[taskid].jobIDS}'`);
            if (res1.length > 0) { //在线边
                storage_batch[res1[0].jobIDS] = res1[0];
                theLine_QCtask[taskid] = QC_RealTimeTask[taskid]; //在线边仓
                theLine_colon.push("'" + QC_RealTimeTask[taskid].jobIDS + "'");
            } else if (reswms.length > 0) { //在立库
                var res2 = $Function.toDataSet($System.BTR, `SELECT * FROM ${WMS_dataBase[1]} WHERE secondBatch = '${QC_RealTimeTask[taskid].jobIDS}'`);
                if (res2.length > 0) {
                    WMS_batch[reswms[0].jobIDS] = reswms[0];
                    WMS_QCtask[taskid] = QC_RealTimeTask[taskid]; //在立库
                    WMS_colon.push("'" + QC_RealTimeTask[taskid].jobIDS + "'");
                } else {
                    errorLog[taskid] = '立库和线边仓中查询不到该批次库存信息！'; //即不在立库也不在线边仓
                }
            }
        }
    }

    /**************************MES回传************************ */
    if (theLine_colon.length > 0) {
        var res3 = $Function.toDataSet($System.BTR, `UPDATE ${QC_dataBase[0]} SET QCresult = ${overQCresult} WHERE taskid IN (${QCtaskid_colon.join(',')});UPDATE ${MES_dataBase[0]} SET QCresult = ${overQCresult} WHERE jobIDS IN (${theLine_colon.join(',')})`);
    }
    if (WMS_colon.length > 0) {
        var res3 = $Function.toDataSet($System.BTR, `UPDATE ${QC_dataBase[0]} SET QCresult = ${overQCresult} WHERE taskid IN (${QCtaskid_colon.join(',')});UPDATE ${MES_dataBase[1]} SET QCresult = ${overQCresult} WHERE jobIDS IN (${WMS_colon.join(',')})`);
    }

    /***************************WMS回传************************ */
    if (JSON.stringify(WMS_QCtask) !== '{}') { //在立库
        var WMS_insertArr = [];
        for (var taskid in WMS_QCtask) {
            var obj = {
                //WMS接口表字段信息及对应的值
                Item_No: WMS_QCtask[taskid].productCode,
                Batch_No: WMS_QCtask[taskid].jobID,
                SecondBatch_No: WMS_QCtask[taskid].jobIDS,
                Quality_Result: overQCresult == 0 ? '20' : '00',
                Sync_Time: $Function.GetDataTimeFunc(),
            };
            WMS_insertArr.push(obj);
        }
        var res4 = $Function.SqlInsert(WMS_insertArr, WMS_dataBase[0]);
    }

    /***************************ERP回传*************************** */
    if (JSON.stringify(QC_RealTimeTask) !== '{}') {
        var ERP_insertArr = {}; //合格/不合格重量字典,按大批次来统计
        for (var taskid in QC_RealTimeTask) {
            //原材料
            if (QC_RealTimeTask[taskid].tasktype == 1) {
                //查询被改判的记录
                var QC_determination_history_1 = $Function.toDataSet($System.BTR, `SELECT  TOP 1 * FROM ${ERP_dataBase[0]} WHERE CHARG = '${QC_RealTimeTask[taskid].jobID}' AND MSG_TYP = 'S' AND ZQCUD = '1' AND ACTIONTYPE = 'C'`); //合格记录
                var QC_determination_history_2 = $Function.toDataSet($System.BTR, `SELECT  TOP 1 * FROM ${ERP_dataBase[0]} WHERE CHARG = '${QC_RealTimeTask[taskid].jobID}' AND MSG_TYP = 'S' AND ZQCUD = '2' AND ACTIONTYPE = 'C'`); //不合格记录
                var QC_determination_history = {
                    1: QC_determination_history_1[0],
                    2: QC_determination_history_2[0]
                }
                if (QC_determination_history[1].length === 0 && QC_determination_history[2].length === 0) {
                    errorLog[taskid] = '[SAP]该批次没有给SAP回传质检信息！'
                } else {
                    //按大批次统计合格/不合格重量，以下是需要修改的字段
                    ERP_insertArr[QC_RealTimeTask[taskid].jobIDS] = {
                        BUDAT: $Function.GetDataFunc().replace(new RegExp('-', 'g'), ''),
                        GAMNG: QC_RealTimeTask[taskid].weight,
                        LGORT: storage_batch[QC_RealTimeTask[taskid].jobIDS].ERPStockposition,
                        LGORT1: overQCresult === 0 ? '4603' : storage_batch[QC_RealTimeTask[taskid].jobIDS].position, //原材料都在线边仓，不合格全部调拨到4603   线边仓改判为合格，则调回实物所在的ERP仓位，根据storage_batch表中的position字段判断
                        BWART: '311',
                        MJAHR: (new Date()).getFullYear(),
                        ZQCUD: overQCresult === 0 ? 2 : 1,
                        ACTIONTYPE: 'M'
                    };
                    if (overQCresult == 0) {
                        //不合格
                        if (QC_determination_history[1].length > 0) {
                            ERP_insertArr[QC_RealTimeTask[taskid].jobIDS][ZID_OLD] = QC_determination_history[1].ZID
                        } else {
                            errorLog[taskid] = '[SAP]该批次没有给SAP回传质检信息！'
                        }
                        //将改判记录不需要修改的字段放入需要插入的对象中
                        for (var key in QC_determination_history[1]) {
                            ERP_insertArr[QC_RealTimeTask[taskid].jobIDS][key] === undefined ? (ERP_insertArr[QC_RealTimeTask[taskid].jobIDS][key] = QC_determination_history[1][key]) : 1;
                        }
                    } else if (overQCresult == 1) {
                        //不合格
                        if (QC_determination_history[2].length > 0) {
                            ERP_insertArr[QC_RealTimeTask[taskid].jobIDS][ZID_OLD] = QC_determination_history[2].ZID
                        } else {
                            errorLog[taskid] = '[SAP]该批次没有给SAP回传质检信息！'
                        }
                        //将改判记录不需要修改的字段放入需要插入的对象中
                        for (var key in QC_determination_history[2]) {
                            ERP_insertArr[QC_RealTimeTask[taskid].jobIDS][key] === undefined ? (ERP_insertArr[QC_RealTimeTask[taskid].jobIDS][key] = QC_determination_history[2][key]) : 1;
                        }
                    }
                }
            } else if (QC_RealTimeTask[taskid].tasktype == 3 || QC_RealTimeTask[taskid].tasktype == 5) {
                //成品或半成品
                var LGORT1
                if (overQCresult === 0) {
                    //判定不合格
                    theLine_colon.indexOf("'" + QC_RealTimeTask[taskid].jobIDS + "'") === -1 ? LGORT1 = '7603' : LGORT1 = '4603'
                } else {
                    //判定合格
                    if (theLine_colon.indexOf("'" + QC_RealTimeTask[taskid].jobIDS + "'") === -1) {
                        //在立库
                        LGORT1 = WMS_batch[QC_RealTimeTask[taskid].jobIDS].position
                    } else {
                        //在线边仓
                        LGORT1 = storage_batch[QC_RealTimeTask[taskid].jobIDS].position
                    }
                }
                //查询被改判的记录
                var QC_determination_history = $Function.toDataSet($System.BTR, `SELECT TOP 1 * FROM ${ERP_dataBase[0]} WHERE reserved5 = '${QC_RealTimeTask[taskid].jobIDS}' AND MSG_TYP = 'S' AND ZQCUD IN ('1','2') AND ACTIONTYPE = 'C'`);
                if (QC_determination_history.length === 0) {
                    errorLog[taskid] = '[SAP]该批次没有给SAP回传质检信息！'
                } else {
                    //根据旧的记录更新改判回传的字段
                    ERP_insertArr[QC_RealTimeTask[taskid].jobIDS] = QC_determination_history[0];
                    ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].BUDAT = $Function.GetDataFunc().replace(new RegExp('-', 'g'), '');
                    ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].LGORT = WMS_batch[QC_RealTimeTask[taskid].jobIDS].ERPStockposition;
                    ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].LGORT1 = LGORT1;
                    ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].BWART = '311';
                    ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].ZQCUD = overQCresult === 0 ? 2 : 1;
                    ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].ACTIONTYPE = 'M';
                    ERP_insertArr[QC_RealTimeTask[taskid].jobIDS].ZID_OLD = QC_determination_history[0].ZID;
                }
            }
        }
        ERP_insertArr = $Function.toArray(ERP_insertArr);
        ERP_insertArr.forEach(function (item) {
            delete item.ZID;
            delete item.MSG_TYP;
            delete item.RET_MSG;
        })
        var res5 = $Function.SqlInsert(ERP_insertArr, ERP_dataBase[0]);
        if (!res5) throw new Error('[OverQC] 推送SAP失败！插入QC_determination失败！')
    }
    return errorLog;
} catch (e) {
    console.log(e);
    return false;
}