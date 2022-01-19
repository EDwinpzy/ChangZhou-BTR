/*
 * @description: 周期性同步物料信息
 * @Author: EDwin
 * @Date: 2022-01-18 14:54:01
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-18 15:27:00
 */
var ERP_materialData = toDataSet(global.ERP, `SELECT * FROM materialMasterData`);
