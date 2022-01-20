/*
 * @description: 在触发器中实现出入库指令结果回传的功能
 *               入库指令返回后，推送质检任务，更新库存表storage_batch的库存状态，更新storage_task和storage_task_history
 *               出库指令返回后，更新库存表storage_batch的库存状态，更新storage_task和storage_task_history
 * @Author: EDwin
 * @Date: 2022-01-20 14:59:11
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-20 16:45:59
 */