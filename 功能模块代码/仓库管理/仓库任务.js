/*
 * @Author: EDwin
 * @Date: 2021-12-16 16:51:33
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-31 11:05:41
 */
/**
 * @description: 生成各种仓库任务单，并通过接口传给WMS
 * @param {object[object]} content - 单据内容，格式如下：
 *                                  {
                                        taskid:	        单号（任务编号）
                                        taskstatus:	    任务状态  0：未完成  1：已完成
                                        auditstatus:	审核状态  0：未审核  1：已审核
                                        tasktype:	    任务类型  1：出库单   2：退料单  3：领料单  4：退库单（线边仓退料）5：线边仓出库单  6：产品入库单  7：产品出库单  8：立库入库单  9：立库出库单  10：成品出库单
                                        stocktype:	    物料类型  1：原材料  2：半成品  3：成品  4: 包材
                                        ERPbatch:       ERP批次号（一个ERP订单号对应多个ERP批次号，ERP批次号和MES批次号/ 制令单号/配比单号/工单号一一对应）
                                        ERPorder:	    ERP订单号
                                        jobID:	        制令单号/配比单号（工单号,MES批次号）
                                        jobIDS:	        小批次号
                                        stockcode:	    物料代码
                                        stockmodel:	    物料型号
                                        model:          规格型号
                                        QCresult:	    质检结果  0：未质检  1：合格  2：不合格
                                        startposition:	起始仓位
                                        endposition:	终止仓位
                                        starttime:	    开始时间
                                        endtime:	    结束时间
                                        sponsor:	    发起人
                                        reviewer:	    审核人
                                        executor:	    执行人
                                        weight:	        重量
                                        unit：          单位
                                        station:	    工作中心（工序）
                                        line:       	产线
                                        remark：        备注
                                        privateObj：	私有成员对象
                                    }
 * @return {*}
 */
function TaskGenerate(content) {
    content.forEach(function (item) {
        var sqlStr = `INSERT INTO [dbo].[storage_task] SET `;
        for (var key in item) {
            sqlStr += `${key} = '${item[key]}',`;
        }
        sqlStr.substring(0, sqlStr.length - 1);
        var data = {};
        SyncSQLExecute($System.BTR, 1, sqlStr, data);
        
        if (data.errorCode != 0) {
            return {
                errorCode: 1,
                message: 'SQL语句执行错误   ' + sqlStr,
            };
        }
    });
    return {
        errorCode: 0,
        message: '单据生成成功！',
    };
}
