
/*--------------------------------------------------------------------
触发器： gengxin
目的：判断WMS处理数据是否成功，更新storage_task,storage_batch数据。
编写者:xiaoxiong.cao
----------------------------------------------------------------------
-- 修改记录:
-- 编号	  修改时间		  修改人		         修改原因		   修改标注
-- 001  2022-03-28    xiaoxiong.cao            初建               000
-- 002  2022-03-30      edwin               增加指令回写，
                                            将指令执行状态
                                            回写至出库，入
                                            库，取消表中

---------------------------------------------------------------------*/
DECLARE 
	@Business_Status VARCHAR (255),
	@IO_Type VARCHAR (255),
	@Order_Code VARCHAR (255),
	@Handle_Code VARCHAR (255),
	@jobIDS VARCHAR (255),
	@jobID VARCHAR (255),
	@GGXH VARCHAR (255),
	@ERPorder VARCHAR (255),
    @stockcode VARCHAR (255),
	@stocktype VARCHAR (255),
	@stockname VARCHAR (255),
	@stockmodel VARCHAR (255),
	@weight		float,
	@LGORT	 VARCHAR (255),
	@positionName VARCHAR (255),
	@LGORT1	 VARCHAR (255),
	@ERPbatch VARCHAR (255),
	@executor VARCHAR (255),
	@WMSStockposition VARCHAR (255),
	@QCresult INT,
	@BWART VARCHAR (255)


SELECT @Order_Code = Order_Code , @Business_Status =Business_Status, @IO_Type = IO_Type
FROM INSERTED;
IF (@Business_Status = 80 AND @IO_Type = 1 )
BEGIN
    SELECT @jobIDS = jobIDS, @ERPorder = ERPorder, @stockcode = stockcode, @weight = weight, @ERPbatch = ERPbatch
    FROM storage_task
    WHERE taskid  = @Order_Code;
    SELECT @QCresult = QCresult , @LGORT = ERPStockposition
    FROM [dbo].[storage_batch]
    where jobIDS = @jobIDS;
    DELETE FROM [dbo].[storage_batch] WHERE jobIDS = @jobIDS;

    IF (@QCresult = 0 )
			  BEGIN
        SET @LGORT1 = '7603';
    END
    IF (@QCresult = 1 or @QCresult = 2)
			  BEGIN
        SET @LGORT1 = '7602';
    END
    IF (@QCresult = 2 )
			  BEGIN
        SET @BWART = '323';
    END
    IF (@QCresult = 0 or @QCresult = 1)
			  BEGIN
        SET @BWART = '311';
    END
    INSERT INTO [dbo].[Batch_PutTask]
        ( BUDAT, AUFNR, MATNR,GAMNG, WERKS, LGORT, LGORT1, CHARG, BWART,reserved1, SOBKZ, KOSTL,MEINS,STEMFROM)
    VALUES
        ( CONVERT(varchar(100), GETDATE(), 112), @ERPorder, @stockcode, @weight, '1060', @LGORT, @LGORT1, @ERPbatch, @BWART, @jobIDS, '', '', 'KG', 'FJ2');
    UPDATE  [dbo].[storage_task]  set taskstatus = 1 where taskid  = @Order_Code
;
END
IF(@Business_Status = 80 AND @IO_Type = 2 )
				BEGIN
    SELECT @positionName = positionName, @WMSStockposition = WMSStockposition, @executor = executor, @QCresult = QCresult , @jobID = jobID, @jobIDS = jobIDS, @ERPorder = ERPorder, @stocktype =	stocktype, @stockcode = stockcode, @weight = weight, @ERPbatch = ERPbatch
    FROM storage_task
    WHERE taskid  = @Order_Code;




    IF (@QCresult = 0 )
 			  BEGIN
        SET @LGORT1 = '4603';
    END
    IF (@QCresult = 1 or @QCresult = 2)
 			  BEGIN
        SET @LGORT1 = '3601';
    END
    IF (@QCresult = 2 )
 			  BEGIN
        SET @BWART = '323';
    END
    IF (@QCresult = 0 or @QCresult = 1)
 			  BEGIN
        SET @BWART = '311';
    END
    INSERT INTO [dbo].[storage_batch]
        ([position], [ERPorder], [ERPbatch], [jobID], [jobIDS], [stocktype], [stockcode], [stockname], [stockmodel], [GGXH], [QCresult], [weight], [printFlag], [remark], [privateObj], [positionName], [inputTime], [person], [PackNO], [ERPStockposition], [WMSStockposition], [preScheduledWeight], [occupyFlag])
    VALUES
        ('', @ERPorder, @ERPbatch, @jobID, @jobIDS, @stocktype, @stockcode, @stockname, @stockmodel, @GGXH , @QCresult, @weight, 0, '', '', @positionName, '', '@executor', NULL, @LGORT1, @WMSStockposition, 0, 0);
    INSERT INTO [dbo].[Batch_PutTask]
        ( BUDAT, AUFNR, MATNR,GAMNG, WERKS, LGORT, LGORT1, CHARG, BWART,reserved1, SOBKZ, KOSTL,MEINS,STEMFROM)
    VALUES
        ( CONVERT(varchar(100), GETDATE(), 112), @ERPorder, @stockcode, @weight, '1060', @LGORT, @LGORT1, @ERPbatch, @BWART, @jobIDS, '', '', 'KG', 'FJ2');
    UPDATE  [dbo].[storage_task]  set taskstatus = 1 where taskid  = @Order_Code
;
END

--指令反馈回写至出库，入库，取消表中
IF @IO_Type = 1 --入库任务
BEGIN
    UPDATE WMS_inrequire_history SET Retain_01 = @Business_Status WHERE Order_Code = @Order_Code
END
ELSE IF @IO_Type = 2 --出库任务
BEGIN
    UPDATE WMS_outstore_order SET Retain_01 = @Business_Status WHERE Order_Code = @Order_Code
END 