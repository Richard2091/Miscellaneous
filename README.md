# Miscellaneous
保存一些杂七杂八的东西

# 自动预约座位
### 功能介绍
- 到点自动预约座位
- 可自行设置`自习室` `座位` `预约时间段` `提交预约时间` `停止提交时间`
- 支持预约成功后调用 [Server酱](https://sct.ftqq.com/) 推送
### 使用方法
1. 安装 [油猴](https://www.tampermonkey.net) 等脚本管理插件
2. 将 [AutoReserveSeat.js](https://github.com/Richard2091/Miscellaneous/blob/main/ReserveSeat.js) 脚本添加到脚本管理器中
3. 对其中`用户配置`部分的参数自行修改保存

# 手动预约座位
### 功能介绍
- 手动预约座位
- 以**模拟请求**的方式预约座位, 比一步步**点击操作**预约更快
- 可自行设置`自习室` `座位` `预约时间段` `提交预约时间` `停止提交时间`
### 使用方法
1. 复制 [ReserveSeat.js](https://github.com/Richard2091/Miscellaneous/blob/main/ReserveSeat.js) 的全部代码
2. 打开浏览器的`开发者工具`
3. 切换到`console`控制台功能
4. 将复制好的代码粘贴
5. 自行修改`用户配置`部分的参数
6. 回车运行代码 (即发送预约座位的模拟请求)
