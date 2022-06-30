/*
 * @Author: EDwin
 * @Date: 2021-12-10 13:39:42
 * @LastEditors: EDwin
 * @LastEditTime: 2022-05-14 10:21:58
 * @FilePath: /负极二期/功能模块代码/质检任务生成.js
 */
/**
 * @description: 实现生成原材料质检任务，半成品取样任务，半成品质检任务，成品取样任务，成品质检任务函数
 * @param {Number} taskType - 任务类型 1：原材料质检  3：半成品质检  5：成品质检
 * @param {object[]} info - 传入的原材料/半成品/成品信息(数组对象)
    *                         [{
                                    ERPorder: 'ERP订单号（若为原材料质检则该字段为ERP采购订单号）',
                                    ERPbatch: 'ERP批次号（一个ERP订单号对应多个ERP批次号，ERP批次号和MES批次号/ 制令单号/配比单号/工单号一一对应）（原材料则为ERP原材料大批次，成品则为根据MES大批次项ERP申请的ERP成品批次号）',
                                    jobID: '制令单号/配比单号（工单号，MES大批次号）----与MES大批次号一一对应（若为原材料则该字段为空）',
                                    jobIDS: '小批次号(若质检规则为首检则该参数为空)（原材料小批次或投料小批次）'（若为空则按大批次生成质检任务）
                                    rule1: '质检规则 1：全检 2：首检',(若不传入则默认为全检)
                                    exesponsor: '发起人',
                                    weight: '重量',
                                    remark: '备注',
                                    ****************************若为原材料质检需要加入如下对象******************************
                                    privateTaskObj: {
                                        supplierName: '供应商名称',
                                        supplierNumber: '供应商代码',
                                        WLMC: '物料名称',
                                        stockcode: '物料代码',
                                        stockmodel: '物料型号',
                                        GGXH: '规格类型',
                                        GYSPCH: '供应商批次号',
                                    }
                                    ***********************若为半成品取样/半成品质检/成品取样/成品质检需要加入如下字段***************************
                                   privateTaskObj: {
                                        processpath: '工序名称',
                                        line: '产线',
                                        station: '站点',
                                        equipName: '设备名称',
                                        productCode: '产品代码（成品或半成品）',
                                        productName: 产品名称
                                        productDescript: 产品描述
                                   }
                                }, ...]    
 * @return 
 */
var func = require('e:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/KP自定义函数');
async function QCtaskGenrate(taskType, info) {
    debugger;
    //数据库表完整路径名称(必须包含数据库名称)['质检实时任务表', '质检结果表', '质检项表', '库存批次信息表']
    var dataBase = ['[dbo].[QC_RealTimeTask]', '[dbo].[QC_result]', '[dbo].[QC_testitem]', '[dbo].[storage_batch]'];
    try {
        if (taskType != 1 && taskType != 3 && taskType != 5) throw new Error('[QCtaskGenrate] 传入参数taskType错误！');

        var QC_testitem = await func.toDataSet('$System.BTR', `SELECT * FROM ${dataBase[2]}`); //获取质检项数据集
        var QC_RealTimeTask = await func.toDataSet('$System.BTR', `SELECT * FROM ${dataBase[0]} WHERE tasktype IN (1, 3 ,5)`); //获取已完成的质检任务，用于在生成新任务的时候确定当前任务次数
        /*****************************生成质检任务单****************************** */
        var nowData = func.GetDataTimeFunc(); //获取任务生成时间
        var QC_result_insert = [];
        for (var i = 0; i < info.length; i++) {
            var QCtask = func.dataFilter(QC_RealTimeTask, [{
                    field: 'taskstatus',
                    value: '0,1,2,3',
                    match: 'in'
                },
                {
                    field: 'jobIDS',
                    value: info[i].jobIDS,
                    match: '='
                },
            ]);
            if (!QCtask) continue; // 若已存在该小批次质检任务，则不能重复生成
            var taskId = await func.getID(taskType + 1);
            /*************生成质检结果表QC_result***********/
            var stockCode;
            taskType == 1 ? (stockCode = info[i].privateTaskObj.stockcode) : (stockCode = info[i].privateTaskObj.productCode); //获取物料代码
            var task_testItem = func.dataFilter(QC_testitem, [{
                field: 'WLH',
                value: stockCode,
                match: '='
            }]);
            if (task_testItem == false) throw new Error('[QCtaskGenrate]  查询不到物料编号为' + stockCode + '的质检项信息!');
            task_testItem.forEach(function (item) {
                var obj = Object.assign(new Object(), item);
                obj.taskid = taskId;
                delete obj.type;
                QC_result_insert.push(obj);
            });
            /*************生成质检任务表QC_RealTimeTask**************/
            info[i].taskid = taskId;
            info[i].tasktype = taskType;
            info[i].starttime = nowData;
            info[i].privateTaskObj = JSON.stringify(info[i].privateTaskObj);
        }
        var res = await func.SqlInsert(QC_result_insert, dataBase[1]);
        if (!res) throw new Error('[QCtaskGenrate]  质检项结果表' + dataBase[1] + '插入失败！');
        var res = await func.SqlInsert(info, dataBase[0]);
        if (!res) throw new Error('[QCtaskGenrate]  质检任务表' + dataBase[0] + '插入失败！');
        /********************更新库存表storage_batch质检结果标志位****************** */
        var jobIDS = [];
        info.forEach(function (item) {
            if (jobIDS.indexOf(item.jobIDS) == -1) jobIDS.push("'" + item.jobIDS + "'"); //获取小批次号数组
        });
        var res2 = await func.toDataSet('$System.BTR', `UPDATE ${dataBase[3]} SET QCresult = 0 WHERE jobIDS IN (${jobIDS.join(',')})`);
        if (!res2) throw new Error('[QCtaskGenrate]  库存表' + dataBase[3] + '更新失败！');
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}