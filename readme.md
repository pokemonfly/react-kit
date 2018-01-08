# 技术栈
- ES6 及以上
- React
- Redux
- less
- ANTD
- lodash
- normalizr  
- prop-types
- pubsub-js
- react-sortable-hoc  列表拖动
- .....


# 目录结构
```
.
├─api           Mock 模拟用的数据
├─dist        打包后的资源      
├─conf      开发用服务器 & 配置
├─src           
│  ├─assets                 项目中用到的资料文档
│  ├─containers         容器组件
│  │  └─shared              共通组件
│  │      └─...              组件 具体看下面
│  │  └─xxx                xxx业务模块
│  │      ├─components       业务表现组件
│  │      │  └─xxxa.js                
│  │      │  └─xxxaStyle.less    
│  │      │  └─xxxaRedux.js
│  │      └─index.js       入口 设置懒加载             
│  │      └─xxx.js           模块本身                
│  │      └─xxxStyle.less                 
│  │      └─xxxRedux.js    模块 action  reducer
│  ├─layouts              单页面的框架
│  ├─redux                 redux 相关配置  store reducer
│  │  └─middleware   redux扩展的中间件
│  ├─routes                 路由
│  │  └─reducers.js    reducer注册
│  ├─static                 不参与编译的静态脚本 用于临时需要注入的逻辑
│  └─styles                 共通样式
│  │  └─theme.js             组件库 覆盖 主题
│  └─utils                  函数
│  └─app.js                入口
│  └─index.js              入口页面
└─tests                     测试相关（预留）
```

# shared 组件
- DropdownButton 分裂式下拉按钮
- Icon 对应的iconfont （antd的Icon 也可以同时使用）
- More 更多数据下拉
- Search 检索框 （替换antd的Search）
- Table （留坑）
- Trigger 触发绝对定位弹窗组件 （替换rc-trigger）

#中间件使用

- thunkMiddleware： dispatch 就是通过他提供的。
- createLogger：Action的日志打印，开发时不用你在通过大量的 console 来调试了。
- promiseMiddleware：Promise转换中间件，把三种状态分成3中Action，非常好用。
- afterApiMiddleware：自定义中间件，作为过滤器，处理一些通用逻辑。


# 参考
- https://github.com/wangtao0101/react-virtualized-transfer
