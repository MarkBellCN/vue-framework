# 研发部vue脚手架
`V.1.0` `author:xlchao` `blog:wangyesheji.cn / xdivcss.com` 
## 启动步骤

``` bash
# 初始安装所有依赖包
npm install

# 启动项目（开发模式）
npm run dev

# 项目打包
npm run build

# 打包并生成构建报告
npm run build --report

# 执行单元测试
npm run unit

# 执行全局测试
npm test
```
##目录说明
``` javascript
|-src
    |--assets           //静态资源目录
    |--components       //公共组件目录
    |--libs             //外部库
        fonts           //字体
        css             //字体调用css，已经引入FontAwesome 4.0.7图标字体
    |--router           //路由
    |--service          //服务
        |--service.js   //请求接口集合文件
    |--style            //样式
    |--store            //vuex 状态中心
    |--config           //全局配置
        |--request.js   //请求方法公共文件
        |--utils.js     //常用方法，深度克隆、递归、时间转换…
        |--baseData.js  //全局数据
    |--views            //页面模板
    App.vue             
    main.js             //入口文件
|--staic                //静态资源目录
|--test                 //单元测试
```
##依赖库
``` javascript
"axios": "^0.18.0",     //接口请求
"element-ui": "^2.4.0", //element ui
"vue": "^2.5.2",        //vue
"vue-router": "^3.0.1", //vue路由
"vuex": "^3.0.1"        //vuex状态管理
"less": "^3.0.4",
"less-loader": "^4.1.0",//css预编译
```
> #### 注意
>1. 如果使用接口请求，请先阅读 `config/request.js`
>2. 在使用样式在组件内控制 `element ui` 组件样式时慎用 `scoped`
