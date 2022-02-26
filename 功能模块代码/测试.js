async function dotxt() {
    var func = require('E:/OneDrive/亚控科技/项目资料/常州贝特瑞项目/负极二期/功能模块代码/KP自定义函数');
    var res1 = await func.toDataSet(123, `SELECT * FROM productOrder_realTime WHERE jobID = '6#20220207'`);

    console.log(res1);
}
dotxt();
