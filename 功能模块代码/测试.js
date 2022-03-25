var strSourFile = '"E:\\test.txt"';
var strDestFile = '"E:\\test\\test.txt"';
var objFSO = new ActiveXObject('Scripting.FileSystemObject');
// 检查文件是否存在
if (objFSO.FileExists(strSourFile)) {
    // 移动文件
    var strPath = objFSO.MoveFile(strSourFile, strDestFile);
    if (objFSO.FileExists(strDestFile)) console.log('文件已经移动到: ' + strDestFile);
    // 复制文件
    var strPath = objFSO.CopyFile(strDestFile, strSourFile);
    if (objFSO.FileExists(strSourFile)) console.log('文件已经复制到: ' + strSourFile);
    // 删除文件
    objFSO.DeleteFile(strDestFile, true);
    console.log('文件: ' + strDestFile + '已经删除');
} else console.log('文件: ' + strSourFile + '不存在');
