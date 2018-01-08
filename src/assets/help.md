## React 生命周期
constructor
componentWillMount  render之前执行1次
componentDidMount

componentWillReceiveProps  
shouldComponentUpdate
componentWillUpdate
componentDidUpdate  在组件完成更新后立即执行

componentWillUnmount

## PropTypes
```
optionalArray: PropTypes.array,
optionalBool: PropTypes.bool,
optionalFunc: PropTypes.func,
optionalNumber: PropTypes.number,
optionalObject: PropTypes.object,
optionalString: PropTypes.string,
optionalSymbol: PropTypes.symbol,
```

https://facebook.github.io/react/docs/typechecking-with-proptypes.html

## normalizr API
https://github.com/paularmstrong/normalizr/blob/master/docs/api.md

## lodashjs API
http://lodashjs.com/docs/

## prettydiff配置
https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/prettydiff.coffee

## PureComponent

## 校验
getFieldDecorator( 'profit', {
    initialValue: profit,
    validateFirst: true,
    validateTrigger: 'onBlur',
    rules: [
        {
            required: true,
            message: '请输入商品利润'
        }, {
            type: "number",
            min: 0.01,
            transform: v => +v,
            range: true,
            message: '请输入正确的商品利润'
        }
    ]
} )( <Input addonAfter="元"/> )

=====or ===========
 rules: [{ validator: this.checkPrice }],

 checkPrice = (rule, value, callback) => {
    if (value.number > 0) {
      callback();
      return;
    }
    callback('Price must greater than zero!');
  }
