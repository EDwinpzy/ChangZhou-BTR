var Delay_Time = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
};
var Delay_Time_Second = function (ms) {
    setTimeout(function () {}, ms);
};
var Delay_Print = async function (ms) {
    Delay_Time_Second(ms);
    console.log('After Delay_Time_Second');
    await Delay_Time(ms);
    console.log('After Delay_Time');
    return new Promise(function (resolve, reject) {
        resolve('END');
    });
};

Delay_Print(20000).then(function (resolve) {
    console.log(resolve);
});
