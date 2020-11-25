var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', { title: '分享家',profiles:[
    {title:'users'},
    {title:'分享自己觉得有意思的事情'},
    {title:'分享自己觉得有价值的物品。'}] 
  });
});



module.exports = router;