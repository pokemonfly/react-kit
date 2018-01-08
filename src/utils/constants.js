import { compact, map } from 'lodash'
// 全局 常量 配置
export const versionNameMap = {
    1: '快车托管',
    2: '云托管定制版',
    3: '基础版',
    4: '锦囊版',
    5: '旗舰版',
    6: '直钻结合版',
    106: '体验版',
    7: '智囊版',
    8: 'VIP大客户',
    9: '快车托管'
}

export const getEngineType = ( type ) => {
    switch ( type ) {
        case 0:
            return '长尾'
        case 1:
            return '加力'
        case 2:
            return '无线'
        case 6:
            return 'ROI'
        default:
            return '未知'
    }
}

export const grabRankStatusPcMap = {
    '-1': {
        title: '抢PC'
    },
    0: {
        title: '待开始'
    },
    1: {
        title: '正在抢',
        className: 'success'
    },
    2: {
        title: '已抢到',
        className: 'success'
    },
    3: {
        title: '抢失败',
        className: 'error'
    },
    4: {
        title: '暂停抢',
        className: 'warning'
    },
    5: {
        title: '暂停抢',
        className: 'warning'
    },
    // 自定义的类型
    11: {
        title: '手动抢',
        className: 'warning'
    }
}
// 同上
export const grabRankStatusMobileMap = {
    ...grabRankStatusPcMap,
    '-1': {
        title: '抢无线'
    }
}

// 关键词列表 报表排序用
/**
 * 新加字段逻辑
 * directPpr(Plus purchase rate) 直接加购率=直接购物车数/点击量
 * indirectPpr(Plus purchase rate) 间接加购率=间接购物车数/点击量
 * pprTotal(Plus purchase rate) 总加购率=总购物车数/点击量
 * favItemRate 宝贝收藏率=收藏宝贝数/点击量
 * favShopRate 店铺收藏率=收藏店铺数/点击量
 * favRate 总收藏率=总收藏数/点击量
 * directPprFavRate 直接加购收藏率（兴趣度）=（收藏宝贝数+直接购物车数）/点击量
 */
export const keywordReports = {
    'impressions': {
        'name': '展现量',
        'unit': '',
        'sortNum': 0
    },
    'click': {
        'name': '点击量',
        'unit': '',
        'sortNum': 1
    },
    'ctr': {
        'name': '点击率',
        'unit': '%',
        'sortNum': 2
    },
    'cost': {
        'name': '总花费',
        'unit': '元',
        'sortNum': 3
    },
    'cpc': {
        'name': 'PPC',
        'unit': '元',
        'sortNum': 4
    },
    'realRoi': {
        'name': 'ROI',
        'unit': '',
        'sortNum': 5
    },
    'pay': {
        'name': '成交额',
        'unit': '元',
        'sortNum': 6
    },
    'payCount': {
        'name': '总成交数',
        'unit': '',
        'sortNum': 7
    },
    'dayCtr': {
        'name': '全网点击率',
        'unit': '%',
        'sortNum': 8
    },
    'dayPrice': {
        'name': '全网均价',
        'unit': '元',
        'sortNum': 9
    },
    'avgPos': {
        'name': '平均展现排名',
        'unit': '',
        'sortNum': -1
    },
    'cpm': {
        'name': '千次展现花费',
        'unit': '元',
        'sortNum': -2
    },
    'directPay': {
        'name': '直接成交额',
        'unit': '元',
        'sortNum': -3
    },
    'directPayCount': {
        'name': '直接成交数',
        'unit': '',
        'sortNum': -4
    },
    'indirectPay': {
        'name': '间接成交额',
        'unit': '元',
        'sortNum': -5
    },
    'indirectPayCount': {
        'name': '间接成交数',
        'unit': '',
        'sortNum': -6
    },
    'favItemCount': {
        'name': '收藏宝贝数',
        'unit': '',
        'sortNum': -7
    },
    'favShopCount': {
        'name': '收藏店铺数',
        'unit': '',
        'sortNum': -8
    },
    'favCount': {
        'name': '总收藏数',
        'unit': '',
        'sortNum': -9
    },
    'cvr': {
        'name': '点击转化率',
        'unit': '%',
        'sortNum': -10
    },
    'dayPv': {
        'name': '全网展现指数',
        'unit': '',
        'sortNum': -14
    },
    'dayClick': {
        'name': '全网点击指数',
        'unit': '',
        'sortNum': -15
    },
    'cartTotal': {
        'name': '总购物车数',
        'unit': '',
        'sortNum': -11
    },
    'directCartTotal': {
        'name': '直接购物车数',
        'unit': '',
        'sortNum': -12
    },
    'indirectCartTotal': {
        'name': '间接购物车数',
        'unit': '',
        'sortNum': -13
    },
    'dayCompetition': {
        'name': '全网竞争度',
        'unit': '',
        'sortNum': -18
    },
    'dayCvr': {
        'name': '全网转化率',
        'unit': '%',
        'sortNum': '-19'
    },
    'directPpr': {
        'name': '直接加购率',
        'unit': '%',
        'sortNum': -20
    },
    'indirectPpr': {
        'name': '间接加购率',
        'unit': '%',
        'sortNum': -21
    },
    'pprTotal': {
        'name': '总加购率',
        'unit': '%',
        'sortNum': -22
    },
    'favItemRate': {
        'name': '宝贝收藏率',
        'unit': '%',
        'sortNum': -23
    },
    'favShopRate': {
        'name': '店铺收藏率',
        'unit': '%',
        'sortNum': -24
    },
    'favRate': {
        'name': '总收藏率',
        'unit': '%',
        'sortNum': -25
    },
    'directPprFavRate': {
        'name': '直接加购收藏率',
        'unit': '%',
        'sortNum': -26
    }
}
// 获得默认选中列
export function getKeywordDefaultReportCols( ) {
    return compact(map(keywordReports, ( a, b ) => ( a.sortNum > -1 && b )))
}

export const validator = {
    editPrice: ( rule, value, callback ) => {
        const price = parseFloat( value );
        if ( price >= 0.05 && price <= 99.99 || value.length == 0 ) {
            callback( );
        } else {
            callback( '建议限价最低0.05，最高99.99' )
        }
    }
}

export const OPTIMIZE_TYPE = {
    '1': '全自动优化',
    '0': '只优化价格',
    '-1': '不自动优化',
    '2': '只优化出词',
    '3': '宝贝不优化[出词&出价]',
    '9': '按配置优化'
}
