# 一款由手机为操控器的HTML5平面射击游戏

## 游戏地址
http://btspoony.github.com/agameforgamejam

## 游戏简介
该游戏是一款由HTML5制作的平面设计游戏。电脑登陆网页端为游戏界面，手机登陆为控制器。

打开控制器后，选择任一角色后即可开始游戏。枪手为开枪攻击，刀手为近战挥刀攻击。

控制器上有两种操作方式

* 一手进行move操作，另一手点击进行攻击
* 一手进行move操作，同时挥动手机进行攻击

屏幕最上方为血条，怪物全部消灭后即可进入下一关. 不过边界检测没弄，囧..

## 后端技术
服务端语言: NodeJS (Javascript)

服务端使用库:

* Express: 一个NodeJS的Web框架，具有Restful的Route和各种渲染引擎支持。 点此围观:[传送门](https://github.com/visionmedia/express)
* EJS: 一个简单的View渲染引擎。点此围观:[传送门](https://github.com/visionmedia/ejs)
* Eagle: 我自己写的库，提供API使任意设备可向使用Socket.IO的Web页面推送消息，基于Socket.IO服务端。点此围观:[传送门](https://github.com/btspoony/node-eagle)

主要代码见 server.js

## 前端技术
前端为Javascript开发的HTML5游戏

前端使用库:

Crafty引擎: 一个基于Entity/Component架构的Javascript游戏引擎，同时支持Canvas和DOM，对于熟悉Entity/Component架构的开发者来说它非常便利。点此围观:[传送门](https://github.com/louisstow/Crafty)

主要游戏逻辑代码见: public/js/main.js

游戏控制器代码见: public/js/controller.js

_由于图快速开发，代码可能比较野蛮，请见谅..._

# 开源协议
本软件使用的协议为LPGL, 协议文件请看LICENSE-lgpl.txt

# 联系方式
微博: @原木博皞 http://weibo.com/boisgames

邮件: btspoony[AT]gmail.com

微博: @faseer http://webo.com/faseer

邮件: hbbalfred[AT]gmail.com