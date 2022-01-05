async function a () {
    function promiseClick() {
        return new Promise(async function (resolve, reject) {
            var a = 2;
            //做一些异步操作
            setTimeout(function () {
                resolve(a);
            }, 4000);
        });
    }
    var p = await promiseClick()
        p.then(function (data) {
        return data;
    });
}
console.log(1);
console.log(a)
console.log(3)