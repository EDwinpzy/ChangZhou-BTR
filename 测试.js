/*
 * @Author: EDwin
 * @Date: 2022-03-03 20:40:42
 * @LastEditors: EDwin
 * @LastEditTime: 2022-06-01 18:55:04
 */
/**
 * @type:
 * @description: 计划重排
 * @param {object[string]} jobIDArr 数据集
 * @return {*}
 */
try {
    var config = ['productOrder_realTime', 'put_realTime', 'get_realTime', 'materialObj', 'storage_batch'];

    var field = [];
    var res = true;
    jobIDArr.forEach(function (item) {
        field.push("'" + item.jobID + "'");
        res = $Function.toDataSet($System.BTR, `UPDATE ${config[0]} SET status = '0', auditFlag = '0', pickFlag = '0', materialPlanFlag = '0', stationPlanFlag = '0', BOM = '', planStartTime = '', planEndTime = '', planStartDT = '0' WHERE jobID = '${item.jobID}'`);
    });
    if (res === false) throw new Error('[rePlan] 工单信息表' + config[0] + '重排计划失败！更新标志位失败');

    var res = $Function.toDataSet($System.BTR, `DELETE FROM ${config[1]} WHERE jobID IN (${field.join(',')})`);
    if (res === false) throw new Error('[rePlan] 投料实时表' + config[1] + '删除失败！');

    var res = $Function.toDataSet($System.BTR, `DELETE FROM ${config[2]} WHERE jobID IN (${field.join(',')})`);
    if (res === false) throw new Error('[rePlan] 收料实时表' + config[2] + '删除失败！');

    var materialObj = $Function.toDataSet($System.BTR, `SELECT * FROM ${config[3]} WHERE jobID IN (${field.join(',')})`);
    if (materialObj === false) throw new Error('[rePlan] 物料批次计划表' + config[3] + '查询失败！');
    var res = true;
    materialObj.forEach(function (item) {
        var res = $Function.toDataSet($System.BTR, `UPDATE ${config[4]} SET preScheduledWeight = preScheduledWeight - '${item.planWeight}' WHERE jobIDS = '${item.materialSmallBatch}'`);
        //如果排产了四号的物料，且所排产的小批次尚未入六号的库存表“storage_batch”,此时需要将小批次释放，反馈给四号进行解锁；
        if (item.ascription === 'FJ1') {
            var sqlStr1 = `SELECT  jobIDS FROM [dbo].[storage_batch] WHERE jobIDS = '${item.materialSmallBatch}'`;
            var dataSet1 = $Function.toDataSet($System.BTR, sqlStr1); //同步查询函数调用
            if (dataSet1.length === 0 && dataSet1 !== false) { //四号未扫码出库，未入六号的库存，需要往中间表里写入排产四号物料的小批次
                //查询小批次是否排产了其他工单
                var sql6 = `SELECT  jobID FROM [dbo].[materialObj] WHERE jobID NOT IN(${field.join(',')})  AND materialSmallBatch = '${item.materialSmallBatch}'`;
                var data6 = $Function.toDataSet($System.BTR, sql6); //同步查询函数调用
                if (data6.length === 0 && data6 !== false) { //此前四号该小批次未排过重量，如果已排过，则无需更新为‘M’
                    var insertsql = `UPDATE [192.168.0.230].[负极服务器].[dbo].[PlanMaterialBatch6_to_4] SET PC_flag='M' WHERE PC = '${item.materialSmallBatch}'`;
                    var dataSet = $Function.toDataSet($System.BTR, insertsql); //同步函数调用
                    if (dataSet === false) throw new Error('[rePlan] 表"PlanMaterialBatch6_to_4"四号小批次释放失败！');
                }
            }
        }
    });
    if (res === false) throw new Error('[rePlan] 库存信息表' + config[4] + '预排产重量更新失败！');

    var res = $Function.toDataSet($System.BTR, `DELETE FROM ${config[3]} WHERE jobID IN (${field.join(',')})`);
    if (res === false) throw new Error('[rePlan] 物料批次计划表' + config[3] + '删除失败！');
    return true;
} catch (e) {
    console.log(e);
    return false;
}