var express = require('express');
var router = express.Router();

// 引入查询功能 model
let sqlData = require('../modules/handle.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  renderFun(req, res, next);
});
router.get('/goods/:num', function(req, res, next) {
  renderFun(req, res, next);
});
function renderFun(req, res, next){
  let num = parseInt(req.params.num) || 1;
  console.log(req.params.num,num);
  let p1 = new Promise((resolve,reject)=>{
    sqlData.queryCategory(req, res, next,function(result){
      resolve(result);
    });
  });
  let p2 = new Promise((resolve,reject)=>{
    sqlData.queryGoodByCategoryId(req, res, next, num, function(result){
      resolve(result);
    });
  });
  Promise.all([p1,p2]).then((result)=>{
    // console.log(result[0]);
    let subtit = '';
    for(let i =0;i<result[0].length;i++){
      if(result[0][i].id == num){
        subtit = result[0][i].name;break;
      }
    }
    res.render('index', { 
      title: '分享家',
      navs : result[0],
      pageNum: num,
      goods:result[1],
      subtit: subtit
    });
  });
}
module.exports = router;