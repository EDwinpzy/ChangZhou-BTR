/*
 * @Author: EDwin
 * @Date: 2022-03-04 09:10:54
 * @LastEditors: EDwin
 * @LastEditTime: 2022-03-10 11:16:29
 */
//对象深拷贝
var c = { c1: 1, c2: 2 };
var d = Object.assign(new Object(), c);
d.d3 = 3;
console.log(c, d);
//数组深拷贝
var a = [1, 2];
var b = [20000];
b = b.concat(a);
b[1] = 10000;
console.log(a, b);
