// ==UserScript==
// @name        自动预约座位
// @version     0.2
// @author      Richard
// @description 定时自动模拟请求预约座位
// @grant       unsafeWindow
// @icon        https://raw.githubusercontent.com/Richard2091/Miscellaneous/main/Rick.jpg
// @namespace   hnit_chaoxing_library_seatSystem
// @match       *://office.chaoxing.com/*
// @match       *://i.chaoxing.com/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js 
// @require     https://cdn.jsdelivr.net/npm/vue
// ==/UserScript==


(function() {
    'use strict';
    
    //////////////////////  用户配置  //////////////////////
      
    //自习室(电子借阅室905,自习一室906,自习四室907)
    var roomId = '905';
    //座位号(输入完整编号,前面如果有0就要带0)
    var seatNum = '001';
    //开始运行时间(默认21:30:00 注意不要写00,直接写0即可, 01同理写1)
    var startHour=21, startMinute=30, startSecond=0;
    //运行时长(超过此时间后,若预约失败,不再重试)
    var runningTime = 5;
    //预约时间(每行代表一次预约,一行内前者表示开始时间,后者表示结束时间)
    var timeList = [["08:30","12:30"],
                    ["12:30","14:00"],
                    ["14:00","18:00"],
                    ["18:00","21:30"]];
  
  
  
    ////////////////////////  功能区  ////////////////////////
    
    //当前日期
    var today = new Date();
    var year, month, date;
  
    //第二天日期
    var tomorrow;

    //当前时间
    var timeNow = new Date();
    var hour, minute, second;
  
    //预约座位
    function reserveSeat(){
      //用于接收页面返回值
      var htmlData = null;
      //获取页面数据
      $.ajax({
        type: "GET",
        url: "http://office.chaoxing.com/front/third/apps/seatengine/select?id="+roomId+"&day="+tomorrow+"&backLevel=2&seatId=661&fidEnc=e8d15c598859417b",
        async: false,
        success: function(data) {
          htmlData = data;
        }
      });
      //提取token
      var token = htmlData.split("token: '")[1].split("'")[0];
      //模拟多次请求
      for(var i=0; i<timeList.length; i++){
        //合成链接
        var reserveURL = "http://office.chaoxing.com/data/apps/seatengine/submit?roomId="+roomId+"&startTime="+timeList[i][0]+"&endTime="+timeList[i][1]+"&day="+tomorrow+"&captcha=&seatNum="+seatNum+"&token="+token;
        //接收预约结果
        var reserveResult = null;
        //发送请求
        $.ajax({
          type: "GET",
          url: reserveURL,
          async: false,
          dataType:'json',
          success: function(json) {
            reserveResult = json.msg
          }
        });
        //输出返回值
        console.log(timeList[i][0]+"-"+timeList[i][1]+" 预约结果:"+reserveResult);
        //如果没有超时,则判断是否需要重试
        if(minute-startMinute <= runningTime){
          //如果失败则刷新页面重试
          if(reserveResult == "预约失败，请退出后重试！"){
            window.location.reload();
          }
        }
      }
    }
    
    //时间更新器
    function timeUpdater(){
      //初始化日期数据
      year = today.getFullYear(), month = today.getMonth()+1, date = today.getDate();
      console.log("日期数据已获取,现在是"+year+"年"+month+"月"+date+"日");
      tomorrow = year+'-'+month+'-'+(date+1);
      console.log("预约 "+tomorrow+" 的 "+ seatNum +" 号座位");

      //每秒更新时间数据
      let updateTime = setInterval(() => {
        timeNow = new Date();
        hour = timeNow.getHours(), minute = timeNow.getMinutes(), second = timeNow.getSeconds();
        //抢座前5秒输出倒计时
        //不跨0秒
        if(hour==startHour && minute==startMinute && startSecond-second<=5 && startSecond>second){
          console.log("正在倒计时,现在是 "+hour+":"+minute+":"+second);
        }
        //跨0秒
        if(hour==startHour && minute==startMinute-1 && startSecond<=5 && (second>=55 || second<=startSecond)){
          console.log("正在倒计时,现在是 "+hour+":"+minute+":"+second);
        }
        //到点开始运行
        if(hour>=startHour && minute>=startMinute && second>=startSecond){
          console.log("现在时间:"+hour+":"+minute+":"+second+". 到点了,开冲!");
          //开始预约
          reserveSeat();
        }
      }, 1000);
    }
    
    //检测时间
    timeUpdater();
  
})();

