/*
 * @Author: EDwin
 * @Date: 2022-05-31 15:49:29
 * @LastEditors: EDwin
 * @LastEditTime: 2022-05-31 17:10:25
 */
/**
 * @type: KP自定义函数 业务函数
 * @description: 根据物料小批次追溯整个物料移动的流程
 * @param {string} jobIDS - 小批次
 * @param {number} stockType = 物料类型 1：原材料 2：成品/半成品
 * @return {object} 返回追溯结果
 */
async function retrospect(jobIDS) {
    var func = require('E:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/KP自定义函数.js')
    var ERP_DBName = {
        MATDOC: 'MATDOC'
    };
    var MES_DBName = {
        storage_batch: 'storage_batch',
        storage_task: 'storage_task',
        storage_task_history: 'storage_task_history',
        Theline_Task: 'Theline_Task',
        Theline: '[192.168.0.230].[负极服务器].[dbo].[Theline] '
    }
    var WMS_DBName = {
        WMS_batch: 'WMS_batch',
        V_storage_1: '[192.168.0.230].[负极服务器].[dbo].[V_storage_1] '
    }
    try {
        var storage_task = await func.toDataSet($System.BTR, `SELECT * FROM ${database.MES_DBName.storage_task} WHERE jobIDS = '${jobIDS}' AND taskstatus = 1`); //查询仓库任务单
        if (!storage_task) throw new Error('[retrospect] 仓库任务单表' + database.MES_DBName.storage_task + '查询失败！')
        var storage_task_history = await func.toDataSet($System.BTR, `SELECT * FROM ${database.MES_DBName.storage_task_history} WHERE jobIDS = '${jobIDS}' AND taskstatus = 1`); //查询仓库历史任务单
        if (!storage_task_history) throw new Error('[retrospect] 仓库任务单表' + database.MES_DBName.storage_task_history + '查询失败！')
        storage_task = storage_task.concat(storage_task_history)
        func.sqlOrder(storage_task, [{
            name: 'starttime',
            rule: 'ASC'
        }])
        switch (stockType) {
            //原材料
            case 1:
                /********************************* 原材料领料记录******************************/

                break;
                //成品/半成品
            case 2:
                break;
            default:
                break;

        }
    } catch (e) {

    }
}