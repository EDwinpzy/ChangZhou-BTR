BEGIN DECLARE 
@DH VARCHAR (255),
--制造命令单单号
@ZD VARCHAR (255),
--生产站点
@PC VARCHAR (255),
--批次号
@ZL FLOAT,
--重量
@ZJ INT,
--是否质检
@SJ datetime,
--时间
@FALG INT,
--处理标志位
@SFTL INT,
--是否投料
@ID INT,
--ID
@GX VARCHAR (255),
--工序
@GXDM VARCHAR (255),
--工序代码
@CX VARCHAR (255),
--产线
@CJ VARCHAR (255),
--车间
@SB VARCHAR (255),
--设备
@sj1 VARCHAR (255),
--时间1
@duiyingpc VARCHAR (255),
--对应批次
@duiyingpc1 VARCHAR (255),
@duiyingpc2 VARCHAR (255),
@wlbh VARCHAR (255),
--物料代码
@job VARCHAR (255),
--订单号
@YH VARCHAR (255),
---用户
@weight_PV FLOAT,
@weight_SV FLOAT,
@row11 INT,
@row22 INT,
@row INT,
@row1 INT,
@WLH VARCHAR (255),
@LGORT VARCHAR (255),
@linename VARCHAR (255),
@linegx VARCHAR (255),
@ZL1 FLOAT --------------------获取当前数据------------
SELECT
  @DH = DH,
  @ZD = ZD,
  @PC = PC,
  @ZL = ZL,
  @SJ = SJ,
  @FALG = FALG,
  @SFTL = SFTL,
  @ID = ID,
  @YH = YH
FROM
  inserted
SELECT
  @GX = LineCode,
  @CX = LineNo1,
  @GXDM = LineCode,
  @SB = EquipmentNo,
  @CJ = LineName1
FROM
  basic_moduleInfo
WHERE
  PutStation = @ZD;
SELECT
  @WLH = wldm
FROM
  Theline
WHERE
  pc = @pc --判断批次、站点是否为空，工单是否属于此站点
SELECT
  @GX
SELECT
  @DH IF @PC IS NULL
  OR @PC = '' BEGIN
UPDATE
  [dbo].[batch_TL]
SET
  falg = 2,
  BZ = '批次不允许为空',
  zl = @ZL
WHERE
  pc = @PC
  AND ID = @ID;
RETURN;
END IF @ZD IS NULL
OR @ZD = '' BEGIN
UPDATE
  [dbo].[batch_TL]
SET
  falg = 2,
  BZ = '站点不允许为空',
  zl = @ZL
WHERE
  pc = @PC
  AND ID = @ID;
RETURN;
END
SELECT
  555
SELECT
  @row = COUNT (*)
FROM
  batch_history_get1
WHERE
  jobIDS = @DH
  AND LineCode_SV IN (
    SELECT
      GZZX
    FROM
      basic_ProductModule1
    WHERE
      LineCode = @GXDM
  )
  AND closeFlag = '关闭';
IF @row = 1 BEGIN
UPDATE
  [dbo].[batch_TL]
SET
  falg = 2,
  BZ = '此工单已结单，不允许报工',
  zl = @ZL
WHERE
  pc = @PC
  AND ID = @ID;
RETURN;
END
SELECT
  @row = COUNT (*)
FROM
  batch_history_get1
WHERE
  jobIDS = @DH
  AND LineCode_SV IN (
    SELECT
      GZZX
    FROM
      basic_ProductModule1
    WHERE
      LineCode = @GXDM
  )
  AND closeFlag = '未关闭';
IF @row = 0 BEGIN
UPDATE
  [dbo].[batch_TL]
SET
  falg = 2,
  BZ = '此站点不存在该工单',
  zl = @ZL
WHERE
  pc = @PC
  AND ID = @ID;
RETURN;
END ----flag验证----
SELECT
  @linename = LineName1
FROM
  [dbo].[basic_moduleInfo]
WHERE
  PutStation = @ZD;
SELECT
  @linegx = gx
FROM
  [dbo].[Theline]
WHERE
  pc = @PC;
IF @linename = '天然半成品车间' BEGIN
SET
  @linename = '5001'
END
ELSE IF @linename = '粉碎整形车间' BEGIN
SET
  @linename = '5002'
END
ELSE IF @linename = '二次造粒车间' BEGIN
SET
  @linename = '5003'
END
ELSE IF @linename = '成品车间' BEGIN
SET
  @linename = '5004'
END IF @linename != @linegx BEGIN
UPDATE
  [dbo].[batch_TL]
SET
  falg = 2,
  BZ = '该批次未进行发料，不允许投料',
  zl = @ZL
WHERE
  pc = @PC
  AND ID = @ID;
RETURN;
END ----flag验证----
IF @SFTL = 1 ----开始投料
BEGIN
SELECT
  @ZL1 = zl
FROM
  Theline
WHERE
  pc = @PC IF @ZL1 IS NULL
  OR @ZL1 = '' BEGIN
UPDATE
  [dbo].[batch_TL]
SET
  falg = 2,
  pc = @pc,
  DH = @DH,
  BZ = '线边仓中不存在该批次物料',
  zl = @ZL1
WHERE
  pc = @PC
  AND ID = @ID;
RETURN;
END ----查询批次是否在工单中
SELECT
  @row11 = COUNT (*)
FROM
  materialRequistion
WHERE
  jobIDs = @DH
  AND cBatchNo = @PC;
IF @row11 = 0 BEGIN
UPDATE
  [dbo].[batch_TL]
SET
  falg = 2,
  BZ = '该批次未在该工单中',
  zl = @ZL
WHERE
  pc = @PC
  AND ID = @ID;
RETURN;
END
ELSE BEGIN ----查询批次是否已完成投料
SELECT
  @row22 = COUNT (*)
FROM
  materialRequistion
WHERE
  jobIDs = @DH
  AND cBatchNo = @PC
  AND isFinish = 0;
IF @row22 != 0 BEGIN
UPDATE
  basic_moduleInfo
SET
  flag1 = 1,
  jobIDs = @DH
WHERE
  PutStation = @ZD;
----获取当前年月
SELECT
  @sj1 = CONVERT (VARCHAR (100), GETDATE(), 112);
IF @CJ = '天然半成品车间' BEGIN
SET
  @LGORT = '5001'
END
ELSE IF @CJ = '粉碎整形车间' BEGIN
SET
  @LGORT = '5002'
END
ELSE IF @CJ = '二次造粒车间' BEGIN
SET
  @LGORT = '5003'
END
ELSE IF @CJ = '成品车间' BEGIN
SET
  @LGORT = '5004'
END ----判断实际报工重量与计划重量大小
SELECT
  DISTINCT @weight_PV = weight_PV,
  @weight_SV = weight_SV,
  @job = job
FROM
  batch_history_put
WHERE
  Batch = @PC
  AND jobIDS = @DH;
IF @weight_PV IS NULL BEGIN
SET
  @weight_PV = 0;
END ----实际重量小于计划重量
IF (@weight_PV + @ZL) < @weight_SV BEGIN
UPDATE
  batch_history_put
SET
  LineNo_PV = @CX,
  LineName_PV = @GX,
  LineCode_PV = @GXDM,
  EquipmentNo_PV = @SB,
  station_PV = @ZD,
  date_PV = GETDATE(),
  weight_PV = @ZL + @weight_PV,
  isfinish = '1'
WHERE
  Batch = @PC
  AND jobIDS = @DH
UPDATE
  planRealTime
SET
  isFinished = '1'
WHERE
  jobIDS = @DH
  AND isFinished = '0';
INSERT INTO
  Theline_Task (
    [wlxh],
    [pc],
    [sj],
    [zl],
    [zjjg],
    [flag],
    [reid],
    [bz],
    [gx],
    [wllx],
    [pcsx],
    [gx1]
  )
SELECT
  [wlxh],
  [pc],
  GETDATE(),
  @zl,
  [zjjg],
  '1',
  '4',
  '物料拆包投料出库,',
  [gx],
  [wllx],
  [pcsx],
  ''
FROM
  Theline
WHERE
  pc = @PC;
------ERP--------
  IF EXISTS (
    SELECT
      *
    FROM
      dbo.Material_batch
    WHERE
      BTRsmallBatch = @PC
  )
  AND NOT EXISTS (
    SELECT
      *
    FROM
      dbo.Finished_batch
    WHERE
      BTRsmallBatch = @PC
  ) BEGIN
SELECT
  @duiyingpc = CHARG
FROM
  ERP.dbo.batch_relationship
WHERE
  MESbatch = @pc
  AND MATNR = @WLH IF @duiyingpc = ''
  OR @duiyingpc IS NULL BEGIN
SELECT
  @duiyingpc = ERPBatch,
  @WLH = WLDM
FROM
  dbo.Material_batch
WHERE
  BTRsmallBatch = @PC
END
INSERT INTO
  ERP.[dbo].Batch_PutTask (
    BUDAT,
    AUFNR,
    MATNR,
    GAMNG,
    WERKS,
    LGORT,
    LGORT1,
    CHARG,
    BWART,
    STEMFROM,
    reserved5,
    MEINS
  )
VALUES
  (
    CONVERT (VARCHAR (100), GETDATE(), 112),
    @job,
    @WLH,
    @ZL,
    '1060',
    @LGORT,
    '',
    @duiyingpc,
    '261',
    'FJ1',
    @PC,
    'KG'
  )
END IF NOT EXISTS (
  SELECT
    *
  FROM
    dbo.Material_batch
  WHERE
    BTRsmallBatch = @PC
)
AND EXISTS (
  SELECT
    *
  FROM
    dbo.Finished_batch
  WHERE
    BTRsmallBatch = @PC
) BEGIN
SELECT
  @duiyingpc1 = CHARG,
  @WLH = MATNR
FROM
  ERP.dbo.batch_relationship
WHERE
  MESbatch = @pc
  AND MATNR = @WLH
SELECT
  1;
IF @duiyingpc1 = ''
  OR @duiyingpc1 IS NULL BEGIN
SELECT
  @duiyingpc1 = ERPBatch,
  @WLH = WLDM
FROM
  dbo.Finished_batch
WHERE
  BTRsmallBatch = @PC
END
INSERT INTO
  ERP.[dbo].Batch_PutTask (
    BUDAT,
    AUFNR,
    MATNR,
    GAMNG,
    WERKS,
    LGORT,
    LGORT1,
    CHARG,
    BWART,
    STEMFROM,
    reserved5,
    MEINS
  )
VALUES
  (
    CONVERT (VARCHAR (100), GETDATE(), 112),
    @job,
    @WLH,
    @ZL,
    '1060',
    @LGORT,
    '',
    @duiyingpc1,
    '261',
    'FJ1',
    @PC,
    'KG'
  )
END IF NOT EXISTS (
  SELECT
    *
  FROM
    dbo.Material_batch
  WHERE
    BTRsmallBatch = @PC
)
AND NOT EXISTS (
  SELECT
    *
  FROM
    dbo.Finished_batch
  WHERE
    BTRsmallBatch = @PC
) BEGIN
SELECT
  @duiyingpc2 = CHARG,
  @WLH = MATNR
FROM
  ERP.dbo.batch_relationship
WHERE
  MESbatch = @pc
  AND MATNR = @WLH IF @duiyingpc2 != ''
  OR @duiyingpc2 IS NOT NULL BEGIN
INSERT INTO
  ERP.[dbo].Batch_PutTask (
    BUDAT,
    AUFNR,
    MATNR,
    GAMNG,
    WERKS,
    LGORT,
    LGORT1,
    CHARG,
    BWART,
    STEMFROM,
    reserved5,
    MEINS
  )
VALUES
  (
    CONVERT (VARCHAR (100), GETDATE(), 112),
    @job,
    @WLH,
    @ZL,
    '1060',
    @LGORT,
    '',
    @duiyingpc2,
    '261',
    'FJ1',
    @PC,
    ''
  )
END
ELSE BEGIN
INSERT INTO
  ERP.[dbo].Batch_PutTask (
    BUDAT,
    AUFNR,
    MATNR,
    GAMNG,
    WERKS,
    LGORT,
    LGORT1,
    CHARG,
    BWART,
    MSG_TYP,
    RET_MSG,
    STEMFROM,
    reserved5,
    MEINS
  )
VALUES
  (
    CONVERT (VARCHAR (100), GETDATE(), 112),
    @job,
    @WLH,
    @ZL,
    '1060',
    @LGORT,
    '',
    @duiyingpc2,
    '261',
    'N',
    '未在标签表及批次对应表中找到对应信息',
    'FJ1',
    @PC,
    'KG'
  )
END
END ------ERP---------
UPDATE
  Theline
SET
  zl = (@weight_SV - @weight_PV - @ZL)
WHERE
  pc = @PC;
END
ELSE IF (@weight_PV + @ZL) = @weight_SV BEGIN
UPDATE
  batch_history_put
SET
  LineNo_PV = @CX,
  LineName_PV = @GX,
  LineCode_PV = @GXDM,
  EquipmentNo_PV = @SB,
  station_PV = @ZD,
  date_PV = GETDATE(),
  weight_PV = @ZL + @weight_PV,
  isfinish = '1'
WHERE
  Batch = @PC
  AND jobIDS = @DH
UPDATE
  materialRequistion
SET
  isfinish = '1'
WHERE
  cBatchNo = @PC
  AND isfinish = '0'
  AND jobIDS = @DH;
SELECT
  12
UPDATE
  planRealTime
SET
  isFinished = '1'
WHERE
  jobIDS = @DH
  AND isFinished = '0';
SELECT
  1345
INSERT INTO
  Theline_Task (
    [wlxh],
    [pc],
    [sj],
    [zl],
    [zjjg],
    [flag],
    [reid],
    [bz],
    [gx],
    [wllx],
    [pcsx],
    [gx1]
  )
SELECT
  DISTINCT [wlxh],
  [pc],
  GETDATE(),
  [zl],
  [zjjg],
  '1',
  '4',
  '物料整包投料出库',
  [gx],
  [wllx],
  [pcsx],
  ''
FROM
  Theline
WHERE
  pc = @PC;
SELECT
  134 ------ERP--------
  IF EXISTS (
    SELECT
      *
    FROM
      dbo.Material_batch
    WHERE
      BTRsmallBatch = @PC
  )
  AND NOT EXISTS (
    SELECT
      *
    FROM
      dbo.Finished_batch
    WHERE
      BTRsmallBatch = @PC
  ) BEGIN
SELECT
  4;
SELECT
  @duiyingpc = CHARG
FROM
  ERP.dbo.batch_relationship
WHERE
  MESbatch = @pc
  AND MATNR = @WLH IF @duiyingpc = ''
  OR @duiyingpc IS NULL BEGIN
SELECT
  @duiyingpc = ERPBatch,
  @WLH = WLDM
FROM
  dbo.Material_batch
WHERE
  BTRsmallBatch = @PC
END
INSERT INTO
  ERP.[dbo].Batch_PutTask (
    BUDAT,
    AUFNR,
    MATNR,
    GAMNG,
    WERKS,
    LGORT,
    LGORT1,
    CHARG,
    BWART,
    STEMFROM,
    reserved5,
    MEINS
  )
VALUES
  (
    CONVERT (VARCHAR (100), GETDATE(), 112),
    @job,
    @WLH,
    @ZL,
    '1060',
    @LGORT,
    '',
    @duiyingpc,
    '261',
    'FJ1',
    @PC,
    'KG'
  )
END IF NOT EXISTS (
  SELECT
    *
  FROM
    dbo.Material_batch
  WHERE
    BTRsmallBatch = @PC
)
AND EXISTS (
  SELECT
    *
  FROM
    dbo.Finished_batch
  WHERE
    BTRsmallBatch = @PC
) BEGIN
SELECT
  2;
SELECT
  @duiyingpc1 = CHARG,
  @WLH = MATNR
FROM
  ERP.dbo.batch_relationship
WHERE
  MESbatch = @pc
  AND MATNR = @WLH
SELECT
  @WLH;
IF @duiyingpc1 = ''
  OR @duiyingpc1 IS NULL BEGIN
SELECT
  @duiyingpc1 = ERPBatch,
  @WLH = WLDM
FROM
  dbo.Finished_batch
WHERE
  BTRsmallBatch = @PC
END
INSERT INTO
  ERP.[dbo].Batch_PutTask (
    BUDAT,
    AUFNR,
    MATNR,
    GAMNG,
    WERKS,
    LGORT,
    LGORT1,
    CHARG,
    BWART,
    STEMFROM,
    reserved5,
    MEINS
  )
VALUES
  (
    CONVERT (VARCHAR (100), GETDATE(), 112),
    @job,
    @WLH,
    @ZL,
    '1060',
    @LGORT,
    '',
    @duiyingpc1,
    '261',
    'FJ1',
    @PC,
    'KG'
  )
END IF NOT EXISTS (
  SELECT
    *
  FROM
    dbo.Material_batch
  WHERE
    BTRsmallBatch = @PC
)
AND NOT EXISTS (
  SELECT
    *
  FROM
    dbo.Finished_batch
  WHERE
    BTRsmallBatch = @PC
) BEGIN
SELECT
  3;
SELECT
  @duiyingpc2 = CHARG,
  @WLH = MATNR
FROM
  ERP.dbo.batch_relationship
WHERE
  MESbatch = @pc
  AND MATNR = @WLH IF @duiyingpc2 != ''
  OR @duiyingpc2 IS NOT NULL BEGIN
INSERT INTO
  ERP.[dbo].Batch_PutTask (
    BUDAT,
    AUFNR,
    MATNR,
    GAMNG,
    WERKS,
    LGORT,
    LGORT1,
    CHARG,
    BWART,
    STEMFROM,
    reserved5,
    MEINS
  )
VALUES
  (
    CONVERT (VARCHAR (100), GETDATE(), 112),
    @job,
    @WLH,
    @ZL,
    '1060',
    @LGORT,
    '',
    @duiyingpc2,
    '261',
    'FJ1',
    @PC,
    'KG'
  )
END
ELSE BEGIN
INSERT INTO
  ERP.[dbo].Batch_PutTask (
    BUDAT,
    AUFNR,
    MATNR,
    GAMNG,
    WERKS,
    LGORT,
    LGORT1,
    CHARG,
    BWART,
    MSG_TYP,
    RET_MSG,
    STEMFROM,
    reserved5,
    MEINS
  )
VALUES
  (
    CONVERT (VARCHAR (100), GETDATE(), 112),
    @job,
    @WLH,
    @ZL,
    '1060',
    @LGORT,
    '',
    @duiyingpc2,
    '261',
    'N',
    '未在标签表及批次对应表中找到对应信息',
    'FJ1',
    @PC,
    'KG'
  )
END
END ------ERP---------
DELETE Theline
WHERE
  pc = @PC;
DELETE ERP_CWDY
WHERE
  batch = @PC
END ----实际重量大于计划重量
ELSE IF (@weight_PV + @ZL) > @weight_SV BEGIN
SELECT
  @weight_PV;
SELECT
  @ZL;
SELECT
  @weight_SV;
UPDATE
  [dbo].[batch_TL]
SET
  falg = 2,
  BZ = '该批次投料超过计划重量',
  zl = @ZL
WHERE
  pc = @PC
  AND ID = @ID;
RETURN;
END
UPDATE
  [dbo].[batch_TL]
SET
  falg = 1,
  BZ = '投料成功'
WHERE
  pc = @PC
  AND ID = @ID;
END
ELSE BEGIN
UPDATE
  [dbo].[batch_TL]
SET
  falg = 2,
  BZ = '该批次已完成投料',
  zl = @ZL
WHERE
  pc = @PC
  AND ID = @ID;
RETURN;
END
END
END
ELSE IF @SFTL = 0 ----投料完成
BEGIN
SELECT
  444 DECLARE @jobID VARCHAR (50),
  @productNumber VARCHAR (50),
  @BomVersion VARCHAR (20),
  @ProcessVersion VARCHAR (20),
  @LineNo_SV VARCHAR (50),
  @LineName_SV VARCHAR (50),
  @LineCode_SV VARCHAR (50),
  @EquipmentNo_SV VARCHAR (50),
  @Station_SV VARCHAR (50),
  @LineNo_PV VARCHAR (200),
  @LineName_PV VARCHAR (200),
  @LineCode_PV VARCHAR (200),
  @EquipmentNo_PV VARCHAR (255);
SELECT
  @job = job,
  @jobID = jobID,
  @productNumber = productNumber,
  @BomVersion = BomVersion,
  @ProcessVersion = ProcessVersion,
  @LineNo_SV = LineNo_SV,
  @LineName_SV = LineName_SV,
  @LineCode_SV = LineCode_SV,
  @EquipmentNo_SV = EquipmentNo_SV,
  @Station_SV = Station_SV
FROM
  batch_history_get1
WHERE
  jobIDs = (
    SELECT
      DH
    FROM
      INSERTED
  );
SELECT
  TOP 1 @LineNo_PV = LineNo1,
  @LineName_PV = LineName,
  @LineCode_PV = LineCode,
  @EquipmentNo_PV = EquipmentNo
FROM
  basic_moduleinfo
WHERE
  GetStation = (
    SELECT
      ZD
    FROM
      INSERTED
  )
ORDER BY
  ID DESC;
----判断该站点、改订单在PUT表中是否存在
  IF (
    SELECT
      COUNT (*)
    FROM
      batch_history_put
    WHERE
      station_PV = (
        SELECT
          ZD
        FROM
          INSERTED
      )
      AND jobIDS = (
        SELECT
          DH
        FROM
          INSERTED
      )
  ) = 0 BEGIN
INSERT INTO
  batch_history_put (
    job,
    jobID,
    jobIDS,
    productNumber,
    BomVersion,
    ProcessVersion,
    LineNo_SV,
    LineName_SV,
    LineCode_SV,
    EquipmentNo_SV,
    Station_SV,
    Batch,
    LineNo_PV,
    LineName_PV,
    LineCode_PV,
    EquipmentNo_PV,
    station_PV,
    weight_PV,
    date_PV,
    isfinish
  )
VALUES
  (
    @job,
    @jobID,
    (
      SELECT
        DH
      FROM
        INSERTED
    ),
    @productNumber,
    @BomVersion,
    @ProcessVersion,
    @LineNo_SV,
    @LineName_SV,
    @LineCode_SV,
    @EquipmentNo_SV,
    @Station_SV,
    (
      SELECT
        PC
      FROM
        INSERTED
    ),
    @LineNo_PV,
    @LineName_PV,
    @LineCode_PV,
    @EquipmentNo_PV,
    (
      SELECT
        ZD
      FROM
        INSERTED
    ),
    (
      SELECT
        ZL
      FROM
        INSERTED
    ),
    GetDate(),
    '1'
  );
UPDATE
  batch_TL
SET
  falg = 1,
  BZ = '投料完成'
WHERE
  ID = (
    SELECT
      ID
    FROM
      INSERTED
  );
UPDATE
  basic_moduleinfo
SET
  jobIDS = (
    SELECT
      DH
    FROM
      INSERTED
  ),
  flag1 = 1
WHERE
  PutStation = (
    SELECT
      ZD
    FROM
      INSERTED
  );
END
ELSE BEGIN
SELECT
  1;
UPDATE
  [dbo].[batch_TL]
SET
  falg = 2,
  BZ = '不允许重复投料',
  zl = @ZL
WHERE
  pc = @PC
  AND ID = @ID;
--return;
END
END
END