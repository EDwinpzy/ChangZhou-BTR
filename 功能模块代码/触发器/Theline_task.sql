/*--------------------------------------------------------------------
触发器：线边仓调度
目的：线边仓调度，需要给ERP回传;
编写者:hjz，pzy
----------------------------------------------------------------------
-- 修改记录:
-- 编号	  修改时间		  修改人		         修改原因		   修改标注
---------------------------------------------------------------------*/
DECLARE
--Theline_Task
@ID int,--序号
@reid varchar(255),--调度类型 1为入库2为出库
@wllx varchar(255),--物料类型（0为原材料、1位半成品、2为成品）
@flag int,--标志位
@pc varchar(255),--批次号码
@gx varchar(255),--工序
@gx1 varchar(255),--终点仓位
@pcsx varchar(255),--大批次
@bz varchar(255), --备注信息
@zl varchar(50), --重量


--storage_task
@type int,--单据类型
@ERPbatch varchar(255),--ERP批次号
@endposition varchar(50), --终止仓位
@position1 varchar(50), --仓位编号（mes）
@positionName varchar(50), --仓位名称（mes）

--storage_batch
@ERPStockposition varchar(255),--ERP库位
@stockmodel varchar(255),--物料型号
@stockcode varchar(255),--物料代码
@weight varchar(255),--重量
@stocktype int,--物料类型
@jobID varchar(255),--大批次
@jobIDS varchar(255),--小批次
@ERPorder varchar(50)--ERP订单号

--查询插入信息
select @reid=reid, @wllx=wllx, @flag=flag, @pc=pc, @ID=ID, @pcsx=pcsx, @zl=zl
from inserted

IF @reid = '' OR @reid is NULL
BEGIN
    update Theline_Task set flag=2,bz='错误，请输入调度类型！' where ID=@ID;
END  
ELSE 
IF @reid = 1 --入库任务
BEGIN
    --查询任务单信息
    select @ERPbatch=ERPbatch, @type=type, @jobIDS=jobIDS, @endposition=endposition, @position1=position, @positionName=positionName
    from storage_task
    where jobIDS = @pc
    IF @jobIDS is NULL
    BEGIN
        update Theline_Task set flag=2,bz='错误，该批次不在调度任务单中！' where ID=@ID;
    END
    ELSE
    BEGIN
        IF @type NOT IN (5,8,10,11,13)
        BEGIN
            update Theline_Task set flag=2,bz='错误，该批次的任务单不属于线边仓调度！' where ID=@ID;
        END 
        ELSE 
        IF @reid = 1 AND @type = 8 --退库单
        BEGIN
            SET @bz = '退库单入库成功！'
        END 
        ELSE 
        IF @reid= 1 AND @type = 11 --成本中心退料单
        BEGIN
            SET @bz = '成本中心退料单执行成功！'
        END
        --更新线边仓库存
        INSERT INTO storage_batch
        SELECT @position1, [ERPorder], [ERPbatch], [jobID], [jobIDS], [MBLNR], [ZEILE], [stocktype], [stockcode], [stockname], [stockmodel], [GGXH], [QCresult], @zl, [printFlag], [remark], [privateObj], @positionName, [inputTime], [person], [PackNO], @endposition, [WMSStockposition], [preScheduledWeight], 0
        FROM storage_batch_history
        WHERE jobIDS = @pc
        --更新storage_task仓库任务单的任务状态;
        update storage_task set taskstatus = 1 where jobIDS = @pc;
        --更新自身该条记录;
        update Theline_Task set flag=1,bz=@bz where ID=@ID;
        --调度信息回传至ERP
        insert into Batch_PutTask
            (BUDAT,AUFNR,MATNR,GAMNG,WERKS,LGORT,LGORT1,CHARG,BWART,STEMFROM,reserved1,MEINS)
        values
            (CONVERT(varchar(100), GETDATE(),112), @ERPorder, @stockcode, @zl, '1060', @ERPStockposition, @endposition, @jobID, '311', 'FJ2', @PC, 'KG' )
    END
END
ELSE
IF @reid = 2 --出库任务
BEGIN
    --判断该批次是否在线边仓中
    select @stockcode=stockcode, @stockmodel=stockmodel, @stocktype=stocktype, @jobID=jobID, @jobIDS=jobIDS, @ERPStockposition=ERPStockposition, @weight=weight, @ERPorder=ERPorder
    from storage_batch
    where jobIDS = @pc
    IF @jobIDS is NULL
    BEGIN
        update Theline_Task set flag=2,bz='错误，该批次不在线边仓中！' where ID=@ID;
    END
    ELSE 
    BEGIN
        --查询任务单信息
        select @ERPbatch=ERPbatch, @type=type, @jobIDS=jobIDS, @endposition=endposition, @position1=position, @positionName=positionName
        from storage_task
        where jobIDS = @pc
        IF @jobIDS is NULL
        BEGIN
            update Theline_Task set flag=2,bz='错误，该批次不调度任务单中！' where ID=@ID;
        END
        ELSE
        BEGIN
            IF @type NOT IN (5,8,10,11,13)
            BEGIN
                update Theline_Task set flag=2,bz='错误，该批次的任务单不属于线边仓调度！' where ID=@ID;
            END 
            ELSE IF @reid = 2 AND @type = 5 --出库单（移动类型包含成本中心领用，委外...）
            BEGIN
                SET @bz = '出库成功！'
                --将该批次从线边仓库存中删除
                DELETE FROM storage_batch WHERE jobIDS = @pc
            END 
        ELSE IF @reid= 2 AND @type = 10 --领料单
        BEGIN
                SET @bz = '领料单出库执行成功！'
                --将该批次从线边仓库存中删除
                DELETE FROM storage_batch WHERE jobIDS = @pc
            END
            -- ELSE IF @reid= 1 AND @type = 13 --销售退货单
            -- BEGIN
            --     SET @bz = '销售退货单执行成功！'
            -- END
            --更新storage_task仓库任务单的任务状态;
            update storage_task set taskstatus = 1 where jobIDS = @pc;
            --更新自身该条记录;
            update Theline_Task set flag=1,bz=@bz where ID=@ID;
            --调度信息回传至ERP
            insert into Batch_PutTask
                (BUDAT,AUFNR,MATNR,GAMNG,WERKS,LGORT,LGORT1,CHARG,BWART,STEMFROM,reserved1,MEINS)
            values
                (CONVERT(varchar(100), GETDATE(),112), @ERPorder, @stockcode, @zl, '1060', @ERPStockposition, @endposition, @jobID, '311', 'FJ2', @PC, 'KG' )
        END
    END
END