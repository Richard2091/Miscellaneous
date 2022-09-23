// ==UserScript==
// @name        自动预约座位
// @version     2.2
// @author      Richard
// @description 定时自动模拟请求预约座位
// @grant       none
// @icon        https://raw.githubusercontent.com/Richard2091/Miscellaneous/main/Rick.jpg
// @namespace   hnit_chaoxing_library_seatSystem
// @match       *://office.chaoxing.com/*
// @match       *://i.chaoxing.com/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require     https://cdn.jsdelivr.net/npm/dayjs@1.11.5/dayjs.min.js
// ==/UserScript==
(function() {
	'use strict';

	//////////////////////  用户配置  //////////////////////
	//自习室(电子借阅室905,自习一室906,自习四室907)
	var roomId = '905';
	//座位号(输入完整编号,前面如果有0就要带0)
	var seatList = ["001", "050", "099", "165"];
	//预约时间(每行代表一次预约,一行内前者表示开始时间,后者表示结束时间)
	var timeList = [["18:00", "22:00"], ["14:00", "18:00"], ["12:30", "14:00"], ["08:30", "12:30"]];
	//开始运行时间(默认21:30:00:000 注意前面不要带0, 如01, 直接写1即可)
	var startHour = 21;
	var startMinute = 30;
	var startSecond = 0;
	var startMillisecond = 0;
	//最大失败次数(不超过此值时,若失败将重试,超过此值则跳过该预约. 避免无限循环)
	let maxFailNum = 5;
	//推送服务① (访问此页面获取 https://sct.ftqq.com/sendkey 留空则不推送)
	let sendKey = "";
	//推送服务② (访问此页面获取 https://www.pushplus.plus/push1.html 留空则不推送)
	let token = "";

	//////////////////////  功能模块  //////////////////////
	//是否在等待预约
	let isWaiting;

	//设置预约时间
	var reserveTime;

	//更新预约的日期
	function updateReserveTime() {
		reserveTime = dayjs().set('hour', startHour).set('minute', startMinute).set('second', startSecond).set('millisecond', startMillisecond);
	}

	//server酱推送
	function serverPush(title) {
		$.ajax({
			type: "GET",
			url: "https://sctapi.ftqq.com/" + sendKey + ".send?title=" + title,
			async: true,
			success: function(data) {
				// console.log(data);
			}
		});
	}

	//pushplus推送
	function pushplus(title, content) {
		$.ajax({
			type: "GET",
			url: "http://www.pushplus.plus/send?token=" + token + "&title=" + title + "&content=" + content + "&template=html",
			async: true,
			success: function(data) {
				// console.log(data);
			}
		});
	}

	//到点自动预约
	function waitReserve() {
		setTimeout(() => {
			//明天的日期
			let tomorrow = dayjs().add(1, 'day').format("YYYY-MM-DD");
			//选用的座位
			let seatIndex = 0;
			//预约的时间段
			let timeIndex = 0;
			//失败次数
			let failNum = 0;

			//检查所有时间和座位
			while (timeIndex < timeList.length && seatIndex < seatList.length) {
				//用于接收页面返回值
				var htmlData = null;
				//选座页面链接
				let htmlURL = "http://office.chaoxing.com/front/third/apps/seatengine/select?";
				let htmlParameter = "id=" + roomId + "&day=" + tomorrow + "&backLevel=2&seatId=661&fidEnc=e8d15c598859417b"
				//发起页面请求的时间
				let requestHtmlTime = dayjs().format("HH:MM:ss:SSS");
				console.log(requestHtmlTime + " 发起预约");
				//页面请求
				$.ajax({
					type: "GET",
					url: htmlURL + htmlParameter,
					async: false,
					success: function(response) {
						htmlData = response;
					}
				});

				//提取token
				var token = htmlData.split("token: '")[1].split("'")[0];
				// console.log(token)
				//定义链接
				var reserveURL = "http://office.chaoxing.com/data/apps/seatengine/submit?";
				var reserveParameter = "roomId=" + roomId + "&startTime=" + timeList[timeIndex][0] + "&endTime=" + timeList[timeIndex][1] + "&day=" + tomorrow + "&seatNum=" + (seatList[seatIndex]) + "&token=" + token;
				//发起预约请求的时间
				let requestReserveTime = dayjs().format("HH:MM:ss:SSS");
				//发起预约
				$.ajax({
					type: "GET",
					url: reserveURL + reserveParameter,
					async: false,
					dataType: 'json',
					success: function(reserveResult) {
						//收到预约结果的时间
						let receiveResultTime = dayjs().format("HH:MM:ss:SSS");
						//信息标题
						let title = seatList[seatIndex] + " " + timeList[timeIndex][0] + "-" + timeList[timeIndex][1];
						//信息内容
						let content = "页面请求时间 " + requestHtmlTime + "<br>" + "发起预约时间 " + requestReserveTime + "<br>" + "收到结果时间 " + receiveResultTime;
						//控制台输出结果
						console.log(receiveResultTime + " 预约结果:");
						console.log(title + " " + reserveResult.msg);

						//预约成功
						if (reserveResult.success) {
							reserveResult.msg = "预约成功";
							//预约下一个时间段
							timeIndex++;
							//判断是否推送
							if (token != "") {
								//pushplus推送
								pushplus(title, content);
							}
							if (sendKey != "") {
								//server酱推送
								serverPush(receiveResultTime + " " + title + " " + reserveResult.msg);
							}
						}
						//预约失败
						else {
							//该时间段您已有预约！
							if (reserveResult.msg.match("已有预约")) {
								//切换下一个时间段
								timeIndex++;
							}
							//该时间段已被占用！
							else if (reserveResult.msg.match("占用")) {
								//换座位
								seatIndex++;
							}
							//预约失败，请退出后重试！
							else if (reserveResult.msg.match("失败")) {
								//允许的范围内,原座位,原时间,重新预约
								if (failNum < maxFailNum) {
									//记录失败次数
									failNum++;
									//什么也不做直接下一轮
								}
							}
							//非法预约
							else if (reserveResult.msg.match("非法")) {
								//直接停止
								timeIndex = timeList.length;
							}
							//未知情况
							else {
								//直接停止
								timeIndex = timeList.length;
							}
						}
					}
				});
			}
			//预约过程执行完毕, setTimeout即将结束, 等待函数即将结束
			isWaiting = false;
		},
		reserveTime.valueOf() - dayjs().valueOf());
	}

	//开始等待预约(因为等待函数使用的setTimeout是一次性的,所以要重复开启等待函数)
	function startWait() {
		//更新开始预约的时间
		updateReserveTime();
		//现在已经过了预约时间
		if (dayjs() > reserveTime) {
			//获取明天的预约时间
			reserveTime = dayjs().add(1, 'day').set('hour', startHour).set('minute', startMinute).set('second', startSecond).set('millisecond', startMillisecond);
		}
		//开始等待预约
		waitReserve();
		isWaiting = true;
		//输出提示信息
		console.log("现在时间是 " + dayjs().format("YYYY/MM/DD HH:mm:ss"));
		console.log("将在 " + reserveTime.format("MM/DD HH:mm:ss:SSS") + " 发起预约");
        	console.log("座位候选列表: " + seatList);
	}

	//初始化
	startWait();

	//每隔一小时检查等待函数是否运行
	setInterval(() =>{
		//没有运行等待预约函数(一般是刚预约完)
		if (!isWaiting) {
			startWait();
		}
	},
	1000 * 60 * 60);

})();
