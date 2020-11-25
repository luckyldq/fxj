let json = function(res, result) {
    if (typeof result === 'undefined') {
        res.json({
            code: '1',
            msg: '操作失败'
        });
    }else if(result === 'params_error'){
        res.json({
            code: '2',
            msg: '参数缺失或参数值有误'
        });
    }else{
        res.json({
            code: '200',
            msg: '查找成功',
            data: result.data
        });
    } 
};
module.exports = json;