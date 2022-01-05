if (void 0 === kmParameterIteam)
    var kmParameterIteam = {
        KM_PARAMETER_REQUESTTYPE: 'requestType',
        KM_PARAMETER_REQUESTID: 'requestId',
        KM_PARAMETER_SPACENAME: 'spaceName',
        KM_PARAMETER_POSITIONNAME: 'positionName',
        KM_PARAMETER_DATAVERSION: 'dataVersion',
        KM_PARAMETER_timeMode: 'timeMode',
        KM_PARAMETER_STARTTIME: 'startTime',
        KM_PARAMETER_ENDTIME: 'endTime',
        KM_PARAMETER_STIMEPOSITION: 'sTimePosition',
        KM_PARAMETER_ETIMEPOSITION: 'eTimePosition',
        KM_PARAMETER_FILTER: 'filter',
        KM_PARAMETER_DATA: 'data',
        KM_PARAMETER_FILTER: 'filter',
    };
var requestAnimationFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (e) {
            return window.setTimeout(function () {
                e();
            }, 1e3 / 60);
        },
    cancelAnimationFrame =
        window.cancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.cancelRequestAnimationFrame ||
        function () {
            clearTimeout(timeId);
        },
    timeId = requestAnimationFrame(onTimer);

function onTimer() {
    for (var e = KMDevRunMng.getInstance().getNeedUpdateCanvas(), t = e.length, n = 0; n < t; ++n) {
        var o = e[n],
            a = o.getStage(),
            r = o.getIsTile(),
            s = o.getIsGrid(),
            i = o.getViewObj();
        if (KMDevRunMng.getInstance().flag !== systemState.RUN_SYSTEM || !i.twoDimenObj || i.twoDimenObj.pageVisible) {
            if ((a.clear(), r && i.draw(!1), s)) {
                var l = a.scaleX;
                i.grid.drawGrid(l);
            }
            a.update();
        }
    }
    KMDevRunMng.getInstance().clearNeedUpdateCanvas(), requestAnimationFrame(onTimer);
}

function gSyscallback(e) {
    var t = e.data;
    'string' == typeof t && (t = JSON.parse(t));
    var n = t.dataType;
    1 === n ? gSubScribleSyscallBack(t) : 2 === n && operateDbcallBack(t), 'auth' === t.type ? authSysCallback(t) : console.log('callBack data is error!');
}

function authSysCallback(e) {
    switch (e.errorCode) {
        case STATUSEUME.AUTHNUMBER:
            scriptConfusionDialog(SOFT_LOCK.AUTHTIPNOTE, SOFT_LOCK.NEEDMORECLIENTAUZ), (window.location.href = window.location.pathname);
            break;
        case STATUSEUME.AUTHCONNECTER:
            scriptConfusionDialog(SOFT_LOCK.AUTHTIPNOTE, SOFT_LOCK.SERVERCONNECTIONFAIL);
            break;
        case STATUSEUME.AUTHSUPERUSE:
            scriptConfusionDialog(SOFT_LOCK.AUTHTIPNOTE, SOFT_LOCK.PLEASEAUZ), (window.location.href = window.location.pathname);
            break;
        case STATUSEUME.AUTHTIMEOUT:
            scriptConfusionDialog(SOFT_LOCK.AUTHTIPNOTE, SOFT_LOCK.SERVERCONNECTIONFAIL);
            break;
        case STATUSEUME.AUTHPRECHECK:
            if ('DAY15' === e.data) scriptConfusionDialog(SOFT_LOCK.AUTHTIPNOTE, SOFT_LOCK.AUTHLAST15DAYS);
            else if (0 === e.data.indexOf('ONEDAY')) {
                var t = Number(e.data.substring(6, e.length));
                scriptConfusionDialog(SOFT_LOCK.AUTHTIPNOTE, 24 === t ? SOFT_LOCK.AUTHLASTONEDAY : SOFT_LOCK.AUTHLASTTIME + t + SOFT_LOCK.HOURS);
            } else if (0 === e.data.indexOf('ONEHOUR')) {
                var n = Number(e.data.substring(7, e.length));
                scriptConfusionDialog(SOFT_LOCK.AUTHTIPNOTE, SOFT_LOCK.AUTHLASTTIME + 10 * n + SOFT_LOCK.MINUTES);
            }
    }
}

function gSubScribleSyscallBack(e) {
    'string' == typeof e && (e = JSON.parse(e));
    var t = KMDevRunMng.getInstance().subscribeMap;
    if (t.has(subscribeType.KPSYSTEMSUBSCRIBE)) for (var n = t.get(subscribeType.KPSYSTEMSUBSCRIBE), o = 0; o < n.length; o++) n[o](e.data);
}

function operateDbcallBack(e) {
    'string' == typeof e && (e = JSON.parse(e));
    var t = KMDevRunMng.getInstance().requestCallBackMap;
    t.has(e.requestId) && t.get(e.requestId)(e);
}

function ExportToExcel(e, t, n = [], o = []) {
    var a = !1,
        r = 0;
    if (void 0 === t || '' === t) r = -1;
    else if (!Array.isArray(e) || (e[0] && 'object' != typeof e[0])) (r = -1), console.warn('ExportToExcel()：数据格式错误!');
    else {
        var s = kmUlits.deepClone(e);
        var i = s[0];
        s.unshift({});
        let r = [];
        for (var l = kmUlits.deepClone(o), c = 0; c < o.length; c++)
            if (o[c].children) {
                a = !0;
                var u = o[c].children;
                o.splice(c, 1);
                for (var g = 0; g < u.length; g++) o.splice(c + g, 0, u[g]);
            }
        var f = [];
        let w = {};
        if (o && o.length > 0) {
            for (var d in i) s[0][d] = d;
            for (var c in o) (s[0][o[c].prop] = o[c].label), f.push(o[c].prop);
        } else for (var d in i) f.push(d), (s[0][d] = d);
        for (let e = 0; e < l.length; e++) {
            if (l[e].children) {
                var p = l[e].children;
                for (d = 0; d < p.length - 1; d++) r.push(l[e].label);
            }
            r.push(l[e].label);
        }
        for (var m = 0; m < f.length; m++) w[f[m]] = r[m];
        i = [];
        a && s.unshift(w),
            s
                .map((e, t) =>
                    f.map((n, o) =>
                        Object.assign(
                            {},
                            {
                                v: e[n],
                                position:
                                    (o > 25
                                        ? (function (e) {
                                              let t = '',
                                                  n = 0;
                                              for (; e > 0; ) (n = (e % 26) + 1), (t = String.fromCharCode(n + 64) + t), (e = (e - n) / 26);
                                              return t;
                                          })(o)
                                        : String.fromCharCode(65 + o)) +
                                    (t + 1),
                            }
                        )
                    )
                )
                .reduce((e, t) => e.concat(t))
                .forEach(
                    (e, t) =>
                        (i[e.position] = {
                            v: e.v,
                        })
                );
        var h = Object.keys(i);
        i['!merges'] = n;
        var M = {
                SheetNames: ['mySheet'],
                Sheets: {
                    mySheet: Object.assign({}, i, {
                        '!ref': h[0] + ':' + h[h.length - 1],
                    }),
                },
            },
            I = new Blob(
                [
                    (function (e) {
                        for (var t = new ArrayBuffer(e.length), n = new Uint8Array(t), o = 0; o != e.length; ++o) n[o] = 255 & e.charCodeAt(o);
                        return t;
                    })(
                        XLSX.write(M, {
                            bookType: 'xlsx',
                            bookSST: !1,
                            type: 'binary',
                        })
                    ),
                ],
                {
                    type: '',
                }
            ),
            y = document.createElement('a');
        (y.href = URL.createObjectURL(I)),
            (y.download = t + '.xlsx'),
            document.body.appendChild(y),
            y.click(),
            setTimeout(function () {
                URL.revokeObjectURL(I), document.body.removeChild(y);
            }, 100);
    }
    return r;
}

function ImportByExcel(e) {
    var t;
    var n = document.createElement('input');
    (n.type = 'file'),
        (n.style.display = 'none'),
        (n.id = 'IMPORT_BY_EXCEL'),
        (obj = n),
        document.body.appendChild(n),
        $(n).trigger('click'),
        (n.onchange = function () {
            if (obj.files) {
                var o = obj.files[0],
                    a = o.name.split('.'),
                    r = a[a.length - 1];
                if (['xlsx', 'xls'].includes(r)) {
                    var s = new FileReader();
                    (s.onload = function (o) {
                        var a = o.target.result;
                        (t = null),
                            (t = XLSX.read(a, {
                                type: 'binary',
                            }));
                        var r = XLSX.utils.sheet_to_json(t.Sheets[t.SheetNames[0]]);
                        e(r), $('#' + n.id).remove();
                    }),
                        s.readAsBinaryString(o);
                } else $Function.ShowMes(IDS_FILE_FORMAT_DISCREPANCY, 'error');
            }
        });
}

function SQLConnect(e, t, n, o, a, r, s) {
    KMClientInterface.getInstance().SQLConnect(e, t, n, o, a, r, s);
}

function SQLExecute(e, t, n, o, a, r) {
    var s = r || 3e3,
        i = KMDatasourceMng.getInstance().getDataSource(e),
        l = KMClientInterface.getInstance().getFileRequest();
    i
        ? 'string' == typeof e && 'number' == typeof t && 'number' == typeof n && 'string' == typeof o && 'function' == typeof a && sqlParam[t] == i.type
            ? i.SQLExecute(n, o, s, (e) => {
                  0 !== e.errorCode && e.message && e.message.indexOf('en is invalid') > -1 ? (new RegExp(sessionStorage.getItem('WellinUserToken')).test(e.message) ? l.checkStatus(i.SQLExecute, arguments) : i.SQLExecute(n, o, s, a)) : a(e);
              })
            : alert(RS.CHECK_PARAM)
        : console.log('数据源未找到');
}

function SQLExecute1(e, t, n, o, a) {
    var r = a || 3e3,
        s = KMDatasourceMng.getInstance().getDataSource(e),
        i = KMClientInterface.getInstance().getFileRequest();
    s
        ? 'string' == typeof e && 'number' == typeof t && 'string' == typeof n && 'function' == typeof o && s.SQLExecute1
            ? s.SQLExecute1(t, n, r, (e) => {
                  0 !== e.errorCode && e.message && e.message.indexOf('en is invalid') > -1 ? (new RegExp(sessionStorage.getItem('WellinUserToken')).test(e.message) ? i.checkStatus(SQLExecute1, arguments) : s.SQLExecute1(t, n, r, o)) : o(e);
              })
            : alert(RS.CHECK_PARAM)
        : console.log('数据源未找到');
}

function SQLExecute2(e, t, n, o) {
    var a = KMDatasourceMng.getInstance().getDataSource(e);
    a
        ? 'string' == typeof e && 'string' == typeof t && 'object' == typeof n && 'function' == typeof o && a.SQLExecute2
            ? a.SQLExecute2(sqltype, n, (e) => {
                  0 !== e.errorCode && e.message.indexOf('en is invalid') > -1 ? new RegExp(sessionStorage.getItem('WellinUserToken')).test(e.message) && clientRoute.checkStatus(SQLExecute2, arguments) : o(e);
              })
            : alert(RS.CHECK_PARAM)
        : console.log('数据源未找到');
}

function SyncSQLExecute(e, t, n, o, a) {
    var r = a || 3e3,
        result = {},
        s = KMDatasourceMng.getInstance().getDataSource(e);
    s ? (s.SyncSQLExecute ? (result = s.SyncSQLExecute(t, n, r, o)) : alert(RS.CHECK_PARAM)) : console.log('数据源未找到');
    return result;
}

function ExcuteSqlSelect(e, t, n) {
    KMDatasourceMng.getInstance().getDataSource(dsName).SQLExecute(0, t, n);
}

function ExcuteSqlNoSelect(e, t, n) {
    KMDatasourceMng.getInstance().getDataSource(dsName).SQLExecute(1, t, n);
}

function RedisExecute(e, t, n, o) {
    KMDatasourceMng.getInstance().getDataSource(e).RedisExecute(!0, t, n, o);
}

function SyncRedisExecute(e, t, n, o) {
    KMDatasourceMng.getInstance().getDataSource(e).RedisExecute(!1, t, n, o);
}

function SQLDisconnect(e, t, n) {
    KMClientInterface.getInstance().SQLDisconnect(e, t, n);
}

function MongoDBExecute(e, t, n, o) {
    KMDatasourceMng.getInstance().getDataSource(e).MongoDBExecute(!1, t, n, o);
}

function setTagValues(e, t, n, o, a) {
    var r = a || 3e3,
        s = KMDatasourceMng.getInstance().getDataSource(e),
        i = KMClientInterface.getInstance().getFileRequest();
    s
        ? s.setTagValues(t, n, r, (e) => {
              0 !== e.errorCode && e.message.indexOf('en is invalid') > -1 ? i.checkStatus(setTagValues, arguments) : o(e);
          })
        : console.log('数据源未找到');
}

function AsynQueryHistoryDatas(e, t, n, o, a, r, s, i, l, c, u, g) {
    var f = c || 3e3,
        d = KMDatasourceMng.getInstance().getDataSource(e),
        p = KMClientInterface.getInstance().getFileRequest();
    d
        ? d.AsynQueryHistoryDatas(
              t,
              n,
              o,
              a,
              r,
              s,
              i,
              f,
              (e) => {
                  0 !== e.errorCode && e.message.indexOf('en is invalid') > -1 ? p.checkStatus(AsynQueryHistoryDatas, arguments) : l(e);
              },
              u,
              g
          )
        : console.log('数据源未找到');
}

function GetTagValue(e, t, n) {
    var o = n || 3e3,
        a = [];
    'string' == typeof e ? a.push(e) : e instanceof Array && (a = e);
    var r = KMProjectVariableMng.getInstance().projectVariablesMap.get(a[0]);
    if (r) {
        var s = KMDatasourceMng.getInstance().getDataSource(r.dataSourceItem.appName + '.' + r.dataSourceItem.dataSourceName);
        s ? (result = s.GetTagValue(a, o, t)) : console.log('数据源未找到');
    } else console.log('工程变量未找到');
}

function SyncGetFieldValues(e, t, n, o) {
    var a = GetTagFieldValue(e, t, o || 3e3, n, KMTransmissionType.SYNC);
    (n.errorCode = a.errorCode), (n.data = a.data);
}

function GetFieldValues(e, t, n, o) {
    GetTagFieldValue(e, t, o || 3e3, n, KMTransmissionType.ASYN);
}

function GetTagFieldValue(e, t, n, o, a) {
    var r = [],
        s = [];
    'string' == typeof e ? r.push(e) : e instanceof Array && (r = e);
    var i = [];
    t.forEach((e) => {
        (e = e.toUpperCase()), i.push(fieldNameIDObj[e]);
    });
    var l = KMProjectVariableMng.getInstance().projectVariablesMap.get(r[0]);
    if (l) {
        var c = KMDatasourceMng.getInstance().getDataSource(l.dataSourceItem.appName + '.' + l.dataSourceItem.dataSourceName);
        c && (s = c.GetFieldValues(r, i, n, o, a));
    }
    return s;
}

function SyncSetFieldValues(e, t, n) {
    var o = SetTagFieldValue(e, n || 3e3, t, KMTransmissionType.SYNC);
    (t.errorCode = o.errorCode), (t.data = o.data);
}

function SetFieldValues(e, t, n) {
    SetTagFieldValue(e, n || 3e3, t, KMTransmissionType.ASYN);
}

function SetTagFieldValue(e, t, n, o) {
    var a = [],
        r = KMProjectVariableMng.getInstance().projectVariablesMap.get(e[0].N);
    if (r) {
        var s = KMDatasourceMng.getInstance().getDataSource(r.dataSourceItem.appName + '.' + r.dataSourceItem.dataSourceName);
        s && (a = s.SetFieldValues(e, t, n, o));
    }
    return a;
}

function getAlarmConfig(e, t, n, o, a, r) {
    var s = KMDatasourceMng.getInstance().getDataSource(e);
    if ((!a && (a = 3e3), s)) {
        if ('string' == typeof n) {
            var i = {},
                l = [];
            'condition' == r ? (i.condition_name = t) : 'tag' == r && (i.tag_name = t), (i.attribute = n), 'all' == r && (i = {}), l.push(i);
        } else if (n instanceof Array) {
            l = [];
            for (var c = 0; c < n.length; c++) {
                i = {};
                'condition' == r ? (i.condition_name = t) : 'tag' == r && (i.tag_name = t), (i.attribute = n[c]), l.push(i);
            }
        } else console.log('please check parameters');
        s.queryAlarmConfig(l, a, o, r);
    } else console.log('未找到数据源');
}

function GetAlarmField(e, t, n) {
    getAlarmConfig(e, '', '', t, n, 'all');
}

function GetAlarmFieldByTag(e, t, n, o, a) {
    getAlarmConfig(e, t, n, o, a, 'tag');
}

function GetAlarmFieldByItem(e, t, n, o, a) {
    getAlarmConfig(e, t, n, o, a, 'condition');
}

function setAlarmConfig(e, t, n, o, a, r, s) {
    var i = KMDatasourceMng.getInstance().getDataSource(e);
    if ((!r && (r = 3e3), i)) {
        if ('string' == typeof n) {
            var l = {},
                c = [];
            'condition' == s ? (l.condition_name = t) : 'tag' == s && (l.tag_name = t), (l.attribute = n), (l.value = o), c.push(l);
        } else if (n instanceof Array) {
            c = [];
            if (o.length === n.length)
                for (var u = 0; u < n.length; u++) {
                    l = {};
                    'condition' == s ? (l.condition_name = t) : 'tag' == s && (l.tag_name = t), (l.attribute = n[u]), (l.value = o[u]), c.push(l);
                }
            else console.log('please check parameters');
        } else console.log('please check parameters');
        i.setAlarmConfig(c, r, a, s);
    }
}

function SetAlarmFieldByTag(e, t, n, o, a, r) {
    setAlarmConfig(e, t, n, o, a, r, 'tag');
}

function SetAlarmFieldByItem(e, t, n, o, a, r) {
    setAlarmConfig(e, t, n, o, a, r, 'condition');
}

function KHQueryRawDatas(e, t, n, o, a, r, s, i, l) {
    var c = l || 3e3,
        u = KMDatasourceMng.getInstance().getDataSource(e);
    u ? u.KHQueryRawDatas(operator, t, n, o, a, r, s, c, i) : console.log('数据源未找到');
}

function KHAddDatas(e, t, n) {
    var o = KMDatasourceMng.getInstance().getDataSource(e);
    o ? o.KHAddDatas(t, n) : console.log('数据源未找到');
}

function KHQuerySampleDatas1(e, t, n, o, a) {
    var r = KMDatasourceMng.getInstance().getDataSource(e);
    r ? r.KHQuerySampleDatas1(data, callBack) : console.log('数据源未找到');
}

function GetHistoryDatasKH351(e, t, n, o, a, r, s, i, l = 0) {
    var c = KMDatasourceMng.getInstance().getDataSource(e),
        u = i || 3e3;
    c ? (1 === a ? ((u = s || 3e3), c.KHQueryRawDatas(t, n, o, l, '', 1, u, r, 1)) : 3 === a ? console.log('暂不支持该模式') : ((void 0 === s || s < 500) && (s = 500), c.KHQuerySampleDatas2(t, n, o, l, s, 0, '', 1, u, r, 1))) : console.log('数据源未找到');
}

function GetHistoryDatasKH(e, t, n, o, a, r, s, i, l) {
    var c = l || 3e3,
        u = KMDatasourceMng.getInstance().getDataSource(e);
    u ? u.KHQueryRawDatas(t, n, o, a, r, s, c, i, 0) : console.log('数据源未找到');
}

function GetHistoryDatasKHEx1(e, t, n, o, a, r, s, i, l, c, u) {
    var g = u || 3e3,
        f = KMDatasourceMng.getInstance().getDataSource(e);
    f ? f.KHQuerySampleDatas2(t, n, o, a, r, s, i, l, g, c) : console.log('数据源未找到');
}

function GetRealDatasKH351(e, t, n, o) {
    var a = KMDatasourceMng.getInstance().getDataSource(e),
        r = o || 3e3;
    a ? a.KHQueryRealKHDatas(t, 1, r, n) : console.log('数据源未找到');
}

function GetKingHistoryGroupList(e, t, n) {
    var o = KMDatasourceMng.getInstance().getDataSource(e),
        a = n || 3e3;
    o
        ? (KMClientInterface.getInstance()
              .getFileRequest()
              .refreshTokenRequest(() => {}),
          o.KHQueryGroupList(a, t))
        : console.log('数据源未找到');
}

function GetKingHistoryTagList(e, t, n, o) {
    var a = KMDatasourceMng.getInstance().getDataSource(e),
        r = o || 3e3;
    a
        ? (KMClientInterface.getInstance()
              .getFileRequest()
              .refreshTokenRequest(() => {}),
          a.KHQueryTagList(t, r, n))
        : console.log('数据源未找到');
}

function GetRealDatasKH(e, t, n, o) {
    var a = o || 3e3,
        r = KMDatasourceMng.getInstance().getDataSource(e);
    r ? r.KHQueryRealKHDatas(t, 0, a, n) : console.log('数据源未找到');
}

function GetDataSourceName() {
    var e = [];
    return (
        KMDatasourceMng.getInstance().datasourceMap.forEach((t, n) => {
            e.push(n);
        }),
        e
    );
}

function GetFilesList(e, t) {
    KMClientInterface.getInstance().GetFilesList(e, t);
}

function UploadFiles(e, t, n) {
    var o = new KMUIInput();
    (o.thisElement.id = 'kmui-file'),
        o.thisElement.setAttribute('type', 'file'),
        o.thisElement.setAttribute('multiple', 'true'),
        (o.thisElement.style.display = 'none'),
        document.body.appendChild(o.thisElement),
        $('#kmui-file')
            .unbind('change')
            .bind('change', function () {
                for (var a = KMClientInterface.getInstance(), r = document.getElementById('kmui-file').files, s = ['js', 'xml', 'jsp', 'php', 'master', 'asp', 'ascx', 'aspx', 'bat', 'exe', 'dll'], i = 0; i < r.length; i++) {
                    var l = r[i],
                        c = l.name.replace(/.+\./, '');
                    if (s.includes(c)) return void alert(c + IDS_UPLOAD_NOTPROMISE);
                    'project' === n ? a.uploadImg(e, l, null, t) : a.UploadFiles(e, l, null, t);
                }
                document.body.removeChild(o.thisElement);
            }),
        $('#kmui-file').click();
}

function UploadFilesByFilebox(e, t, n, o) {
    for (var a = KMClientInterface.getInstance(), r = 0; r < e.length; r++) {
        var s = e[r];
        'project' === o ? a.uploadImg(t, s, null, n) : a.UploadFiles(t, s, null, n);
    }
}

function DownloadFiles(e, t) {
    KMClientInterface.getInstance().DownloadFiles(e, t);
}

function DeleteFiles(e, t) {
    KMClientInterface.getInstance().DeleteFiles(e, t);
}

function CreateFolder(e, t) {
    KMClientInterface.getInstance().CreateFolder(e, t);
}

function DeleteFolder(e, t) {
    var n = window.sessionStorage.userhandle;
    KMClientInterface.getInstance().DeleteFolder(n, e, t);
}

function RenameFile(e, t, n) {
    var o = window.sessionStorage.userhandle;
    KMClientInterface.getInstance().RenameFile(o, e, t, n);
}

function SearchFile(e, t, n) {
    var o = window.sessionStorage.userhandle;
    KMClientInterface.getInstance().SearchFile(o, e, t, n);
}

function CopyFile(e, t, n) {
    var o = window.sessionStorage.userhandle;
    KMClientInterface.getInstance().CopyFile(o, e, t, n);
}

function onInconsistentFormat(e, t, n) {
    var o = {
            status: '',
            fileList: null,
        },
        a = [],
        r = {
            fileRelativePath: e,
            fileFormat: t,
        };
    a.push(r), (o.status = 'incon-format'), (o.fileList = a), n(o);
}

function ReadExcelFile(e, t) {
    var n = e.match(/(\.[^.]+|)$/)[0];
    if ('.xls' === (n = n.replace('/', '')) || '.xlsx' === n) {
        var o = window.sessionStorage.userhandle;
        KMClientInterface.getInstance().ReadFile(o, e, t);
    } else {
        onInconsistentFormat(e, '.xls or .xlsx', t);
    }
}

function WriteExcelFile(e, t, n) {
    var o = e.match(/(\.[^.]+|)$/)[0];
    if ('.xls' === (o = o.replace('/', '')) || '.xlsx' === o) {
        var a = window.sessionStorage.userhandle;
        KMClientInterface.getInstance().WriteFile(a, e, t, n);
    } else {
        onInconsistentFormat(e, '.xls or .xlsx', n);
    }
}

function ReadJsonFile(e, t) {
    var n = e.match(/(\.[^.]+|)$/)[0];
    if ('.json' === (n = n.replace('/', ''))) {
        var o = window.sessionStorage.userhandle;
        KMClientInterface.getInstance().ReadFile(o, e, t);
    } else {
        onInconsistentFormat(e, '.json', t);
    }
}

function WriteJsonFile(e, t, n) {
    var o = e.match(/(\.[^.]+|)$/)[0];
    if ('.json' === (o = o.replace('/', ''))) {
        var a = window.sessionStorage.userhandle;
        KMClientInterface.getInstance().WriteFile(a, e, t, n);
    } else {
        onInconsistentFormat(e, '.json', n);
    }
}

function ReadTextFile(e, t) {
    var n = e.match(/(\.[^.]+|)$/)[0];
    if ('.txt' === (n = n.replace('/', ''))) {
        var o = window.sessionStorage.userhandle;
        KMClientInterface.getInstance().ReadFile(o, e, t);
    } else {
        onInconsistentFormat(e, '.txt', t);
    }
}

function WriteTextFile(e, t, n) {
    var o = e.match(/(\.[^.]+|)$/)[0];
    if ('.txt' === (o = o.replace('/', ''))) {
        var a = window.sessionStorage.userhandle;
        KMClientInterface.getInstance().WriteFile(a, e, t, n);
    } else {
        onInconsistentFormat(e, '.txt', n);
    }
}

function GetCurrentUser() {
    var e = '';
    return '' !== window.sessionStorage.user && (e = window.sessionStorage.user), e;
}

function GetCurrentUnit() {
    var e = '';
    return '' !== window.sessionStorage.unit && (e = window.sessionStorage.unit), e;
}

function getDataModel(e, t) {
    var n = KMClientInterface.getInstance();
    e === KMDataModelENUM.RTO ? n.EnumDataModels(window.sessionStorage.userhandle, kmOperateFlag.KM_RTO_MODEL_DEF_ENUM_BY_TYPE, t) : e === KMDataModelENUM.HISTORY ? n.EnumDataModels(window.sessionStorage.userhandle, kmOperateFlag.KM_HIS_MODEL_DEF_ENUM_BY_TYPE, t) : e === KMDataModelENUM.PLAY && n.EnumDataModels(window.sessionStorage.userhandle, kmOperateFlag.KM_PLO_MODEL_DEF_ENUM_BY_TYPE, t);
}

function getUserRole(e) {
    KMClientInterface.getInstance().EnumRoles(window.sessionStorage.userhandle, e);
}

function fileManager(e) {
    new KMUIFileManagePopup(e);
}

function openDevelopWin(e, t, n, o, a, r, s) {
    new KMRunLogin().userLoginChecked(e, t, n, o, a, r, s);
}

function getInfoByStatusCode(e) {
    var t = 0;
    switch (e) {
        case kmResponseStatusCodes.SUCCESS:
            t = kmResponseStatusInfos.SUCCESS;
            break;
        case kmResponseStatusCodes.UNEXIST_USERNAME:
            t = kmResponseStatusInfos.UNEXIST_USERNAME;
            break;
        case kmResponseStatusCodes.INCORRECT_PASSWORD:
            t = kmResponseStatusInfos.INCORRECT_PASSWORD;
            break;
        case kmResponseStatusCodes.USERNOTLOGIN:
            t = kmResponseStatusInfos.USERNOTLOGIN;
            break;
        case kmResponseStatusCodes.NOAUTH:
            t = kmResponseStatusInfos.NOAUTH;
            break;
        case kmResponseStatusCodes.EXPIRE:
            t = kmResponseStatusInfos.EXPIRE;
            break;
        case kmResponseStatusCodes.MADATELOGIN:
            t = kmResponseStatusInfos.MADATELOGIN;
            break;
        case kmResponseStatusCodes.MAXONLINELINITED:
            t = kmResponseStatusInfos.MAXONLINELINITED;
            break;
        case kmResponseStatusCodes.INCORRECT_OLD_PASSWORD:
            t = kmResponseStatusInfos.INCORRECT_OLD_PASSWORD;
            break;
        case kmResponseStatusCodes.FAILED:
            t = kmResponseStatusInfos.FAILED;
    }
    return t;
}

function httpRequestExec(e, t, n, o, a, r) {
    var s = KMClientInterface.getInstance();
    '/' === t[0] && (t = t.substring(1, t.length)), s.httpRequestExec(e, t, n, o, a, r);
}

function SystemSubscribe(e) {
    KMClientInterface.getInstance().systemSubscribe(e);
}

function sendEmail(e, t, n, o, a, r, s, i) {
    var l = KMClientInterface.getInstance(),
        c = {
            sendToList: JSON.stringify(e),
            CCList: JSON.stringify(t),
            subject: n,
            body: o,
            sender: JSON.stringify(a),
        };
    'function' == typeof r ? l.kmSendEMail(c, r) : ((c.html = r), (c.attachments = s), l.kmSendEMail(c, i));
}

function addRole(e) {
    var t = new KMRole(),
        n = e;
    t.jsonToObject(n), KMRoleManager.getInstance().add(t) ? KMRoleManager.getInstance().saveData(function () {}) : console.log('新增的角色名或ID已存在');
}

function roleExecute(e, t, n) {
    var o = KMRoleManager.getInstance();
    switch (t) {
        case 'query':
            o.roleList ? n(o.roleList) : console.log('角色列表为空');
            break;
        case 'modify':
            if (!o.updateRole(e)) return;
            o.saveData(n);
            break;
        case 'delete':
            o.roleRemoveByName(e), o.saveData(n);
    }
}

function roleModify(e, t) {
    roleExecute(e, 'modify', t);
}

function roleQuery(e, t) {
    roleExecute(e, 'query', t);
}

function roleDelete(e, t) {
    roleExecute(e, 'delete', t);
}

function user_list() {
    return new OauthClient().getUserMap();
}

function user_info(e) {
    return new OauthClient().getUserInfo(e);
}

function user_add(e) {
    return new OauthClient().createUser(e);
}

function AuthorizeDataSourceAccess(e, t) {
    try {
        if (e && t.length > 0) {
            let o = new OauthClient();
            KMClientInterface.getInstance();
            for (var n = 0; n < t.length; n++) {
                let a = KMDatasourceMng.getInstance().getByName(t[n]).dataSourceName,
                    r = KMDatasourceMng.getInstance().getByName(t[n]).appName,
                    s = o.userMap[e],
                    i = {
                        needOperateCheck: !0,
                        token: getToken(),
                        projectName: r,
                        datasourceName: a,
                        userId: s,
                    },
                    l = '';
                (l = 'http:' == window.location.protocol ? `${window.location.protocol}//${window.location.hostname}:11005/api/v1/thirdparty/setDataSourceUser` : `${window.location.origin}/kingdbm/api/v1/thirdparty/setDataSourceUser`),
                    $.ajax({
                        url: encodeURI(l),
                        dataType: 'json',
                        async: !1,
                        data: i,
                        type: 'POST',
                        contentType: 'application/x-www-form-urlencoded',
                        success: function (e) {
                            'success' == e.code ? console.log('授权成功') : 201 == e.code ? console.log('重复授权') : (console.log('授权失败'), console.log(e));
                        },
                        error: (e, t, n) => {
                            console.log(t + ':' + e.responseText), console.log('授权失败');
                        },
                    });
            }
        } else alert(IDS_DATATYPE_TIP);
    } catch (e) {
        console.log(e), alert(IDS_DATATYPE_TIP);
    }
}

function user_password(e) {
    return new OauthClient().updatePassword(e);
}

function user_modifyold(e, t) {
    return new OauthClient().updateUser(e, t);
}

function user_delete(e) {
    return new OauthClient().deleteUser(e);
}

function group_list() {
    return new OauthClient().getGroupMap();
}

function group_add(e) {
    return new OauthClient().createGroup(e);
}

function group_modify(e, t) {
    return new OauthClient().updateGroup(e, t);
}

function group_delete(e) {
    return new OauthClient().deleteGroup(e);
}

function getSecurityGroup() {
    var e = KMClientInterface.getInstance(),
        t = {
            name: 'securitySectionManager',
            type: operateType.ROLEIN,
            guid: e.currentProName,
        },
        n = [];
    return (
        e.kmGetProjectInFile(1, JSON.stringify(t), function (e) {
            for (var t = 0; t < e.length; t++) n.push(e[t].name);
        }),
        n
    );
}

function getResourceGroup(e) {
    KMClientInterface.getInstance().kmGetResourceGroup(
        {
            userName: 'hehehe',
        },
        e
    );
}

function user_modifyById(e) {
    return new OauthClient().updateUserbyId(e);
}

function GetParentGroupByUserName(e) {
    var t = new OauthClient().getUserInfo(e);
    if (t && t.data && t.data.groupId) {
        var n = t.data.groupId;
        return (
            oauthCommon.ajaxGet('/api/v1/groupInfo', `groupId=${n}`, getToken(), !1, function (e) {
                e && (result = e);
            }),
            result
        );
    }
    throw new Error('OauthClient getUserInfo error: get userInfo error');
}

function getLoginHistory(e, t, n, o) {
    KMClientInterface.getInstance().getLoginHistory(e, t, n, function (t) {
        let n = [];
        t.forEach((t) => {
            let o = t.token_name.split('_')[1];
            e === o && n.push(t);
        }),
            o(n);
    });
}

function getAllLoginHistory(e) {
    KMClientInterface.getInstance().getAllLoginHistory(e);
}

function CustomImport(e) {
    CustomImportByExcel((t, n) => {
        KMClientInterface.getInstance().customReport(
            JSON.stringify({
                data: t,
                name: n,
            }),
            CustomExportToExcel,
            e
        );
    });
}

function CustomExportToExcel(e, t) {
    $('.km-ds-popup-wrap').remove();
    var n = e.data,
        o = e.name;
    XLSX.writeFile(n, o, {});
}

function CustomImportByExcel(e, t, n) {
    var o;
    var a = document.createElement('input');
    (a.type = 'file'),
        (a.style.display = 'none'),
        (a.id = 'IMPORT_BY_EXCEL'),
        (obj = a),
        document.body.appendChild(a),
        $(a).trigger('click'),
        (a.onchange = function () {
            if (obj.files) {
                var t = obj.files[0],
                    n = obj.files[0].name,
                    r = t.name.match(/^(.*)(\.)(.{1,8}$)/)[3];
                if (-1 !== ['xlsx', 'xls'].indexOf(r.toLowerCase())) {
                    var s = new FileReader();
                    (s.onload = function (t) {
                        var r = t.target.result;
                        (o = XLSX.read(r, {
                            type: 'binary',
                        })),
                            e(o, n),
                            $('#' + a.id).remove(),
                            (self.popup = new KMPopupBase()),
                            self.popup.setPanelWidth(400),
                            self.popup.setTitleBarText('查询中...');
                        let s = $('\n                    <div style = "height: 25px">\n                        <img id ="imgProgress" src="static/images/010.gif"  width="100%" height="100%">\n                    </div>\n                ')[0];
                        self.popup.cancelBtn.thisElement.remove(), self.popup.closeSpan.thisElement.remove(), self.popup.confirmBtn.thisElement.remove(), self.popup.content.thisElement.appendChild(s);
                    }),
                        s.readAsBinaryString(t);
                } else alert(RS.FILE_TYPE_MISMATCH);
            }
        });
}
var $WorkFlow = {
    allWorkFlow: (e, t) => {
        var n = e + '/api/v1.0/workflow/getworkflowInfo' + '?username=' + window.sessionStorage.user;
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxGetWorkFlow('', n, (e) => {
                t(e);
            });
    },
    startWorkFlowTags: (e, t, n, o) => {
        var a = e + '/api/v1.0/engine/getworkflowpublicvariable' + '?username=' + window.sessionStorage.user + '&workflowId=' + t + '&version=' + n;
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxGetWorkFlow('', a, (e) => {
                o(e);
            });
    },
    startWorkFlow: (e, t, n, o, a, r, s) => {
        var i = e + '/api/v1.0/engine/startworkflow';
        let l = {
            sponsor: window.sessionStorage.user,
            workflowId: t,
            workflowName: n,
            workflowTitle: o,
            publicvariable: a,
            version: r,
        };
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxPostWorkFlow('', i, l, (e) => {
                s(e);
            });
    },
    todoWorkFlow: (e, t, n) => {
        var o = e + '/api/v1.0/activity/getworkflowactivity' + '?username=' + window.sessionStorage.user + '&type=1&page=1&pagecount=' + t;
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxGetWorkFlow('', o, (e) => {
                n(e);
            });
    },
    doneWorkFlow: (e, t, n) => {
        var o = e + '/api/v1.0/activity/getworkflowactivity' + '?username=' + window.sessionStorage.user + '&type=2&page=1&pagecount=' + t;
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxGetWorkFlow('', o, (e) => {
                n(e);
            });
    },
    cancelWorkFlow: (e, t, n, o) => {
        var a = e + '/api/v1.0/engine/cancelworkflow';
        let r = {
            username: window.sessionStorage.user,
            workflowInstanceId: n,
            workflowId: t,
        };
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxPostWorkFlow('', a, r, (e) => {
                o(e);
            });
    },
    jumpWorkFlow: (e, t, n, o) => {
        var a = e + '/api/v1.0/activity/activityjump';
        let r = {
            username: window.sessionStorage.user,
            workflowInstanceId: t,
            activityId: n,
        };
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxPostWorkFlow('', a, r, (e) => {
                o(e);
            });
    },
    getCollectWorkFlow: (e, t) => {
        var n = e + '/api/v1.0/workflow/getmyworkflow' + '?username=' + window.sessionStorage.user;
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxGetWorkFlow('', n, (e) => {
                t(e);
            });
    },
    addCollectWorkFlow: (e, t, n, o) => {
        var a = e + '/api/v1.0/workflow/setfavoriteworkflow' + '?username=' + window.sessionStorage.user + '&workflowId=' + t + '&workflowversion=' + n;
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxGetWorkFlow('', a, (e) => {
                o(e);
            });
    },
    delCollectWorkFlow: (e, t, n, o) => {
        var a = e + '/api/v1.0/workflow/cancelfavoriteworkflow' + '?username=' + window.sessionStorage.user + '&workflowId=' + t + '&workflowversion=' + n;
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxGetWorkFlow('', a, (e) => {
                o(e);
            });
    },
    getAllWorkFlow: (e, t) => {
        var n = e + '/api/v1.0/workflow/getallworkflow' + '?page=&pagecount=65535';
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxGetWorkFlow('', n, (e) => {
                t(e);
            });
    },
    getAllNodeInfo: (e, t, n) => {
        var o = e + '/api/v1.0/engine/getworkflowtasktime' + '?workflowInstanceId=' + t;
        KMClientInterface.getInstance()
            .getFileRequest()
            .KMAjaxGetWorkFlow('', o, (e) => {
                n(e);
            });
    },
};

function updateExcelSheet(e, t, n) {
    KMClientInterface.getInstance().updateExcelSheet(e, t, n);
}

function printExcelSheet(e, t) {
    KMClientInterface.getInstance().printExcelSheet(e, t);
}

function WriteLog(e, t, n) {
    try {
        var o = KMClientInterface.getInstance(),
            a = new Date().toLocaleString('chinese', {
                hour12: !1,
            }),
            r = {
                logmsg: (a = a.replace('/', '-').replace('/', '-')) + ' operate ' + t + ' ' + n,
                path: '../../../../../sdb/logs/operate.log',
            };
        o.WriteFile('', '', r, function (e) {
            return 'success' === e.status ? 0 : 1;
        });
    } catch (e) {
        return 1;
    }
}

function EnumKIOVariable(e, t, n, o) {
    new DataSourceAccess().GetDataSourceContentsAsync(getToken(), e, t, n, function (e) {
        'success' === e.code ? o(e.data.objectList) : (o(e.code), alert(RS.UPDATED_DATASOURCE_VARIABLE_FAILED + ': ' + e.code), console.log(RS.UPDATED_DATASOURCE_VARIABLE_FAILED + ': ' + e.code));
    });
}

function EnumKIODataSource(e, t) {
    let n = [];
    return (
        new DataSourceAccess().GetDataSourceInfosAsync(getToken(), e, t, function (e) {
            'success' === e.code ? (n = e.data) : ((n = []), alert('请确认数据源访问APP服务是否正常：' + e.code), console.log(e.code));
        }),
        n
    );
}

function AdminRegister(e, t) {
    let n = getToken(),
        o = '';
    if (
        (oauthCommon.ajaxPost('/user/adminRegister', e, n, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (o = e));
        }),
        '' !== o)
    )
        return o;
}

function GetAdminInfo(e) {
    let t = getToken(),
        n = '';
    if (
        (oauthCommon.ajaxGet('/api/v1/user/adminInfo', {}, t, !1, (t) => {
            t && ('function' == typeof e ? e(t) : (n = t));
        }),
        '' !== n)
    )
        return n;
}

function GetUserInfo(e, t) {
    let n = getToken(),
        o = '';
    if (
        (oauthCommon.ajaxPost('/api/v1/user/info', e, n, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (o = e));
        }),
        '' !== o)
    )
        return o;
}

function GetMessage(e, t) {
    let n = {
            phone: e,
        },
        o = getToken(),
        a = '';
    if (
        (oauthCommon.ajaxPost('/user/verificationCode', n, o, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (a = e));
        }),
        '' !== a)
    )
        return a;
}

function UpdateEmail(e, t, n) {
    let o = {
            userId: e,
            email: t,
        },
        a = getToken(),
        r = '';
    if (
        (oauthCommon.ajaxPost('/api/v1/user/updateEmail', o, a, !1, (e) => {
            e && ('function' == typeof n ? n(e) : (r = e));
        }),
        '' !== r)
    )
        return r;
}

function UpdatePassword(e, t) {
    let n = getToken(),
        o = '';
    if (
        (oauthCommon.ajaxPost('/api/v1/userPassword', e, n, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (o = e));
        }),
        '' !== o)
    )
        return o;
}

function GetTenantList(e) {
    let t = getToken(),
        n = '';
    if (
        (oauthCommon.ajaxPost('/api/v1/user/tenantList', {}, t, !1, (t) => {
            t && ('function' == typeof e ? e(t) : (n = t));
        }),
        '' !== n)
    )
        return n;
}

function UpdateNickName(e, t, n) {
    let o = {
            userId: e,
            nickName: t,
        },
        a = getToken(),
        r = '';
    if (
        (oauthCommon.ajaxPost('/api/v1/user/updateNickName', o, a, !1, (e) => {
            e && ('function' == typeof n ? n(e) : (r = e));
        }),
        '' !== r)
    )
        return r;
}

function UpdatePhoneNumber(e, t, n, o) {
    let a = {
            userId: e,
            phone: t,
            phoneCode: n,
        },
        r = getToken(),
        s = '';
    if (
        (oauthCommon.ajaxPut('/api/v1/user/updatePhoneNumber', a, r, !1, (e) => {
            e && ('function' == typeof o ? o(e) : (s = e));
        }),
        '' !== s)
    )
        return s;
}

function VerifyMessage(e, t, n) {
    let o = {
            phoneNumber: e,
            phoneCode: t,
        },
        a = getToken(),
        r = '';
    if (
        (oauthCommon.ajaxPost('/user/verifyCode', o, a, !1, (e) => {
            e && ('function' == typeof n ? n(e) : (r = e));
        }),
        '' !== r)
    )
        return r;
}

function ImageUpload(e, t) {
    var n = new KMUIInput();
    (n.thisElement.id = 'kmui-file'),
        n.thisElement.setAttribute('type', 'file'),
        n.thisElement.setAttribute('multiple', 'true'),
        (n.thisElement.style.display = 'none'),
        document.body.appendChild(n.thisElement),
        $('#kmui-file')
            .unbind('change')
            .bind('change', function () {
                var o = KMClientInterface.getInstance(),
                    a = document.getElementById('kmui-file').files[0];
                let r = getToken();
                var s = new FormData();
                s.append('userImage', a),
                    s.append('userId', e),
                    (function (e, t, n, a, r) {
                        let s = {
                            Authorization: 'Bearer ' + n,
                            Accept: 'application/json',
                            Connection: 'keep-alive',
                        };
                        fetch('http://' + o.oauthIp + e, {
                            headers: s,
                            method: 'PUT',
                            body: t,
                        })
                            .then((e) => e.json())
                            .then((e) => {
                                r(e);
                            });
                    })('/api/v1/user/imageUpload', s, r, 0, function (e) {
                        t(e), document.body.removeChild(n.thisElement);
                    });
            }),
        $('#kmui-file').click();
}

function RegisteredCode(e, t) {
    let n = {
            phoneNumber: e,
        },
        o = getToken(),
        a = '';
    if (
        (oauthCommon.ajaxPost('/user/registeredCode', n, o, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (a = e));
        }),
        '' !== a)
    )
        return a;
}

function ModifyPhoneCode(e, t) {
    let n = {
            phoneNumber: e,
        },
        o = getToken(),
        a = '';
    if (
        (oauthCommon.ajaxPost('/user/modifyPhoneCode', n, o, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (a = e));
        }),
        '' !== a)
    )
        return a;
}

function SmsNotification(e, t) {
    let n = {
            phoneNumber: e,
        },
        o = getToken(),
        a = '';
    if (
        (oauthCommon.ajaxPost('/user/SmsNotification', n, o, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (a = e));
        }),
        '' !== a)
    )
        return a;
}

function NotificationCode(e, t) {
    let n = {
            phoneNumber: e,
        },
        o = getToken(),
        a = '';
    if (
        (oauthCommon.ajaxPost('/user/NotificationCode', n, o, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (a = e));
        }),
        '' !== a)
    )
        return a;
}

function ResetPasswordCode(e, t) {
    let n = {
            phoneNumber: e,
        },
        o = getToken(),
        a = '';
    if (
        (oauthCommon.ajaxPost('/user/resetPasswordCode', n, o, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (a = e));
        }),
        '' !== a)
    )
        return a;
}

function ResetPassword(e, t) {
    let n = getToken(),
        o = '';
    if (
        (oauthCommon.ajaxPost('/user/resetPassword', e, n, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (o = e));
        }),
        '' !== o)
    )
        return o;
}

function ResetUserPassword(e, t) {
    let n = getToken(),
        o = '';
    if (
        (oauthCommon.ajaxPost('/api/v1/resetPassword', e, n, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (o = e));
        }),
        '' !== o)
    )
        return o;
}

function UpdateRealName(e, t) {
    let n = getToken(),
        o = '';
    if (
        (oauthCommon.ajaxPost('/api/v1/user/updateRealName', e, n, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (o = e));
        }),
        '' !== o)
    )
        return o;
}

function UpdateCompanyName(e, t) {
    let n = getToken(),
        o = '';
    if (
        (oauthCommon.ajaxPost('/api/v1/user/updateCompanyName', e, n, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (o = e));
        }),
        '' !== o)
    )
        return o;
}

function AddUser(e, t) {
    let n = getToken(),
        o = '';
    if (
        (oauthCommon.ajaxPost('/api/v1/user', e, n, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (o = e));
        }),
        '' !== o)
    )
        return o;
}

function UpdateUser(e, t) {
    let n = getToken(),
        o = '';
    if (
        (oauthCommon.ajaxPut('/api/v1/user', e, n, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (o = e));
        }),
        '' !== o)
    )
        return o;
}

function DeleteUser(e, t) {
    let n = getToken(),
        o = '';
    if (
        (oauthCommon.ajaxDelete('/api/v1/user', e, n, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (o = e));
        }),
        '' !== o)
    )
        return o;
}

function GetUserList(e, t) {
    let n = getToken(),
        o = '';
    if (
        (oauthCommon.ajaxGet('/api/v1/user/userList', e, n, !1, (e) => {
            e && ('function' == typeof t ? t(e) : (o = e));
        }),
        '' !== o)
    )
        return o;
}

function playSound(e, t) {
    var n = window.location.origin + e;
    KMUIMusicPlay.getInstance().modePlay(n, t);
}

function isFile(e, t) {
    KMClientInterface.getInstance().kmIsFile(e, t);
}

function AsynDBQuery(e, t, n, o) {
    var a = KMDatasourceMng.getInstance().getDataSource(e);
    a ? a.executeSQLByTable3('queryTable', t, n, o) : console.log('数据源未找到');
}

function AsynDBDelete(e, t, n, o) {
    var a = KMDatasourceMng.getInstance().getDataSource(e);
    a ? a.executeSQLByTable3('deleteData', t, n, o) : console.log('数据源未找到');
}

function AsynDBInsert(e, t, n, o, a) {
    var r = KMDatasourceMng.getInstance().getDataSource(e);
    r ? r.executeSQLByTable2('insertData', t, n, o, a) : console.log('数据源未找到');
}

function AsynDBUpdate(e, t, n, o) {
    var a = KMDatasourceMng.getInstance().getDataSource(e);
    a ? a.executeSQLByTable3('updateData', t, n, o) : console.log('数据源未找到');
}

function AsynDBCreateTable(e, t, n, o, a) {
    var r = KMDatasourceMng.getInstance().getDataSource(e);
    r ? r.executeSQLByTable2('createTable', t, n, o, a) : console.log('数据源未找到');
}

function AsynDBAlterTable(e, t, n, o, a) {
    var r = KMDatasourceMng.getInstance().getDataSource(e);
    r ? r.executeSQLByTable2('updateTable', t, n, o, a) : console.log('数据源未找到');
}

function AsynDBClearTable(e, t, n, o) {
    var a = KMDatasourceMng.getInstance().getDataSource(e);
    a ? a.executeSQLByTable1('clearTable', t, n, o) : console.log('数据源未找到');
}

function AsynDBDeleteTable(e, t, n, o) {
    var a = KMDatasourceMng.getInstance().getDataSource(e);
    a ? a.executeSQLByTable1('dropTable', t, n, o) : console.log('数据源未找到');
}

function AsynDBGetTableColumns(e, t, n, o) {
    var a = KMDatasourceMng.getInstance().getDataSource(e);
    a ? a.executeSQLByTable1('getTableInfo', t, n, o) : console.log('数据源未找到');
}

function AsynDBGetTableCount(e, t, n, o) {
    var a = KMDatasourceMng.getInstance().getDataSource(e);
    a ? a.executeSQLByTable1('getTableCount', t, n, o) : console.log('数据源未找到');
}

function AsynDBGetTables(e, t, n, o) {
    var a = KMDatasourceMng.getInstance().getDataSource(e);
    a ? a.executeSQLByTable1('getTableName', t, n, o) : console.log('数据源未找到');
}

function AsynDBGetPages(e, t, n, o, a, r) {
    var s = KMDatasourceMng.getInstance().getDataSource(e);
    s ? s.executeSQLByTable4('getTablePagination', t, n, o, a, r) : console.log('数据源未找到');
}

function AsynDBQuerySP(e, t, n, o, a, r) {
    var s = KMDatasourceMng.getInstance().getDataSource(e);
    s ? s.executeSQLByTable4('executeSP', t, n, o, a, r) : console.log('数据源未找到');
}

function AsynDBGetViews(e, t, n, o, a) {
    var r = KMDatasourceMng.getInstance().getDataSource(e);
    r ? r.executeSQLByTable2('getViews', t, n, o, a) : console.log('数据源未找到');
}

function ShowAlert(e) {
    element_popup.render('alert', e);
}

function ShowLoading(e) {
    return element_popup.render('loading', e);
}

function ShowMessage(e) {
    element_popup.render('message', e);
}

function ShowMsgBox(e, t, n) {
    element_popup.render('messagebox', t, e, n);
}

function ShowNotification(e) {
    element_popup.render('notification', e);
}
var element_popup = (function () {
    var e = null,
        t = function () {
            var e = document.createElement('div');
            document.body.appendChild(e), (e.id = 'ElementShowFunction'), (e.style.position = 'absolute'), (e.style.top = 0), (e.style.left = 0), (e.style.width = '100%'), (e.style.zIndex = 100);
            (e.innerHTML = '\n        <component :is="name" :options="options" ref="component" :mode="mode" :cb="cb"></component>\n        '), window.removeEventListener('load', t, !1);
        };
    window.addEventListener('load', t, !1);
    var n = {
        alert: {
            name: 'element-alert',
            props: {
                options: {
                    type: Object,
                    required: !1,
                },
            },
            template:
                '\n                <el-alert\n                    :title="options.title?options.title:\'\'",\n                    :type="options.type?options.type:\'info\'",\n                    :description="options.description?options.description:\'\'"\n                    :closable="(options.closable === false)?options.closable:true",\n                    :center="options.center?options.center:false",\n                    :show-icon="(options[\'show_icon\'] === false)?options[\'show_icon\']:true" \n                    :effect="options.effect?options.effect:\'light\'"\n                ></el-alert>\n            ',
        },
        loading: {
            name: 'element-loading',
            props: {
                options: {
                    type: Object,
                    required: !1,
                },
            },
            template: '\n                <div></div>\n            ',
            mounted() {
                var e = {
                    lock: !0,
                    text: this.options.text ? this.options.text : '',
                    background: this.options.background ? this.options.background : 'rgba(0,0,0,0.7)',
                    iconUrl: this.options.iconUrl ? this.options.iconUrl : '',
                };
                e.iconUrl || delete e.iconUrl,
                    (this.load = this.$loading(e)),
                    $('.el-loading-mask').css({
                        width: this.options.width,
                        height: this.options.height,
                        left: this.options.left,
                        top: this.options.top,
                        'z-index': getMaxZIndexOfDom(),
                    });
            },
            methods: {
                close: function () {
                    this.load.close(), $('.el-loading-mask').remove();
                },
            },
        },
        message: {
            name: 'element-message',
            props: {
                options: {
                    type: Object,
                    required: !1,
                },
            },
            template: '<div></div>',
            mounted() {
                this.$message(this.options),
                    $('.el-message').css({
                        minWidth: '200px',
                        width: this.options.width,
                        height: this.options.height,
                        backgroundColor: this.options.backgroundColor,
                        border: this.options.border,
                        borderRadius: this.options.borderRadius,
                    }),
                    $('.el-message__content').css('color', this.options.color);
            },
        },
        messagebox: {
            name: 'element-message',
            props: {
                options: {
                    type: Object,
                    required: !1,
                },
                mode: {
                    type: String,
                    required: !0,
                },
                cb: {
                    type: Function,
                    require: !0,
                    default: function () {},
                },
            },
            template: '<div></div>',
            mounted() {
                var e = this.options.message ? this.options.message : '',
                    t = this.options.title ? this.options.title : '';
                this.options.message && delete this.options.message,
                    this.options.title && delete this.options.title,
                    this['$' + this.mode](e, t, this.options)
                        .then((e) => {
                            'prompt' !== this.mode
                                ? this.cb({
                                      action: e,
                                      inputValue: '',
                                  })
                                : this.cb({
                                      action: e.action,
                                      inputValue: e.value,
                                  });
                        })
                        .catch((e) => {
                            this.cb({
                                action: e,
                                inputValue: '',
                            });
                        }),
                    this.options.titleStyle
                        ? $('.el-message-box__title').css({
                              'font-size': this.options.titleStyle.fontSize,
                              'text-align': this.options.titleStyle.textAlign,
                          })
                        : $('.el-message-box__title').css({
                              'font-size': '18px',
                              'text-align': 'left',
                          }),
                    this.options.messageStyle
                        ? $('.el-message-box__content').css({
                              'font-size': this.options.messageStyle.fontSize,
                              'text-align': this.options.messageStyle.textAlign,
                          })
                        : $('.el-message-box__content').css({
                              'font-size': '14px',
                              'text-align': 'left',
                          });
            },
        },
        notication: {
            name: 'element-message',
            props: {
                options: {
                    type: Object,
                    required: !1,
                },
            },
            template: '<div></div>',
            mounted() {
                this.$notify(this.options);
            },
        },
    };
    return {
        render(t, o, a, r) {
            if (
                (e && 'loading' === t && e.name !== t && ((e = null), (document.getElementById('ElementShowFunction').innerHTML = '<component :is="name" :options="options" ref="component" :mode="mode" :cb="cb"></component>')),
                e
                    ? e.name === t
                        ? ((e.name = ''),
                          e.$nextTick(() => {
                              (e.name = t), (e.options = o), a && (e.mode = a), r && (e.cb = r);
                          }))
                        : ((e.name = t), (e.options = o), a && (e.mode = a), r && (e.cb = r))
                    : (e = new Vue({
                          el: '#ElementShowFunction',
                          data: {
                              name: t,
                              options: o,
                              mode: a || '',
                              cb: r || null,
                          },
                          components: {
                              alert: n.alert,
                              loading: n.loading,
                              message: n.message,
                              messagebox: n.messagebox,
                              notification: n.notication,
                          },
                      })),
                'loading' === t)
            )
                return e.$refs.component.close;
        },
    };
})();

function getAbsImgList(e, t, n) {
    var o = KMClientInterface.getInstance(),
        a = {
            imgPath: (e = e.replace('/', '//')),
            imgName: t,
        };
    o.getAbsImgList(a, function (e) {
        if (!n) return e;
        n(e);
    });
}

function getImageCarsuelList(e, t, n) {
    getAbsImgList(e, t, function (e) {
        if (!Array.isArray(e)) throw new Error('data type  error!');
        var t = [];
        if (
            (e.forEach((e) => {
                if (window.plus) {
                    var n = {
                        src: (e = sessionStorage.getItem('urlObj') + '/imgAbs/?imgPath=' + e),
                    };
                    t.push(n);
                } else {
                    n = {
                        src: (e = window.location.origin + '/imgAbs/?imgPath=' + e),
                    };
                    t.push(n);
                }
            }),
            !n)
        )
            return t;
        n(t);
    });
}

function ImportByCsv(e) {
    var t,
        n = !1;
    var o = document.createElement('input');
    (o.type = 'file'),
        (o.style.display = 'none'),
        (o.id = 'IMPORT_BY_EXCEL'),
        (obj = o),
        document.body.appendChild(o),
        $(o).trigger('click'),
        (o.onchange = function () {
            if (obj.files) {
                var a = obj.files[0],
                    r = new FileReader();
                (r.onload = function (a) {
                    var r = a.target.result;
                    if (((t = null), n)) {
                        r = r;
                        var s = cptable.utils.decode(936, r);
                        t = XLSX.read(s, {
                            type: 'string',
                        });
                    } else console.log('不是csv文件');
                    t ||
                        (t = n
                            ? XLSX.read(
                                  btoa(
                                      (function (e) {
                                          for (var t = '', n = 0, o = 10240; n < e.byteLength / o; ++n) t += String.fromCharCode.apply(null, new Uint8Array(e.slice(n * o, n * o + o)));
                                          return (t += String.fromCharCode.apply(null, new Uint8Array(e.slice(n * o))));
                                      })(r)
                                  ),
                                  {
                                      type: 'base64',
                                  }
                              )
                            : XLSX.read(r, {
                                  type: 'binary',
                              }));
                    var i = XLSX.utils.sheet_to_json(t.Sheets[t.SheetNames[0]]);
                    e(i), $('#' + o.id).remove();
                }),
                    'csv' == a.name.split('.').reverse()[0] && (n = !0),
                    r.readAsBinaryString(a);
            }
        });
}

function ShowAddRoleBox(e, t) {
    var n = new KMRoleResource();
    new KMUIAuthRoleResource(n, e, t, 'add');
}

function PasteRole(e, t) {
    e instanceof KMRoleResource ? KMRoleManager.getInstance().roleExecute(e, 'add', t) : t('参数错误');
}

function ShowModifyRoleBox(e, t, n) {
    KMRoleManager.getInstance().updateRoleList();
    var o = KMRoleManager.getInstance().getRoleResourceByName(e);
    if (o) new KMUIAuthRoleResource(o[0], t, n, 'edit');
    else console.log('该角色不存在!');
}

function QueryRoleObject(e, t) {
    var n;
    KMRoleManager.getInstance().updateRoleList(), (n = e ? KMRoleManager.getInstance().getRoleResourceByName(e) : KMRoleManager.getInstance().roleResourceList) ? t(n) : console.log('not found role list!');
}

function QueryAuthDescObjectByRole(e, t) {
    var n = KMRoleManager.getInstance().getRoleResourceByName(e);
    t(KMRoleManager.getInstance().getResTreeData(n[0].resourceAuthInfo));
}

function ModifyAuthDescObjectRole(e, t, n) {
    var o = KMRoleManager.getInstance().getRoleResourceByName(e);
    (o[0].resourceAuthInfo = t),
        KMRoleManager.getInstance().roleExecute(o, 'edit', function (e) {
            n(e);
        });
}

function DeleteRoleObject(e, t) {
    KMRoleManager.getInstance().updateRoleList();
    for (var n = '', o = [], a = 0; a < e.length; a++) {
        var r = KMRoleManager.getInstance().getRoleResourceByName(e[a]);
        KMRoleManager.getInstance().checkRoleUserLink(r[0]) ? (n += r[0].name + ' ') : o.push(r[0]);
    }
    if (o.length)
        KMRoleManager.getInstance().roleExecute(o, 'delete', function (e) {
            0 === e.errorCode ? t(e) : console.log(e.message);
        });
    else if (n) {
        t({
            errorCode: -1,
            message: '已关联用户，请先删除已关联的用户!',
        });
    }
}

function GetRolesByUserName() {
    new KMUIResourceConfigPopup('role');
}

function GetAuthInfoByUserName() {
    new KMUIResourceConfigPopup('resource');
}

function GetUserNameByAuthInfo() {
    new KMUIResourceConfigPopup('user');
}

function rolesCopy(e, t) {
    PasteRole(KMRoleManager.getInstance().copyData(e), t);
}

function FuzzyQueryRole(e, t) {
    t(KMRoleManager.getInstance().getRoleResourceByNameFuzzy(e));
}

function checkAuthApi(e, t, n, o) {
    for (var a = 0; a < n.length; a++)
        if (n[a].name === e) {
            var r = !1,
                s = n[a].children[1];
            if (s) {
                var i = s.children;
                if (i) {
                    for (var l = 0; l < i.length; l++) i[l].name === t && ((o.id = i[l].id), (o.errorCode = 0), (r = !0));
                    r || ((o.errorCode = 2), (o.errorCodeDescription = '权限描述不存在'));
                    break;
                }
            }
        } else if (n[a].children.length && '访问权限' !== n[a].children[0].name) checkAuthApi(e, t, n[a].children, o);
    return o;
}

function SetAuthDescObject(e, t, n) {
    var o = {
        errorCode: -1,
        errorCodeDescription: '',
    };
    if (KMUserAuthManager.getInstance().userAdminType) (o.errorCode = 0), (o.errorCodeDescription = '成功'), n(o);
    else {
        var a = checkAuthApi(e, t, KMPageResourceMng.getInstance().pageResource.children, o),
            r = KMUserAuthManager.getInstance().userPageAuth;
        0 === a.errorCode
            ? (o = r.includes(a.id)
                  ? {
                        errorCode: 0,
                        errorCodeDescription: '成功',
                    }
                  : {
                        errorCode: -1,
                        errorCodeDescription: '失败',
                    })
            : 0 === a.errorCode && ((o.errorCode = 2), (o.errorCodeDescription = '权限描述不存在')),
            n(o);
    }
}

function getProjectPath(e) {
    KMClientInterface.getInstance().getProjectPath(e);
}

function ShowUserLinkRoleBox(e, t) {
    KMRoleManager.getInstance().updateRoleList();
    var n = KMRoleManager.getInstance().getRoleByName(e);
    if (!n) return IDS_ROLE_NOT_FOUND;
    new KMUIAuthRoleManager().userLink1(n, t);
}

function UserLinkRole(e, t, n, o) {
    var a = KMRoleManager.getInstance().getRoleByName(e);
    0 === KMUserManager.getInstance().userList.length && updateUserData('group');
    var r = KMUserManager.getInstance().getIdByUserName(t);
    if (a) {
        var s = new Set(a.user);
        0 === n
            ? (r.forEach((e) => {
                  s.add(e);
              }),
              (a.user = Array.from(s)))
            : 1 === n &&
              (r.forEach((e) => {
                  s.delete(e);
              }),
              (a.user = Array.from(s)));
    }
    KMRoleManager.getInstance().roleExecute(a, 'edit', o);
}

function KKFPreview(e, t) {
    'string' == typeof e && KMClientInterface.getInstance().kkfPreview(e, t);
}

function GPSCoordinate2AmapCoordinate(e, t) {
    if ('string' == typeof e || 'string' == typeof t) {
        if (-1 === GPSTypeConversion(e) || -1 === GPSTypeConversion(t)) return alert('GPS坐标不是标准的DMS(X°Y\'M")格式'), -1;
        (e = GPSTypeConversion(e)), (t = GPSTypeConversion(t));
    }
    var n = 6378245,
        o = 0.006693421622965943,
        a = (function (e, t) {
            var n = 2 * e - 100 + 3 * t + 0.2 * t * t + 0.1 * e * t + 0.2 * Math.sqrt(Math.abs(e));
            return (n += (2 * (20 * Math.sin(6 * e * Math.PI) + 20 * Math.sin(2 * e * Math.PI))) / 3), (n += (2 * (20 * Math.sin(t * Math.PI) + 40 * Math.sin((t / 3) * Math.PI))) / 3), (n += (2 * (160 * Math.sin((t / 12) * Math.PI) + 320 * Math.sin((t * Math.PI) / 30))) / 3);
        })(t - 105, e - 35),
        r = (function (e, t) {
            var n = 300 + e + 2 * t + 0.1 * e * e + 0.1 * e * t + 0.1 * Math.sqrt(Math.abs(e));
            return (n += (2 * (20 * Math.sin(6 * e * Math.PI) + 20 * Math.sin(2 * e * Math.PI))) / 3), (n += (2 * (20 * Math.sin(e * Math.PI) + 40 * Math.sin((e / 3) * Math.PI))) / 3), (n += (2 * (150 * Math.sin((e / 12) * Math.PI) + 300 * Math.sin((e / 30) * Math.PI))) / 3);
        })(t - 105, e - 35),
        s = (e / 180) * Math.PI,
        i = Math.sin(s);
    i = 1 - o * i * i;
    var l = Math.sqrt(i),
        c = e + (a = (180 * a) / (((n * (1 - o)) / (i * l)) * Math.PI));
    return {
        lon: (t + (r = (180 * r) / ((n / l) * Math.cos(s) * Math.PI))).toFixed(8),
        lat: c.toFixed(8),
    };
}

function GPSTypeConversion(e) {
    var t = e.indexOf('°'),
        n = e.indexOf('′'),
        o = e.indexOf('″');
    return -1 === t || -1 === n || -1 === o ? -1 : parseFloat(e.substr(0, t)) + parseFloat(e.substr(t + 1, n - t - 1)) / 60 + parseFloat(e.substr(n + 1, o - n - 1)) / 3600;
}

function GetTimeDifference(e) {
    return KMClientInterface.getInstance().getTimeDifference(e);
}

function GetPublicKeyKC(e) {
    return KMClientInterface.getInstance().getPublicKeyKC(e);
}

function GetCurrentPageName() {
    return KMUIFrame.getInstance().showingPageName;
}

function importProject(e, t, n, o) {
    var a = KMClientInterface.getInstance();
    if (o) {
        var r = o;
        if (r.size / 1024 / 1024 > 500) return void showErrorMsg('导入的工程过大', 3e3);
        if (-1 === r.name.indexOf('.gz')) return void showErrorMsg('请导入正确的工程', 3e3);
        var s = r.name.split('.gz')[0],
            i = {
                createTime: new Date().format('yyyy-MM-dd hh:mm:ss'),
                creator: sessionStorage.getItem('user') || sessionStorage.getItem('user'),
                describe: t.projectDescript,
                id: idBuilder.generateUUID(),
                importname: t.projectName,
                name: s,
                projectGroupId: '',
            };
        return (
            a.upDateProjectGroupInfo(function (e) {
                var t = [];
                if (
                    (e.projectMng &&
                        e.projectMng.projectArray &&
                        e.projectMng.projectArray.forEach(function (e) {
                            t.push(e.name);
                        }),
                    e.projectGroups.forEach(function (e) {
                        e.projectArray.forEach(function (e) {
                            t.push(e.name);
                        });
                    }),
                    0 !== t.filter((e) => e === i.importname).length)
                )
                    return (
                        n({
                            errorCode: 21100,
                            message: '工程名称重复',
                        }),
                        !1
                    );
                $.messager.progress({
                    title: '工程导入',
                    msg: '导入中...',
                    text: '<img src="./static/images/010.gif"  width="100%" height="100%">',
                    interval: 0,
                });
                var o = new FormData();
                o.append('uploadproject', r),
                    a.importProject('importProject', i, o, function (t, o) {
                        $.messager.progress('close'), o ? o && (showSuccessMsg('导入成功', 3e3), publishProject(t, i, n)) : t.flag ? ((e.errorCode = !1), showErrorMsg('服务器未回复信息，可能与服务器断开连接')) : n(t);
                    });
            }),
            !0
        );
    }
    var l = new KMUIInput();
    (l.thisElement.id = 'import-project-file'),
        l.thisElement.setAttribute('type', 'file'),
        (l.thisElement.style.display = 'none'),
        document.body.appendChild(l.thisElement),
        $('#import-project-file')
            .unbind('change')
            .bind('change', function (o) {
                if (1 == +e) {
                    var r = o.target.files[0];
                    if (r.size / 1024 / 1024 > 500) return void showErrorMsg('导入的工程过大', 3e3);
                    if (($(o.target).remove(), -1 === r.name.indexOf('.gz'))) return void showErrorMsg('请导入正确的工程', 3e3);
                    var s = r.name.split('.gz')[0],
                        i = {
                            createTime: new Date().format('yyyy-MM-dd hh:mm:ss'),
                            creator: sessionStorage.getItem('user') || sessionStorage.getItem('user'),
                            describe: t.projectDescript,
                            id: idBuilder.generateUUID(),
                            importname: t.projectName,
                            name: s,
                            projectGroupId: t.projectGroupId,
                        };
                    return (
                        a.upDateProjectGroupInfo(function (e) {
                            var t = [];
                            if (
                                (e.projectMng.projectArray.forEach(function (e) {
                                    t.push(e.name);
                                }),
                                e.projectGroups.forEach(function (e) {
                                    e.projectArray.forEach(function (e) {
                                        t.push(e.name);
                                    });
                                }),
                                0 !== t.filter((e) => e === i.importname).length)
                            )
                                return showErrorMsg(IDS_NAME_REPEAT, 3e3), !1;
                            $.messager.progress({
                                title: '工程导入',
                                msg: '导入中...',
                                text: '<img src="./static/images/010.gif"  width="100%" height="100%">',
                                interval: 0,
                            });
                            var o = new FormData();
                            o.append('uploadproject', r),
                                a.importProject('importProject', i, o, function (t, o) {
                                    $.messager.progress('close'), o ? o && (showSuccessMsg('导入成功', 3e3), publishProject(t, i, n)) : t.flag ? ((e.errorCode = !1), showErrorMsg('服务器未回复信息，可能与服务器断开连接')) : n(t);
                                });
                        }),
                        !0
                    );
                }
            }),
        $('#import-project-file').click();
}

function publishProject(e, t, n) {
    $.messager.progress({
        title: '工程发布',
        msg: '发布中...',
        text: '<img src="./static/images/010.gif"  width="100%" height="100%">',
        interval: 0,
    });
    var o = KMClientInterface.getInstance();
    o.publishProject(function (a) {
        var r = {
            name: 'pageManager',
            type: operateType.PAGEMNG,
            guid: t.id + '/1.0.0.1',
        };
        o.kmGetProjectInFileDev(r, function (t) {
            console.log(t);
            for (var s = (t = 'string' == typeof t ? JSON.parse(t) : t).default, i = !1, l = 0; l < t.Pages.length; l++)
                if (s === t.Pages[l].name) {
                    i = !0;
                    break;
                }
            i || ($.messager.progress('close'), showErrorMsg('发布失败，请前往开发态设置运行态首页', 3e3));
            var c = {
                projectName: e.groupName || '工程管理',
                proName: null,
            };
            o.kmDeployGlobalScript(JSON.stringify(c), r.guid, function (e) {
                e && console.log('success');
            });
            var u = KMUserManager.getInstance().getLoginUser();
            c = {
                projectInfo: {
                    tenantId: u.tenantId || '',
                    projectId: e.id || e.GUID,
                    projectGroupName: e.groupName || '工程管理',
                    solutionId: a.solutions.GUID,
                    solutionName: a.solutions.solutionName,
                    creator: u.userName,
                    createTime: e.createtime,
                    modifyTime: new Date().format('yyyy-MM-dd hh:mm:ss'),
                    projectName: e.text || e.name,
                    projectType: 1,
                    projectTypeVersion: [e.version],
                    publishTime: new Date().format('yyyy-MM-dd hh:mm:ss'),
                    projectDescription: e.des,
                    projectVersion: e.version,
                },
                token: getToken(),
                type: 'uploadProject',
            };
            o.projectHandle(JSON.stringify(c), function (e) {
                $.messager.progress('close'),
                    showSuccessMsg('工程发布成功', 3e3),
                    0 === Number(e)
                        ? n({
                              code: 0,
                              message: 'success',
                              data: {
                                  projectId: c.projectInfo.projectId,
                                  projectVersion: c.projectInfo.projectVersion,
                              },
                          })
                        : n({
                              code: 400,
                              message: 'failed',
                              data: {
                                  projectId: c.projectInfo.projectId,
                                  projectVersion: c.projectInfo.projectVersion,
                              },
                          });
            });
        });
    });
}

function GetCurrentAppName() {
    return KMClientInterface.getInstance().APPName;
}

function SaveImgWithBase64ToUpload(e, t) {
    KMClientInterface.getInstance().saveImgWithBase64ToUpload(e, t);
}

function convertHTMLToPdf(e, t) {
    (self.popup = new KMPopupBase()), self.popup.setPanelWidth(400), self.popup.setTitleBarText('生成中...');
    let n = $('\n            <div style = "height: 25px">\n                <img id ="imgProgress" src="static/images/010.gif" width="100%" height="100%">\n            </div>\n        ')[0];
    if ((self.popup.cancelBtn.thisElement.remove(), self.popup.closeSpan.thisElement.remove(), self.popup.confirmBtn.thisElement.remove(), self.popup.content.thisElement.appendChild(n), '' === e || void 0 === e || 0 === e)) return alert(HTMLTOPDF.RIGHTSCRIPPARAM), !1;
    if (!e.hasOwnProperty('pageName')) return alert(HTMLTOPDF.SETFORMATPAGENAME), !1;
    if ('' === e.pageName) return alert(HTMLTOPDF.FORMATPAGENAMENOTNULL), !1;
    if (!e.hasOwnProperty('layoutWidth')) return alert(HTMLTOPDF.SETLAYOUTWIDTH), !1;
    if ('' === e.layoutWidth) return alert(HTMLTOPDF.LAYOUTWIDTHNOTNULL), !1;
    if (!e.hasOwnProperty('layoutName')) return alert(HTMLTOPDF.SETREPORTLAYOUTNAME), !1;
    if ('' === e.layoutName) return alert(HTMLTOPDF.REPORTLAYOUTNAMENOTNULL), !1;
    if (!e.hasOwnProperty('title')) return alert(HTMLTOPDF.SETPAGETITLE), !1;
    if ('' === e.title) return alert(HTMLTOPDF.PAGETITLENOTNULL), !1;
    if (!e.hasOwnProperty('logoImg')) return alert(HTMLTOPDF.SETPAGELOGO), !1;
    if (!e.hasOwnProperty('waterMark')) return alert(HTMLTOPDF.SETPAGEWATERMARK), !1;
    if (!e.hasOwnProperty('pageFooter')) return alert(HTMLTOPDF.SETPAGEFOOTER), !1;
    if (!e.hasOwnProperty('pageHeader')) return alert(HTMLTOPDF.SETPAGEHEADER), !1;
    if (((this.pageHtmlInfo = ''), e.hasOwnProperty('pageName') && '' != e.pageName.length && e.hasOwnProperty('layoutName') && '' != e.layoutName.length)) {
        var o = KMUIFrame.getInstance().pageMng.$PicManager[e.pageName].$Children[e.layoutName];
        (this.pageHtmlInfo = o.thisElement.outerHTML), o.setWidth(e.layoutWidth), o.resetRegionPos();
    }
    (this.textAreaDoms = ''),
        e.hasOwnProperty('textAreaElements') &&
            0 != e.textAreaElements.length &&
            e.textAreaElements.forEach(function (e) {
                if ('' !== e.textAreaValue) {
                    var t = e.textAreaValue.replace(/\n/g, '\\n'),
                        n = 'document.getElementById("' + e.textAreaId + '").innerHTML = "' + t + '";';
                    this.textAreaDoms += n;
                }
            }),
        (this.labelTextDoms = ''),
        e.hasOwnProperty('textElements') &&
            0 != e.textElements.length &&
            e.textElements.forEach(function (e) {
                var t = 'document.getElementById("' + e.labelId + '").value="' + e.labelValue + '";';
                this.labelTextDoms += t;
            }),
        (this.canvasImgDoms = ''),
        e.hasOwnProperty('images') &&
            0 != e.images.length &&
            e.images.forEach(function (e) {
                var t =
                    '\n                var canvas = document.getElementById("' +
                    e.canvasId +
                    '");\n                var context = canvas.getContext("2d");\n                var img = new Image();\n                img.src = "' +
                    window.location.origin +
                    '/img/?imgPath=/Project//res/images/' +
                    e.imageName +
                    '";\n                img.onload = function() {\n                    canvas.width = img.width;\n                    canvas.height = img.height;\n                    context.drawImage(this, 0, 0, img.width, img.width);\n                }';
                this.canvasImgDoms += t;
            }),
        (this.echartsDoms = ''),
        e.hasOwnProperty('echartsOption') &&
            0 != e.echartsOption.length &&
            e.echartsOption.forEach(function (e) {
                var t = '\n                var myChart = echarts.init(document.getElementById("' + e.echartsId + '")); \n                myChart.setOption(' + e.echartsData + ');';
                this.echartsDoms += t;
            });
    var a = document.getElementsByTagName('style'),
        r = '';
    if (a.length > 0) for (var s = 0; s < a.length; s++) r += a[s].outerHTML;
    var i = `<script>\n${this.textAreaDoms}\n${this.labelTextDoms}\n${this.canvasImgDoms}\n${this.echartsDoms}\n<\/script>`,
        l = '\n    <script type="text/javascript" src="' + window.location.origin + '/static/javascripts/ThirdParty/qrcode/jquery.min.js"></script>\n    <script type="text/javascript" src="' + window.location.origin + '/static/javascripts/ThirdParty/echarts.min.js"></script>',
        c = KMClientInterface.getInstance();
    (pageInfo = {
        htmlInfo: l + r + this.pageHtmlInfo + i,
        title: e.title,
        logoImg: e.logoImg,
        waterMark: e.waterMark,
        pageFooter: e.pageFooter,
        pageHeader: e.pageHeader,
    }),
        c.convertHTMLToPdf(pageInfo, (e) => {
            try {
                e.status ? ($('.km-ds-popup-wrap').remove(), alert(HTMLTOPDF.GENERATEPDFSUCCESS), t(e)) : ($('.km-ds-popup-wrap').remove(), alert(HTMLTOPDF.PAGETOPDFFAILE), console.log(e));
            } catch (e) {
                $('.km-ds-popup-wrap').remove(), alert(HTMLTOPDF.SERVEREXCEPTION);
            }
        });
}

function getCurrentPageVariableNames(e) {
    for (var t = [], n = [], o = KMProjectVariableMng.getInstance(), a = e.dataSourceMng.dataSourceMng, r = 0; r < a.length; r++) {
        for (var s = a[r].subscribe, i = a[r].query, l = 0; l < s.length; l++) n.push(s[l].id);
        for (var c = 0; c < i.length; c++) n.push(i[l].id);
    }
    for (var u = 0; u < n.length; u++) t.push(o.getVariableNameById(n[u]));
    return t;
}

function getAllProVariableNames() {
    var e = [],
        t = [];
    t = KMProjectVariableMng.getInstance().getAllProjectVariables();
    for (var n = 0; n < t.length; n++) t[n].name.match(/\$/g) || e.push(t[n].name);
    return e;
}

function GetMqttDeviceModelList(e, t) {
    KMClientInterface.getInstance().MqttKpToKc(e, '/getMqttDeviceModelList', '', t);
}

function CreateMqttDeviceByModel(e, t, n, o, a, r, s) {
    var i = {
        deviceName: t,
        description: n,
        deviceIdentity: o,
        belongGroup: a,
        modelName: r,
    };
    KMClientInterface.getInstance().MqttKpToKc(e, '/createMqttDeviceByModel', i, s);
}

function ModifyMqttDeviceInfoByName(e, t, n, o, a) {
    var r = {
        deviceName: t,
        operate: n,
        data: o,
    };
    KMClientInterface.getInstance().MqttKpToKc(e, '/modifyMqttDeviceInfoByName', r, a);
}

function DeleteMqttDevice(e, t, n) {
    KMClientInterface.getInstance().MqttKpToKc(e, '/deleteMqttDevice', t, n);
}

function GetMqttDeviceList(e, t) {
    KMClientInterface.getInstance().MqttKpToKc(e, '/getMqttDeviceList', '', t);
}

function PrintPage(e) {
    if ('string' == typeof e) {
        var t = KMUIFrame.getInstance(),
            n = t.pageMng.getPageByName(e);
        if (null !== n) {
            let e = $(document.head).clone();
            $(e)
                .find('script')
                .each((t, n) => {
                    -1 === n.src.indexOf('easyui') && -1 === n.src.indexOf('element-ui') && e[0].removeChild(n);
                });
            var o = n.thisElement.outerHTML;
            $(document.body)
                .children()
                .each((e, t) => {
                    'STYLE' === t.tagName && (o += t.outerHTML);
                });
            var a = document.querySelectorAll('#' + n.thisElement.id + ' input'),
                r = [];
            for (let e = 0; e < a.length; e++) r.push(a[e].value);
            var s = document.querySelectorAll('#' + n.thisElement.id + ' canvas'),
                i = [];
            for (let e = 0; e < s.length; e++) i.push(s[e].toDataURL('image/png'));
            var l = {
                    head: e[0].outerHTML,
                    body: o,
                },
                c = {
                    height: 800,
                    width: 1e3,
                    left: (window.screen.availWidth - 10 - 1e3) / 2,
                    top: (window.screen.availHeight - 30 - 800) / 2,
                },
                u = `<!doctype html><html>${l.head} <body>${l.body}</body></html>`,
                g = window.open('', '', 'height=' + c.height + ', width=' + c.width + ',left=' + c.left + ',top=' + c.top),
                f = g.document;
            f.open(),
                f.write(u),
                f.close(),
                g.focus(),
                (g.onload = function () {
                    let e = f.querySelectorAll('input');
                    if (0 !== e.length && e.length === r.length) for (let t = e.length - 1; t >= 0; t--) e[t].value = r[t];
                    var t = [];
                    let n = f.querySelectorAll('img');
                    for (let e = 0; e < n.length; e++)
                        t.push(
                            new Promise((t, o) => {
                                var a = new Image();
                                (a.src = n[e].src),
                                    (a.onload = function () {
                                        t();
                                    });
                            })
                        );
                    let o = f.querySelectorAll('canvas');
                    if (0 !== o.length && o.length === i.length)
                        for (let e = o.length - 1; e >= 0; e--)
                            t.push(
                                new Promise((t, n) => {
                                    let a = o[e].getContext('2d'),
                                        r = new Image();
                                    (r.onload = function () {
                                        a.drawImage(this, 0, 0), t();
                                    }),
                                        (r.src = i[e]);
                                })
                            );
                    Promise.all(t)
                        .then(
                            () =>
                                new Promise((e) => {
                                    let t = setTimeout(() => {
                                        g.print(), g.close(), clearTimeout(t), e();
                                    });
                                })
                        )
                        .catch((e) => {
                            console.log(e);
                        });
                });
        } else if (t.projectServer.pageMng.Pages.some((t) => t.name === e)) {
            var d = RS.PAGE_NOT_LOAD.replace('XX', e);
            console.log(d);
        } else {
            d = RS.PAGE_NOT_EXIST.replace('XX', e);
            console.log(d);
        }
    }
}

function WriteExcel(e, t, n) {
    KMClientInterface.getInstance().WriteExcel(e, t, n);
}

function scriptConfusionDialog(e, t, n) {
    (self.confusionForm = new KMUIHtml('div', [['class', 'confusionform']])),
        (self.confusionTitle = new KMUIHtml('span', [
            ['class', 'confusiontitle'],
            ['innerText', e],
        ])),
        (self.confusionClose = new KMUIHtml('div', [['class', 'confusionclose']])),
        (self.horizontalLine = new KMUIHtml('div', [['class', 'horizontalline']])),
        (self.warningImg = new KMUIHtml('div', [['class', 'warningImg']])),
        (self.warningNote = new KMUIHtml('span', [
            ['class', 'warningNote'],
            ['innerText', t],
        ])),
        (self.confusionCenter = new KMUIHtml('div', [['class', 'confusionCenter']])),
        (self.confusionCancelDiv = new KMUIHtml('div', [['class', 'confusionCancelDiv']])),
        (self.confusionConfirmDiv = new KMUIHtml('div', [['class', 'confusionConfirmDiv']])),
        (self.confusionCancelMsg = new KMUIHtml('span', [
            ['class', 'confusionCancelMsg'],
            ['innerText', IDS_CANCEL],
        ])),
        (self.confusionConfirmMsg = new KMUIHtml('span', [
            ['class', 'confusionConfirmMsg'],
            ['innerText', IDS_CONFIRM],
        ])),
        (self.barwrapContain = new KMUIHtml('div', [['class', 'bar-wrap-contain']])),
        document.body.appendChild(self.barwrapContain.thisElement),
        self.barwrapContain.appendChild(self.confusionForm),
        self.confusionForm.appendChild(self.confusionTitle),
        self.confusionForm.appendChild(self.confusionClose),
        self.confusionForm.appendChild(self.horizontalLine),
        self.confusionCenter.appendChild(self.warningImg),
        self.confusionCenter.appendChild(self.warningNote),
        self.confusionCancelDiv.appendChild(self.confusionCancelMsg),
        self.confusionConfirmDiv.appendChild(self.confusionConfirmMsg),
        self.confusionCenter.appendChild(self.confusionConfirmDiv),
        self.confusionCenter.appendChild(self.confusionCancelDiv),
        self.confusionForm.appendChild(self.confusionCenter),
        (self.confusionCancelDiv.thisElement.onclick = function () {
            self.barwrapContain.remove(), $('#glo-script-win').window('close'), n && n(!1);
        }),
        (self.confusionClose.thisElement.onclick = function () {
            self.barwrapContain.remove();
        }),
        (self.confusionConfirmDiv.thisElement.onclick = function (e) {
            self.barwrapContain.remove(), n && n(!0);
        });
}

function showHTPreview(e, t = 'center', n) {
    var o = decodeURIComponent(window.location.hash).replace('#', ''),
        a = KMUIFrame.getInstance().getPageMng().getPageByName(o);
    if (!a) return void alert('当前页面异常, 请检查');
    if (!a.$Children[e]) return void alert('当前页面中不存在' + e + ', 请检查');
    let r = KMClientInterface.getInstance().currentProName;
    r ||
        getProjectPath((e) => {
            r = KMClientInterface.getInstance().currentProName = e
                .split('kingclient')[1]
                .split('1.0.0.1')[0]
                .replace(/[\\\/]/g, '');
        });
    let s = '',
        i = '';
    (s = window.plus ? localStorage.getItem('urlObj').split('://')[1].split(':')[0] : location.hostname),
        KMClientInterface.getInstance().kmGetHT3DSceneInfo(() => {
            var o = new KMUIHT3DPreviewContainer((i = 'https://' + s + '/kingclient3d/display.html?tag=displays/' + n + '.json&projectInfo=' + r + '/1.0.0.1')),
                l = a.$Children[e].getRegionDiv(t);
            $(l).empty(), l.appendChild(o.iframeElement3d.thisElement);
        });
}

function closeHTPreview() {
    $('#iframeElement3d').remove();
}

function showHTEditor(e, t = 'center') {
    var n = decodeURIComponent(window.location.hash).replace('#', ''),
        o = KMUIFrame.getInstance().getPageMng().getPageByName(n);
    if (!o) return void alert('当前页面异常, 请检查');
    if (!o.$Children[e]) return void alert('当前页面中不存在' + e + ', 请检查');
    let a = KMClientInterface.getInstance().currentProName;
    a ||
        getProjectPath((e) => {
            a = KMClientInterface.getInstance().currentProName = e
                .split('kingclient')[1]
                .split('1.0.0.1')[0]
                .replace(/[\\\/]/g, '');
        });
    let r = '',
        s = '';
    (r = window.plus ? localStorage.getItem('urlObj').split('://')[1].split(':')[0] : location.hostname),
        KMClientInterface.getInstance().kmGetHT3DSceneInfo(() => {
            s = 'https://' + r + '/kingclient3d/?projectInfo=' + KMClientInterface.getInstance().currentProName + '/1.0.0.1';
            var n = new KMUIHT3DEditorContainer(s),
                a = o.$Children[e].getRegionDiv(t);
            $(a).empty(), a.appendChild(n.iframeElement3d.thisElement);
        });
}

function exitHTEditor() {
    $('#iframeElement3d').remove();
}

function getHTNodeAttr(e, t, ...n) {
    if (!e || 'string' != typeof e) return void alert('节点名称不正确, 请检查');
    if (!t || 'string' != typeof t) return void alert('方法名不正确, 请检查');
    let o = {
        type: 'get',
        nodeName: e,
        method: t,
        args: n,
    };
    $('#iframeElement3d')[0].contentWindow.postMessage(o, $('#iframeElement3d')[0].src);
}

function setHTNodeAttr(e, t, ...n) {
    if (!e || 'string' != typeof e) return void alert('节点名称不正确, 请检查');
    if (!t || 'string' != typeof t) return void alert('方法名不正确, 请检查');
    let o = {
        type: 'set',
        nodeName: e,
        method: t,
        args: n,
    };
    $('#iframeElement3d')[0].contentWindow.postMessage(o, $('#iframeElement3d')[0].src);
}

function showHTTrack(e, t = !0) {
    if (!e instanceof Array) alert('轨迹数组错误, 请检查');
    else {
        var n = {
            type: 'showTrack',
            track: e,
            isShow: t,
        };
        $('#iframeElement3d')[0].contentWindow.postMessage(n, $('#iframeElement3d')[0].src);
    }
}

function trackPlayback(e, t, n, o) {
    if (e && 'string' == typeof e)
        if (!t instanceof Array) alert('轨迹回放数组错误, 请检查');
        else {
            var a = {
                type: 'trackPlayback',
                target: e,
                track: t,
                animID: n,
            };
            $('#iframeElement3d')[0].contentWindow.postMessage(a, $('#iframeElement3d')[0].src), window.animationMap.set(n, o);
        }
    else alert('轨迹回放目标节点名错误, 请检查');
}

function togglePlayback(e) {
    if (e && 'string' == typeof e) {
        var t = {
            type: 'togglePlayback',
            animID: e,
        };
        $('#iframeElement3d')[0].contentWindow.postMessage(t, $('#iframeElement3d')[0].src);
    } else alert('动画ID错误, 请检查');
}

function changePlaybackSpeed(e, t = 1) {
    if (e && 'string' == typeof e) {
        var n = {
            type: 'changePlaybackSpeed',
            animID: e,
            speed: t,
        };
        $('#iframeElement3d')[0].contentWindow.postMessage(n, $('#iframeElement3d')[0].src);
    } else alert('动画ID错误, 请检查');
}

function setHTAnimation(e, t) {
    if (!e || 'string' != typeof e) return void alert('节点名不正确, 请检查');
    if (!t || 'object' != typeof t) return void alert('动画对象不正确, 请检查');
    let n = {
        type: 'setAnimation',
        targetName: e,
        animationObj: t,
    };
    $('#iframeElement3d')[0].contentWindow.postMessage(n, $('#iframeElement3d')[0].src);
}

function toggleHTAnimation(e) {
    if (!e || 'string' != typeof e) return void alert('节点名不正确, 请检查');
    let t = {
        type: 'toggleAnimation',
        targetName: e,
    };
    $('#iframeElement3d')[0].contentWindow.postMessage(t, $('#iframeElement3d')[0].src);
}

function createHTSymbol(e, t) {
    if (!e || 'string' != typeof e) return void alert('图标名不正确, 请检查');
    if (!t || 'object' != typeof t) return void alert('动态创建对象信息不正确, 请检查');
    let n = {
        type: 'createSymbol',
        symbolName: e,
        objectArr: t,
    };
    $('#iframeElement3d')[0].contentWindow.postMessage(n, $('#iframeElement3d')[0].src);
}

function deleteHTSymbol(e) {
    if (!e || 'object' != typeof e) return void alert('图标名数组不正确, 请检查');
    let t = {
        type: 'deleteSymbol',
        nameArr: e,
    };
    $('#iframeElement3d')[0].contentWindow.postMessage(t, $('#iframeElement3d')[0].src);
}

function getHTAllDatas(e) {
    $('#iframeElement3d')[0].contentWindow.postMessage(
        {
            type: 'getAllDatas',
        },
        $('#iframeElement3d')[0].src
    ),
        window.HTDataMap.set('allDatas', e);
}

function getHTData(e, t) {
    let n = {
        type: 'getData',
        displayName: e,
    };
    $('#iframeElement3d')[0].contentWindow.postMessage(n, $('#iframeElement3d')[0].src), window.HTDataMap.set(e, t);
}

function getCurrentNodeName() {
    return window.currentNodeName;
}

function zoomToAll() {
    $('#iframeElement3d')[0].contentWindow.postMessage(
        {
            type: 'zoomToAll',
        },
        $('#iframeElement3d')[0].src
    );
}

function zoomToTarget(e, t) {
    let n = {
        type: 'zoomToTarget',
        target: e,
        zoom: t,
    };
    $('#iframeElement3d')[0].contentWindow.postMessage(n, $('#iframeElement3d')[0].src);
}

function sendSQLDataToHT(e, t) {
    let n = {
        type: 'sendSQLDataToHT',
        dataName: e,
        data: t,
    };
    $('#iframeElement3d')[0].contentWindow.postMessage(n, $('#iframeElement3d')[0].src);
}

function operateHTOverview(e) {
    let t = {
        type: 'operateHTOverview',
        operateType: e,
    };
    $('#iframeElement3d')[0].contentWindow.postMessage(t, $('#iframeElement3d')[0].src);
}

function QueryAlarmInfo(e, t, n, o) {
    var a = o || 3e3;
    if (e) {
        var r = KMDatasourceMng.getInstance().getDataSource(e);
        r && (result = r.AsynGetAlarmValues(t, n, a));
    }
}

function ExportToExcelForEasyui(e) {
    var t = 0;
    if (e)
        if (!Array.isArray(e.data) || (e.data[0] && 'object' != typeof e.data[0])) (t = -1), console.warn('ExportToExcelForEasyui()：数据格式错误!');
        else if (!Array.isArray(e.columns) || !Array.isArray(e.columns[0]) || (e.columns[0][0] && 'object' != typeof e.columns[0][0])) (t = -1), console.warn('ExportToExcelForEasyui()：表头格式错误!');
        else {
            for (var n = '', o = [], a = 0; a < e.columns.length; a++) {
                n += '<tr style="text-align:center;background:#cccccc">';
                for (var r = 0; r < e.columns[a].length; r++)
                    e.columns[a][r].field && o.push(e.columns[a][r].field),
                        e.columns[a][r].rowspan && !e.columns[a][r].colspan
                            ? (n += `<th rowspan="${e.columns[a][r].rowspan}">${e.columns[a][r].title}</th>`)
                            : !e.columns[a][r].rowspan && e.columns[a][r].colspan
                            ? (n += `<th colspan="${e.columns[a][r].colspan}">${e.columns[a][r].title}</th>`)
                            : e.columns[a][r].rowspan && e.columns[a][r].colspan
                            ? (n += `<th rowspan="${e.columns[a][r].rowspan}" colspan="${e.columns[a][r].colspan}">${e.columns[a][r].title}</th>`)
                            : (n += `<th>${e.columns[a][r].title}</th>`);
                n += '</tr>';
            }
            e.merges &&
                0 !== e.merges.length &&
                e.merges.forEach(function (t) {
                    if (((t.index = Number(t.index)), t.rowspan && !t.colspan)) {
                        t.rowspan = Number(t.rowspan);
                        for (var n = t.index; n < t.index + t.rowspan; n++)
                            n === t.index
                                ? (e.data[n][t.field] = {
                                      field: e.data[n][t.field],
                                      rowspan: t.rowspan,
                                      isShow: !0,
                                  })
                                : (e.data[n][t.field] = {
                                      field: e.data[n][t.field],
                                      isShow: !1,
                                  });
                    }
                    if (!t.rowspan && t.colspan) {
                        t.colspan = Number(t.colspan);
                        var o = null,
                            a = 0;
                        for (var r in e.data[t.index])
                            a++,
                                r === t.field &&
                                    ((o = a),
                                    (e.data[t.index][r] = {
                                        field: e.data[t.index][r],
                                        colspan: t.colspan,
                                        isShow: !0,
                                    })),
                                o &&
                                    a > o &&
                                    a < o + t.colspan &&
                                    (e.data[t.index][r] = {
                                        field: e.data[t.index][r],
                                        isShow: !1,
                                    });
                    }
                    if (t.rowspan && t.colspan) {
                        (t.rowspan = Number(t.rowspan)), (t.colspan = Number(t.colspan));
                        for (n = t.index; n < t.index + t.rowspan; n++)
                            if (n === t.index) {
                                (o = null), (a = 0);
                                for (var r in e.data[n])
                                    a++,
                                        r === t.field &&
                                            ((o = a),
                                            (e.data[n][r] = {
                                                field: e.data[n][r],
                                                colspan: t.colspan,
                                                rowspan: t.rowspan,
                                                isShow: !0,
                                            })),
                                        o &&
                                            a > o &&
                                            a < o + t.colspan &&
                                            (e.data[n][r] = {
                                                field: e.data[n][r],
                                                isShow: !1,
                                            });
                            } else {
                                (o = null), (a = 0);
                                for (var r in e.data[n])
                                    a++,
                                        r === t.field &&
                                            ((o = a),
                                            (e.data[n][r] = {
                                                field: e.data[n][r],
                                                isShow: !1,
                                            })),
                                        o &&
                                            a > o &&
                                            a < o + t.colspan &&
                                            (e.data[n][r] = {
                                                field: e.data[n][r],
                                                isShow: !1,
                                            });
                            }
                    }
                });
            for (a = 0; a < e.data.length; a++) {
                for (var s in ((n += '<tr style="text-align:center;">'), e.data[a]))
                    e.data[a][s] && o.includes(s) && 'object' == typeof e.data[a][s]
                        ? e.data[a][s].isShow && (e.data[a][s].rowspan && !e.data[a][s].colspan && (n += `<td rowspan="${e.data[a][s].rowspan}">${e.data[a][s].field}</td>`), !e.data[a][s].rowspan && e.data[a][s].colspan && (n += `<td colspan="${e.data[a][s].colspan}">${e.data[a][s].field}</td>`), e.data[a][s].rowspan && e.data[a][s].colspan && (n += `<td rowspan="${e.data[a][s].rowspan}" colspan="${e.data[a][s].colspan}">${e.data[a][s].field}</td>`))
                        : o.includes(s) && (n += `<td>${e.data[a][s] ? e.data[a][s] : ''}</td>`);
                n += '</tr>';
            }
            var i = `\n        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">\n            <head>\n                \x3c!--[if gte mso 9]>\n                <xml>\n                    <x:ExcelWorkbook>\n                        <x:ExcelWorksheets>\n                            <x:ExcelWorksheet>\n                                <x:Name>${
                    e.worksheetName ? e.worksheetName : 'Sheet1'
                }</x:Name>\n                                <x:WorksheetOptions>\n                                    <x:DisplayGridlines/>\n                                </x:WorksheetOptions>\n                            </x:ExcelWorksheet>\n                        </x:ExcelWorksheets>    \n                    </x:ExcelWorkbook>\n                </xml>\n                <![endif]--\x3e\n            </head>\n            <body>\n                <table border="1" cellspacing="0">${n}</table>\n            </body>\n        </html>\n        `,
                l = document.createElement('a');
            (l.style.display = 'none'), (l.href = 'data:application/vnd.ms-excel;base64,' + window.btoa(unescape(encodeURIComponent(i)))), (l.download = e.fileName ? e.fileName : '下载文件.xls'), $('body').append(l), l.click(), $(l).remove();
        }
    else t = -1;
    return t;
}
