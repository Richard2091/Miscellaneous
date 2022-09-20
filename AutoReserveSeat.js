// ==UserScript==
// @name        自动预约座位
// @version     1.7
// @author      Richard
// @description 定时自动模拟请求预约座位
// @grant       none
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
    var seatList = ["001","099","150"];
    //预约时间(每行代表一次预约,一行内前者表示开始时间,后者表示结束时间)
    var timeList = [["18:00","21:30"],
                    ["14:00","18:00"],
                    ["12:30","14:00"],
                    ["08:30","12:30"]];
    //开始运行时间(默认21:30:00 注意前面不要带0, 如01, 直接写1即可)
    var startHour = 21, startMinute = 30;
    //尝试预约次数(避免预约失败, 自动重复预约, 预约所有时间段算一次)
    var tryReserveNum = 3;
    //推送服务密钥(访问此页面获取密钥https://sct.ftqq.com/sendkey 留空则不推送)
    var sendKey = "";
  
  
  
    ////////////////////////  功能区  ////////////////////////
    
    //当前日期
    var today = new Date();
    var year, month, date;
  
    //第二天日期
    var tomorrow;

    //当前时间
    var timeNow = new Date();
    var hour, minute, second;
    
    //预约成功次数
    var successNum = 0;
    //选用的座位
    var seatNum = 0;
  
    function pushInformation(title){
      $.ajax({
        type: "GET",
        url: "https://sctapi.ftqq.com/"+sendKey+".send?title="+title,
        async: true,
        success: function(data) {
          //console.log(data);
        }
      });
    }
  
    //发起单次预约
    function reserveSeat(startTime, endTime){
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
      //定义链接
      var reserveURL = "http://office.chaoxing.com/data/apps/seatengine/submit?";
      var reserveParameter = "roomId="+roomId+"&startTime="+startTime+"&endTime="+endTime+"&day="+tomorrow+"&captcha=&seatNum="+(seatList[seatNum])+"&token="+token;
      //接收预约结果
      var reserveResult = null;
      //发送请求
      $.ajax({
        type: "GET",
        url: reserveURL+reserveParameter,
        async: false,
        dataType:'json',
        success: function(json) {
          if(json.success){
            reserveResult = "预约成功";
          }else{
            reserveResult = json.msg;
          }
        }
      });
      //输出返回值
      timeNow = new Date();
      hour = timeNow.getHours(), minute = timeNow.getMinutes(), second = timeNow.getSeconds();
      var information = hour+":"+minute+":"+second+" 座位"+seatList[seatNum]+" 时间段"+startTime+"-"+endTime+" "+reserveResult;
      console.log(information);
      //处理结果
      if(reserveResult == "预约成功"){
        //如果填了sendKey则发起推送
        if(sendKey!=""){
          pushInformation(information);
        }
        //记录成功次数
        successNum++;
      }
      //如果被占用
      if(reserveResult == "该时间段已被占用！"){
        //如果还有备选座位
        if(seatNum < seatList.length){
          //换座位
          seatNum++;
        }
        //未能全部完成
      }
    }
    
    //时间函数
    function timeUtils(){
      //初始化日期数据
      year = today.getFullYear(), month = today.getMonth()+1, date = today.getDate();
      console.log("日期数据已获取, 现在是"+year+"年"+month+"月"+date+"日");
      tomorrow = year+'-'+month+'-'+(date+1);
      console.log("将在 "+startHour+":"+startMinute+" 自动预约 "+ seatList[seatNum] +" 号座位");

      //每秒更新时间数据
      let updateTime = setInterval(() => {
        //更新时间数据
        timeNow = new Date();
        hour = timeNow.getHours(), minute = timeNow.getMinutes(), second = timeNow.getSeconds();
        
        //每小时更新日期数据
        if(!minute && !second){
          var oldDay = date();
          //更新日期数据
          today = new Date();
          year = today.getFullYear(), month = today.getMonth()+1, date = today.getDate();
          //数据发生变化则更新并输出提示
          if(oldDay != date){
            console.log("日期数据已更新, 现在是"+year+"年"+month+"月"+date+"日");
          }
        }
        
        //抢座前5秒输出倒计时
        if(hour==startHour && minute==startMinute-1 && second>=55){
          console.log("正在倒计时, 现在是 "+hour+":"+minute+":"+second);
        }
        
        //到点开始运行
        if(hour==startHour && minute==startMinute && second==0){
          //反复发起预约
          for(var reserveNum=0; reserveNum<tryReserveNum; reserveNum++){
            //全部成功则中止
            if(successNum == timeList.length){
              break;
            }
            //提示当前次数
            console.log("发起第 "+(reserveNum+1)+"次预约");
            //遍历时间表
            while(successNum < timeList.length){
              reserveSeat(timeList[successNum][0], timeList[successNum][1]);
            }  
          }
        }
        
      }, 1000);
    }
    
    //检测时间
    timeUtils();
  
})();

