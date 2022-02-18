debugger;
//----------查询用户的权限-------------
if ($Variable.S用户权限 == '') {
    var SQLSour = 'mesSQL';
    var res = {};
    var sql = "select UserID,JobCenterID from view_usertoplace where UserID='" + $System.S登陆用户 + "'";
    SyncSQLExecute(SQLSour, 0, sql, res);

    //if(res.records[0].SCheck == 1) {
    if (res.records.length > 0) {
        $Variable.S用户权限 = JSON.stringify(res.records);
    } else {
        $Variable.S用户权限 = '';
    }
}

//---------开工处理-------------

var SQLSour = 'mesSQL';
var ScanCode = 开工码.Text; //开工码.Text
var Sort_JobCenter = $(CT工作中心.id).combotree('getText');
var usr = $System.S登陆用户.toUpperCase();
var region = $System.S登陆用户.toUpperCase();
var jobcenter = $System.S登陆用户.toUpperCase();
// var num = T工单数量.Text;
var sql = `select count(*) as result from order_r_pda_m_code where 领料单据号 = '${ScanCode}' and ERP删除标识 != 'X' and mes领料状态 = '0'`;
var res = {};
var 选中中心 = Sort_JobCenter;

//---------KC参数配置-----------
var iclient = KMClientInterface.getInstance();
var host = 'http://' + $System.KCIP + ':' + $System.KCPort;
var api = '/' + 'PostBegin'; //KC请求式计算的脚本名称
var type = 'post';
var postType = 'JSON';
var kcdata = {
    InParam: { 电子工单号: ScanCode, 用户: usr, 工作中心: 选中中心 }, //传入到KC的参数
    RequestType: 'normal',
    RequestID: $Function.uuid(),
};

//----------KC参数配置结束---------

if ($Variable.B提交 == 0) {
    var TreeData = JSON.parse(JSON.stringify(window.mesdata.JobTree));
    var TreeList = treeToList(TreeData, null, 0);
    var scanStr = 选中中心;
    var regObj = new RegExp(scanStr, ['i']);
    var data = treeScanText(TreeData, regObj);
    var root;
    if (data != undefined && data[0] != undefined) {
        root = data[0];
    } else {
        root = data;
    }
    SyncSQLExecute(SQLSour, 0, sql, res);
    if (res.records[0].result !== 0) {
        alert('该工单未领料,请领料后进行报工操作');
    } else if (scanStr == '' || root == undefined || root.length < 1) {
        alert(usr + ' 用户缺少 ' + scanStr + '工作中心操作权限 ');
    } else if (ScanCode === '') {
        alert('请输入开工码');
    } else if (Sort_JobCenter === '' || Sort_JobCenter == '0' || jobcenter === '请选择') {
        alert('请选择工序');
    } else if (usr === '') {
        alert('请重新登录');
    }
    // else if(num === ''){
    //     alert('请输入报工数量');
    // }
    // else if($Variable.S实际数量 == $Variable.S计划数量){
    //     alert('该工单已加工完成,请确认!');
    // }
    else if ($Variable.B分批标识) {
        alert('工单完成，请回收电子工单');
    }
    // else if( $Variable.B多工序标识){
    // }
    else {
        if (typeof plus !== 'undefined') {
            plus.nativeUI.showWaiting('开工提交中...', {
                background: 'rgba(0,0,0,0.4)',
            });
        }
        $Variable.B提交 = 1;

        iclient.httpRequestExec(host, api, type, kcdata, postType, function (resData) {
            console.log(resData); //将返回结果打印在信息窗口中
            var res = resData;
            //console.log(res);
            $Variable.B提交 = 0;
            if (typeof plus !== 'undefined') {
                plus.nativeUI.closeWaiting();
            }

            setTimeout(function () {
                $Variable.N刷新需求 = 1;
                $Variable.B开工查询 = !$Variable.B开工查询;
            }, 100);

            if (typeof res == 'string') alert(res);
            else alert(res.outMess);

            首检判断(Sort_JobCenter, $Variable.N批次号, $Variable.N工序序号, $Variable.N图号);
        });
    }
}

//-------------------函数包---------------------//
/*
函数名称:treeToList
函数功能:将树形结构的数据转换成列表结构
输入参数:
    TreeData:树形结构的数据
        例如:
            var treeData = [{id:'a1',children:[{id:'a11'},{id:'a12',children:[{id:'a121'}]}]},
                            {id:'a2',children:[{id:'a21',children:[{id:'a211'}]]}];
    parentId:父节点的id,字符串。不输入此参数为null

输出结果:
    var TabDate = [{id:'a1',parentId:null},{id:'a11',parentId:'a1'},{id:'a12',parentId:'a1'},
                   {id:'a121',parentId:'a12'},{id:'a2',parentId:null},{id:'a21',parentId:'a2'},
                   {id:'a21',parentId:'a211'}];
更新时间:2020/6/19  创建函数
*/
function treeToList(TreeData, parentId, flag) {
    var TabDate = [];
    if (TreeData && TreeData.length < 1) return null;
    for (var i = 0; i < TreeData.length; i++) {
        var tempTab = {
            id: TreeData[i].id,
            text: TreeData[i].text,
            parentId: parentId,
            able: TreeData[i].able,
            //-----其他自定义数据--------

            //------其他自定义数据结束-----
        };
        if (tempTab.able == 1 || flag == 1) {
            TabDate.push(tempTab);
            flag = 1;
        }

        if (TreeData[i].children && TreeData[i].children.length > 0) {
            TabDate = TabDate.concat(treeToList(TreeData[i].children, TreeData[i].id, flag));
        }
    }
    return TabDate;
}

/*
函数名称:treeScanText
函数功能:按指定规则筛选树的节点，同时保留树的结构
输入参数:
    data:树形结构的数据
        例如:
        var treeData = [{id:'a1',text:'A1',children:[{id:'a11',text:'B1'}
                            ,{id:'a12',text:'C1',children:[{id:'a121',text:'D1'}]}]},
                        {id:'a2',text:'A2',children:[{id:'a21',text:'B2',children:[{id:'a211',text:'T3'}]}]}];
    regObj:正则表达式对象，详情查询正则表达式

输出结果:
         var treeData = [{id:'a1',text:'A1',children:[{id:'a11',text:'B1'}
                            ,{id:'a12',text:'C1',children:[{id:'a121',text:'D1'}]}]},
                        {id:'a2',text:'A2',children:[{id:'a21',text:'B2',children:[{id:'a211',text:'T3'}]}]}];

备注:自写的函数，在判断方面可以比较灵活的拓展
更新时间:2020/6/19  创建函数
*/
function treeScanText(data, regObj) {
    if (data) {
        for (var i = 0; i < data.length; i++) {
            var temp = regObj.test(data[i].id);
            //var temp = regObj.test(data[i].text);
            if (temp == false && typeof data[i].children == 'object' && data[i].children.length && data[i].children.length > 0) {
                data[i].children = treeScanText(data[i].children, regObj);
            }
            if (temp == true || (typeof data[i].children == 'object' && data[i].children.length > 0)) {
            } //删除不符合要求的节点
            else {
                data.splice(i, 1);
                i--;
            }
        }
    }
    return data;
}

function 首检判断(JBX, ProductOrder, process, figure) {
    var sql = `select SCheck from fac_b_jobcenter where JobCenterID = '${JBX}'`;

    SQLExecute1(SQLSour, 0, sql, function (res) {
        if (res.data.records !== '') {
            if (res.data.records[0].SCheck === 1) {
                var sql = `select CheckSign from qc_re_ipqc where JobCenterID = '${JBX}' and Batch = '${ProductOrder}' and process = '${process}' and figure = '${figure}'`;

                SQLExecute1(SQLSour, 0, sql, function (res) {
                    if (res.data.records.length === 0) {
                        //  $Variable.B首检通知 =!$Variable.B首检通知;

                        alert('请联系品质人员进行首件检测');
                    } else {
                        if (res.data.records.CheckSign === 0) {
                            //   $Variable.B首检通知 =!$Variable.B首检通知;
                            alert('请联系品质人员进行首件检测');
                        }
                    }
                });
            }
        }
    });
}
