// ==UserScript==
// @name        自动抢座
// @namespace   null
// @match       *://office.chaoxing.com/*
// @match       *://i.chaoxing.com/*
// @grant       unsafeWindow
// @version     0.1
// @author      Richard
// @description 自动抢座(开启脚本时不要手动打开"首页"以外的页面,脚本会自动预约!)
// @icon        https://raw.githubusercontent.com/Richard2091/Miscellaneous/main/Rick.jpg
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js 
// @require     https://cdn.jsdelivr.net/npm/vue
// @updateURL   
// ==/UserScript==
(function() {
    'use strict';
  
    
    //////////////////////  用户配置  //////////////////////
      
    //自习室名
    var roomName = '电子阅览室';
    //座位号
    var seatNum = '007';
    //开始运行时间
    var targetHour=21, targetMinute=30, targetSecond=0;
    //超时返回主页
    var stopHour=21, stopMinute=35;
    //预约时间
    var startTime = "08:00", endTime = "12:00";
  
  
  
    ////////////////////////  功能区  ////////////////////////
    
    //当前日期
    var today = new Date();
    var year = today.getFullYear(), month = today.getMonth()+1, date = today.getDate();
    console.log("日期数据已获取,现在是"+year+"年"+month+"月"+date+"日");
  
    //第二天日期
    var tomorrow = month+'-'+(date+1);

    //当前时间
    var timeNow = new Date();
    var hour = timeNow.getHours(), minute = timeNow.getMinutes(), second = timeNow.getSeconds();
    console.log("时间数据已获取,现在是"+hour+":"+minute+":"+second);
  
    
    //时间更新器
    function timeUpdater(){

      //更新时间数据
      let updateTime = setInterval(() => {
        timeNow = new Date();
        hour = timeNow.getHours(), minute = timeNow.getMinutes(), second = timeNow.getSeconds();
        //抢座前5秒输出倒计时
        //不跨0秒
        if(hour==targetHour && minute==targetMinute && targetSecond-second<=5 && targetSecond>second){
          console.log("时间数据已更新,现在是 "+hour+":"+minute+":"+second);
        }
        //跨0秒
        if(hour==targetHour && minute==targetMinute-1 && targetSecond<=5 && (second>=55 || second<=targetSecond)){
          console.log("时间数据已更新,现在是 "+hour+":"+minute+":"+second);
        }
        //每到双数小时更新日期
        if(hour%2 == 0){
          year = today.getFullYear(), month = today.getMonth()+1, date = today.getDate();
          console.log("日期数据已更新,现在是 "+year+"/"+month+"/"+date);
        }
        //到点开始运行
        if(hour==targetHour && minute==targetMinute && second==targetSecond){
          console.log("现在时间:"+hour+":"+minute+":"+second+". 到点了,开冲!");
          //打开自习室列表
          $("p:contains('预约座位')" ).click();
        }
        //超时返回主页
        if(hour>=stopHour && minute>=stopMinute){
          let backToHome = setInterval(() => {
            //当前非首页
            if(document.getElementsByClassName("log_out").length <= 0){
              clearInterval(backToHome);
              //返回首页
              window.open("http://office.chaoxing.com/front/third/apps/seatengine/index?seatId=661&enc=809f86db89e276daf934fc8e6a2214f7&fidEnc=e8d15c598859417b&appId=6a695ef8e8814080974aba29ee78993d&appKey=1kPfvM785PKx8T2Q&uid=114738766&mappId=6198763&mappIdEnc=d53eec5c070044cc7ebc7c37f8524b83&code=RfNGA6M7&state=126163","_self");
            }
            //当前处于首页
            else{
              clearInterval(backToHome);
            }
          },100);
        }
      }, 1000);
    }
  
  
    //从"自习室列表"进入"自习室选座预约"页面
    function openRoom(){
      //选择日期
      let chooseDate = setInterval(() => {
        if($("h6:contains("+"'"+tomorrow+"'"+")" ).length > 0){
          clearInterval(chooseDate);
          //获取明天的日期按钮
          var dateButton = document.getElementsByClassName("mTabul")[0].children[1];
          //点击明天的日期
          dateButton.click();
          //点击"选座"图标
          let clickChooseSeatImg = setInterval(() => {
            if(dateButton.className == "active"){
              clearInterval(clickChooseSeatImg);
              // document.getElementsByClassName("scr_cont")[0].children[0].children[3].click();
              $("span:contains("+"'"+roomName+"'"+")").parent().parent()[0].children[3].click();
            }
          },200);
        }
      },200);
    }
  
    //预约座位
    function reserveSeat(){
      //关闭时间面板
      let closeTimeBoard = setInterval(() => {
        if(document.getElementsByClassName("time_pop").length > 0){
          clearInterval(closeTimeBoard);
          $("span:contains('取消')" ).click();
          
          //选择座位
          let seatSelect = setInterval(() => {
            if (document.getElementsByClassName("order_data").length > 0) {
              clearInterval(seatSelect);
              $("p:contains("+"'"+seatNum+"'"+")").click();
              console.log("座位已选择:"+seatNum)
              
              //选择预约时间
              let queryTime = setInterval(() => {
                if (document.getElementsByClassName("time_pop").length > 0) {
                  clearInterval(queryTime);
                  console.log("现在预约"+startTime+"-"+endTime);
                  //选择起止时间
                  $("li:contains("+"'"+startTime+"-'"+")").click();
                  $("li:contains("+"'-"+endTime+"'"+")").click();
                  console.log("时间已选择:"+startTime+'-'+endTime);
                  //提交预约
                  let submit = setInterval(() => {
                    if($("label:contains("+"'"+seatNum+"'"+")").length > 0){
                      clearInterval(submit);
                      $("p:contains('提交')" ).click();
                      console.log("结束");
                      //刷新,下一轮
                      window.location.reload();
                    }
                  },200);
                }
              },200);
            }
          }, 200);
        }
      },200);
    }
    
    //检测时间
    timeUpdater();
    //打开自习室
    openRoom();
    //预约座位
    reserveSeat();
  
})();

