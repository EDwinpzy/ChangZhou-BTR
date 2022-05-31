/*
 * @Author: EDwin
 * @Date: 2021-12-27 09:40:33
 * @LastEditors: EDwin
 * @LastEditTime: 2022-05-24 09:14:29
 */
/**
 * @type: KC请求式脚本
 * @description: 质检结果回传，将结果更新到ERP接口表，WMS接口表，MES内部库存表,只有为成品半成品的收才会通过该函数回传ERP
 * @param {object[]} QCinfo - WMS质检推送信息
 *                                  {
                                        systematic: [1,2,3] '回传位置 1：ERP，2：WMS，3：MES'
                                        stockcode: '物料编号',
                                        stocktype： '物料类型 1：原材料  2：半成品/成品'
                                        jobID: '若为成品/半成品则是MES大批次，若为原材料则是ERP大批次',
                                        jobIDS: '原材料小批次/成品半成品小批次（收料小批次）',(若为空则按大批次来推送质检结果)
                                        QCresult: '质检结果 0：不合格 1：合格 ',
                                    }
 * @return {boolean} 成功返回true，失败返回false并在控制台打印错误信息
 */
//质检任务表
var QC_dataBase = ['QC_RealTimeTask', 'QC_result'];
//WMS接口表信息['质检信息推送接口表']
var WMS_dataBase = ['WMS_QCinfo'];
//MES内部表信息['库存批次信息表']
var MES_dataBase = ['storage_batch', 'WMS_batch'];
//WMS库存表
var WMS_dataBase = ['WMS_QCinfo', '[10.102.178.99].[BTRWMCS_CATHODE].[dbo].[WMS_batch]']
//SAP质检接口表
var SAP_dataBase = ['QC_determination', 'DetectionCharacteristicValue', 'Production_storage_withdrawal']
try {
    //获取批次信息
    var jobIDS = [], //线边仓和立库小批次带引号
        jobIDS_colon = [], //线边仓和立库小批次不带引号
        storage_jobIDS = [], //线边仓小批次
        WMS_jobIDS = []; //立库小批次
    if (QCinfo.jobIDS !== undefined && QCinfo.jobIDS !== '') {
        //按小批次推送
        //查询批次信息
        var storage_batch = $Function.toDataSet($System.BTR, `SELECT * FROM ${MES_dataBase[0]} WHERE jobIDS = '${QCinfo.jobIDS}'`);
        if (!storage_batch) throw new Error('[QCresultBack] storage_batch线边仓库存查询失败！');
        if (storage_batch.length > 0) storage_jobIDS.push(QCinfo.jobIDS)

        var WMS_batch = $Function.toDataSet($System.BTR, `SELECT * FROM ${MES_dataBase[1]} WHERE jobIDS = '${QCinfo.jobIDS}'`);
        if (!WMS_batch) throw new Error('[QCresultBack] WMS_batch立库库存查询失败！');
        if (WMS_batch.length > 0) WMS_jobIDS.push(QCinfo.jobIDS)

        var QC_RealTimeTask = storage_batch.concat(WMS_batch);
        if (QC_RealTimeTask.length === 0) throw new Error('[QCresultBack] 查询不到小批次号为' + QCinfo.jobIDS + '的小批次信息！')
        jobIDS.push("'" + QCinfo.jobIDS + "'");
        jobIDS_colon.push(QCinfo.jobIDS);
    } else { //按大批次推送
        //查询批次信息
        var storage_batch = $Function.toDataSet($System.BTR, `SELECT * FROM ${MES_dataBase[0]} WHERE jobID = '${QCinfo.jobID}'`);
        if (!storage_batch) throw new Error('[QCresultBack] storage_batch线边仓库存查询失败！');
        if (storage_batch.length > 0) storage_jobIDS.push(QCinfo.jobIDS)

        var WMS_batch = $Function.toDataSet($System.BTR, `SELECT * FROM ${MES_dataBase[1]} WHERE jobID = '${QCinfo.jobID}'`);
        if (!WMS_batch) throw new Error('[QCresultBack] WMS_batch立库库存查询失败！');
        if (WMS_batch.length > 0) WMS_jobIDS.push(QCinfo.jobIDS)

        var QC_RealTimeTask = storage_batch.concat(WMS_batch);
        if (QC_RealTimeTask.length === 0) throw new Error('[QCresultBack] 查询不到大批次号为' + QCinfo.jobID + '的小批次信息！')
        QC_RealTimeTask.forEach(function (item) {
            jobIDS.push("'" + item.jobIDS + "'");
            jobIDS_colon.push(QCinfo.jobIDS);
        })
    }
    /*******************************WMS质检信息推送接口*************************** */
    if (QCinfo.systematic.indexOf(2) > -1) {
        var WMS_config = { //WMS接口表字段信息及对应的值
            Item_No: QCinfo.stockcode,
            Batch_No: QCinfo.jobID,
            SecondBatch_No: '',
            Quality_Result: QCinfo.QCresult == 0 ? '20' : '00',
            Sync_Time: $Function.GetDataTimeFunc(),
        };
        //拼接数据集用于插入
        var arr = [];
        QC_RealTimeTask.forEach(function (item) {
            WMS_config.SecondBatch_No = item.jobIDS;
            var obj = Object.assign(new Object(), WMS_config);
            arr.push(obj);
        });
        var res = $Function.SqlInsert(arr, WMS_dataBase[0]);
        if (!res) throw new Error('[QCresultBack] WMS质检信息接口表插入失败！');
    }
    /*******************************MES内部库存表质检推送**************************** */
    if (QCinfo.systematic.indexOf(3) > -1) {
        //在线边仓
        storage_batch.forEach(function (item) {
            var ERPStockposition = QCinfo.QCresult === 0 ? "'4603'" : 'position'; //若判定为不合格全部调到4603
            var res = $Function.toDataSet($System.BTR, `UPDATE ${MES_dataBase[0]} SET ERPStockposition = ${ERPStockposition}, QCresult = ${QCinfo.QCresult} WHERE jobIDS = '${item.jobIDS}'`);
            if (!res) throw new Error('[QCresultBack]MES内部表' + MES_dataBase[0] + '更新失败！');
        })
        //在立库
        WMS_batch.forEach(function (item) {
            var ERPStockposition = QCinfo.QCresult === 0 ? "'7603'" : "'7602'"; //若判定为不合格全部调到7603
            var res1 = $Function.toDataSet($System.BTR, `UPDATE ${MES_dataBase[1]} SET ERPStockposition = ${ERPStockposition}, QCresult = ${QCinfo.QCresult} WHERE jobIDS  = '${item.jobIDS}'`);
            if (!res1) throw new Error('[QCresultBack]MES内部表' + MES_dataBase[1] + '更新失败！');
        })



    }
    /*********************************ERP质检结果推送************************************* */
    if (QCinfo.systematic.indexOf(1) > -1) {
        //只回传成品和半成品
        if (QCinfo.stocktype === 1) throw new Error('[QCresultBack] ' + QCinfo.jobID + '该大批次为原材料！不允许按小批次回传SAP！');
        var SAP_arr = []
        var year = date.getFullYear();
        var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var BUDAT = year + month + day; //格式20220203
        var HSDAT = year + month + day; //格式20220203
        var MJAHR = year; //物料凭证年度
        //查询生产入库接口获取质检物料凭证
        var Production_storage_withdrawal = $Function.toDataSet($System.BTR, `SELECT jobIDS, MATNR, GAMNG, HSDAT, RET_MSG FROM ${SAP_dataBase[2]} WHERE jobIDS IN (${jobIDS.join(',')}) AND MSG_TYP = 'S'`)
        if (!Production_storage_withdrawal || Production_storage_withdrawal.length === 0) throw new Error('[QCresultBack]SAP接口表' + SAP_dataBase[2] + '查询失败！无法获取返回的物料凭证！');
        Production_storage_withdrawal = $Function.toMap(['jobIDS'], Production_storage_withdrawal);
        QC_RealTimeTask = $Function.toMap(['jobIDS'], QC_RealTimeTask)
        for (var jobIDS in Production_storage_withdrawal) {
            Production_storage_withdrawal[jobIDS].RET_MSG = Production_storage_withdrawal[jobIDS].RET_MSG.substring(0, 10); //截取前十位作为物料凭证
            //判断该小批次在线边仓还是在立库
            if (storage_jobIDS.indexOf(jobIDS) > -1) {
                //在线别仓
                var LGORT1 = QCinfo.QCresult == 0 ? '4603' : QC_RealTimeTask[jobIDS].position;
            } else {
                //在立库
                var LGORT1 = QCinfo.QCresult == 0 ? '7603' : '7602';
            }
            var obj = {
                BUDAT: BUDAT,
                AUFNR: QC_RealTimeTask[jobIDS].ERPorder,
                MATNR: QC_RealTimeTask[jobIDS].stockcode,
                GAMNG: QC_RealTimeTask[jobIDS].weight,
                WERKS: '1060',
                LGORT: QC_RealTimeTask[jobIDS].ERPStockposition,
                LGORT1: LGORT1,
                CHARG: QC_RealTimeTask[jobIDS].ERPbatch,
                HSDAT: Production_storage_withdrawal[jobIDS].HSDAT,
                BWART: '321',
                KDAUF: QC_RealTimeTask[jobIDS].ERPorder,
                MBLNR: Production_storage_withdrawal[jobIDS].RET_MSG,
                ZEILE: '1',
                INSMK: '02',
                ZQCUD: QCinfo.QCresult == 0 ? 2 : 1,
                reserved5: (QCinfo.jobIDS !== undefined && QCinfo.jobIDS !== '') ? QCinfo.jobIDS : QCinfo.jobID,
                MEINS: 'KG',
                STEMFROM: 'FJ2',
                ACTIONTYPE: 'C',
                MJAHR: year
            }
            SAP_arr.push(obj)
        }
        var res = $Function.SqlInsert(SAP_arr, SAP_dataBase[0]);
        if (!res) throw new Error('[QCresultBack] SAP质检信息接口表' + SAP_dataBase[0] + '插入失败！');

        //检测特征值回传
        var QC_testItem_arr = []
        for (var jobIDS in Production_storage_withdrawal) {
            var QC_result = $Function.toDataSet($System.BTR, `SELECT * FROM ${QC_dataBase[0]} a JOIN ${QC_dataBase[1]} b ON A.taskid = B.taskid WHERE A.jobIDS = '${jobIDS}'`)
            QC_result.forEach(function (item) {
                var obj = {
                    MATNR: QC_RealTimeTask[jobIDS].stockcode,
                    CHARG: QC_RealTimeTask[jobIDS].jobID,
                    STEMFROM: 'FJ2',
                    ZMTZ38: QC_RealTimeTask[jobIDS].ERPbatch,
                }
                QC_testItem_arr.push(obj);
            })
        }
        var res = $Function.SqlInsert(QC_testItem_arr, SAP_dataBase[1]);
        if (!res) throw new Error('[QCresultBack] SAP质检项信息接口表' + SAP_dataBase[1] + '插入失败！');
    }
    return true;
} catch (e) {
    console.log(e);
    return false;
}