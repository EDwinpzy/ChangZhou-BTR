if (判断为入库任务且库存表中无该库存) {
    if (storage_task表中有该批次的任务单) {
        更新storage_batch表中小批次该批次的位置信息;
        更新自身该条记录;
        更新storage_task仓库任务单的任务状态;
    }
} else if (判断为出库任务且库存表中有该库存) {
    if (storage_task表中有该批次的任务单) {
        更新storage_小批次atch表中该批次的位置信息;
        更新自身该条记录;
        更新storage_task仓库任务单的任务状态;
        根据批次对应关系表小批次batch_relationship更新表小批次batch_PutTask;
    }
}
