/*
 * @Author: EDwin
 * @Date: 2021-12-29 17:40:18
 * @LastEditors: EDwin
 * @LastEditTime: 2022-02-18 15:50:13
 */
/**
 * @type: KP自定义脚本
 * @description: 按控件内容筛选函数
 * @param {object[object]} OCX - 控件名称及对应的字段名 [{name: 'Combobox1', field: 'taskID', match: '='}, ...] 匹配条件可为 =、!=、<、>、<=、>=、like（模糊查询）
 *                               若需要对单选框的文本内容进行筛选，则name属性需为 '控件名称_text' 这种形式
 *                                若需要对单选框的索引进行筛选，则name属性需为 '控件名称_index' 这种形式
 * @param {object[object]} dataSet - 数据集
 * @return {object[object]} 筛选后的数据集
 */
debugger;
function OcxFiltering(OCX, dataSet) {
    var condition = [];
    for (var i = 0; i < OCX.length; i++) {
        //控件名字
        var OCXName = OCX[i].name;
        var obj = {
            field: OCX[i].field,
            match: OCX[i].match,
        };
        //判断控件类型  Combobox Textbox UIRadioButtonGroup DateBox DateTimeBox
        switch (this.$ParentChildren[OCXName].prototypeName) {
            case 'Combobox':
                obj.value = eval(OCXName).GetCurrentText();
                break;
            case 'Textbox':
                obj.value = eval(OCXName).Text;
                break;
            case 'UIRadioButtonGroup':
                if (OCXName.indexOf(text) != -1) {
                    obj.value = eval(OCXName).SelectedText;
                } else if (OCXName.indexOf(index) != -1) {
                    obj.value = eval(OCXName).SelectedIndex;
                }
                break;
            case 'DateBox':
                obj.value = eval(OCXName).Value;
                break;
            case 'DateTimeBox':
                obj.value = eval(OCXName).Value;
                break;
            default:
                return;
        }
        condition.push(obj);
    }
    for (var j = 0; j < condition.length; j++) {
        if (condition[j].value == '全部') {
            break;
        } else {
            switch (condition[j].match) {
                case '=':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][condition[j].field] != condition[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case '!=':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][condition[j].field] == condition[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case '>':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][condition[j].field] <= condition[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case '>=':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][condition[j].field] < condition[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case '<':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][condition[j].field] >= condition[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case '<=':
                    for (var i = 0; i < dataSet.length; i++) {
                        if (dataSet[i][condition[j].field] > condition[j].value) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
                case 'like':
                    for (var i = 0; i < dataSet.length; i++) {
                        var reg = eval('/' + condition[j].value + '/ig');
                        if (!reg.test(dataSet[i][condition[j].field])) {
                            dataSet.splice(i, 1);
                        }
                    }
                    break;
            }
        }
    }
    return dataSet;
}
