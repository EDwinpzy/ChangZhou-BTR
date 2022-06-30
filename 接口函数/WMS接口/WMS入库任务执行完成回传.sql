/*
 * @description: 在触发器中实现出入库指令结果回传的功能
 *               入库指令返回后，更新库存表storage_batch的库存状态，更新storage_task和storage_task_history
 * @Author: EDwin
 * @Date: 2022-01-20 14:59:11
 * @LastEditors: EDwin
 * @LastEditTime: 2022-01-25 14:23:11
 */
creat trigger WMS_instore_order_update ON WMS_instore_order
after
UPDATE
    AS BEGIN if (
        SELECT
            Handle_Code
        FROM
            inserted
    ) = '000' BEGIN --更新库存状态
UPDATE
    storage_batch
SET
    position = 3,
    inputTime = GETDATE()
WHERE
    jobIDS IN (
        SELECT
            Package_Code
        FROM
            inserted
    ) --更新实时任务状态
UPDATE
    storage_task
SET
    taskstatus = 1 endtime = GETDATE()
WHERE
    taskID IN (
        SELECT
            UID
        FROM
            inserted
    ) --将实时任务插入历史表中
INSERT INTO
    storage_task_history
SELECT
    *
FROM
    storage_task
WHERE
    taskID IN (
        SELECT
            UID
        FROM
            inserted
    ) --删除实时任务
DELETE FROM
    storage_task
WHERE
    taskID IN (
        SELECT
            UID
        FROM
            inserted
    )