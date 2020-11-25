let protcl = window.location.protocol;

let questPath = '/www.quan8.plus/fxj_v1';

let debug = true;

if(debug){
    questPath = '/fxj_v1';
}


$('#searchBtn').click(function(){
    var serTxt = document.getElementById('searchTxt').value;
    if(!serTxt.trim()){return false;}
    var id = parseUrl(serTxt).id;
    if(id){
        getCuponInfo(id);
    }
    else{
        getCuponInfoByWord(sliceStr(serTxt))
    };
});
// 通过商品id 搜索优惠券
function getCuponInfo(gid){
    let _this = this;
    /*if (Math.random()>0.5){
      _this.setData({
        searchStatus: 1,
        goodInfo: {
          'title':'',
          'c_price': 3.99,
          'commission': 2.16,
          'tcode': '66666',
        }
      });
    }
    else{
      _this.setData({
        searchStatus: 2,
        errMsg:'搜索不到'
      });
    }
    return false;*/
    let urlStr = protcl + questPath + '/goodDetailById';
    $.ajax({
        url: urlStr,
        // url:'http://localhost:8080/fxj_v1/goodDetailById',
        data:{
            id: Number(gid)
        },
        header: {
            'content-type': 'application/json'
        },
        success(res) {
            // console.log(res,res.data.msg,'请求成功');
            goodByIdRes(res);
        },
        error(err){
            searGoodErr();
        }
    });
}
/*
通过关键字获取商品组
*/
function getCuponInfoByWord(words){
    // this.setData({
    //   searchStatus:3,
    //   isSearch: true,
    // });
    let _this = this;
    let urlStr = protcl + questPath+'/goodDetailByWord';
    // console.log(urlStr);
    $.ajax({
        url: urlStr,
        data: {
            keyWords: words
        },
        header: {
            'content-type': 'application/json'
        },
        success(res) {
            goodByKeyword(res);
        },
        error(err) {
            searGoodErr();
        }
    });
}
 // 解析url中的 id
function parseUrl(url){
    let obj = {};
    if(url.indexOf('?')){
      let qs = url.split('?')[1];
      if(qs && qs.indexOf('&')){
        let parArr = qs.split('&');
        parArr.forEach((item) => {
          if(item && item.indexOf('=')){
            let kv = item.split('=');
            obj[kv[0]] = kv[1];
          }
        });
      }
    }
    return obj; // 解析后的对象
}
  // 提取字符串  微信小程序里面正则会有问题
  /*
    var regex = /(?<=【).*?(?=】)/g;
    let tmpVal2 = res.val.match(regex);
  */
function sliceStr(str){
    let s = str.indexOf('【');
    let e = str.lastIndexOf('】');
    // console.log(str.slice(s+1, e));
    if(s!=-1 && e != -1 && s<e){
      return str.slice(s+1,e);
    }else{
      return str;
    }
}
/* 通过 id 获取到商品 */
function goodByIdRes(res){
    var str = '';
    if(res.code == 200){
        let result = res.msg
        let tmpP = Number(result.c_price);
        result.c_price = tmpP.toFixed(2);
        if(result.cupon){
            str = '<div class="yh-info"><p class="gd-name">'+result.title+'</p><p class="gd-shop">【店铺名】'+result.nick+'</p><p class="gd-price">【券后价】'+result.c_price+'元</p><p wx:if="{{result.cupon}}" class="gd-link">【优惠券】'+result.cupon+'元</p><p class="gd-link">【返红包】'+result.commission+'元</p></div><div class="cp-box"><button class="copy-btn" data-clipboard-text="'+ result.tcode +'">复制淘口令</button><p class="gd-by">复制淘口令后，打开手机淘宝下单购买</p></div>';
        }
        else{
            str = '<div class="yh-info"><p class="gd-name">'+result.title+'</p><p class="gd-shop">【店铺名】'+result.nick+'</p><p class="gd-price">【券后价】'+result.c_price+'元</p><p class="gd-link">【返红包】'+result.commission+'元</p></div><div class="cp-box"><button class="copy-btn" data-clipboard-text="'+result.tcode +'">复制淘口令</button><p class="gd-by">复制淘口令后，打开手机淘宝下单购买</p></div>';
        }
        getClipTcode('.copy-btn');
    }
    else{
        if (res.msg && res.msg.code == 15){
            str = '<div class="sear-tips">商品活动已经结束了，下次早点来</div>';
        }else{
            console.log(res);
            str = '<div class="sear-tips">当前系统繁忙，添加微信客服找券</div>';
        }
    }
    $('#searRes').html(str);
}
/* 通过关键字获取到到商品 */
function goodByKeyword(res){
    var str = '';
    if(res.code == 200){
        let resT = JSON.parse(res.msg);
        resT.forEach((item)=>{
            if(item.cupon){
                str += '<div class="item"><div class="img-box"><img src="'+ item.pict_url +'" alt=""></div><div class="title line-elli">'+item.title+'</div><div class="info"><div class="info-l"><div class="p"><i>￥</i><em>'+item.c_price+'</em><span>券后</span></div><div class="c">'+item.cupon+'元券</div></div><div class="info-r copy_tcodet" data-gurl="'+ item.good_url +'" data-clipboard-action="copy" data-clipboard-target="#tcodeBox">复制淘口令</div></div></div>';
                //  data-clipboard-text="'+item.tcode+'"
            }
            else{
                str += '<div class="item"><div class="img-box"><img src="'+ item.pict_url +'" alt=""></div><div class="title line-elli">'+item.title+'</div><div class="info"><div class="info-l"><div class="p"><i>￥</i><em>'+item.c_price+'</em><span>券后</span></div></div><div class="info-r copy_tcodet" data-gurl="'+item.good_url+'" data-clipboard-action="copy" data-clipboard-target="#tcodeBox">复制淘口令</div></div></div>';
            }
        });
    }
    else{
        if (res.msg && res.msg.code == 15){
            str = '<div class="sear-tips">商品活动已经结束了，下次早点来</div>';
        }else{
            console.log(res);
            str = '<div class="sear-tips">当前系统繁忙，添加微信客服找券</div>';
        }
    }

    $('#searResByTxt').html(str);
    // $('#searResByTxt .copy_tcodet').click(function(ev){
    //     if(ev.target.dataset.tcode){
    //         popbox.style.display = 'flex';
    //         poptxt.innerHTML = ev.target.dataset.tcode;
    //     }
    //     else{
    //         obtainTcode(this);
    //     }
    // });
    
    var clipboard2 = new ClipboardJS('.copy_tcodet',{
        target:function(e){
            var gurl = $(e).data('gurl');
            obtainTcode(gurl);
            return document.querySelector('#tcodeBox');
        }
    });
    clipboard2.on('success', function(e) {
        popbox.style.display = 'flex';
        poptxt.innerHTML = '复制成功，打开淘宝';
        timer1 = setTimeout(() => {
            popbox.style.display = 'none';
        }, 800);
    });
    clipboard2.on('error', function(e) {
        popbox.style.display = 'flex';
        poptxt.innerHTML = '复制失败，扫码添加微信客服';
        timer1 = setTimeout(() => {
            popbox.style.display = 'none';
        }, 800);
    });
}
/* 获取淘口令 */
function obtainTcode(gurl){
    var resstr = '';
    // let gurl = el.dataset.gurl;
    //   console.log(gurl);
    let urlStr = protcl + questPath+'/getGoodTcode';
    // console.log(urlStr);
    $.ajax({
        url: urlStr,
        data: {
            goodUrl: gurl
        },
        header: {
            'content-type': 'application/json'
        },
        success(res) {
            if(res.code == 200){
                resstr = res.msg;
                $('#tcodeBox').text(resstr);
            }
        },
        error(err) {
            console.log('获取失败');
        }
    });
}
/* 查询失败的商品 */
function searGoodErr(){
    $('#searRes').html('<div class="sear-tips">当前系统繁忙，添加微信客服找券</div>');
}
/* 操作剪切板 */
function getClipTcode(selector){
    let clipboard = new ClipboardJS(selector);
    clipboard.on('success', function(e) {
        popbox.style.display = 'flex';
        poptxt.innerHTML = '复制成功，打开淘宝';
        timer1 = setTimeout(() => {
            popbox.style.display = 'none';
        }, 800);
    });
    clipboard.on('error', function(e) {
        popbox.style.display = 'flex';
        poptxt.innerHTML = '复制失败，扫码添加微信客服';
        timer1 = setTimeout(() => {
            popbox.style.display = 'none';
        }, 800);
    });
}
/* 复制 */
function myClip(el,str){
    var oInput = document.createElement('input');
    oInput.id = "copy-input";
    oInput.readOnly = "readOnly";        // 防止ios聚焦触发键盘事件
    oInput.style.position = "absolute";
    oInput.style.left = "-1000px";
    oInput.style.zIndex = "-1000";
    el.appendChild(oInput);
    oInput.value = str;
    if (oInput.createTextRange) {//ie
        const range = oInput.createTextRange();
        range.collapse(true);
        range.moveStart('character', 0);//起始光标
        range.moveEnd('character', str.length);//结束光标
        range.select();//不兼容苹果
    } 
    else {//firefox/chrome
        oInput.setSelectionRange(0, str.length);
        oInput.focus();
    }
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        popbox.style.display = 'flex';
        poptxt.innerHTML = '复制成功，打开淘宝';
        timer1 = setTimeout(() => {
            popbox.style.display = 'none';
        }, 800);
    }
    else{
        popbox.style.display = 'flex';
        poptxt.innerHTML = '复制失败，扫码添加微信客服';
        timer1 = setTimeout(() => {
            popbox.style.display = 'none';
        }, 800);
    }
    oInput.blur();
    el.removeChild(oInput);
}