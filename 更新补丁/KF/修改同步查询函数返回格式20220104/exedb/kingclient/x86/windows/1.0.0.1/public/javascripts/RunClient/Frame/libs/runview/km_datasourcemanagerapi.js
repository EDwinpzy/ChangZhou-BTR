const theAPIId = generateUUID(),
    testAppInfo = !1,
    APIERRCODE = {
        NOSERVERDISCOVERINFO: -1,
        SERVERDISCOVERFAIL: -2,
    },
    APIERRINFO = {
        SERVERDISCOVERFAIL: '服务发现请求失败',
        NOSERVERDISCOVERINFO: '没有找到服务发现的信息',
    },
    ERRORTIP = {
        SERVERTIMEOUT: '服务器响应超时',
    },
    protocol = window.location.protocol,
    httpTimeout = 3e4,
    operateFlag = {
        SUBCRIBE_BY_TAGNAMES: 1,
        SUBCRIBEALARM_BY_TAGNAMES: 2,
    },
    subscribeConetentCache = new Map(),
    requestCallBackMap = new Map();
var GlobalSubDataCallBack = null,
    GlobalSubDataCallAlarmBack = null,
    isSendReconnectInfo = !1,
    gWebsocketClient = null,
    gWebsocketClientMap = new Map(),
    mapRunningServerInfo = new Map(),
    resultInfo = {};
class DataSourceManagerRunningAPI {
    constructor() {
        (this.m_serverFindInfo = null), (this.nginxBalance = null);
    }
    getRunningServerInfoByAppName(e, t) {
        if (testAppInfo) return testAppInfo;
        var o = {
            code: 0,
            appInfo: null,
        };
        if ('KP2.0' === kmUlits.currentProductName()) {
            if (window.plus) {
                var a = localStorage.getItem('urlObj').split('://')[1];
                o.appInfo = a.split(':')[0] + ':' + Number(Number(a.split(':')[1]) + 1);
            } else o.appInfo = window.location.hostname + ':' + Number(Number(window.location.port) + 1);
            return o;
        }
        if ('KF3.6' === kmUlits.currentProductName()) {
            if (this.nginxBalance) return (o.appInfo = window.location.host + '/' + e), o;
            if (mapRunningServerInfo.has(e)) return (o.appInfo = mapRunningServerInfo.get(e)), o;
            if (!this.m_serverFindInfo) return (o.code = APIERRCODE.NOSERVERDISCOVERINFO), o;
            var n = this.m_serverFindInfo + '/api/v1/accessURL?appName=' + e + '&token=' + t;
            return (
                -1 == this.m_serverFindInfo.indexOf('https') && -1 == this.m_serverFindInfo.indexOf('http') && (n = 'http://' + this.m_serverFindInfo + '/api/v1/accessURL?appName=' + e + '&token=' + t),
                $.ajax({
                    url: encodeURI(n),
                    datatype: 'json',
                    async: !1,
                    type: 'GET',
                    success: function (t) {
                        if (('string' == typeof t && (t = JSON.parse(t)), 0 == t.code)) {
                            var a = t.data.isAgent,
                                n = t.data.publicAccessURL;
                            if (0 == a) {
                                let e = n.indexOf('/');
                                o.appInfo = n.substring(0, e);
                            } else 1 == a && (o.appInfo = n);
                            -1 !== o.appInfo.indexOf('https://') && (o.appInfo = o.appInfo.slice(8)), -1 !== o.appInfo.indexOf('http://') && (o.appInfo = o.appInfo.slice(7)), mapRunningServerInfo.set(e, o.appInfo);
                        } else o.code = APIERRCODE.SERVERDISCOVERFAIL;
                    },
                    error: function (e, t, a) {
                        console.error(ERRORTIP.SERVERTIMEOUT), (o.code = APIERRCODE.SERVERDISCOVERFAIL);
                    },
                }),
                o
            );
        }
    }
    SetServerFindInfo(e) {
        this.m_serverFindInfo = e;
    }
    SetNginexConfig(e) {
        this.nginxBalance = e;
    }
    registerSubscribeCallBack(e) {
        GlobalSubDataCallBack = e;
    }
    registerAlarmSubscribeCallBack(e) {
        GlobalSubDataCallAlarmBack = e;
    }
    gSysWebsocketCallback(e) {
        var t = e.data,
            o = JSON.parse(t);
        if (o.hasOwnProperty('requestId')) {
            var a = requestCallBackMap.get(o.requestId);
            a && (delete o.requestId, a(o));
        } else 0 === o.dataType && GlobalSubDataCallBack(o), 1 === o.dataType && GlobalSubDataCallAlarmBack(o);
    }
    async synWebSocketConnectFun(e, t, o) {
        var a = this;
        return new Promise((n, r) => {
            var s = this.getRunningServerInfoByAppName(e, t);
            if (s.appInfo) {
                var i;
                if ((-1 !== s.appInfo.indexOf('http://') ? (s.appInfo = s.appInfo.slice(7)) : s.appInfo, -1 !== s.appInfo.indexOf('https://') ? (s.appInfo = s.appInfo.slice(8)) : s.appInfo, (i = 'http:' === protocol ? 'ws://' + s.appInfo : 'wss://' + s.appInfo), 0 !== s.code)) {
                    var c = {};
                    return (c.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (c.message = APIERRCODE.SERVERDISCOVERFAIL), void o(c);
                }
                (gWebsocketClient = new WsCommunication(i, a.gSysWebsocketCallback)), gWebsocketClientMap.set(e, gWebsocketClient);
            }
        });
    }
    AsynSubscribeTagValue(e, t, o, a, n, r) {
        var s = generateUUID();
        requestCallBackMap.set(s, r);
        var i = {
                requestId: s,
                requestType: operateFlag.SUBCRIBE_BY_TAGNAMES,
                datasourcename: t,
                token: o,
                tag: a,
                subscribeFlag: n,
                apiId: theAPIId,
            },
            c = JSON.stringify(i);
        if ((gWebsocketClientMap.get(e) || this.synWebSocketConnectFun(e, o, a, r), n)) subscribeConetentCache.set(t + 'real', c);
        else {
            var R,
                u = subscribeConetentCache.get(t + 'real');
            if ((u && (R = JSON.parse(u)), !R)) return void console.log('未进行订阅操作！无法取消订阅');
            if (R.tag.length) {
                var I = R.tag.filter((e) => -1 == a.indexOf(e));
                (i.tag = I), (i.subscribeFlag = 1), subscribeConetentCache.set(t + 'real', JSON.stringify(i));
            }
        }
        gWebsocketClientMap.get(e) && gWebsocketClientMap.get(e).send(c);
    }
    AsynSubscribeTagAlarm(e, t, o, a, n) {
        var r = generateUUID();
        requestCallBackMap.set(r, n);
        var s = {
                requestId: r,
                requestType: operateFlag.SUBCRIBEALARM_BY_TAGNAMES,
                datasourcename: t,
                token: o,
                subscribeFlag: a,
                apiId: theAPIId,
            },
            i = JSON.stringify(s);
        gWebsocketClientMap.get(e) || this.synWebSocketConnectFun(e, o, n), a ? subscribeConetentCache.set(t + 'alarm', i) : subscribeConetentCache.delete(t + 'alarm');
        var c = gWebsocketClientMap.get(e);
        c && c.send(i);
    }
    AsynSQLQuery(e, t, o, a, n, r, s) {
        var i = this,
            c = this.getRunningServerInfoByAppName(e, o);
        if (0 !== c.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var R = {
                script: a,
            },
            u = protocol + '//' + c.appInfo + '/api/v1/sqldata';
        $.ajax({
            url: encodeURI(u),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            contentType: 'application/json',
            async: !0,
            data: JSON.stringify(R),
            type: 'POST',
            timeout: n || httpTimeout,
            success: function (e) {
                var t = JSON.parse(e),
                    o = i.changeSQLQueryData(t, {}, s);
                r(o);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    changeSQLQueryData(e, t, o) {
        if (((t.records = []), (t.field = []), 0 === e.errorCode)) {
            for (let n = 0; n < e.data.length; n++) {
                if (o) var a = e.data[n];
                else a = Object.values(e.data[n]);
                if ((t.records.push(a), Array.isArray(e.data[0]))) for (let o = 0; o < e.data.length; o++) t.field[o] = Object.keys(e.data[o][0]);
                else t.field = Object.keys(e.data[0]);
            }
            var n = {};
            return (n.errorCode = e.errorCode), e.message && (n.message = e.message), o ? (n.data = t) : (n.Body = t), n;
        }
        return e;
    }
    SQLQuery(e, t, o, a, n, r, s) {
        s = true;
        var i = {},
            c = this,
            R = this.getRunningServerInfoByAppName(e, o);
        if (0 !== R.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var u = {
                script: a,
            },
            I = protocol + '//' + R.appInfo + '/api/v1/sqldata';
        if (
            ($.ajax({
                url: encodeURI(I),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                contentType: 'application/json',
                async: !1,
                data: JSON.stringify(u),
                type: 'POST',
                timeout: n || httpTimeout,
                success: function (e) {
                    var t = JSON.parse(e),
                        o = c.changeSQLQueryData(t, r, s);
                    i = o;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (i = -1);
                },
            }),
            !i.errorCode || -1001 != i.errorCode)
        )
            return i;
        KMClientInterface.getInstance()
            .getFileRequest()
            .checkStatus(function () {
                var o = getToken();
                this.SQLQuery(e, t, o, a, n, r, s);
            });
    }
    AsynSQLExecute(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = {
                script: a,
            },
            c = protocol + '//' + s.appInfo + '/api/v1/execute';
        $.ajax({
            url: encodeURI(c),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            contentType: 'application/json',
            async: !0,
            timeout: n || httpTimeout,
            data: JSON.stringify(i),
            type: 'POST',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    SQLExecute(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = {
                script: a,
            },
            c = protocol + '//' + s.appInfo + '/api/v1/execute';
        if (
            ($.ajax({
                url: encodeURI(c),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                contentType: 'application/json',
                async: !1,
                timeout: n || httpTimeout,
                data: JSON.stringify(i),
                type: 'POST',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            !r.errorCode || -1001 != r.errorCode)
        )
            return r;
        KMClientInterface.getInstance()
            .getFileRequest()
            .checkStatus(function () {
                var o = getToken();
                this.SQLExecute(e, t, o, a, n);
            });
    }
    AsynGetNameID(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v1/tableid',
            c = {
                tableName: a,
            };
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            contentType: 'application/json',
            async: !0,
            type: 'GET',
            data: c,
            timeout: n || httpTimeout,
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    GetNameID(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v1/tableid',
            c = {
                tableName: a,
            };
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                contentType: 'application/json',
                async: !1,
                type: 'GET',
                data: c,
                timeout: n || httpTimeout,
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynGetTitleID(e, t, o, a, n, r, s) {
        var i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void s(resultInfo);
        var c = {
                tableName: a,
                columeName: n,
            },
            R = protocol + '//' + i.appInfo + '/api/v1/fieldid';
        $.ajax({
            url: encodeURI(R),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            contentType: 'application/json',
            async: !0,
            type: 'GET',
            data: c,
            timeout: r || httpTimeout,
            success: function (e) {
                var t = JSON.parse(e);
                s(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), s(-1);
            },
        });
    }
    GetTitleID(e, t, o, a, n, r) {
        var s = {},
            i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var c = {
                tableName: a,
                columeName: n,
            },
            R = protocol + '//' + i.appInfo + '/api/v1/fieldid';
        return (
            $.ajax({
                url: encodeURI(R),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                contentType: 'application/json',
                async: !1,
                type: 'GET',
                data: c,
                timeout: r || httpTimeout,
                success: function (e) {
                    var t = JSON.parse(e);
                    s = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (s = -1);
                },
            }),
            s
        );
    }
    AsynGetTagValues(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = {
                tag: a,
            },
            c = protocol + '//' + s.appInfo + '/api/v2/realtimedata';
        $.ajax({
            url: encodeURI(c),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            type: 'POST',
            timeout: n || httpTimeout,
            contentType: 'application/json',
            data: JSON.stringify(i),
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    GetTagValues(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = {
                tag: a,
            },
            c = protocol + '//' + s.appInfo + '/api/v2/realtimedata';
        return (
            $.ajax({
                url: encodeURI(c),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                type: 'POST',
                timeout: n || httpTimeout,
                contentType: 'application/json',
                data: JSON.stringify(i),
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynSetTagValues(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/writebackdata',
            c = {
                tag: a,
            };
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            type: 'POST',
            datatype: 'json',
            async: !0,
            timeout: n || httpTimeout,
            contentType: 'application/json',
            data: JSON.stringify(c),
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    SetTagValues(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/writebackdata',
            c = {
                tag: a,
            };
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                type: 'POST',
                datatype: 'json',
                async: !1,
                timeout: n || httpTimeout,
                contentType: 'application/json',
                data: JSON.stringify(c),
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynQueryHistoryDatas(e, t, o, a, n, r) {
        var s = this,
            i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var c = {
                startTime: a.startTime,
                endTime: a.endTime,
                tagNames: a.tagNames,
                DataVersion: a.dataVersion,
                filter: a.filter,
                dataQuality: a.dataQuality,
                mode: a.mode,
                intervalTime: a.intervalTime,
            },
            R = protocol + '//' + i.appInfo + '/api/v2/historydata';
        $.ajax({
            url: encodeURI(R),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            timeout: n || httpTimeout,
            contentType: 'application/json',
            data: JSON.stringify(c),
            type: 'POST',
            success: function (e) {
                var t = JSON.parse(e),
                    o = s.historyDataChange(t);
                r(o);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    QueryHistoryDatas(e, t, o, a, n, r, s, i, c, R) {
        var u = {},
            I = this,
            p = this.getRunningServerInfoByAppName(e, o);
        if (0 !== p.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var l = {
                startTime: n,
                endTime: r,
                tagNames: a,
                DataVersion: s,
                filter: i,
                dataQuality: c,
            },
            d = protocol + '//' + p.appInfo + '/api/v2/historydata';
        return (
            $.ajax({
                url: encodeURI(d),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                timeout: R || httpTimeout,
                contentType: 'application/json',
                data: l,
                type: 'GET',
                success: function (e) {
                    var t = JSON.parse(e);
                    u = I.historyDataChange(t);
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (u = -1);
                },
            }),
            u
        );
    }
    historyDataChange(e) {
        var t = [];
        if (0 !== e.errorCode) return e;
        var o = e.data;
        if (e.hasOwnProperty('dataType') && 1 === e.dataType) return e;
        if (Array.isArray(e.data[0]))
            for (let e = 0; e < o.length; e++) {
                var a = o[e];
                for (let e = 0; e < a.length; e++) {
                    ((n = {}).N = a[e].DataName), a[e].DataVersion ? (n.VER = a[e].DataVersion) : (n.VER = null), ((r = {}).V = a[e].DataValue), (r.T = a[e].DataTime), (r.Q = a[e].DataQuality), (n.records = r), t.push(n);
                }
            }
        else
            for (let e = 0; e < o.length; e++) {
                var n, r;
                ((n = {}).N = o[e].DataName), o[e].DataVersion ? (n.VER = o[e].DataVersion) : (n.VER = null), ((r = {}).V = o[e].DataValue), (r.T = o[e].DataTime), (r.Q = o[e].DataQuality), (n.records = r), t.push(n);
            }
        let s = {};
        return (s.errorCode = e.errorCode), (s.message = e.message), (s.data = t), s;
    }
    AsynConfirmTagAlarm(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/confirmtagalarm',
            c = {
                tagArray: a,
            };
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            data: JSON.stringify(c),
            timeout: n || httpTimeout,
            contentType: 'application/json',
            type: 'POST',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    ConfirmTagAlarm(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/confirmtagalarm',
            c = {
                tagArray: a,
            };
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                data: JSON.stringify(c),
                timeout: n || httpTimeout,
                contentType: 'application/json',
                type: 'POST',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynGetAlarmValues(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = JSON.stringify(a),
            c = protocol + '//' + s.appInfo + '/api/v2/ksalarmdata';
        $.ajax({
            url: encodeURI(c),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            type: 'POST',
            timeout: n || httpTimeout,
            contentType: 'application/json',
            data: i,
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    GetAlarmValues(e, t, o, a, n, r) {
        var s = {},
            i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var c = JSON.stringify(a),
            R = protocol + '//' + i.appInfo + '/api/v2/ksalarmdata';
        return (
            $.ajax({
                url: encodeURI(R),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                type: 'POST',
                timeout: n || httpTimeout,
                contentType: 'application/json',
                data: c,
                success: function (e) {
                    var t = JSON.parse(e);
                    s = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (s = -1);
                },
            }),
            s,
            s
        );
    }
    AsynQueryHistoryAlarmDatas(e, t, o, a, n, r, s) {
        var i = this,
            c = this.getRunningServerInfoByAppName(e, o);
        if (0 !== c.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void s(resultInfo);
        var R = {
                startTime: a,
                endTime: n,
            },
            u = protocol + '//' + c.appInfo + '/api/v2/historyalarmdata';
        $.ajax({
            url: encodeURI(u),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            type: 'POST',
            datatype: 'json',
            async: !0,
            timeout: r || httpTimeout,
            contentType: 'application/json',
            data: JSON.stringify(R),
            success: function (e) {
                var t = JSON.parse(e),
                    o = i.historyAlarmChangeData(t);
                s(o);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), s(-1);
            },
        });
    }
    QueryHistoryAlarmDatas(e, t, o, a, n, r) {
        var s = {},
            i = this,
            c = this.getRunningServerInfoByAppName(e, o);
        if (0 !== c.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var R = {
                startTime: a,
                endTime: n,
            },
            u = protocol + '//' + c.appInfo + '/api/v2/historyalarmdata';
        return (
            $.ajax({
                url: encodeURI(u),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                type: 'GET',
                datatype: 'json',
                async: !1,
                timeout: r || httpTimeout,
                contentType: 'application/json',
                data: R,
                success: function (e) {
                    var t = JSON.parse(e);
                    s = i.historyAlarmChangeData(t);
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (s = -1);
                },
            }),
            s
        );
    }
    AsynGetFieldValues(e, t, o, a, n, r, s) {
        var i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void s(resultInfo);
        var c = {
                tag: a,
                field: n,
            },
            R = protocol + '//' + i.appInfo + '/api/v2/realtimefielddata';
        $.ajax({
            url: encodeURI(R),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            type: 'GET',
            contentType: 'application/json',
            timeout: r || httpTimeout,
            data: c,
            success: function (e) {
                var t = JSON.parse(e);
                s(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), s(-1);
            },
        });
    }
    getFieldValues(e, t, o, a, n, r) {
        var s = {},
            i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var c = {
                tag: a,
                field: n,
            },
            R = protocol + '//' + i.appInfo + '/api/v2/realtimefielddata';
        return (
            $.ajax({
                url: encodeURI(R),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                type: 'GET',
                contentType: 'application/json',
                timeout: r || httpTimeout,
                data: c,
                success: function (e) {
                    var t = JSON.parse(e);
                    s = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (s = -1);
                },
            }),
            s
        );
    }
    AsynSetFieldValues(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) {
            var i = {};
            return (i.errorCode = G_API_ERRCODE.KF_API_GET_APPINFO_FAILED), (i.message = 'serverdiscover failed'), void r(i);
        }
        var c = protocol + '//' + s.appInfo + '/api/v2/writebackfileddata';
        $.ajax({
            url: encodeURI(c),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            data: JSON.stringify(a),
            contentType: 'application/json',
            timeout: n || httpTimeout,
            type: 'POST',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    setFieldValues(e, t, o, a, n, r) {
        var s = {},
            i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var c = protocol + '//' + i.appInfo + '/api/v2/writebackfileddata';
        return (
            $.ajax({
                url: encodeURI(c),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                data: JSON.stringify(a),
                contentType: 'application/json',
                timeout: n || httpTimeout,
                type: 'POST',
                success: function (e) {
                    var t = JSON.parse(e);
                    s = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (s = -1);
                },
            }),
            s
        );
    }
    historyAlarmChangeData(e) {
        if (!e.errorCode && e.data) {
            var t = e.data,
                o = [];
            for (let e = 0; e < t.length; e++) {
                var a = {};
                a.N = t[e].TagName;
                var n = {};
                (n.AlarmDateTime = t[e].AlarmTime), (n.TagType = ''), (n.AlarmType = this.KSKVAlarmType(t[e].AlarmType)), (n.AlarmText = t[e].AlarmText), (n.AlarmValue = t[e].AlarmValue), (n.EventType = this.KSKVEventType(t[e].EventType)), (n.EventDateTime = t[e].EventTime), (n.LimitValue = t[e].LimitValue), (n.Quality = t[e].Quality), (n.AlarmGroupName = t[e].GroupName), (n.ExtendField1 = t[e].ExtendField1), (n.ExtendField2 = t[e].ExtendField2), (a.records = n), o.push(a);
            }
            e.data = o;
        }
        return e;
    }
    KSKVEventType(e) {
        var t = null;
        switch (e) {
            case '报警':
                t = 0;
                break;
            case '报警确认':
                t = 1;
                break;
            case '报警消除':
                t = 3;
                break;
            case '报警恢复':
                t = 2;
        }
        return t;
    }
    KSKVAlarmType(e) {
        var t = null;
        switch (e) {
            case '低低':
            case '低低报警':
                t = 0;
                break;
            case '低报警':
            case '低':
                t = 1;
                break;
            case '高报警':
            case '高':
                t = 2;
                break;
            case '高高':
            case '高高报警':
                t = 3;
                break;
            case '大偏差报警':
            case '大偏差':
                t = 4;
                break;
            case '小偏差报警':
            case '小偏差':
                t = 5;
                break;
            case '变化率报警':
            case '变化率':
                t = 6;
                break;
            case '离散开报警':
            case '离散开':
                t = 7;
                break;
            case '离散关报警':
            case '离散关':
                t = 8;
                break;
            case '离散变化报警':
            case '离散变化':
                t = 9;
                break;
            case '条件报警':
            case '条件':
                t = 10;
        }
        return t;
    }
    KHDataFormatTransform(e, t, o) {
        var a = JSON.parse(e),
            n = a.data,
            r = ['value', 'quality', 'time', 'version'],
            s = [],
            i = {};
        if (n && !a.system) {
            for (let e = 0; e < t.length; e++) {
                var c = t[e];
                i[c] = [];
                for (let e = 0; e < n.length; e++) {
                    var R = n[e];
                    R.TagName === c && i[c].push(R);
                }
            }
            var u = Object.keys(i);
            for (let e = 0; e < u.length; e++) {
                var I = u[e],
                    p = i[I];
                if (p.length > 0) {
                    var l = {};
                    (l.dataPro = r), (l.records = []), (l.records[0] = I), (l.records[1] = p[0].DataType), (l.records[2] = p[0].DataVersion), (l.records[3] = p.length);
                    var d = [];
                    for (let e = 0; e < p.length; e++) {
                        var f = p[e],
                            E = [];
                        (E[0] = f.DataValue), (E[1] = f.QualityStamp || f.Quality), (E[2] = f.TimeStamp), (E[3] = '' + f.DataVersion || '' + f.Version), d.push(E);
                    }
                    (l.records[4] = d), s.push(l);
                }
            }
        } else {
            (s = {}).dataPro = r;
            for (const e in n)
                if (n.hasOwnProperty(e)) {
                    f = n[e];
                    s.records = [];
                    var m = [];
                    (m[0] = e), (m[1] = n[e][0].DataType), (m[2] = n[e][0].DataVersion), (m[3] = n[e].length);
                    var S = [];
                    for (let t = 0; t < n[e].length; t++) {
                        const o = n[e][t];
                        var y = [];
                        (y[0] = o.DataValue), (y[1] = o.QualityStamp), (y[2] = o.TimeStamp), S.push(y);
                    }
                    (m[4] = S), s.records.push(m);
                }
        }
        var A = {};
        return (A.errorCode = a.errorCode), (A.message = a.message), (A.tag_oks = a.tag_oks), 0 === a.errorCode && (1 == o ? (A.Body = s) : (A.data = s)), A;
    }
    KHDataFormatTransform2(e, t, o) {
        var a = JSON.parse(e),
            n = a.data,
            r = [];
        if (n)
            for (let e = 0; e < n.length; e++) {
                var s = {},
                    i = n[e];
                (s.N = i.TagName || t[e]), (s.V = i.DataValue), (s.T = i.TimeStamp), (s.Q = i.Quality || i.QualityStamp), r.push(s);
            }
        var c = {};
        return (c.errorCode = a.errorCode), (c.message = a.message), (c.tag_oks = a.tag_oks), 0 === a.errorCode && (1 == o ? (c.Body = r) : (c.data = r)), c;
    }
    AsynKHQueryRawDatas(e, t, o, a, n, r, s, i, c, R, u, I) {
        var p = this,
            l = p.getRunningServerInfoByAppName(e, o);
        if (0 !== l.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void u(resultInfo);
        var d = {};
        (d.start = n), (d.end = r), (d.dataVersion = s), (d.filter = i), (d.quality = c), (d.tag = []);
        for (var f = 0; f < a.length; f++) d.tag[f] = a[f];
        var E = JSON.stringify(d),
            m = protocol + '//' + l.appInfo + '/api/v1/historydata/rawdata';
        $.ajax({
            url: encodeURI(m),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            contentType: 'application/json',
            async: !0,
            timeout: R,
            data: E,
            type: 'POST',
            success: function (e) {
                var t = p.KHDataFormatTransform(e, a, I);
                u(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), u(-1);
            },
        });
    }
    KHQueryRawDatas(e, t, o, a, n, r, s, i, c, R, u) {
        var I = this,
            p = {},
            l = I.getRunningServerInfoByAppName(e, o);
        if (0 !== l.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var d = {};
        (d.start = n), (d.end = r), (d.dataVersion = s), (d.filter = i), (d.quality = c), (d.tag = []);
        for (var f = 0; f < a.length; f++) d.tag[f] = a[f];
        var E = JSON.stringify(d),
            m = protocol + '//' + l.appInfo + '/api/v1/historydata/rawdata';
        return (
            $.ajax({
                url: encodeURI(m),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                contentType: 'application/json',
                async: !1,
                timeout: R,
                data: E,
                type: 'POST',
                success: function (e) {
                    var t = I.KHDataFormatTransform(e, a, u);
                    p = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (p = -1);
                },
            }),
            p
        );
    }
    AsynKHQueryRawDatas1(e, t, o, a, n, r, s, i, c, R, u) {
        var I = this,
            p = I.getRunningServerInfoByAppName(e, o);
        if (0 !== p.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void u(resultInfo);
        var l = {};
        (l.start = n), (l.recordNumbers = r), (l.version = s), (l.filter = i), (l.quality = c), (l.tag = []);
        for (var d = 0; d < a.length; d++) l.tag[d] = a[d];
        var f = JSON.stringify(l),
            E = protocol + '//' + p.appInfo + '/api/v1/historydata/recordNumbers';
        $.ajax({
            url: encodeURI(E),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            timeout: R,
            contentType: 'application/json',
            type: 'POST',
            data: f,
            success: function (e) {
                var t = I.KHDataFormatTransform(e, a);
                u(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), u(-1);
            },
        });
    }
    KHQueryRawDatas1(e, t, o, a, n, r, s, i, c, R) {
        var u = this,
            I = {},
            p = u.getRunningServerInfoByAppName(e, o);
        if (0 !== p.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var l = {};
        (l.start = n), (l.recordNumbers = r), (l.version = s), (l.filter = i), (l.quality = c), (l.tag = []);
        for (var d = 0; d < a.length; d++) l.tag[d] = a[d];
        var f = JSON.stringify(l),
            E = protocol + '//' + p.appInfo + '/api/v1/historydata/recordNumbers';
        return (
            $.ajax({
                url: encodeURI(E),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !0,
                timeout: R,
                contentType: 'application/json',
                type: 'POST',
                data: f,
                success: function (e) {
                    var t = u.KHDataFormatTransform(e, a);
                    I = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (I = -1);
                },
            }),
            I
        );
    }
    AsynKHAddDatas(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v1/historydata';
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            contentType: 'application/json',
            async: !0,
            timeout: n || httpTimeout,
            data: JSON.stringify(a),
            type: 'POST',
            success: function (e) {
                var t = JSON.parse(e);
                r(t.errorCode);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    KHAddDatas(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v1/historydata';
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                contentType: 'application/json',
                async: !1,
                timeout: n || httpTimeout,
                data: JSON.stringify(a),
                type: 'POST',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynKHQueryRealKHDatas(e, t, o, a, n, r) {
        var s = this,
            i = s.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var c = JSON.stringify(a),
            R = protocol + '//' + i.appInfo + '/api/v1/historydata/currentdata';
        $.ajax({
            url: encodeURI(R),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            data: c,
            contentType: 'application/json',
            timeout: n || httpTimeout,
            type: 'POST',
            success: function (e) {
                var t = s.KHDataFormatTransform2(e, a);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    KHQueryRealKHDatas(e, t, o, a, n) {
        var r = this,
            s = r.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = JSON.stringify(a),
            c = protocol + '//' + s.appInfo + '/api/v1/historydata/currentdata';
        return (
            $.ajax({
                url: encodeURI(c),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                data: i,
                contentType: 'application/json',
                timeout: n || httpTimeout,
                type: 'POST',
                success: function (e) {
                    var t = r.KHDataFormatTransform2(e, a);
                    ret = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (ret = -1);
                },
            }),
            ret
        );
    }
    AsynKHQuerySampleDatas2(e, t, o, a, n, r, s, i, c, R, u, I, p, l) {
        var d = this,
            f = d.getRunningServerInfoByAppName(e, o);
        if (0 !== f.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void p(resultInfo);
        var E = {};
        (E.start = n), (E.end = r), (E.mode = s), (E.interval = i), (E.calculatemode = c), (E.tag = []);
        for (var m = 0; m < a.length; m++) E.tag[m] = a[m];
        var S = JSON.stringify(E),
            y = protocol + '//' + f.appInfo + '/api/v1/historydata/perioddata';
        $.ajax({
            url: encodeURI(y),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            timeout: I,
            type: 'POST',
            data: S,
            contentType: 'application/json',
            success: function (e) {
                var t = d.KHDataFormatTransform(e, a, l);
                p(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), p(-1);
            },
        });
    }
    KHQuerySampleDatas2(e, t, o, a, n, r, s, i, c, R, u, I, p) {
        var l = this,
            d = {},
            f = l.getRunningServerInfoByAppName(e, o);
        if (0 !== f.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var E = {};
        (E.start = n), (E.end = r), (E.mode = s), (E.interval = i), (E.calculatemode = c), (E.tag = []);
        for (var m = 0; m < a.length; m++) E.tag[m] = a[m];
        var S = JSON.stringify(E),
            y = protocol + '//' + f.appInfo + '/api/v1/historydata/perioddata';
        return (
            $.ajax({
                url: encodeURI(y),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                timeout: I,
                type: 'POST',
                data: S,
                contentType: 'application/json',
                success: function (e) {
                    var t = l.KHDataFormatTransform(e, a, p);
                    d = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (d = -1);
                },
            }),
            d
        );
    }
    AsynKHQuerySpecifictimeDatas(e, t, o, a, n, r, s, i, c, R, u) {
        var I = this,
            p = I.getRunningServerInfoByAppName(e, o);
        if (0 !== p.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void R(resultInfo);
        var l = {};
        (l.mode = r), (l.specifictime = n), (l.tag = []);
        for (var d = 0; d < a.length; d++) l.tag[d] = a[d];
        var f = JSON.stringify(l),
            E = protocol + '//' + p.appInfo + '/api/v1/historydata/specifictimedata';
        $.ajax({
            url: encodeURI(E),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            timeout: c,
            type: 'POST',
            data: f,
            contentType: 'application/json',
            success: function (e) {
                var t = I.KHDataFormatTransform2(e, a, u);
                R(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), R(-1);
            },
        });
    }
    AsynKHQueryGroupList(e, t, o, a, n) {
        var r = this.getRunningServerInfoByAppName(e, o);
        if (0 !== r.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void n(resultInfo);
        var s = protocol + '//' + r.appInfo + '/api/v2/khgrouplist';
        $.ajax({
            url: encodeURI(s),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            timeout: a,
            type: 'GET',
            contentType: 'application/json',
            success: function (e) {
                let t = JSON.parse(e);
                n(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), n(-1);
            },
        });
    }
    AsynKHQueryTagList(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        let i = {
            groupId: a,
        };
        var c = protocol + '//' + s.appInfo + '/api/v2/khtaglist';
        $.ajax({
            url: encodeURI(c),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            timeout: n,
            type: 'GET',
            data: i,
            contentType: 'application/json',
            success: function (e) {
                let t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    KSSAsynConfirmTagAlarm(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/confirmtagalarm',
            c = {
                tagArray: a,
            };
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            type: 'POST',
            async: !0,
            data: JSON.stringify(c),
            timeout: n || httpTimeout,
            contentType: 'application/json',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    KSSConfirmTagAlarm(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/confirmtagalarm',
            c = {
                tagArray: a,
            };
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                type: 'POST',
                async: !1,
                data: JSON.stringify(c),
                timeout: n || httpTimeout,
                contentType: 'application/json',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    KSSAsynQueryHistoryAlarmDatas(e, t, o, a, n, r, s) {
        var i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void s(resultInfo);
        var c = {
                startTime: a,
                endTime: n,
            },
            R = JSON.stringify(c),
            u = protocol + '//' + i.appInfo + '/api/v2/historyalarmdata';
        $.ajax({
            url: encodeURI(u),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            timeout: r || httpTimeout,
            type: 'POST',
            data: R,
            success: function (e) {
                var t = JSON.parse(e),
                    o = t.data,
                    a = [];
                if (t) {
                    for (let e = 0; e < o.length; e++) {
                        var n = {};
                        n.N = o[e].tag_name;
                        var r = {};
                        (r.AlarmDateTime = o[e].alarm_time), (r.TagType = ''), (r.AlarmType = o[e].alarm_type), (r.AlarmText = o[e].alarm_text), (r.AlarmValue = o[e].alarm_value), (r.EventType = o[e].event_type), (r.EventDateTime = o[e].event_time), (r.LimitValue = o[e].alarm_line), (r.Quality = o[e].quality), (r.AlarmGroupName = ''), (r.ExtendField1 = o[e].extend_field_string1), (r.ExtendField2 = o[e].extend_field_string2), (n.records = r), a.push(n);
                    }
                    (datainfo = {}), (datainfo.errorCode = t.errorCode), (datainfo.message = t.message), (datainfo.data = a);
                }
                s(datainfo);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), s(-1);
            },
        });
    }
    AlarmProjectConfirmTagAlarm(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/confirmtagalarm',
            c = {
                tagArray: a,
            };
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            type: 'POST',
            async: !0,
            data: JSON.stringify(c),
            timeout: n || httpTimeout,
            contentType: 'application/json',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    SynAlarmProjectConfirmTagAlarm(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/confirmtagalarm',
            c = {
                tagArray: a,
            };
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                type: 'POST',
                async: !1,
                data: JSON.stringify(c),
                timeout: n || httpTimeout,
                contentType: 'application/json',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AlarmProjectQueryHistoryAlarmDatas(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/historyalarmdata';
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            type: 'GET',
            data: a,
            timeout: n || httpTimeout,
            contentType: 'application/json',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    SynAlarmProjectQueryHistoryAlarmDatas(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/historyalarmdata';
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                type: 'GET',
                data: a,
                timeout: n || httpTimeout,
                contentType: 'application/json',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AlarmProjectDeleteAlarm(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/deletealarm';
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            data: JSON.stringify(a),
            contentType: 'application/json',
            timeout: n || httpTimeout,
            type: 'DELETE',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    SynAlarmProjectDeleteAlarm(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/deletealarm';
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                data: JSON.stringify(a),
                contentType: 'application/json',
                timeout: n || httpTimeout,
                type: 'DELETE',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AlarmProjectQueryCacheAlarmDatas(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/alarmcache';
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            contentType: 'application/json',
            type: 'GET',
            async: !0,
            data: a,
            timeout: n || httpTimeout,
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    SynAlarmProjectQueryCacheAlarmDatas(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/alarmcache';
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                contentType: 'application/json',
                type: 'GET',
                async: !1,
                data: a,
                timeout: n || httpTimeout,
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AlarmProjectQueryAlarmConfig(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/getalarmconfig';
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            type: 'GET',
            async: !0,
            data: a,
            contentType: 'application/json',
            timeout: n || httpTimeout,
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    SynAlarmProjectQueryAlarmConfig(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/getalarmconfig';
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                type: 'GET',
                async: !1,
                data: a,
                contentType: 'application/json',
                timeout: n || httpTimeout,
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AlarmProjectQueryAlarmConfigOfTag(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/getalarmconfigoftag';
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            contentType: 'application/json',
            type: 'POST',
            async: !0,
            timeout: n || httpTimeout,
            data: JSON.stringify(a),
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(tip), r(-1);
            },
        });
    }
    SynAlarmProjectQueryAlarmConfigOfTag(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/getalarmconfigoftag';
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                contentType: 'application/json',
                type: 'POST',
                async: !1,
                timeout: n || httpTimeout,
                data: JSON.stringify(a),
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(tip), (r = -1);
                },
            }),
            r
        );
    }
    AlarmProjectQueryAlarmConfigOfCondition(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/getalarmconfigofcondition';
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            contentType: 'application/json',
            async: !0,
            timeout: n || httpTimeout,
            type: 'POST',
            data: JSON.stringify(a),
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    SynAlarmProjectQueryAlarmConfigOfCondition(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/getalarmconfigofcondition';
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                contentType: 'application/json',
                async: !1,
                timeout: n || httpTimeout,
                type: 'POST',
                data: JSON.stringify(a),
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AlarmProjectSetAlarmConfigOfTag(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/setalarmconfigoftag';
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            type: 'POST',
            async: !0,
            timeout: n || httpTimeout,
            contentType: 'application/json',
            data: JSON.stringify(a),
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    SynAlarmProjectSetAlarmConfigOfTag(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/setalarmconfigoftag';
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                type: 'POST',
                async: !1,
                timeout: n || httpTimeout,
                contentType: 'application/json',
                data: JSON.stringify(a),
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AlarmProjectSetAlarmConfigOfCondition(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/setalarmconfigofcondition';
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            data: JSON.stringify(a),
            timeout: n || httpTimeout,
            contentType: 'application/json',
            type: 'POST',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    AlarmProjectSetAlarmConfigOfCondition(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/setalarmconfigofcondition';
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                data: JSON.stringify(a),
                timeout: n || httpTimeout,
                contentType: 'application/json',
                type: 'POST',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynAlarmProjectQueryAlarmGroup(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v2/getalarmgroup';
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            type: 'GET',
            async: !0,
            timeout: n || httpTimeout,
            data: a,
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    AlarmProjectQueryAlarmGroup(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = protocol + '//' + s.appInfo + '/api/v2/getalarmgroup';
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                type: 'GET',
                async: !0,
                timeout: n || httpTimeout,
                data: a,
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynRedisGet(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = 'http://' + s.appInfo + '/api/v1/nosqldata',
            c = {
                function: 'get',
                filter: {
                    key: a,
                },
            };
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            contentType: 'application/json',
            async: !0,
            timeout: n || 3e3,
            data: c,
            type: 'GET',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    RedisGet(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = 'http://' + s.appInfo + '/api/v1/nosqldata',
            c = {
                function: 'get',
                filter: {
                    key: a,
                },
            };
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                contentType: 'application/json',
                async: !1,
                timeout: n || 3e3,
                data: c,
                type: 'GET',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynRedisSet(e, t, o, a, n, r, s) {
        var i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void s(resultInfo);
        var c = 'http://' + i.appInfo + '/api/v1/nosqldata',
            R = {
                function: 'set',
                filter: {
                    key: a,
                },
                data: n,
            };
        $.ajax({
            url: encodeURI(c),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            contentType: 'application/json',
            timeout: r || httpTimeout,
            async: !0,
            data: JSON.stringify(R),
            type: 'POST',
            success: function (e) {
                var t = JSON.parse(e);
                s(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), s(-1);
            },
        });
    }
    RedisSet(e, t, o, a, n, r) {
        var s = {},
            i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var c = 'http://' + i.appInfo + '/api/v1/nosqldata',
            R = {
                function: 'set',
                filter: {
                    key: a,
                },
                data: n,
            };
        return (
            $.ajax({
                url: encodeURI(c),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                contentType: 'application/json',
                timeout: r || httpTimeout,
                async: !1,
                data: JSON.stringify(R),
                type: 'POST',
                success: function (e) {
                    var t = JSON.parse(e);
                    s = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (s = -1);
                },
            }),
            s
        );
    }
    AsynRedisDel(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = 'http://' + s.appInfo + '/api/v1/nosqldata',
            c = {
                function: 'del',
                filter: {
                    key: a,
                },
            };
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            timeout: n || httpTimeout,
            contentType: 'application/json',
            async: !0,
            data: JSON.stringify(c),
            type: 'POST',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    RedisDel(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = 'http://' + s.appInfo + '/api/v1/nosqldata',
            c = {
                function: 'del',
                filter: {
                    key: a,
                },
            };
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                timeout: n || httpTimeout,
                contentType: 'application/json',
                async: !1,
                data: JSON.stringify(c),
                type: 'POST',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynRedisHashGet(e, t, o, a, n, r, s) {
        var i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void s(resultInfo);
        var c = 'http://' + i.appInfo + '/api/v1/nosqldata',
            R = {
                function: 'hget',
                filter: {
                    key: a,
                    field: n,
                },
            };
        $.ajax({
            url: encodeURI(c),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            timeout: r || httpTimeout,
            contentType: 'application/json',
            async: !0,
            data: R,
            type: 'GET',
            success: function (e) {
                var t = JSON.parse(e);
                s(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), s(-1);
            },
        });
    }
    RedisHashGet(e, t, o, a, n, r) {
        var s = {},
            i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var c = 'http://' + i.appInfo + '/api/v1/nosqldata',
            R = {
                function: 'hget',
                filter: {
                    key: a,
                    field: n,
                },
            };
        return (
            $.ajax({
                url: encodeURI(c),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                timeout: r || httpTimeout,
                contentType: 'application/json',
                async: !1,
                data: R,
                type: 'GET',
                success: function (e) {
                    var t = JSON.parse(e);
                    s = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (s = -1);
                },
            }),
            s
        );
    }
    AsynRedisHashSet(e, t, o, a, n, r, s, i) {
        var c = this.getRunningServerInfoByAppName(e, o);
        if (0 !== c.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void i(resultInfo);
        var R = 'http://' + c.appInfo + '/api/v1/nosqldata',
            u = {
                function: 'hset',
                data: r,
                filter: {
                    key: a,
                    field: n,
                },
            };
        $.ajax({
            url: encodeURI(R),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            timeout: s || httpTimeout,
            contentType: 'application/json',
            async: !0,
            data: JSON.stringify(u),
            type: 'POST',
            success: function (e) {
                var t = JSON.parse(e);
                i(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), i(-1);
            },
        });
    }
    RedisHashSet(e, t, o, a, n, r, s) {
        var i = {},
            c = this.getRunningServerInfoByAppName(e, o);
        0 !== c.code && ((resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), (i = resultInfo));
        var R = 'http://' + c.appInfo + '/api/v1/nosqldata',
            u = {
                function: 'hset',
                data: r,
                filter: {
                    key: a,
                    field: n,
                },
            };
        return (
            $.ajax({
                url: encodeURI(R),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                timeout: s || httpTimeout,
                contentType: 'application/json',
                async: !1,
                data: JSON.stringify(u),
                type: 'POST',
                success: function (e) {
                    var t = JSON.parse(e);
                    i = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (i = -1);
                },
            }),
            i
        );
    }
    AsynRedisHashDel(e, t, o, a, n, r, s) {
        var i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void s(resultInfo);
        var c = 'http://' + i.appInfo + '/api/v1/nosqldata',
            R = {
                function: 'hdel',
                filter: {
                    key: a,
                    field: n,
                },
            };
        $.ajax({
            url: encodeURI(c),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            timeout: r || httpTimeout,
            contentType: 'application/json',
            async: !0,
            data: JSON.stringify(R),
            type: 'POST',
            success: function (e) {
                var t = JSON.parse(e);
                s(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), s(-1);
            },
        });
    }
    RedisHashDel(e, t, o, a, n, r) {
        var s = {},
            i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var c = 'http://' + i.appInfo + '/api/v1/nosqldata',
            R = {
                function: 'hdel',
                filter: {
                    key: a,
                    field: n,
                },
            };
        return (
            $.ajax({
                url: encodeURI(c),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                timeout: r || httpTimeout,
                contentType: 'application/json',
                async: !1,
                data: JSON.stringify(R),
                type: 'POST',
                success: function (e) {
                    var t = JSON.parse(e);
                    s = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (s = -1);
                },
            }),
            s
        );
    }
    AsynRedisExists(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = 'http://' + s.appInfo + '/api/v1/nosqldata',
            c = {
                filter: {
                    key: a,
                },
                function: 'exists',
            };
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            timeout: n || httpTimeout,
            contentType: 'application/json',
            data: c,
            type: 'GET',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    RedisExists(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = 'http://' + s.appInfo + '/api/v1/nosqldata',
            c = {
                filter: {
                    key: a,
                },
                function: 'exists',
            };
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                timeout: n || httpTimeout,
                contentType: 'application/json',
                data: c,
                type: 'GET',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynRedisHashGetAll(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = 'http://' + s.appInfo + '/api/v1/nosqldata',
            c = {
                function: 'hgetall',
                filter: {
                    key: a,
                },
            };
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            timeout: n || httpTimeout,
            contentType: 'application/json',
            async: !0,
            data: c,
            type: 'GET',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    RedisHashGetAll(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = 'http://' + s.appInfo + '/api/v1/nosqldata',
            c = {
                function: 'hgetall',
                filter: {
                    key: a,
                },
            };
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                timeout: n || httpTimeout,
                contentType: 'application/json',
                async: !1,
                data: c,
                type: 'GET',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynRedisGetRealTimeVariablesList(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = 'http://' + s.appInfo + '/api/v1/redisvariable',
            c = {
                projectInstanceName: a,
                function: 'get',
                type: 1,
            };
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            timeout: n || httpTimeout,
            contentType: 'application/json',
            async: !0,
            data: c,
            type: 'GET',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    RedisGetRealTimeVariablesList(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var i = 'http://' + s.appInfo + '/api/v1/redisvariable',
            c = {
                projectInstanceName: a,
                function: 'get',
                type: 1,
            };
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                timeout: n || httpTimeout,
                contentType: 'application/json',
                async: !1,
                data: c,
                type: 'GET',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynRedisGetVariableFileds(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = 'http://' + s.appInfo + '/api/v1/redisvariable',
            c = {
                projectInstanceName: a,
                function: 'get',
                type: 2,
            };
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            timeout: n || httpTimeout,
            contentType: 'application/json',
            async: !0,
            data: c,
            type: 'GET',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    RedisGetVariableFileds(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void callback(resultInfo);
        var i = 'http://' + s.appInfo + '/api/v1/redisvariable',
            c = {
                projectInstanceName: a,
                function: 'get',
                type: 2,
            };
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                timeout: n || httpTimeout,
                contentType: 'application/json',
                async: !0,
                data: c,
                type: 'GET',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynRedisGetVariableFiledValue(e, t, o, a, n, r, s) {
        var i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void s(resultInfo);
        var c = 'http://' + i.appInfo + '/api/v1/redisvariable',
            R = {
                projectInstanceName: a,
                longValueName: n,
                function: 'get',
                type: 3,
            };
        $.ajax({
            url: encodeURI(c),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            timeout: r || httpTimeout,
            contentType: 'application/json',
            data: R,
            type: 'GET',
            success: function (e) {
                var t = JSON.parse(e);
                s(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), s(-1);
            },
        });
    }
    RedisGetVariableFiledValue(e, t, o, a, n, r) {
        var s = {},
            i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var c = 'http://' + i.appInfo + '/api/v1/redisvariable',
            R = {
                projectInstanceName: a,
                longValueName: n,
                function: 'get',
                type: 3,
            };
        return (
            $.ajax({
                url: encodeURI(c),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                timeout: r || httpTimeout,
                contentType: 'application/json',
                data: R,
                type: 'GET',
                success: function (e) {
                    var t = JSON.parse(e);
                    s = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (s = -1);
                },
            }),
            s
        );
    }
    AsynRedisGetRealTimeVariableValue(e, t, o, a, n, r, s) {
        var i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void s(resultInfo);
        var c = 'http://' + i.appInfo + '/api/v1/redisvariable',
            R = {
                projectInstanceName: a,
                longValueName: n,
                function: 'get',
                type: 4,
            };
        $.ajax({
            url: encodeURI(c),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            timeout: r || httpTimeout,
            contentType: 'application/json',
            data: R,
            type: 'GET',
            success: function (e) {
                var t = JSON.parse(e);
                s(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), s(-1);
            },
        });
    }
    RedisGetRealTimeVariableValue(e, t, o, a, n, r) {
        var s = {},
            i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), resultInfo;
        var c = 'http://' + i.appInfo + '/api/v1/redisvariable',
            R = {
                projectInstanceName: a,
                longValueName: n,
                function: 'get',
                type: 4,
            };
        return (
            $.ajax({
                url: encodeURI(c),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                timeout: r || httpTimeout,
                contentType: 'application/json',
                data: R,
                type: 'GET',
                success: function (e) {
                    var t = JSON.parse(e);
                    s = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (s = -1);
                },
            }),
            s
        );
    }
    AsynOpenTSDBQuery(e, t, o, a, n, r) {
        var s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void r(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v1/opentsdbquery';
        $.ajax({
            url: encodeURI(i),
            headers: {
                Authorization: 'Bearer ' + o,
                datasourcename: encodeURIComponent(t),
            },
            datatype: 'json',
            async: !0,
            timeout: n,
            contentType: 'application/json',
            data: JSON.stringify(a),
            type: 'POST',
            success: function (e) {
                var t = JSON.parse(e);
                r(t);
            },
            error: function (e, t, o) {
                console.log(ERRORTIP), r(-1);
            },
        });
    }
    OpenTSDBQuery(e, t, o, a, n) {
        var r = {},
            s = this.getRunningServerInfoByAppName(e, o);
        if (0 !== s.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void callback(resultInfo);
        var i = protocol + '//' + s.appInfo + '/api/v1/opentsdbquery';
        return (
            $.ajax({
                url: encodeURI(i),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !1,
                timeout: n,
                contentType: 'application/json',
                data: JSON.stringify(a),
                type: 'POST',
                success: function (e) {
                    var t = JSON.parse(e);
                    r = t;
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), (r = -1);
                },
            }),
            r
        );
    }
    AsynMQTTPublish(e, t, o, a, n, r, s) {
        var i = this.getRunningServerInfoByAppName(e, o);
        if (0 !== i.code) return (resultInfo.errorCode = APIERRCODE.SERVERDISCOVERFAIL), (resultInfo.message = APIERRINFO.SERVERDISCOVERFAIL), void s(resultInfo);
        var c = protocol + '//' + i.appInfo + '/api/v1/mqtt/publish',
            R = {};
        (R.mqttTopic = a),
            (R.mqttData = n),
            $.ajax({
                url: encodeURI(c),
                headers: {
                    Authorization: 'Bearer ' + o,
                    datasourcename: encodeURIComponent(t),
                },
                datatype: 'json',
                async: !0,
                data: JSON.stringify(R),
                type: 'POST',
                contentType: 'application/json',
                timeout: r,
                success: function (e) {
                    var t = JSON.parse(e);
                    s(t);
                },
                error: function (e, t, o) {
                    console.log(ERRORTIP), s(-1);
                },
            });
    }
}

function generateUUID() {
    var e = new Date().getTime();
    return 'cxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (t) {
        var o = (e + 16 * Math.random()) % 16 | 0;
        return (e = Math.floor(e / 16)), ('x' == t ? o : (3 & o) | 8).toString(16);
    });
}

function WsCommunication(e, t) {
    var o = this;
    if (((o.pingTimeout = 15e3), (o.pangTimeout = 1e4), (o.reconnectTimeout = 2e3), (o.reconnectTimeoutID = null), (o.pingMsg = 'ping'), (o.url = e), (o.funcAddress = t), (o.needSendMess = new Array()), (o.reconnectCount = 0), (o.client = null), o.url.slice(0, o.url.lastIndexOf(':')) === window.location.hostname)) o.newUrl = 'http:' === protocol ? 'ws://' + o.url : 'wss://' + o.url;
    else {
        var a = o.url.slice(o.url.lastIndexOf(':'));
        o.newUrl = 'http:' === protocol ? 'ws://' + window.location.hostname + a + '/' : 'wss://' + window.location.hostname + a + '/';
    }
    (o.createWebSocket = function () {
        try {
            (o.client = new WebSocket(o.newUrl)), o.initEvevtHandle();
        } catch (e) {
            o.reconnect(), console.log('WS重连错误信息：', e.message);
        }
    }),
        (o.initEvevtHandle = function () {
            (o.client.onopen = function () {
                if ((console.log('webSocket connect success!'), o.reconnectCount > 0 && (o.reconnectCount = 0), o.heartCheck(), 'false' === window.sessionStorage.wsConnectState && !0 === isSendReconnectInfo)) {
                    var e = [];
                    Array.from(subscribeConetentCache.values()).forEach((t) => {
                        var o = JSON.parse(t);
                        (o.reConnectFlag = !0), (t = JSON.stringify(o)), e.push(t);
                    }),
                        (o.needSendMess = e);
                }
                if (((window.sessionStorage.wsConnectState = 'true'), o.needSendMess.length > 0)) {
                    for (var t = 0; t < o.needSendMess.length; ++t) o.client.send(o.needSendMess[t]);
                    o.needSendMess.splice(0, o.needSendMess.length);
                }
            }),
                (o.client.onmessage = function (e) {
                    switch ((o.heartCheck(), e.data)) {
                        case 'pang':
                            break;
                        case 'SendReconnect':
                            if ('true' === window.sessionStorage.wsConnectState) {
                                var t = [];
                                Array.from(subscribeConetentCache.values()).forEach((e) => {
                                    var o = JSON.parse(e);
                                    (o.reConnectFlag = !0), (e = JSON.stringify(o)), t.push(e);
                                }),
                                    (o.needSendMess = t);
                            }
                            if (o.needSendMess.length > 0) {
                                for (var a = 0; a < o.needSendMess.length; ++a) o.client.send(o.needSendMess[a]);
                                o.needSendMess.splice(0, o.needSendMess.length);
                            }
                            break;
                        default:
                            o.funcAddress(e);
                    }
                }),
                (o.client.onerror = function () {
                    console.log('connect error!'), o.reconnect();
                }),
                (o.client.onclose = function () {
                    'true' === window.sessionStorage.wsConnectState && ((window.sessionStorage.wsConnectState = 'false'), o.reconnect());
                });
        }),
        (o.reconnect = function () {
            o.lockReconnect ||
                ((o.lockReconnect = !0),
                o.reconnectTimeoutID && (clearTimeout(o.reconnectTimeoutID), (o.reconnectTimeoutID = null)),
                (o.reconnectTimeoutID = setTimeout(function () {
                    o.createWebSocket(), (o.lockReconnect = !1), o.reconnectCount++;
                }, o.reconnectTimeout)));
        }),
        (o.send = function (e) {
            o.client && (1 === o.client.readyState ? o.client.send(e) : o.needSendMess.push(e));
        }),
        (o.heartCheck = function () {
            o.heartReset(), o.heartStart();
        }),
        (o.heartStart = function () {
            o.forbidReconnect ||
                (o.pingTimeoutId = setTimeout(function () {
                    1 === o.client.readyState ? o.send(o.pingMsg) : o.client.readyState,
                        (o.pangTimeoutId = setTimeout(function () {
                            o.client.onclose();
                        }, o.pangTimeout));
                }, o.pingTimeout));
        }),
        (o.heartReset = function () {
            clearTimeout(o.pingTimeoutId), clearTimeout(o.pangTimeoutId);
        }),
        (o.close = function () {
            o.client.close();
        }),
        (o.setOnmessage = function (e) {
            o.funcAddress = e;
        }),
        o.createWebSocket();
}
DataSourceManagerRunningAPI.getInstance = function () {
    return void 0 === DataSourceManagerRunningAPI.DataSourceAPI && (DataSourceManagerRunningAPI.DataSourceAPI = new DataSourceManagerRunningAPI()), DataSourceManagerRunningAPI.DataSourceAPI;
};
