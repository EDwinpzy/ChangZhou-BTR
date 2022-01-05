var KMDatasourceFactory = function (e) {
    return 'number' == typeof e && (e = DataSourceType[e]), this instanceof KMDatasourceFactory ? new this[e]() : new KMDatasourceFactory(e);
};

function KMDatasourceBase() {
    (this.name = ''),
        (this.id = ''),
        (this.appName = ''),
        (this.dataSourceName = ''),
        (this.type = ''),
        (this.projectGroupName = ''),
        (this.list = []),
        (this.comment = ''),
        (this.isDirectConnection = !1),
        (this.serverHost = ''),
        (this.baseJsonToObejct = function (e) {
            this.setKPName(e.name), this.setAppName(e.appName), this.setDataSourceName(e.dataSourceName), this.setType(e.type), this.setId(e.id), this.setProjectGroup(e.projectGroupName), this.setList(e.list), this.setComment(e.comment), 'false' === e.isDirectConnection || !1 === e.isDirectConnection || void 0 === e.isDirectConnection ? (this.isDirectConnection = !1) : (this.isDirectConnection = !0), (this.serverHost = e.serverHost);
        }),
        (this.baseObjectToJson = function () {
            return (object = {
                name: this.getKPName(),
                appName: this.getAppName(),
                dataSourceName: this.getDataSourceName(),
                id: this.getId(),
                type: this.getType(),
                projectGroupName: this.getProjectGroup(),
                list: this.getList(),
                comment: this.getComment(),
                isDirectConnection: this.isDirectConnection,
                serverHost: this.serverHost,
            });
        }),
        (this.setKPName = function (e) {
            this.name = e;
        }),
        (this.getKPName = function () {
            return this.name;
        }),
        (this.setAppName = function (e) {
            this.appName = e;
        }),
        (this.getAppName = function () {
            return this.appName;
        }),
        (this.setDataSourceName = function (e) {
            this.dataSourceName = e;
        }),
        (this.getDataSourceName = function () {
            return this.dataSourceName;
        }),
        (this.setType = function (e) {
            this.type = e;
        }),
        (this.getType = function () {
            return this.type;
        }),
        (this.setId = function (e) {
            this.id = e || idBuilder.generateUUID();
        }),
        (this.getId = function () {
            return this.id;
        }),
        (this.setProjectGroup = function (e) {
            this.projectGroupName = e;
        }),
        (this.getProjectGroup = function () {
            return this.projectGroupName;
        }),
        (this.setList = function (e) {
            this.list = e;
        }),
        (this.getList = function () {
            return this.list;
        }),
        (this.setComment = function (e) {
            this.comment = e;
        }),
        (this.getComment = function () {
            return this.comment;
        });
}

function KMDatasourceSQL() {
    KMDatasourceBase.call(this),
        (this.SQLExecute = function (e, t, a, n) {
            0 === e ? DataSourceManagerRunningAPI.getInstance().AsynSQLQuery(this.appName, this.dataSourceName, getToken(), t, a, n, !1, this.isDirectConnection, this.serverHost) : 1 === e && DataSourceManagerRunningAPI.getInstance().AsynSQLExecute(this.appName, this.dataSourceName, getToken(), t, a, n, this.isDirectConnection, this.serverHost);
        }),
        (this.SQLExecute1 = function (e, t, a, n) {
            0 === e ? DataSourceManagerRunningAPI.getInstance().AsynSQLQuery(this.appName, this.dataSourceName, getToken(), t, a, n, !0, this.isDirectConnection, this.serverHost) : 1 === e && DataSourceManagerRunningAPI.getInstance().AsynSQLExecute(this.appName, this.dataSourceName, getToken(), t, a, n, this.isDirectConnection, this.serverHost);
        }),
        (this.SyncSQLExecute = function (e, t, a, n) {
            var res = {};
            0 === e ? (res = DataSourceManagerRunningAPI.getInstance().SQLQuery(this.appName, this.dataSourceName, getToken(), t, a, n, this.isDirectConnection, this.serverHost)) : 1 === e && (res = DataSourceManagerRunningAPI.getInstance().SQLExecute(this.appName, this.dataSourceName, getToken(), t, a, n, this.isDirectConnection, this.serverHost));
            return res;
        }),
        (this.SQLOperate1 = function (e, t, a, n, s) {
            switch (e) {
                case 'insertData':
                    DataSourceManagerRunningAPI.getInstance().AsynDBInsert(this.appName, this.dataSourceName, getToken(), t, a, n, s);
                    break;
                case 'createTable':
                    DataSourceManagerRunningAPI.getInstance().AsynDBCreateTable(this.appName, this.dataSourceName, getToken(), t, a, n, s);
                    break;
                case 'updateTable':
                    DataSourceManagerRunningAPI.getInstance().AsynDBAlterTable(this.appName, this.dataSourceName, getToken(), t, a, n, s);
                    break;
                default:
                    console.log('operation type is invalid!');
            }
        }),
        (this.SQLOperate2 = function (e, t, a, n) {
            switch (e) {
                case 'queryTable':
                    DataSourceManagerRunningAPI.getInstance().AsynDBQuery(this.appName, this.dataSourceName, getToken(), t, a, n);
                    break;
                case 'deleteData':
                    DataSourceManagerRunningAPI.getInstance().AsynDBDelete(this.appName, this.dataSourceName, getToken(), t, a, n);
                    break;
                case 'updateData':
                    DataSourceManagerRunningAPI.getInstance().AsynDBUpdate(this.appName, this.dataSourceName, getToken(), t, a, n);
                    break;
                case 'clearTable':
                    DataSourceManagerRunningAPI.getInstance().AsynDBClearTable(this.appName, this.dataSourceName, getToken(), t, a, n);
                    break;
                case 'dropTable':
                    DataSourceManagerRunningAPI.getInstance().AsynDBDeleteTable(this.appName, this.dataSourceName, getToken(), t, a, n);
                    break;
                case 'getTableInfo':
                    DataSourceManagerRunningAPI.getInstance().AsynDBGetTableColumns(this.appName, this.dataSourceName, getToken(), t, a, n);
                    break;
                case 'getTableCount':
                    DataSourceManagerRunningAPI.getInstance().AsynDBGetTableCount(this.appName, this.dataSourceName, getToken(), t, a, n);
                    break;
                case 'getTableName':
                    DataSourceManagerRunningAPI.getInstance().AsynDBGetTables(this.appName, this.dataSourceName, getToken(), t, a, n);
                    break;
                case 'getViews':
                    DataSourceManagerRunningAPI.getInstance().AsynDBGetViews(this.appName, this.dataSourceName, getToken(), t, a, n);
                    break;
                default:
                    console.log('operation type is invalid!');
            }
        }),
        (this.SQLOperate3 = function (e, t, a, n, s, i) {
            switch (e) {
                case 'getTablePagination':
                    DataSourceManagerRunningAPI.getInstance().AsynDBGetPages(this.appName, this.dataSourceName, getToken(), t, a, n, s, i);
                    break;
                case 'executeSP':
                    DataSourceManagerRunningAPI.getInstance().AsynDBQuerySP(this.appName, this.dataSourceName, getToken(), t, a, n, s, i);
                    break;
                default:
                    console.log('operation type is invalid!');
            }
        }),
        (this.executeSQLByTable1 = function (e, t, a, n) {
            var s = this;
            t && 'getTableName' !== e
                ? DataSourceManagerRunningAPI.getInstance().AsynGetNameID(this.appName, this.dataSourceName, getToken(), t, a, function (i) {
                      'string' == typeof i && (i = JSON.parse(i)), 0 == i.errorCode ? ((t = i.enumID), s.SQLOperate2(e, t, a, n)) : console.log('Get id failed!');
                  })
                : s.SQLOperate2(e, t, a, n);
        }),
        (this.executeSQLByTable2 = function (e, t, a, n, s) {
            var i = this;
            t &&
                'createTable' !== e &&
                'getViews' !== e &&
                DataSourceManagerRunningAPI.getInstance().AsynGetNameID(this.appName, this.dataSourceName, getToken(), t, n, function (r) {
                    'string' == typeof r && (r = JSON.parse(r)), 0 == r.errorCode ? ((t = r.enumID), i.SQLOperate1(e, t, a, n, s)) : console.log('Get id failed!');
                }),
                ('createTable' != e && 'getTableName' != e && 'getViews' != e) || i.SQLOperate1(e, t, a, n, s);
        }),
        (this.executeSQLByTable3 = function (e, t, a, n) {
            var s = this;
            t.tableName &&
                'createTable' !== e &&
                DataSourceManagerRunningAPI.getInstance().AsynGetNameID(this.appName, this.dataSourceName, getToken(), t.tableName, a, function (i) {
                    if (('string' == typeof i && (i = JSON.parse(i)), 0 == i.errorCode)) {
                        if (((t.tableName = i.enumID), t.filter)) {
                            var r = [];
                            t.hasOwnProperty('select') && (r = t.select.params);
                            var o = [];
                            t.hasOwnProperty('order') && t.hasOwnProperty('columnName') && o.push(t.columnName);
                            var c = [];
                            t.hasOwnProperty('filter') &&
                                t.filter.items.forEach((e, t, a) => {
                                    for (let t in e) 1 == e[t] && c.push(t);
                                });
                            var u = r.concat(o).concat(c);
                            DataSourceManagerRunningAPI.getInstance().AsynGetTitleID(s.appName, s.dataSourceName, getToken(), t.tableName, u, a, function (i) {
                                'string' == typeof i && (i = JSON.parse(i)),
                                    0 == i.errorCode &&
                                        ('queryTable' == e
                                            ? ((t.select.params = i.enumIDs.splice(0, t.select.params.length)),
                                              (t.columnName = i.enumIDs.splice(0, 1)[0]),
                                              t.filter.items.forEach((e, t, a) => {
                                                  for (let a in e) 1 == e[a] && (0 == t ? ((e[i.enumIDs[t]] = e[a]), delete e[a]) : ((e[i.enumIDs[t / 2]] = e[a]), delete e[a]));
                                              }),
                                              s.SQLOperate2(e, t, a, n))
                                            : (t.filter.items.forEach((e, t, a) => {
                                                  for (let a in e) 1 == e[a] && (0 == t ? ((e[i.enumIDs[t]] = e[a]), delete e[a]) : ((e[i.enumIDs[t / 2]] = e[a]), delete e[a]));
                                              }),
                                              s.SQLOperate2(e, t, a, n)));
                            });
                        }
                    } else console.log('Get id failed!');
                });
        }),
        (this.executeSQLByTable4 = function (e, t, a, n, s, i) {
            var r = this;
            t && a && 'executeSP' != e
                ? DataSourceManagerRunningAPI.getInstance().AsynGetNameID(this.appName, this.dataSourceName, getToken(), t, s, function (o) {
                      'string' == typeof o && (o = JSON.parse(o)), 0 == o.errorCode ? ((t = o.enumID), console.log(e + ': ' + t + ': ' + a + ': ' + n), r.SQLOperate3(e, t, a, n, s, i)) : console.log('Get id failed!');
                  })
                : 'executeSP' == e && r.SQLOperate3(e, t, a, n, s, i);
        }),
        (this.jsonToObject = function (e) {
            this.baseJsonToObejct(e);
        }),
        (this.objectToJson = function () {
            return this.baseObjectToJson();
        });
}

function KMDatasourceRedis() {
    KMDatasourceBase.call(this);
}

function KMDatasourceMongoDB() {
    KMDatasourceBase.call(this);
}

function KMRealTimeDatasource() {
    KMDatasourceBase.call(this),
        (this.link = {
            subscribe: new Map(),
            request: new Map(),
        }),
        (this.currentLinkedProjectVar = []),
        (this.dynamicAdd = new KMDynamicAddTag(this));
}

function KMDatasourceKH() {
    KMRealTimeDatasource.call(this),
        (this.jsonToObject = function (e) {
            this.baseJsonToObejct(e);
        }),
        (this.objectToJson = function () {
            return this.baseObjectToJson();
        }),
        (this.KHQueryRawDatas = function (e, t, a, n, s, i, r, o, c) {
            DataSourceManagerRunningAPI.getInstance().AsynKHQueryRawDatas(this.appName, this.dataSourceName, getToken(), e, t, a, n, s, i, r, o, c, this.isDirectConnection, this.serverHost);
        }),
        (this.KHAddDatas = function (e, t) {
            DataSourceManagerRunningAPI.getInstance().AsynKHAddDatas(this.appName, this.dataSourceName, getToken(), e, t, this.isDirectConnection, this.serverHost);
        }),
        (this.KHQuerySampleDatas1 = function (e, t, a, n) {
            DataSourceManagerRunningAPI.getInstance().AsynKHQueryRawDatas(this.appName, this.dataSourceName, getToken(), e, t, a, n, this.isDirectConnection, this.serverHost);
        }),
        (this.KHQuerySampleDatas2 = function (e, t, a, n, s, i, r, o, c, u, g) {
            DataSourceManagerRunningAPI.getInstance().AsynKHQuerySampleDatas2(this.appName, this.dataSourceName, getToken(), e, t, a, n, s, i, r, o, c, u, g, this.isDirectConnection, this.serverHost);
        }),
        (this.KHQueryRealKHDatas = function (e, t, a, n) {
            DataSourceManagerRunningAPI.getInstance().AsynKHQueryRealKHDatas(this.appName, this.dataSourceName, getToken(), e, a, n, t, this.isDirectConnection, this.serverHost);
        }),
        (this.KHQueryGroupList = function (e, t) {
            DataSourceManagerRunningAPI.getInstance().AsynKHQueryGroupList(this.appName, this.dataSourceName, getToken(), e, t);
        }),
        (this.KHQueryTagList = function (e, t, a) {
            DataSourceManagerRunningAPI.getInstance().AsynKHQueryTagList(this.appName, this.dataSourceName, getToken(), e, t, a);
        });
}
(KMDatasourceFactory.prototype = {
    Redis: KMDatasourceRedis,
    MySQL: KMDatasourceSQL,
    MongoDB: KMDatasourceMongoDB,
    SQLServer: KMDatasourceSQL,
    TDEngine: KMDatasourceSQL,
    Oracle: KMDatasourceSQL,
    TDEngine: KMDatasourceSQL,
    DM: KMDatasourceSQL,
    KingHistorian: KMDatasourceKH,
    PostgreSQL: KMDatasourceSQL,
    KingSCADA: KMRealTimeDatasource,
    KingSCADA_Linux: KMRealTimeDatasource,
    KingIOServer: KMRealTimeDatasource,
    KingIOServer_Linux: KMRealTimeDatasource,
    KingIOServer_Windows: KMRealTimeDatasource,
    KingView: KMRealTimeDatasource,
    KingSuperSCADA: KMRealTimeDatasource,
    AlarmEngineering: KMRealTimeDatasource,
    'MQTT(格式转换)': KMRealTimeDatasource,
}),
    kmUlits.extend(KMDatasourceSQL, KMDatasourceBase),
    kmUlits.extend(KMDatasourceRedis, KMDatasourceBase),
    (KMDatasourceRedis.prototype.RedisExecute = function (e, t, a, n) {
        this[t](e, a, n);
    }),
    (KMDatasourceRedis.prototype.get = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynRedisGet(this.appName, this.dataSourceName, getToken(), t.key, a) : DataSourceManagerRunningAPI.getInstance().RedisGet(this.appName, this.dataSourceName, getToken(), t.key, a);
    }),
    (KMDatasourceRedis.prototype.set = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynRedisSet(this.appName, this.dataSourceName, getToken(), t.key, t.value, a) : DataSourceManagerRunningAPI.getInstance().RedisSet(this.appName, this.dataSourceName, getToken(), t.key, t.value);
    }),
    (KMDatasourceRedis.prototype.del = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynRedisDel(this.appName, this.dataSourceName, getToken(), t.key, a) : DataSourceManagerRunningAPI.getInstance().RedisDel(this.appName, this.dataSourceName, getToken(), t.key);
    }),
    (KMDatasourceRedis.prototype.hashSet = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynRedisHashSet(this.appName, this.dataSourceName, getToken(), t.key, t.attribute, t.value, a) : DataSourceManagerRunningAPI.getInstance().RedisHashSet(this.appName, this.dataSourceName, getToken(), t.key, t.attribute, t.value);
    }),
    (KMDatasourceRedis.prototype.hashGet = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynRedisHashGet(this.appName, this.dataSourceName, getToken(), t.key, t.field, a) : DataSourceManagerRunningAPI.getInstance().RedisHashGet(this.appName, this.dataSourceName, getToken(), t.key, t.field, a);
    }),
    (KMDatasourceRedis.prototype.hashGet = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynRedisHashGetAll(this.appName, this.dataSourceName, getToken(), t.key, a) : DataSourceManagerRunningAPI.getInstance().RedisHashGetAll(this.appName, this.dataSourceName, getToken(), t.key, a);
    }),
    (KMDatasourceRedis.prototype.hashDel = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynRedisHashDel(this.appName, this.dataSourceName, getToken(), t.key, t.field, a) : DataSourceManagerRunningAPI.getInstance().RedisHashDel(this.appName, this.dataSourceName, getToken(), t.key, t.field, a);
    }),
    (KMDatasourceRedis.prototype.exists = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynRedisExists(this.appName, this.dataSourceName, getToken(), t.key, a) : DataSourceManagerRunningAPI.getInstance().RedisExists(this.appName, this.dataSourceName, getToken(), t.key);
    }),
    (KMDatasourceRedis.prototype.jsonToObject = function (e) {
        this.baseJsonToObejct(e);
    }),
    (KMDatasourceRedis.prototype.objectToJson = function () {
        this.baseObjectToJson();
    }),
    kmUlits.extend(KMDatasourceRedis, KMDatasourceBase),
    (KMDatasourceMongoDB.prototype.MongoDBExecute = function (e, t, a, n) {
        this[operator](e, a, n);
    }),
    (KMDatasourceMongoDB.prototype.get = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynMongoDBFind(this.appName, this.dataSourceName, getToken(), t.collectionName, t.filter, a) : DataSourceManagerRunningAPI.getInstance().MongoDBFind(this.appName, this.dataSourceName, getToken(), t.collectionName, t.filter, a);
    }),
    (KMDatasourceMongoDB.prototype.set = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynRedisSet(this.appName, this.dataSourceName, getToken(), t.key, t.value, a) : DataSourceManagerRunningAPI.getInstance().RedisSet(this.appName, this.dataSourceName, getToken(), t.key, t.value);
    }),
    (KMDatasourceMongoDB.prototype.update = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynRedisGet(this.appName, this.dataSourceName, getToken(), t.collectionName, t.filter, a) : DataSourceManagerRunningAPI.getInstance().RedisGet(this.appName, this.dataSourceName, getToken(), t.collectionName, t.filter, a);
    }),
    (KMDatasourceMongoDB.prototype.del = function (e, t, a) {
        e ? DataSourceManagerRunningAPI.getInstance().AsynRedisSet(this.appName, this.dataSourceName, getToken(), t.collectionName, t.filter, a) : DataSourceManagerRunningAPI.getInstance().RedisSet(this.appName, this.dataSourceName, getToken(), t.collectionName, t.filter);
    }),
    (KMDatasourceMongoDB.prototype.jsonToObject = function (e) {
        this.baseJsonToObejct(e);
    }),
    (KMDatasourceMongoDB.prototype.objectToJson = function () {
        this.baseObjectToJson();
    }),
    kmUlits.extend(KMDatasourceMongoDB, KMDatasourceBase),
    kmUlits.extend(KMRealTimeDatasource, KMDatasourceBase),
    (KMRealTimeDatasource.prototype.addLinkSubscribe = function (e, t, a) {
        var n = !1;
        if (e instanceof KMProjectVariable) {
            var s = e.dataSourceItem.dataSourceTagName,
                i = t;
            t = e;
        } else s = e;
        var r = this.link.subscribe;
        if (r.has(s)) {
            if ((c = r.get(s)).linkMap.has(t.id)) {
                var o = c.linkMap.get(t.id);
                (o += 1), c.linkMap.set(t.id, o);
            } else c.currentSubscribe.add(t), c.linkMap.set(t.id, 1);
            (c.time += 1), r.set(s, c);
        } else {
            var c;
            (c = {
                linkMap: new Map(),
                time: 1,
                currentSubscribe: new Set(),
            }).linkMap.set(t.id, 1),
                c.currentSubscribe.add(t),
                (n = !0);
        }
        return r.set(s, c), 'dynamic' === a && this.dynamicAdd.setSubscribe(e, i), n;
    }),
    (KMRealTimeDatasource.prototype.addLinkRequest = function (e) {
        var t = this.link.request;
        if (t.has(e.id)) {
            var a = t.get(e.id);
            (a += 1), t.set(e.id, a);
        } else {
            a = 1;
            KMSystemQueryMng.getInstance().add(this.appName, this.dataSourceName, e.frequent, e);
        }
        t.set(e.id, 1);
    }),
    (KMRealTimeDatasource.prototype.deleteLinkSubscribe = function (e, t) {
        var a = this.link.subscribe;
        if (a.has(e)) {
            var n = a.get(e);
            if (n.linkMap.has(t.id)) {
                var s = n.linkMap.get(t.id);
                if ((0 === (s -= 1) ? (n.linkMap.delete(t.id), n.currentSubscribe.delete(t)) : n.linkMap.set(t.id, s), (n.time -= 1), 0 === n.time)) return a.delete(e), !0;
                a.set(e, n);
            }
        }
    }),
    (KMRealTimeDatasource.prototype.deleteLinkRequest = function (e) {
        var t = this.link.request;
        if (t.has(e.id)) {
            var a = t.get(e.id);
            0 === (a -= 1) && (t.delete(e.id), KMSystemQueryMng.getInstance().delete(this.appName, this.dataSourceName, e.frequent, e));
        }
    }),
    (KMRealTimeDatasource.prototype.getLinkedByName = function (e) {
        var t = this.link.subscribe.get(e);
        return t ? t.currentSubscribe : [];
    }),
    (KMRealTimeDatasource.prototype.execute = function (e, t, a) {
        if (((t = t || []), a)) {
            var n = [];
            e.forEach((e) => {
                var t = e.dataSourceItem.dataSourceTagName;
                this.addLinkSubscribe(t, e) && n.push(t);
            }),
                n.length && this.subscribe(n),
                t.forEach((e) => {
                    this.addLinkRequest(e);
                });
        } else {
            var s = [];
            e.forEach((e) => {
                var t = e.dataSourceItem.dataSourceTagName;
                this.deleteLinkSubscribe(t, e) && s.push(t);
            }),
                this.unsubscribe(s),
                t.forEach((e) => {
                    this.deleteLinkRequest(e);
                });
        }
    }),
    (KMRealTimeDatasource.prototype.dynamicAddSubscribe = function () {
        var e = [];
        this.link.subscribe.forEach((t, a) => {
            e.push(a);
        }),
            this.subscribe(e);
    }),
    (KMRealTimeDatasource.prototype.subscribe = function (e) {
        DataSourceManagerRunningAPI.getInstance().AsynSubscribeTagValue(
            this.appName,
            this.dataSourceName,
            getToken(),
            e,
            1,
            function (e) {
                console.log(e), KMStationDataServerManager.getInstance().dataReduce(e);
            },
            this.isDirectConnection,
            this.serverHost
        );
    }),
    (KMRealTimeDatasource.prototype.unsubscribe = function (e) {
        this.dynamicAdd.proVarMap.clear(),
            (this.dynamicAdd.onceFlag = !1),
            DataSourceManagerRunningAPI.getInstance().AsynSubscribeTagValue(
                this.appName,
                this.dataSourceName,
                getToken(),
                e,
                0,
                function (e) {
                    console.log(e);
                },
                this.isDirectConnection,
                this.serverHost
            );
    }),
    (KMRealTimeDatasource.prototype.getMapInfoByAppName = function (e, t) {
        if (this.appName == e && this.dataSourceName == t) return this;
    }),
    (KMRealTimeDatasource.prototype.setProjectTagValue = function (e) {
        for (var t = 0; t < e.length; t++) {
            KMProjectVariableMng.getInstance().getVariableByDataSourceName(e[t].N).setValue(e[t].V);
        }
    }),
    (KMRealTimeDatasource.prototype.setPartProjectTagValue = function (e, t) {
        for (var a = new Map(), n = 0; n < e.length; n++) a.set(e.N, e.V);
        for (n = 0; n < t.length; n++) {
            var s = KMProjectVariableMng.getInstance().getDataSourceNameByvariable(t[n]),
                i = a.get(s.name);
            s.setValue = i;
        }
    }),
    (KMRealTimeDatasource.prototype.GetTagValue = function (e, t, a) {
        for (var n = [], s = 0; s < e.length; s++) {
            var i;
            (i = KMProjectVariableMng.getInstance().getVariableNameByDataSourceName(e[s])), n.push(i);
        }
        DataSourceManagerRunningAPI.getInstance().AsynGetTagValues(this.appName, this.dataSourceName, getToken(), n, t, (e) => {
            0 == e.errorCode && a(e);
        });
    }),
    (KMRealTimeDatasource.prototype.setTagValues = function (e, t, a, n) {
        for (var s = this, i = [], r = 0; r < t.length; r++) {
            var o = {};
            if (((o.N = KMProjectVariableMng.getInstance().getVariableNameByDataSourceName(t[r].N)), !o.N)) return;
            (o.V = t[r].V), (o.Q = t[r].Q), (o.T = t[r].T), i.push(o);
        }
        if (1 === e)
            DataSourceManagerRunningAPI.getInstance().AsynSetTagValues(
                this.appName,
                this.dataSourceName,
                getToken(),
                i,
                a,
                function (e) {
                    0 === e.errorCode ? e.data.tag_oks || s.setProjectTagValue(t) : alert('写入失败!'), n && n(e);
                },
                this.isDirectConnection,
                this.serverHost
            );
        else if (0 === e) return void console.log('暂不支持同步写入');
    }),
    (KMRealTimeDatasource.prototype.AsynQueryHistoryDatas = function (e, t, a, n, s, i, r, o, c, u, g) {
        for (var h = [], m = 0; m < t.length; m++) {
            var p;
            (p = KMProjectVariableMng.getInstance().getVariableNameByDataSourceName(t[m])), h.push(p);
        }
        var l = {
            startTime: a,
            endTime: n,
            tagNames: h,
            dataVersion: s,
            filter: i,
            dataQuality: r,
            mode: u,
            intervalTime: g,
        };
        if (1 === e)
            DataSourceManagerRunningAPI.getInstance().AsynQueryHistoryDatas(
                this.appName,
                this.dataSourceName,
                getToken(),
                l,
                o,
                function (e, t) {
                    0 === e.errorCode ? c(e) : alert('查询失败!');
                },
                this.isDirectConnection,
                this.serverHost
            );
        else if (0 === e) return void console.log('暂不支持同步查询');
    }),
    (KMRealTimeDatasource.prototype.AsynQueryAlarmDatas = function (e) {
        DataSourceManagerRunningAPI.getInstance().AsynQueryAlarmDatas(this.appName, this.dataSourceName, getToken(), 1, 3e3, e, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.AsynGetAlarmValues = function (e, t, a) {
        for (var n = e.tagName, s = [], i = 0; i < n.length; i++) s.push(KMProjectVariableMng.getInstance().getVariableNameByDataSourceName(n[i]));
        (e.tagName = s), DataSourceManagerRunningAPI.getInstance().AsynGetAlarmValues(this.appName, this.dataSourceName, getToken(), e, a, t);
    }),
    (KMRealTimeDatasource.prototype.AsynQueryHistoryAlarmDatas = function (e, t, a) {
        DataSourceManagerRunningAPI.getInstance().AsynQueryHistoryAlarmDatas(this.appName, this.dataSourceName, getToken(), e, t, 3e3, a, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.KSSAsynQueryHistoryAlarmDatas = function (e, t, a) {
        DataSourceManagerRunningAPI.getInstance().KSSAsynQueryHistoryAlarmDatas(this.appName, this.dataSourceName, getToken(), e, t, 3e3, a, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.AsynSubscribeTagAlarm = function (e, t) {
        DataSourceManagerRunningAPI.getInstance().AsynSubscribeTagAlarm(this.appName, this.dataSourceName, getToken(), e, t, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.confirmTagAlarm = function (e, t, a) {
        if ('KingSuperSCADA' == t) DataSourceManagerRunningAPI.getInstance().KSSAsynConfirmTagAlarm(this.appName, this.dataSourceName, getToken(), e, 3e3, a, this.isDirectConnection, this.serverHost);
        else if ('AlarmEngineering' == t || 'MQTT(格式转换)' == t) {
            var n = {};
            (n.tag_id = e.tag_id), (n.condition_id = e.condition_id), (n.alarm_type = e.alarm_type), DataSourceManagerRunningAPI.getInstance().AlarmProjectConfirmTagAlarm(this.appName, this.dataSourceName, getToken(), n, 3e3, a, this.isDirectConnection, this.serverHost);
        } else DataSourceManagerRunningAPI.getInstance().AsynConfirmTagAlarm(this.appName, this.dataSourceName, getToken(), e, 3e3, a, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.confirmGroupAlarm = function (e, t) {
        DataSourceManagerRunningAPI.getInstance().AlarmProjectConfirmTagAlarm(this.appName, this.dataSourceName, getToken(), e, 3e3, t, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.DeleteAlarm = function (e, t) {
        DataSourceManagerRunningAPI.getInstance().AlarmProjectDeleteAlarm(this.appName, this.dataSourceName, getToken(), e, 3e3, t, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.getAlaramHistory = function (e) {
        DataSourceManagerRunningAPI.getInstance().AlarmProjectQueryCacheAlarmDatas(this.appName, this.dataSourceName, getToken(), {}, 3e4, e, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.AlarmProjectQueryHistoryAlarmDatas = function (e, t, a, n) {
        var s = {};
        (s.start_time = e), (s.end_time = t), (s.event_type = a), DataSourceManagerRunningAPI.getInstance().AlarmProjectQueryHistoryAlarmDatas(this.appName, this.dataSourceName, getToken(), s, 3e4, n, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.queryAlarmConfig = function (e, t, a, n) {
        var s = DataSourceManagerRunningAPI.getInstance();
        'condition' == n ? s.AlarmProjectQueryAlarmConfigOfCondition(this.appName, this.dataSourceName, getToken(), e, t, a, this.isDirectConnection, this.serverHost) : 'tag' == n ? s.AlarmProjectQueryAlarmConfigOfTag(this.appName, this.dataSourceName, getToken(), e, t, a, this.isDirectConnection, this.serverHost) : 'all' == n && s.AlarmProjectQueryAlarmConfig(this.appName, this.dataSourceName, getToken(), e, t, a, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.setAlarmConfig = function (e, t, a, n) {
        var s = DataSourceManagerRunningAPI.getInstance();
        'condition' == n ? s.AlarmProjectSetAlarmConfigOfCondition(this.appName, this.dataSourceName, getToken(), e, t, a, this.isDirectConnection, this.serverHost) : 'tag' == n && s.AlarmProjectSetAlarmConfigOfTag(this.appName, this.dataSourceName, getToken(), e, t, a, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.queryAlarmGroup = function (e, t, a) {
        DataSourceManagerRunningAPI.getInstance().AlarmProjectQueryAlarmGroup(this.appName, this.dataSourceName, getToken(), e, t, a, this.isDirectConnection, this.serverHost);
    }),
    (KMRealTimeDatasource.prototype.GetFieldValues = function (e, t, a, n, s) {
        for (var i = [], r = 0; r < e.length; r++) {
            var o;
            (o = KMProjectVariableMng.getInstance().getVariableNameByDataSourceName(e[r])), i.push(o);
        }
        if (s === KMTransmissionType.ASYN) DataSourceManagerRunningAPI.getInstance().AsynGetFieldValues(this.appName, this.dataSourceName, getToken(), i, t, a, n, this.isDirectConnection, this.serverHost);
        else if (s === KMTransmissionType.SYNC) return (n = DataSourceManagerRunningAPI.getInstance().getFieldValues(this.appName, this.dataSourceName, getToken(), i, t, a, this.isDirectConnection, this.serverHost));
    }),
    (KMRealTimeDatasource.prototype.SetFieldValues = function (e, t, a, n) {
        for (var s = 0; s < e.length; s++) {
            e[s].N = KMProjectVariableMng.getInstance().getVariableNameByDataSourceName(e[s].N);
        }
        if (n === KMTransmissionType.ASYN) DataSourceManagerRunningAPI.getInstance().AsynSetFieldValues(this.appName, this.dataSourceName, getToken(), e, t, a, this.isDirectConnection, this.serverHost);
        else if (n === KMTransmissionType.SYNC) return (a = DataSourceManagerRunningAPI.getInstance().setFieldValues(this.appName, this.dataSourceName, getToken(), e, t, this.isDirectConnection, this.serverHost));
    }),
    (KMRealTimeDatasource.prototype.objectToJson = function () {
        return this.baseObjectToJson();
    }),
    (KMRealTimeDatasource.prototype.jsonToObject = function (e) {
        this.baseJsonToObejct(e);
    }),
    (KMRealTimeDatasource.prototype.addLink = function (e, t) {
        var a = this;
        t.isSub
            ? (function () {
                  var n = a.link.subscribe;
                  if (n.has(e)) {
                      var s = n.get(e);
                      -1 === s.linkArr.indexOf(t.id) && s.linkArr.push(t.id);
                  } else
                      var s = {
                          linkArr: [t.id],
                          time: 0,
                      };
                  n.set(e, s);
              })()
            : (function () {
                  var n = a.link.request;
                  if (n.has(t.frequent)) {
                      var s = n.get(t.frequent);
                      if (s.has(e)) {
                          var i = s.get(e),
                              r = !1;
                          i.projectVarArr.map((e) => {
                              e.id === t && (r = !0);
                          }),
                              r || (i.projectVarArr.push(t), s.set(e, i));
                      } else {
                          var i = {
                              projectVarArr: [t],
                              time: 0,
                          };
                          s.set(e, i);
                      }
                  } else {
                      var s = new Map(),
                          i = {
                              projectVarArr: [t],
                              time: 0,
                          };
                      s.set(e, i);
                  }
                  n.set(t.frequent, s);
              })();
    }),
    (KMRealTimeDatasource.prototype.deleteLink = function (e, t) {
        if (t.isSub) var a = this.link.subscribe;
        else a = this.link.request;
        if (a.has(e)) {
            var n = a.get(e);
            -1 !== n.linkArr.indexOf(t) && n.linkArr.splice(n.linkArr.indexOf(t), l), n.linkArr.length ? a.set(e, n) : a.delete(e);
        }
    }),
    kmUlits.extend(KMDatasourceKH, KMRealTimeDatasource);
