var express = require('express');
var router = express.Router();
let merge = require('merge');
let sqlData = require('../modules/handle.js');
let json = require('../modules/json.js');

/* let fs = require('fs');
let fs_option = {
    flags:'a',  // append的方式
    encoding: 'utf8'
};
let stdout = fs.createWriteStream('./logs/stdout.txt', fs_option);
let logger = new console.Console(stdout); // 创建logger */
// logger.log()

const fxj_cupon_rate = 0.9;

let TopClient = require('../tbk_lib/api/topClient.js').TopClient;
let client = new TopClient({
    'appkey': '28133788',
    'appsecret': '989bafb4248d533fcbe1b6138cb7b0c0',
    'REST_URL': 'http://gw.api.taobao.com/router/rest'
});
/*
    查淘宝api
    通过商品id 查询信息
*/
router.get('/goodDetailById',function(req,res,next){
    // res.header("Access-Control-Allow-Origin", "http://www.quan8.plus");
    // res.header("Access-Control-Allow-Origin", "https://www.quan8.plus");
    res.header("Access-Control-Allow-Origin", app.locals.ALLOWORIGIN);
    res.header("Access-Control-Allow-Origin", app.locals.ALLOWORIGIN);

    let goodId = req.query.id;
    if(goodId === 'NaN'){
        res.json({
            code: '1',
            msg: '参数类型错误'
        }); 
        return false;
    }
    // 主要拿标题
    _itemInfoGet(goodId,function(error, response) {
        if (error){
            res.json({
                code: '2',
                msg: error
            });
            return false;
        }
        // 写入日志
        // logger.log(JSON.stringify(response));

        let result = response.results.n_tbk_item;
        // 最后返回的信息
        let goodInfo = {
            title:'',  // 商品名称
            nick:'', // 店铺名称
            c_price:0,  // 折扣价 即券后价
            cupon:0,  // 优惠券
            tcode:'',  // 淘口令
            commission_rate:0,  // 佣金比率
            commission:0, // 佣金
        };

        let tprovcity = result[0].provcity.split(' ');
        let pgno = 1;
        let metOp = {
            page_size:100,
            page_no: pgno,
            q: result[0].title,
            itemloc: tprovcity[tprovcity.length -1]
        };
        if(result[0].shop_dsr){
            metOp.start_dsr = result[0].shop_dsr
        }
        if(result[0].is_prepay){
            metOp.need_prepay = result[0].is_prepay
        }
        if(result[0].free_shipment){
            metOp.need_free_shipment = result[0].free_shipment
        }
        let findGood = function(metOp){
            _materialOptional(metOp,function(error2, response2) {
                if(error2){
                    res.json({ 
                        code: '3',
                        msg: error2
                    }); 
                    return false;
                }
                // 写入日志
                // logger.log(JSON.stringify(response2));
    
                let result2 = response2.result_list.map_data;
                for(let i=0;i<result2.length;i++){
                    if(result2[i].item_id == goodId){
                        goodInfo.title = result2[i].title;
                        goodInfo.nick = result2[i].shop_title;
                        goodInfo.cupon = result2[i].coupon_amount?Number(result2[i].coupon_amount):0;
                        goodInfo.c_price = Number(result2[i].zk_final_price) - goodInfo.cupon;
                        goodInfo.commission_rate = result2[i].commission_rate;
                        goodInfo.commission = Math.floor((Number(goodInfo.commission_rate)* fxj_cupon_rate * goodInfo.c_price)/100)/100;
                        let coupon_share_url = result2[i].coupon_share_url;
                        let gooodUrl = result2[i].url;
                        let urlPar = coupon_share_url?'https:'+coupon_share_url:'https:'+ gooodUrl;
                        _tpwdCreate(urlPar,function(error3, response3){
                            // 写入日志
                            // logger.log(response3);
                            if (!error3){
                                goodInfo.tcode = response3.data.model;
                                res.json({
                                    code: '200',
                                    msg: goodInfo
                                });
                            }else {
                                res.json({
                                    code: '4',
                                    msg: error3
                                });
                            }
                        });
                        return false;
                    }
                }
                if(!goodInfo.title){
                    if(pgno <=6){
                        pgno += 1;
                        metOp.page_no = pgno;
                        findGood(metOp);
                    }
                    else{
                        res.json({ 
                            code: '31',
                            msg: '搜索不到对应的商品'
                        });
                    }
                }
            });
        };
        findGood(metOp);
        
    });
});

router.get('/goodDetailByWord',function(req,res,next){
    
    // res.header("Access-Control-Allow-Origin", "http://www.quan8.plus");
    // res.header("Access-Control-Allow-Origin", "https://www.quan8.plus");
    res.header("Access-Control-Allow-Origin", app.locals.ALLOWORIGIN);
    res.header("Access-Control-Allow-Origin", app.locals.ALLOWORIGIN);
    
    let keyWords = req.query.keyWords;
    _materialOptional({
        q:keyWords
    }, function(error, response) {
        if (!error){
            let resArr = [];
            response.result_list.map_data.forEach((item)=>{
                let goodInfo = {
                    title:'',  // 商品名称
                    pict_url:'', // 商品主图
                    nick:'', // 店铺名称
                    c_price:0,  // 折扣价 即券后价
                    cupon:0,  // 优惠券
                    commission_rate:0,  // 佣金比率
                    commission:0, // 佣金
                    good_url:'' // 生成口令的链接
                };
                goodInfo.pict_url = item.pict_url;
                goodInfo.title = item.title;
                goodInfo.nick = item.shop_title;
                goodInfo.cupon = item.coupon_amount?Number(item.coupon_amount):0;
                let tP = Number(item.zk_final_price) - goodInfo.cupon;
                goodInfo.c_price = tP.toFixed(2);
                goodInfo.commission_rate = item.commission_rate;
                goodInfo.commission = Math.floor((Number(goodInfo.commission_rate)* fxj_cupon_rate * goodInfo.c_price)/100)/100;
                let coupon_share_url = item.coupon_share_url;
                let good_url = coupon_share_url?'https:'+coupon_share_url:'https:'+ item.url;
                goodInfo.good_url = good_url;
                resArr.push(goodInfo);
            });
            res.json({
                code: '200',
                msg: JSON.stringify(resArr)
            });
        }else {
            res.json({
                code: '5',
                msg: error
            });
        }
    });
});
router.get('/getGoodTcode',function(req,res,next){
    let goodUrl = req.query.goodUrl;
    _tpwdCreate(goodUrl,function(error3, response3){
        if (!error3){
            res.json({
                code: '200',
                msg: response3.data.model
            });
        }else {
            res.json({
                code: '4',
                msg: error3
            });
        }
    });

});
/* 
 查数据库
 查询日常活动  type 活动类型，日常活动，和节日活动
*/
router.get('/daylyActy',function(req,res,next){
    let qtype = +req.query.type;
    if(!qtype || qtype<=0){
        json(res,'params_error');return false;
    }
    sqlData.qActivityByType(req,res,next,qtype);
});
/*
查询推荐的商品信息，根据 type 类型
*/
router.get('/bestGoods',function(req,res,next){
    let btype = +req.query.type;
    if(!btype || btype<=0){
        json(res,'params_error');return false;
    }
    sqlData.queryGoodByCategoryId(req, res, next, btype);
});
/* 
    tb 根据id获取商品信息
*/
function _itemInfoGet(goodId,cb){
    client.execute('taobao.tbk.item.info.get', {
        'num_iids': goodId,
        'platform':'2'
    }, function(error, response){
        cb && cb(error, response);
    })
}
/* 
    生成淘口令
    转的接口，回调函数
    urlType：'coupon_share_url' /  'good_url'
*/
function _tpwdCreate(url,cb){
    client.execute('taobao.tbk.tpwd.create', {
        'text':'分享家优惠券',
        'url': url,
        'logo':'https://uland.taobao.com/'
    }, function(error, response) {
        cb && cb(error, response);
    });
}

/* 
    根据关键词搜索系列商品
    options:{}
*/
function _materialOptional(options,cb){
    let op = merge({
        'start_dsr':10,
        'page_size':'18',
        'page_no':'1',
        'platform':'2',
        'sort':'total_sales',
        'q': '',
        'adzone_id':109801150270,
        'sort':'total_sales_des'
    },options);
    // console.log(op);
    client.execute('taobao.tbk.dg.material.optional',op,function(error,response){
        cb && cb(error,response);
    })
}

module.exports = router;