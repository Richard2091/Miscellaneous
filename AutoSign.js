// ==UserScript==
// @name        自动签到/签退
// @namespace   autoSign
// @match       *://office.chaoxing.com/*
// @grant       GM_xmlhttpRequest
// @grant       GM_notification
// @connect     office.chaoxing.com
// @connect     www.pushplus.plus
// @version     1.2
// @author      Richard
// @description 每10分钟检查签到, 并设置定时器, 到点自动签到/签退
// @icon        https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/calendar-check.svg
// @require     https://cdn.jsdelivr.net/npm/dayjs@1.11.5/dayjs.min.js
// ==/UserScript==

(function(){
    'use strict';

    ////////////  用户配置  ////////////

    //签到提前时间 (例如预约的8:30, 此处填18, 将会在8:12签到)
    let advanceTime = 18;
    //推送服务 (访问此页面获取 https://www.pushplus.plus/push1.html 留空则不推送)
    let token = "";

    ////////////  功能模块  ////////////

    //当前等待签到的预约id
    let reserveId = "";
    //是否已在等待签到
    let waitSign = false;
    let waitSignback = false;

    //本地+推送 通知服务
    function information(seatNum, type, result, msg){
        //弹出通知
        GM_notification({
            image: "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/circle-check.svg",
            title: "座位 "+seatNum+" "+type+result,
            text: dayjs().format("MM/DD HH:MM:ss")
        });
        //如果填了token则推送
        if(token != ""){
            let title = "座位 "+seatNum+" "+type+result;
            let content = msg;
            //pushplus推送
            $.ajax({
                type: "GET",
                url: "http://www.pushplus.plus/send?token="+token+"&title="+title+"&content="+content+"&template=html",
                async: true,
                success: function(data) {
                    // console.log(data);
                }
            });
        }
    }

    //签到、签退
    function sign(seatNum, URL, type, waitTime){
        setTimeout(() => {
            GM_xmlhttpRequest({
                method: "GET",
                url: URL,
                responseType: "json",
                onload: function(response){
                    let result = JSON.parse(response.responseText)
                    //操作成功
                    if(result.success){
                        information(seatNum, type, "成功", "");
                    }
                    //操作失败
                    else{
                        information(seatNum, type, "失败", result.msg);
                    }
                }
            });
        }, waitTime);
    }

    function checkReserve(){
        //获取预约ID
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://office.chaoxing.com/data/apps/seatengine/index?seatId=661",
            responseType:'json',
            onload: function(response) {
                let result = JSON.parse(response.responseText)
                //判断当前有无预约
                if(result.data.curReserves.length > 0){
                    let nowTime = dayjs().valueOf();
                    let startTime = result.data.curReserves[0].startTime;
                    let endTime = result.data.curReserves[0].endTime;
                    let curReserveId = result.data.curReserves[0].id;
                    let roomId = result.data.curReserves[0].roomId;
                    let seatId = result.data.curReserves[0].seatId;
                    let seatNum = result.data.curReserves[0].seatNum;
                    let URL = "https://office.chaoxing.com/data/apps/seatengine/"
                    let parameter = "?id="+reserveId+"&roomId="+roomId+"&seatId="+seatId+"&seatNum="+seatNum;
                    //console.log(URL+"sign"+parameter);

                    //新的预约
                    if(curReserveId != reserveId){
                        //转移到新预约
                        reserveId = curReserveId;
                        //把旧定时器的标记关闭
                        waitSign = false;
                        waitSignback = false;
                    }
                    //还未签到
                    if(startTime > nowTime && !waitSign){
                        console.log("当前预约:"+seatNum+" 已获取签到时间, 等待中");
                        //等待签到
                        waitSign = true;
                        //开启签到定时器
                        sign(seatNum, URL+"sign"+parameter, "签到", startTime-nowTime-(advanceTime*60000));
                    }

                    //还未签退
                    if(endTime > nowTime && !waitSignback){
                        console.log("当前预约:"+seatNum+" 已获取签退时间, 等待中");
                        //等待签退
                        waitSignback = true;
                        //开启签退定时器
                        sign(seatNum, URL+"signback"+parameter, "签退", endTime-nowTime);
                    }
                }
            }
        });
    }

    //立即检查
    checkReserve();

    //定时检查
    let timetest = setInterval(()=>{
        checkReserve();
    }, 1000*60*10); //每隔10分钟检查

})()
