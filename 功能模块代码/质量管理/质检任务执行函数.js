/*
 * @Author: EDwin
 * @Date: 2021-12-14 10:42:26
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-01-04 18:27:38
 */
/**
 * @description 质检任务执行函数，将上一步质检流程存入历史表中，并将结果回传至WMS、ERP、MES内部表中
 * @param {string} taskId 任务编号
 * @param {string} exeCutor - 当前步骤执行人
 * @param {object[object]} privateResultObj - 质检结果私有成员数组对象，根据任务类型需要存入不同的数据，其中质检结果对象需包含result属性用于存放单个质检项的结果0为不合格1为合格
 * @param {string} QCresult - 质检结果 0：不合格 1：合格 若为空则程序根据质检结果私有成员对象中的检测结果自动判定，若为取样任务则填入空值
 * @return {object} {errorcode: 0, message: ''} errorcode错误代码 0：执行成功 1：执行失败
 */
function QCtaskExecute(taskId, exeCutor, privateResultObj, QCresult) {
    var result = { errorCode: 0, message: '' };
    dataBase = ['[dbo].[QC_RealTimeTask]', '[dbo].[QC_HistoryTask]']; //数据库表完整路径名称(必须包含数据库名称)，第一张表为实时任务表，第二张表为历史任务表
    try {
        var res = $Function.toDataSet($System.BTR, `SELECT * FROM '${dataBase[0]}' WHERE taskid = '${tsakId}'`);
        if (!res) throw '实时表任务查询失败! ';
        var data = res;
        if (data.length <= 0) throw '未找到该条任务信息！';

        /*******************将质检任务实时存历史，并删除实时表中的记录*************** */
        var res = $Function.toDataSet($System.BTR, `DELETE FROM '${dataBase[0]}' WHERE taskid = '${taskId}'`);
        if (!res) throw '实时表任务删除失败!';
        //自动判断质检结果
        if (data[0].tasktype !== 2 && data[0].tasktype !== 4 && QCresult == '') {
            for (var i = 0; i < privateResultObj.length; i++) {
                if (privateResultObj[i].result == 0) {
                    QCresult = 0;
                    break;
                }
            }
        }
        var field = []; //质检任务实时表字段名数组
        var value = []; //质检任务实时表字段值数组
        for (var key in data[0]) {
            field.push(key);
            key == 'exeCutor' ? value.push("'" + exeCutor + "'") : value.push(data[(0)[key]]);
        }
        var res = $Function.toDataSet($System.BTR, `INSERT INTO ${dataBase[1]} (${field.join(',')},QCresult,endtime,privateResultObj) VALUES (${value.join(',')},${QCresult},'${$Function.GetDataTimeFunc()}','${privateResultObj}')`);
        if (!res) throw '质检任务历史表插入失败!';

        /*******************************WME质检信息推送接口************************ */
        var WMSQCData = {
            Item_No: data[0].stockcode, //物料代码（物料编号）
        };
        WMS_QCpush(WMSQCData, function (res) {
            var resData = JSON.parse(res);
            if(resData.Handle_Code != '000') throw resData.Handle_Msg
        });
    } catch (e) {
        result.errorCode = 1;
        result.message = e;
    } finally {
        return result;
    }
}
