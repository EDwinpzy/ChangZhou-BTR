/*
 * @Author: EDwin
 * @Date: 2022-01-10 13:25:09
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-01-11 09:17:07
 */
// 质检任务私有成员对象（数据类型为对象），根据任务类型需要存入不同的数据
// 原材料质检：入库单号(taskid)，入库时间(starttime)，供应商名称(supplierName)，供应商代码(supplierNumber)，物料名称(WLMC)，物料代码(stockcode)，物料型号(stockmodel)，规格类型(GGXH)，供应商批次号(GYSPCH)
// 半成品取样：工序名称，产线，站点，设备名称，产品代码
// 成品质检：工序名称，产线，站点，设备名称，产品代码
// 成品取样：工序名称，产线，站点，设备名称，产品代码
// 成品质检：工序名称，产线，站点，设备名称，产品代码
var a =
    半成品取样:
    {
        processpath: 工序名称,
        line: 产线,
        station: 站点,
        supplierNumber: 设备名称,
        productName: 产品名称,
        productCode: 产品代码,
    };
