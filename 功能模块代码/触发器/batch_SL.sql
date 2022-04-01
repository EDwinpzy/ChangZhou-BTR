/*--------------------------------------------------------------------
触发器：收料校验
目的：将收料信息进行校验，并往质检继续信息回传
编写者:edwin
----------------------------------------------------------------------
-- 修改记录:
-- 编号	  修改时间		  修改人		         修改原因		   修改标注
   001  2022-03-29       edwin                 
---------------------------------------------------------------------*/
DECLARE

--batch_SL
@ZD VARCHAR(255),--收料站点
@PC VARCHAR(255),--小批次
@DH VARCHAR(255),--工单号
@ZL float(53),--重量
@ID int,
@YH varchar(255),--用户

--productOrder_realTime
@ERPorder VARCHAR(255),--ERP生产订单号
@ERPbatch varchar(255),--ERP批次号
@line VARCHAR(255),--工厂
@jobID VARCHAR(255),--大批次/工单号
@realStartTime datetime,--生产日期
@ERPGZZX VARCHAR(255),--工作中心
@type int,--工单类型  
@KCDD varchar(255), --库存地点
@workshop varchar(255), --车间
@productCode varchar(255), --成品代码（若为制造命令单则为空）
@ByProductCode varchar(255), --副产品代码（若为配比单则为空）
@MATNR varchar(255),--物料号
@yield varchar(255),--产量
@productName varchar(255),--成品名字
@ByProductName varchar(255),--副产品名字
@stocktype int,

--get_realTime
@planEquip varchar(255), --计划设备代码/站点
@result int,
@stockname varchar(255),
@stockcode varchar(255),
@row int, --行

--batch_SL
@ZJ int,--质检推送
@tpa varchar(255),

--QC_testitem
@innerCode varchar(255),--质检项内码
@test  varchar(255),--检测项内容
@upper_limit  varchar(255),--上限值（若为空，则无需判断上限值）
@lower_limit  varchar(255),--下限值（若为空，则无需判断下限值）
@WLH   varchar(255),--物料编号（物料代码）
@WLMC  varchar(255),--物料名称
@supplierName   varchar(255),--供应商名称
@supplierNumber   varchar(255),--供应商代码
@CPDM   varchar(255),--产品代码
@GXMC  varchar(255),--工序名称
@station  varchar(255),--站点名称
@SBMC  varchar(255),--设备名称
@batchFlag   varchar(255),--批次标识（0:批/样1:吨/样2:袋/样）
@sampNum  varchar(255),--取样频率的具体数量
@sampRate   varchar(255),--取样频率字符串（报表展示用）
@PDFLAG    varchar(255),--质检项自动判定标识 0：不需要自动判定  1：需要自动判定
@SFFX    varchar(255),--是否需要趋势图分析  0：否 1：是
@mustFlag   varchar(255),--是否必须 0：否 1：是 （若为是的话则一条质检任务中所有mustFlag为1的质检项都必须出结果后才会生成该质检任务的质检结果）
@unit    varchar(255),--单位
@WL_PDFLAG  varchar(255),--物料编号自动判定标识 0：不需要自动判定  1：需要自动判定
@tasktype varchar(255),
@Line1 varchar(255),--线别

--productOrder_realTime
@realEndTime datetime,
@a varchar(255),
@flag INT,
@getName varchar(255), --物料名称
@getCode varchar(255), --物料代码
@name varchar(255), --物料名称
@processpath varchar(255),--工序名称

--其他
@row1 int,
@row2 int,
@row4 int

--获取插入数据
select @ZD=ZD, @PC=PC, @ZL=ZL, @DH=DH, @ZJ=ZJ, @YH=YH
from inserted;

--获取工单表数据
SELECT @ERPorder=ERPorder, @realStartTime=realStartTime, @ERPGZZX=ERPGZZX, @type=type, @workshop=workshop, @ERPbatch = ERPbatch, @ERPGZZX=ERPGZZX
from productOrder_realTime
where jobID = @DH;
-- SELECT @planEquip=planEquip, @getName = getName, @getCode = getCode
-- FROM get_realTime
-- WHERE jobID=@DH and productSmallBatch=@PC;--获取get_realTime的站点

SELECT @row4 = COUNT(*)
FROM batch_SL
WHERE PC = @PC

--收料校验
IF @row4 > 1
BEGIN
    UPDATE  [dbo].[batch_SL]  set falg =2,BZ='不允许重复收料！'  where PC=@PC;
    RETURN
END
IF @ERPorder IS NULL
begin
    UPDATE  [dbo].[batch_SL]  set falg =2,BZ='不存在该工单！'  where PC=@PC;
    RETURN
end
if(@ZD is null or @ZD = '')
BEGIN
    UPDATE [dbo].[batch_SL] set falg =2, BZ='站点不允许为空！' where DH=@DH and PC=@PC;
    RETURN
END;
IF NOT EXISTS (SELECT * FROM basic_info WHERE workCenterCode = @ERPGZZX AND getStation = @ZD)
BEGIN
    UPDATE [dbo].[batch_SL] set falg =2, BZ='此站点不存在该工单！' where DH=@DH and PC=@PC;
    RETURN
END

--判断是否为副产品
SET @a = CHARINDEX('CCL', @PC)
SET @flag = CHARINDEX('SSL', @PC)
if(@a > 0 OR @flag > 0)
BEGIN
    select @tpa = ByProductCode
    from productOrder_realTime
    where jobID = @DH
    select @name = ByProductName
    from productOrder_realTime
    where jobID = @DH
END
else
begin
    select @tpa = productCode
    from productOrder_realTime
    where jobID = @DH
    select @name = productName
    from productOrder_realTime
    where jobID = @DH
end

--回传ERP的Production_storage_withdrawal生产入库接口
DECLARE @LGORT VARCHAR(50)
-- 入库到该地点（）
SELECT @LGORT = CASE lineCode WHEN 'FS' THEN '5602' WHEN 'RZ' THEN '5603' WHEN 'CP' THEN '5604' ELSE '' END
FROM [dbo].[basic_info]
WHERE getStation = @ZD
insert into Production_storage_withdrawal
    (BUDAT,AUFNR,MATNR,GAMNG,WERKS,LGORT,CHARG,SCPH,HSDAT,BWART,MEINS,STEMFROM,jobIDS)
VALUES
    (CONVERT(varchar(100), GETDATE(), 112), @ERPorder, @tpa, @ZL, '1060', @LGORT, @ERPbatch, @PC, CONVERT(varchar(100), @realStartTime, 112), '101', 'KG', 'FJ2', @PC)

--更新线边仓库存storage_batch
DECLARE @ERPStockposition VARCHAR(50)
if(@type = 2) --配比单
begin
    SET @stocktype = 2  
    SET @ERPStockposition = '5604'
end
if(@type = 1) --制令单
begin
    SET @stocktype = 1
    SET @ERPStockposition = '2601'
end
insert into  storage_batch
    (ERPorder,ERPbatch,jobID,jobIDS,stocktype,stockcode,stockname,weight,person,ERPStockposition,QCresult,printFlag,inputTime)
values
    (@ERPorder, @ERPbatch, @jobID, @PC, @stocktype, @getCode, @getName, @yield, @YH, @ERPStockposition, '2', '0', CONVERT(varchar(100), GETDATE(),112))

--质检任务生成





if @result = 0
begin
    --插入数据
    DECLARE @LGORT VARCHAR(50)
    -- 入库到该地点（）
    SELECT @LGORT = CASE lineCode WHEN 'FS' THEN '5602' WHEN 'RZ' THEN '5603' WHEN 'CP' THEN '5604' ELSE '' END
    FROM [dbo].[basic_info]
    WHERE getStation = @ZD
    insert into Production_storage_withdrawal
        (BUDAT,AUFNR,MATNR,GAMNG,WERKS,LGORT,CHARG,SCPH,HSDAT,BWART,MEINS,STEMFROM,jobIDS)
    VALUES
        (CONVERT(varchar(100), GETDATE(), 112), @ERPorder, @tpa, @ZL, '1060', @LGORT, @ERPbatch, @PC, CONVERT(varchar(100), @realStartTime, 112), '101', 'KG', 'FJ2', @PC)


    --若为制造命令单则为半成品，若为配比单则为成品
    if(@type = 2)--配比单
	begin
        select @stocktype = 2
    end
    if(@type = 1)
	begin
        select @stocktype = 1
    end

    --成品入库，成品收至到5604
    insert into  storage_batch
        (ERPorder,ERPbatch,jobID,jobIDS,stocktype,stockcode,stockname,weight,person,ERPStockposition,QCresult,printFlag,inputTime)
    values
        (@ERPorder, @ERPbatch, @jobID, @PC, @stocktype, @getCode, @getName, @yield, @YH, '5604', '2', '0', CONVERT(varchar(100), GETDATE(),112))
    --更新batch里面该批次的ERP仓位

    update batch_SL set SJ = CONVERT(varchar(100), GETDATE(),112), falg = 1, ZL = @yield where @ID = ID and @PC=PC




    if (@ZJ = 1)--质检推送
    begin
        --taskid生成
        declare @starttime varchar(255),
				@month varchar(255),
				@b varchar(255),
				@endtime varchar(255),
				@taskid varchar(255),
				@row3 int

        select @month = month(getdate())
        --select @year = year(getdate())

        if @month = 12 --月份为12时
        begin
            select @starttime = cast(year(getdate()) as varchar)+'-'+cast(month(getdate()) as varchar) +'-'+'01'
            select @endtime = cast(year(getdate()) + 1 as varchar)  +'-'+'01'+'-'+'01'
        end
        if @month < 10 --月份小于10时
        begin
            select @month = '0'+cast(month(getdate()) as varchar)
            select @starttime = cast(year(getdate()) as varchar)+'-'+@month+'-'+'01'
            select @endtime = cast(year(getdate()) as varchar) +'-'+'0'+cast(month(getdate()) + 1 AS varchar)+'-'+'01'
            print @starttime
            print @endtime
        end
        select @row3  = count (*)
        from serial_number
        where DT >= @starttime and DT < @endtime
        --查询当月是否有记录
        if @row3 = 0
        begin
            insert into serial_number (DT,num6)
            values (getdate(), 1)
            select @taskid = 'CPZJ' + cast(year(getdate()) as varchar) + @month + '1'
        end

        if @row3 != 0
        begin

            select @b = (select Max(NewDate)
                from (values
                        (num1),
                        (num2),
                        (num3),
                        (num4),
                        (num5),
                        (num6),
                        (num7),
                        (num8),
                        (num9),
                        (num10),
                        (num11),
                        (num12)) as #temp(NewDate))
            from serial_number
            where DT >= @starttime and DT < @endtime

            select @b = @b + 1
            --最大值加1

            select @taskid = 'CPZJ' + cast(year(getdate()) as varchar) + @month + cast(@b as varchar)

            update serial_number set num6 = @b where DT >= @starttime and DT < @endtime;
        --select * from serial_number where DT >= @starttime and DT < @endtime
        --print @taskid

        end




        select @processpath = processName , @line = lineName
        from basic_info
        where getStation = @ZD


        --插入QC_RealTimeTask

        insert into QC_RealTimeTask
            (taskid,tasktype,ERPorder,ERPbatch,jobID,jobIDS,starttime,endtime,exesponsor,weight,processpath,line,station,productName,productCode)
        values
            (@taskid, 5, @ERPorder, @ERPbatch, @DH, @PC, @realStartTime, @realEndTime, @YH, @ZL, @processpath, @line, @ZD, @name, @tpa)


        --从QC_testitem里查数据插入QC_result中
        SELECT @innerCode=innerCode, @test=test, @upper_limit=upper_limit, @lower_limit=lower_limit, @WLH=WLH, @WLMC=WLMC, @supplierName=supplierName, @CPDM=CPDM, @Line1=Line, @GXMC=GXMC, @station=station, @SBMC=SBMC, @batchFlag=batchFlag, @sampNum=sampNum, @sampRate=sampRate, @PDFLAG=PDFLAG, @SFFX=SFFX, @mustFlag=mustFlag, @unit=unit, @WL_PDFLAG=WL_PDFLAG
        FROM [dbo].[QC_testitem]
        WHERE WLH = @tpa
        --物料号


        insert into [dbo].[QC_result]
            (taskid,innerCode,test,upper_limit,lower_limit,WLH,WLMC,supplierName,supplierNumber,CPDM,Line,GXMC,station,SBMC,batchFlag,sampNum,sampRate,PDFLAG,SFFX,mustFlag,unit,WL_PDFLAG)
        values
            (@taskid, @innerCode, @test, @upper_limit, @lower_limit, @WLH, @WLMC, @supplierName, @supplierNumber, @CPDM, @Line, @GXMC, @station, @SBMC, @batchFlag, @sampNum, @sampRate, @PDFLAG, @SFFX, @mustFlag, @unit, @WL_PDFLAG)



    end


end