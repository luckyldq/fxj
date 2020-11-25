/* 
    表名： fxj_category fxj_goods
    查询栏目名  根据栏目名查商品信息
*/
let queryData = {
    queryAllCategory:'SELECT * FROM fxj_category WHERE isShow = 1',
    queryGoodsByCategory:'SELECT * FROM fxj_goods WHERE category_id = ?',
    qActicityByType:'SELECT * FROM fxj_activity WHERE isShow = 1 AND type = ?'
}
module.exports = queryData;