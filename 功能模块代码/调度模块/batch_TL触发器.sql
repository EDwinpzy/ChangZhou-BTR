BEGIN
  declare 
	@DH      varchar(255),--制造命令单单号
	@ZD      varchar(255),--生产站点
	@PC      varchar(255),--批次号
	@ZL      float,--重量
	@ZJ      INT,--是否质检 
	@SJ      datetime,--时间
	@FALG    int ,--处理标志位
	@SFTL    INT,   --是否投料
	@ID    INT,   --ID
	@GX  varchar(255),--工序
	@GXDM  varchar(255),--工序代码
	@CX  varchar(255),--产线
	@CJ varchar(255),--车间
	@SB  varchar(255),--设备
	@sj1 varchar(255),--时间1
	@duiyingpc varchar(255),--对应批次
	@duiyingpc1 varchar(255),
	@duiyingpc2 varchar(255),
	@wlbh varchar(255),--物料代码
	@job varchar(255),--订单号
    @YH varchar(255),---用户
	@weight_PV float,
	@weight_SV float,
	@row11 int,
	@row22 int,
	@row int,
	@row1 int,
	@WLH varchar(255),
	@LGORT varchar(255),
	@linename varchar(255),
	@linegx varchar(255),
	@ZL1 float

--------------------获取当前数据------------
	select @DH = DH,@ZD = ZD,@PC=PC,@ZL=ZL,@SJ=SJ,@FALG=FALG,@SFTL=SFTL,@ID=ID,@YH=YH from inserted
	select @GX=LineCode,@CX= LineNo1,@GXDM=LineCode, @SB=EquipmentNo,@CJ=LineName1  from  basic_moduleInfo  where PutStation=@ZD;
	select @WLH=wldm from Theline where pc=@pc
	--判断批次、站点是否为空，工单是否属于此站点
	select @GX
	select @DH
	if @PC is null or @PC =''
	begin
		UPDATE  [dbo].[batch_TL]  set falg =2,BZ='批次不允许为空',zl=@ZL  where  pc=@PC  and ID=@ID;
		return;
	end
	if @ZD is null or @ZD =''
	begin
		UPDATE  [dbo].[batch_TL]  set falg =2,BZ='站点不允许为空',zl=@ZL  where  pc=@PC  and ID=@ID;
		return;
	end
	select 555
	select @row =count(*) from batch_history_get1 where jobIDS=@DH and LineCode_SV in (SELECT GZZX FROM basic_ProductModule1 WHERE LineCode = @GXDM) and closeFlag='关闭';
	if @row=1
	begin
		UPDATE  [dbo].[batch_TL]  set falg =2,BZ='此工单已结单，不允许报工',zl=@ZL  where  pc=@PC  and ID=@ID;
		return;
	end
	select @row =count(*) from batch_history_get1 where jobIDS=@DH and LineCode_SV in (SELECT GZZX FROM basic_ProductModule1 WHERE LineCode = @GXDM) and closeFlag='未关闭';
	if @row=0
	begin
		UPDATE  [dbo].[batch_TL]  set falg =2,BZ='此站点不存在该工单',zl=@ZL  where  pc=@PC  and ID=@ID;
		return;
	end

	----判断该投料批次的原料是否在投料工序所在车间，需要查询工单中的工作中心和库存表中该原料所在库位
	select  @linename = LineName1  from  [dbo].[basic_moduleInfo] where  PutStation=@ZD;
	select  @linegx = gx  from  [dbo].[Theline] where  pc=@PC;
	if @linename='天然半成品车间'
		begin 
			set @linename='5001'
		end
		else  if @linename='粉碎整形车间'
		begin 
			set @linename='5002'
		end
		else if @linename='二次造粒车间'
		begin 
			set @linename='5003'
		end
		else if @linename='成品车间'
		begin 
			set @linename='5004'
		end 	
		
		if @linename != @linegx
		begin 
			UPDATE  [dbo].[batch_TL]  set falg =2,BZ='该批次未进行发料，不允许投料',zl=@ZL  where  pc=@PC  and ID=@ID;
			return;
		end
END