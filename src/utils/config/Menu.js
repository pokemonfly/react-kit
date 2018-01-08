/**
 * @fileOverview
 * @author crow
 * @time 2017/11/30
 */
// 注意：href属性和sub属性不能同时存在在一个对象里面，业务场景约定
export default [
    {
        iconName: 'shouye',
        name: '首页',
        href: '/index',
        type: 'index',
    },
    {
        iconName: 'zhinengtuiguang',
        name: '智能推广',
        type: 'auto'
    },
    {
        iconName: 'shoudongtuiguang',
        name: '手动推广',
        type: 'manual'
    },
    {
        iconName: 'jinnang',
        name: '锦囊服务',
        type: 'smart'
    },
    {
        iconName: 'kuaichewang',
        name: '快车网',
        href: '/sources/fastUser/redirectToFast',
        blank: true,
        type: 'fast'
    },
    {
        iconName: 'gongju',
        name: '工具',
        type: 'tool',
        sub: [
            {
                name: '关键词管理',
                type: 'keyWords',
                href: ''
            },
            {
                name: '创意图管理',
                type: 'creative',
                href: ''
            },
            {
                name: '报告管理',
                type: 'report',
                href: ''
            },
            {
                name: '宝贝多计划推广',
                type: 'multiPlan',
                href: ''
            },
            {
                name: '多店铺切换',
                type: 'multiShop',
                href: ''
            },
            {
                name: '余额/日限额短信提醒',
                type: 'sms',
                href: ''
            },
            {
                name: '年中策略报告',
                type: 'midYearReport',
                href: ''
            },
            {
                name: '质量分分布',
                type: 'qualityLie',
                href: ''
            },
            {
                name: '违禁词检测',
                type: 'banWordCheck',
                href: ''
            }
        ]
    },
    {
        iconName: 'kuaichexuetang',
        name: '快车学堂',
        type: 'school'
    },
]