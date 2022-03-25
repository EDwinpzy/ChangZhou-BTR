var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//连接数据库
mongoose.connect('mongodb://localhost:27017/text', {
    useNewUrlParser: true,
});

//监听数据库连接状态
mongoose.connection.once('open', () => {
    console.log('数据库连接成功……');
});
mongoose.connection.once('close', () => {
    console.log('数据库断开……');
});

//创建Schema对象（约束）
var stuSchema = new Schema({
    name: String,
    age: Number,
    gender: {
        type: String,
        default: 'male',
    },
    addr: String,
});

//将stuSchema映射到一个MongoDB collection并定义这个文档的构成
var stuModle = mongoose.model('student', stuSchema);

//向student数据库中插入数据
stuModle.create(
    {
        name: '小明',
        age: '20',
        addr: '天津',
    },
    (err, docs) => {
        if (!err) {
            console.log('插入成功' + docs);
        }
    }
);
/*
 * 控制台结果：
 * 数据库连接成功……
 * 插入成功{
 *   gender: 'male',
 *   _id: 6017a189372ece49089d79c7,
 *   name: '小明',
 *   age: 20,
 *  addr: '天津',
 *   __v: 0
 * }
 */
/*
 * 数据库结果：
 * | _id                      | gender | name | age  | addr | __v  |
 * | ------------------------ | ------ | ---- | ---- | ---- | ---- |
 * | 6017a189372ece49089d79c7 | male   | 小明  | 20   |  天津 | 0    |
 */
