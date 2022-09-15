///////////////自定义配置参数///////////////

//自习室(电子借阅室905,自习一室906,自习四室907)
var roomId = '905';
//座位号(输入完整编号,前面如果有0就要带0)
var seatNum = '057';
//预约日期(比如今天是9月1日5,需要提前预约明天的座位,就填2022-09-16,注意格式)
var reserveTime = '2022-09-16';
//预约时间(每行代表一次预约,一行内前者表示开始时间,后者表示结束时间)
var timeList = [["08:30","12:30"],
                ["12:30","14:00"],
                ["14:00","18:00"],
                ["18:00","21:30"]];


////////////下面的代码不要乱改////////////
var htmlData = null;
//获取页面数据
$.ajax({
    type: "GET",
    url: "http://office.chaoxing.com/front/third/apps/seatengine/select?id="+roomId+"&day="+reserveTime+"&backLevel=2&seatId=661&fidEnc=e8d15c598859417b",
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
    var reserveURL = "http://office.chaoxing.com/data/apps/seatengine/submit?roomId="+roomId+"&startTime="+timeList[i][0]+"&endTime="+timeList[i][1]+"&day="+reserveTime+"&captcha=&seatNum="+seatNum+"&token="+token;
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
}
