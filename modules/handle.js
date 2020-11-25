/*
    数据增删改查模块封装
    req.query 解析GET请求中的参数 包含在路由中每个查询字符串参数属性的对象，如果没有则为{}
    req.params 包含映射到指定的路线“参数”属性的对象,如果有route/user/：name，那么“name”属性可作为req.params.name
    req.body通常用来解析POST请求中的数据
    +req.query.id 可以将id转为整数
 */

 // api 输出文件
 // 引入 mysql模块、mysql配置文件、连接池配置、封装的sql语句、封装返回的json数据格式
let mysql = require('mysql');
let mysqlconfig = require('../config/mysql.js');
let poolextend = require('./poolextend.js');
let sql = require('./sql.js');
let json = require('./json.js');

let pool = mysql.createPool(poolextend({},mysqlconfig));
let sqlData = {
    // 查询栏目
    /*
        没传回调函数，则使用 res 响应请求
        传回调函数，则把数据返回给回调处理
    */
    queryCategory:function(req,res,next,callback=null){
        pool.getConnection(function(err,connection){
            console.log(err);
            
            connection.query(sql.queryAllCategory,function(err,result){
                if(err){
                    console.log('数据库链接失败');
                    throw err;
                }
                let _result = result;
                if(result != ''){
                    result = {
                        result:'querycategory',
                        data:_result
                    }
                }else{
                    result = undefined;
                }
                if(!callback){
                    json(res,result);
                }else{
                    callback(JSON.parse(JSON.stringify(_result)));
                }
                // connection.release();
            });
            pool.releaseConnection(connection);
        });
    },
    // 根据栏目id 查询商品
    queryGoodByCategoryId:function(req,res,next,cateid=null,callback=null){
        let id = cateid || +req.query.id;
        if(!id || id<=0){
            json(res,'params_error');return false;
        }
        pool.getConnection(function(err,connection){
            connection.query(sql.queryGoodsByCategory,id,function(err,result){
                if(err){
                    console.log('数据库链接失败');
                    throw err;
                }
                let _result = result;
                if(result != ''){
                    result = {
                        result:'queryallgoods',
                        data:_result
                    };
                }else{
                    result = undefined;
                }
                if(!callback){
                    json(res,result);
                }else{
                    callback(JSON.parse(JSON.stringify(_result)));
                }
                // connection.release();
            });
            pool.releaseConnection(connection);
        });
    },
    // 查询活动
    qActivityByType:function(req,res,next,type=null,callback=null){
        pool.getConnection(function(err,connection){
            connection.query(sql.qActicityByType,type,function(err,result){
                if(err){
                    console.log('数据库链接失败');
                    throw err;
                }
                let _result = result;
                if(result != ''){
                    result = {
                        result:'queryactivity',
                        data:_result
                    };
                }else{
                    result = undefined;
                }
                if(!callback){
                    json(res,result);
                }else{
                    callback(JSON.parse(JSON.stringify(_result)));
                }
            });
            pool.releaseConnection(connection);
        });
    }
};
module.exports = sqlData;