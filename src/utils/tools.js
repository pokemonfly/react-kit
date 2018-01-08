import { isString, isUndefined } from 'lodash'
import { notification } from 'antd';
import moment from 'moment';
/*
minVal 返回结果不低于此数值
zeroTransfer 结果为0时转义 mode 预设
accuracy: 小数进度
*/
export function formatNum(val, {
    minVal = 0,
    zeroTransfer = '-',
    mode,
    accuracy = 2,
    divide = false
}) {
    switch ( mode ) {
        case 'price':
            minVal = 0.05
            zeroTransfer = 0.05
            divide = true
            break;
        default:
            break;
    }
    var num = val;
    if (isString( num )) {
        num = parseFloat( num );
    }
    //包含undefined
    if (isNaN( num )) {
        console.warn( 'formatPrice error' + val );
        return { text: zeroTransfer, value: '#', num, hasError: true }
    }
    if ( !num ) {
        return { text: zeroTransfer, real: num, num, hasError: true }
    }
    if ( divide ) {
        num = num / 100
    }
    if ( num < minVal ) {
        num = minVal
    }
    num = num.toFixed( accuracy )
    return {text: num, real: num, num: parseFloat( num )}
}

/**
 * 通用报表格式化
 * directPpr(Plus purchase rate) 直接加购率=直接购物车数/点击量
 * indirectPpr(Plus purchase rate) 间接加购率=间接购物车数/点击量
 * pprTotal(Plus purchase rate) 总加购率=总购物车数/点击量
 * favItemRate 宝贝收藏率=收藏宝贝数/点击量
 * favShopRate 店铺收藏率=收藏店铺数/点击量
 * favRate 总收藏率=总收藏数/点击量
 * directPprFavRate 直接加购收藏率（兴趣度）=（收藏宝贝数+直接购物车数）/点击量
 */
export function formatReport( report ) {
    for ( let key in report ) {
        if (report.hasOwnProperty( key )) {
            if ( report.click ) {
                report.directPpr = report.directCartTotal / report.click * 100
                report.indirectPpr = report.indirectCartTotal / report.click * 100
                report.favItemRate = report.favItemCount / report.click * 100
                report.favShopRate = report.favShopCount / report.click * 100
                report.favRate = report.favCount / report.click * 100
                if ( report.cartTotal ) {
                    // 总加购率
                    report.pprTotal = report.cartTotal / report.click * 100
                    // 直接加购收藏率（兴趣度）
                    report.directPprFavRate = ( report.favItemCount + report.directCartTotal ) / report.click * 100
                    //加购收藏率
                    report.pprFavRate = ( report.favCount + report.cartTotal ) / report.click * 100
                }
            }
        }
    }
}

/*
格式化 按日分段的报表数据  到 chart显示用数据
report : [{},{}]
keyMap :  常量map constants中
showKey (可选): 只需要指定的字段
*/
export function formatDayReport( report, keyMap, showKey ) {
    showKey = showKey || Object.keys( keyMap );
    return showKey.map(key => {
        if (!keyMap[key]) {
            throw( '[formatDayReport] key不存在：', key );
        }
        return {
            name: keyMap[key].name,
            unit: keyMap[key].unit,
            data: report.map(obj => obj[key])
        }
    })
}
export function formatRealTimeReport( reportArr, keyMap, showKey ) {
    showKey = showKey || Object.keys( keyMap );
    let dataMap = {},
        nameMap = {},
        hasData = false;
    showKey.forEach(key => {
        nameMap[key] = keyMap[key].name;
        dataMap[key] = reportArr.map(report => {
            hasData = hasData || report.length
            return report.map(obj => {
                return [
                    moment( obj.date ).get( 'h' ),
                    obj[key]
                ]
            })
        })
    });
    let legendUnitMap = {},
        legend = showKey.map(key => {
            legendUnitMap[keyMap[key].name] = keyMap[key].unit;
            return keyMap[key].name
        });
    return {
        legend,
        legendUnitMap,
        dataMap,
        nameMap,
        isNoData: !hasData
    }
}
/** 右上角 的贴条提示
 params  obj / description / message,description / type,message,description
*/
export function notify( ...args ) {
    let obj
    if ( args.length == 3 ) {
        obj = {
            type: args[0],
            message: args[1],
            description: args[2]
        }
    } else if ( args.length == 2 ) {
        obj = {
            message: args[0],
            description: args[1]
        }
    } else {
        if (isString(args[0])) {
            obj = {
                description: args[0]
            }
        } else {
            obj = args[0]
        }
    }
    let {
        type = 'success',
        message = '操作成功',
        description,
        duration = 3
    } = obj
    notification[type]({ message, description, duration });
}

// 计数器
export function counter( num, finishCb ) {
    let limit = num;
    return function ( ) {
        limit--;
        if ( limit == 0 ) {
            finishCb && finishCb( );
        }
    }
}

export function encodeHTML( source ) {
    return String( source ).replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /"/g, '&quot;' ).replace( /'/g, '&#39;' );
}

/**
 * 找到数组中key对应的value的index
 * @param arr
 * @param key
 * @param value
 * @returns {number}
 */
export function findIndex(arr = [], key, value) {
    var i = -1
    for (let n = 0; n < arr.length; n++) {
        if (arr[n][key] == value) {
            i = n
            break
        }
    }
    return i
}
