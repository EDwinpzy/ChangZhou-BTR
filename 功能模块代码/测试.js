var WMS_config = {
    Item_No: '物料编号',
    Batch_No: 'MES大批次',
    SecondBatch_No: '原材料小批次/成品半成品小批次（收料小批次）',
    Quality_Result: '质检结果00：合格（默认）10：待检20：不合格',
};
var WMS_dataBase = ['QC_to_WMS'];
var WMS_field = [];
var WMS_value = [];
for (var key in WMS_config) {
    WMS_field.push(key);
    WMS_value.push("'" + WMS_config[key] + "'");
}
var sqlStr = `INSERT INTO ${WMS_dataBase[0]} (${WMS_field.join(',')}) VALUES (${WMS_value.join(',')})`;
console.log(sqlStr);
