/*
 * @Author: EDwin
 * @Date: 2021-12-29 11:22:16
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-22 09:12:02
 */
//初始化表头
$('#' + id).datagrid({
    frozenColumns: [
        [
            {
                field: 'operation1',
                title: '操作',
                width: '5%',
                align: 'center',
                //添加超链接
                formatter: function showPicture(value, row, index) {
                    var str = '<a name=shanchu class=easyui-linkbutton style = width:50px;height:30px;color:#0076FF;border:none></ a>';
                    return str;
                },
            },
        ],
    ],
    columns: [
        [
            {
                field: 'select',
                title: '选中',
                align: 'center',
                width: '5%',
                checkbox: true,
            },
            {
                field: 'workshopCode',
                title: '车间编号',
                align: 'center',
                width: '7%',
                sortable: true,
                editor: {
                    type: 'combobox',
                    options: {
                        value: '请选择车间编号',
                        valueField: 'label',
                        textField: 'value',
                        panelHeight: 'auto',
                        data: [
                            {
                                label: 'A11',
                                value: 'A11',
                            },
                        ],
                    },
                },
            },
            {
                field: 'activeTime',
                title: '启用时间',
                align: 'center',
                width: '7%',
                sortable: true,
                editor: 'datebox',
                formatter: DateTimeStr,
            },
            {
                field: 'remark',
                title: '备注',
                align: 'center',
                width: '7%',
                sortable: true,
                editor: 'text',
            },
            {
                field: 'overhaulTime',
                title: '大修时间',
                align: 'center',
                width: '7%',
                sortable: true,
                editor: 'datebox',
                formatter: DateTimeStr,
            },
        ],
    ],
    data: [],
    pagePosition: 'bottom',
    pageSize: 1500,
    pageList: [1500, 3000, 5000],
    loadFilter: pagerFilter,
    //配置单击事件
    onDblClickCell: onDblClickCell,
    //行变颜色
    rowStyler: function (index, row) {
        switch (row.spotcheck_status) {
            case '未点检':
                return 'background-color: #FFFF00';
        }
    },
});

/*******************************更改分页****************************/
if ($.fn.pagination) {
    $.fn.pagination.defaults.beforePageText = '第';
    $.fn.pagination.defaults.afterPageText = '共{pages}页';
    $.fn.pagination.defaults.displayMsg = '显示{from}到{to},共{total}记录';
}
function pagerFilter(data) {
    if (typeof data.length == 'number' && typeof data.splice == 'function') {
        // is array
        data = {
            total: data.length,
            rows: data,
        };
    }
    var dg = $(this);
    var opts = dg.datagrid('options');
    var pager = dg.datagrid('getPager');
    pager.pagination({
        onSelectPage: function (pageNum, pageSize) {
            opts.pageNumber = pageNum;
            opts.pageSize = pageSize;
            pager.pagination('refresh', {
                pageNumber: pageNum,
                pageSize: pageSize,
            });
            dg.datagrid('loadData', data);
        },
    });
    if (!data.originalRows) {
        data.originalRows = data.rows;
    }
    var start = (opts.pageNumber - 1) * parseInt(opts.pageSize);
    var end = start + parseInt(opts.pageSize);
    data.rows = data.originalRows.slice(start, end);
    return data;
}

/****************************添加编辑单元方法******************************/
$.extend($.fn.datagrid.methods, {
    editCell: function (jq, param) {
        return jq.each(function () {
            // 获取数据网格的options
            var opts = $(this).datagrid('options');
            // 获取数据网格的字段值
            var fields = $(this).datagrid('getColumnFields', true).concat($(this).datagrid('getColumnFields'));
            for (var i = 0; i < fields.length; i++) {
                var col = $(this).datagrid('getColumnOption', fields[i]);
                col.editor1 = col.editor;
                if (fields[i] != param.field) {
                    col.editor = null;
                }
            }
            $(this).datagrid('beginEdit', param.index);
            for (i = 0; i < fields.length; i++) {
                col = $(this).datagrid('getColumnOption', fields[i]);
                col.editor = col.editor1;
            }
        });
    },
});
var editIndex = undefined;
// 是否结束了编辑
function endEditing() {
    if (editIndex === undefined) {
        return true;
    }
    // 验证指定的行，当验证有效的时候返回true。
    if ($('#' + id).datagrid('validateRow', editIndex)) {
        // 结束编辑行。
        $('#' + id).datagrid('endEdit', editIndex);
        editIndex = undefined;
        return true;
    } else {
        return false;
    }
}
// 单击单元格事件函数
function onDblClickCell(index, field) {
    if (endEditing()) {
        // 选择一行，行索引从0开始。
        $('#' + id)
            .datagrid('selectRow', index)
            .datagrid('editCell', {
                index: index,
                field: field,
            });
        editIndex = index;
    }
}

/*******************时间格式化方法******************/
function DateTimeStr(datestr) {
    var newDate = new Date(datestr);
    if (newDate == 'Invalid Date') return null;
    if (newDate < new Date('2000-01-01')) return null;
    var year = newDate.getFullYear();
    var month = newDate.getMonth() + 1;
    var day = newDate.getDate();
    if (month <= 9) month = '0' + month;
    if (day <= 9) day = '0' + day;
    return year + '-' + month + '-' + day;
}

/*******************日期时间格式化方法*****************/
function DateTimeStr(datestr) {
    var newDate = new Date(datestr);
    if (newDate == 'Invalid Date') return null;
    if (newDate < new Date('2000-01-01')) return null;
    var year = newDate.getFullYear();
    var month = newDate.getMonth() + 1;
    var day = newDate.getDate();
    var hour = newDate.getHours();
    var min = newDate.getMinutes();
    var sec = newDate.getSeconds();
    if (month <= 9) month = '0' + month;
    if (day <= 9) day = '0' + day;
    if (hour <= 9) hour = '0' + hour;
    if (min <= 9) min = '0' + min;
    if (sec <= 9) sec = '0' + sec;
    return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
}
