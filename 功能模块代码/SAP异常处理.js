/*
 * @Author: EDwin
 * @Date: 2022-05-27 13:59:36
 * @LastEditors: EDwin
 * @LastEditTime: 2022-05-31 15:49:40
 */
/**
 * @type: 
 * @description: 用于分析月结盘点时的mes与sap账务不一致的问题，主要是根据小批次进行全流程追溯，最终给出处理意见，选择是否自动处理
 * @param {string} jobIDS - 小批次号
 * @param {string} SAP_weight - SAP中的重量
 * @param {string} SAP_position = SAP中的仓位
 * @return {*}
 */

//基本物料类
class BasicMaterialInformation {
    constructor(jobID, jobIDS, QCresult, weight) {
        this.jobID = jobID; //MES大批次
        this.jobIDS = jobIDS; //MES小批次
        this.QCresult = QCresult; //质检结果
        this.weight = weight; //实际重量
    }
}
//原材料类
class Material extends BasicMaterialInformation {
    constructor(jobID, jobIDS, QCresult, weight, purchaseOrder, material_weight, material_indataTime) {
        super(jobID, jobIDS, QCresult, weight);
        this.purchaseOrder = purchaseOrder; //采购订单
        this.material_weight = material_weight; //采购重量
        this.material_indataTime = material_indataTime; //入库时间
    }
}
//半成品类
class ByProduct extends BasicMaterialInformation {
    constructor(jobID, jobIDS, QCresult, weight, ByProduct_wordOrder, ByProduct_dataTime) {
        super(jobID, jobIDS, QCresult, weight);
        this.ByProduct_wordOrder = ByProduct_wordOrder; //生产工单号
        this.ByProduct_dataTime = ByProduct_dataTime //生产时间
    }
}
//数据库类
class DataBase {
    constructor() {
        this.ERP_DBName = {
            MATDOC: 'MATDOC'
        };
        this.MES_DBName = {
            storage_batch: 'storage_batch',
            storage_task: 'storage_task',
            storage_task_history: 'storage_task_history',
            Theline_Task: 'Theline_Task',
            Theline: '[192.168.0.230].[负极服务器].[dbo].[Theline] '
        }
        this.WMS_DBName = {
            WMS_batch: 'WMS_batch',
            V_storage_1: '[192.168.0.230].[负极服务器].[dbo].[V_storage_1] '
        }
    }
}
//仓库任务单类
class StorageTask {
    constructor(taskId) {
        this.taskId = taskId
        this.startTime
        this.endTime
    }
}
debugger
async function exceptionHanding(jobIDS, SAP_weight, SAP_position) {
    var func = require('E:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/KP自定义函数.js')
    var errorLog;
    var database = new DataBase();
    try {
        /****************************查询该批次的库存信息*************************** */
        var storage_batch = await func.toDataSet($System.BTR, `SELECT * FROM ${database.MES_DBName.storage_batch} WHERE jobIDS = ''${jobIDS}`); //六号线边仓
        var WMS_batch = await func.toDataSet($System.BTR, `SELECT * FROM ${database.WMS_DBName.WMS_batch} WHERE jobIDS = '${jobIDS}'`); //六号立库
        if (!storage_batch || !WMS_batch) throw new Error('[retrospect] 库存表' + database.MES_DBName.storage_batch + ' ' + database.WMS_DBName.WMS_batch + '查询失败！');
        var storage_task = await func.toDataSet($System.BTR, `SELECT * FROM ${database.MES_DBName.storage_task} WHERE jobIDS = '${jobIDS}' AND taskstatus = 1`); //查询仓库任务单
        if (!storage_task) throw new Error('[retrospect] 仓库任务单表' + database.MES_DBName.storage_task + '查询失败！')
        var storage_task_history = await func.toDataSet($System.BTR, `SELECT * FROM ${database.MES_DBName.storage_task_history} WHERE jobIDS = '${jobIDS}' AND taskstatus = 1`); //查询仓库历史任务单
        if (!storage_task_history) throw new Error('[retrospect] 仓库任务单表' + database.MES_DBName.storage_task_history + '查询失败！')
        storage_task = storage_task.concat(storage_task_history)
        func.sqlOrder(storage_task, [{
            name: 'starttime',
            rule: 'ASC'
        }])
        switch (true) {
            //立库和线边仓中都无该库存信息
            case storage_batch.length === 0 && WMS_batch.length === 0:
                if (storage_task.length === 0) {
                    //仓库任务单中无该小批次信息
                    errorLog = {
                        errorCode: 1001,
                        message: '系统中无该批次任务信息！请检查输入批次是否正确！'
                    }
                } else {
                    //仓库任务单中有该小批次信息，则继续查询调度记录
                }
                break;
            case storage_batch.length > 0 && WMS_batch.length > 0:
                break;
            case storage_batch.length > 0:
                break;
            case WMS_batch.length > 0:
                break;
            default:
                break;
        }

    } catch (e) {}
}
exceptionHanding('123')