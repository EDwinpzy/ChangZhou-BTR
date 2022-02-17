/*
 * @description: 周期性同步物料信息
 * @Author: EDwin
 * @Date: 2022-01-18 14:54:01
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-31 12:24:17
 */
/**
 * @description: 周期性同步物料信息，每10分钟同步一次，将ERP的表materialMasterData中的数据插入到WMS接口表WMS_infoSync中
 * @param {*}
 * @return {*}
 */
function materialInfoSync() {
    try {
        var ERP_materialData = toDataSet(global.ERP, `SELECT * FROM materialMasterData`);
        if (!ERP_materialData) throw '物料信息同步失败！';
        var arr = [];
        for (var i = 0; i < ERP_materialData.length; i++) {
            if (ERP_materialData[i] == 'Z002' || ERP_materialData[i] == 'Z003' || ERP_materialData[i] == 'Z005') {
                switch (ERP_materialData[i]) {
                    case 'Z002':
                        ERP_materialData[i] = '201';
                        break;
                    case 'Z003':
                        ERP_materialData[i] = '202';
                        break;
                    case 'Z005':
                        ERP_materialData[i] = '203';
                        break;
                }
                var obj = {
                    Item_No: ERP_materialData[i].matnr,
                    Item_Name: ERP_materialData[i].maktx,
                    Unit: ERP_materialData[i].meins,
                    Item_Type: ERP_materialData[i].mtart,
                    Container_Type: '20',
                    validSign: '1',
                    Sync_Time: GetDataTimeFunc(),
                };
                arr.push(obj);
            }
        }
        var res = SqlInsert(arr, '[dbo].[WMS_infoSync]');
        if (!res) throw '物料信息同步失败！';
        return true;
    } catch (e) {
        return false;
    }
}
