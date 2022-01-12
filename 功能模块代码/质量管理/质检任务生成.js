/*
 * @Author: EDwin
 * @Date: 2021-12-10 13:39:42
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-12 13:47:11
 * @FilePath: \负极二期\功能模块代码\质检任务生成.js
 */
/**
 * @description: 实现生成原材料质检任务，半成品取样任务，半成品质检任务，成品取样任务，成品质检任务函数
 * @param {Number} taskType - 任务类型 1：原材料质检 2：半成品取样 3：半成品质检 4：成品取样 5：成品质检
 * @param {string} exesponsor - 发起人
 * @param {object[]} info - 传入的原材料/半成品/成品信息(数组对象)
    *                         [{
                                    ERPorder: 'ERP订单号（若为原材料质检则该字段为ERP采购订单号）',
                                    ERPbatch: 'ERP批次号（一个ERP订单号对应多个ERP批次号，ERP批次号和MES批次号/ 制令单号/配比单号/工单号一一对应）（原材料则为ERP原材料大批次，成品则为根据MES大批次项ERP申请的ERP成品批次号）',
                                    jobID: '制令单号/配比单号（工单号，MES大批次号）----与MES大批次号一一对应（若为原材料则该字段为空）',
                                    jobIDS: '小批次号(若质检规则为首检则该参数为空)（原材料小批次或投料小批次）',
                                    rule: '质检规则 1：全检 2：首检',(若不传入则默认为全检)
                                    exesponsorv: '发起人',
                                    remark: '备注',
                                    ****************************若为原材料质检需要加入如下对象******************************
                                    privateTaskObj: {
                                        taskid: '入库单号',
                                        starttime: '入库时间',
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
                                        supplierNumber: '设备名称',
                                        productCode: '产品代码（成品或半成品）',
                                        productName: 产品名称
                                        productDescript: 产品描述
                                   }
                                }, ...]    
 * @return {number} {errorCode: 0, message: ''}
 */
function QCtaskGenrate(taskType, exeCutor, info) {
    //数据库表完整路径名称(必须包含数据库名称)['质检实时任务表', '质检结果表', '质检项表', '库存批次信息表']
    var dataBase = ['[dbo].[QC_RealTimeTask]', '[dbo].[QC_result]', '[dbo].[QC_testitem]', '[dbo].[storage_batch]'];
    try {
        var result = {
            errorCode: 0,
            message: '',
        };
        var nowData = $Function.GetDataTimeFunc(); //获取任务生成时间
        var QC_testitem = $Function.toDataSet($System.BTR, `SELECT * FROM ${dataBase[2]}`); //获取质检项数据集
        var QC_RealTimeTask = $Function.toDataSet($System.BTR, `SELECT * FROM ${dataBase[0]} WHERE tasktype IN (1, 3 ,5) AND taskstatus = 3`); //获取已完成的质检任务，用于在生成新任务的时候确定当前任务次数

        /*****************************生成质检任务单****************************** */
        var field = []; //字段名数组
        var field1 = []; //字段名数组
        for (var key in info[0]) {
            field.push(key);
        }
        for (var key in QC_testitem) {
            field1.push(key);
        }
        var sqlStr = `INSERT INTO ${dataBase[0]} (${field.join(',')}, taskid, tasktype, taskNum) VALUES `;
        var sqlStr1 = `INSERT INTO ${dataBase[1]} (${field1.join(',')}, taskid) VALUES `;
        info.forEach(function (item) {
            var taskId = $Function.getID(taskType + 1);
            if (taskType == 1 || taskType == 3 || taskType == 5) {
                /*************生成质检结果表QC_result***********/
                var stockCode;
                taskType == 1 ? (stockCode = item.privateTaskObj.stockcode) : (stockCode = item.privateTaskObj.productCode); //获取物料代码
                var task_testItem = $Function.dataFilter(QC_testitem, { field: 'WLH', value: stockCode, match: '=' });
                if (task_testItem == false) throw '查询不到物料编号为' + stockCode + '的质检项信息';

                task_testItem.forEach(function (item) {
                    var value1 = [];
                    item.taskid = taskId;
                    for (var key in item) {
                        value1.push("'" + item[key] + "'");
                    }
                    sqlStr1 += `(${value1.join(',')}),`;
                });
            }

            /*************生成质检任务表QC_RealTimeTask**************/
            var value = [];
            field.forEach(function (key) {
                if (key == privateTaskObj) item[key] = JSON.stringify(item[key]); //私有成员对象转换成JSON字符串
                value.push("'" + item[key] + "'");
            });
            value.push("'" + taskId + "'");
            value.push("'" + taskType + "'");
            var taskNum = 1;
            //获取该批次已完成的任务记录中当前任务次数最大值，新生成的任务中当前任务次数字段在此基础上加1
            var batch;
            if (item.jobIDS != '' || item.jobIDS != undefined) {
                batch = item.jobIDS;
            } else if (item.jobID != '' || item.jobID != undefined) {
                batch = item.jobID;
            } else if (item.ERPbatch != '' || item.ERPbatch != undefined) {
                batch = item.ERPbatch;
            } else {
                throw '批次信息缺失！';
            }
            var arr1 = $Function.dataFilter(QC_RealTimeTask, [{ field: 'jobIDS', value: batch, match: '=' }]);
            var arr2 = $Function.dataFilter(QC_RealTimeTask, [{ field: 'jobID', value: batch, match: '=' }]);
            var arr3 = $Function.dataFilter(QC_RealTimeTask, [{ field: 'ERPbatch', value: batch, match: '=' }]);
            var arr4 = arr1.concat(arr2.concat(arr3));
            arr4.forEach(function (item) {
                if (item.taskNum > taskNum) taskNum = item.taskNum; //筛选出当前任务次数最大值
            });
            taskNum += 1;
            value.push(taskNum); //将当前任务次数推入数组中
            sqlStr += `(${value.join(',')}),`;
        });
        sqlStr.substring(0, sqlStr.length - 1);
        sqlStr1.substring(0, sqlStr1.length - 1);
        var res = $Function.toDataSet($System.BTR, sqlStr);
        var res1 = $Function.toDataSet($System.BTR, sqlStr1);
        if (!res || !res1) throw '原材料质检任务生成失败！';
    } catch (e) {
        console.log(e)
        result.errorCode = 1;
        result.message = e;
    } finally {
        return result;
    }
}
