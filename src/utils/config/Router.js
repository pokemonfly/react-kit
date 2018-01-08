/**
 * @fileOverview
 * @author crow
 * @time 2017/11/29
 */

const HOME = {
    'title': '首页',
    'href': '/index'
};

const TOOL = {
    title: '工具'
}

export default {
    '/index': [HOME],
    '/list': [HOME, {'title': '智能推广'}],
    '/keyword': [HOME, {'title': '智能推广'}, {'title': '管理关键词'}],
    '/cases': [HOME, {'title': '超级学堂'}, {'title': '操作案例'}],
    '/school/video': [HOME, {'title': '超级学堂'}, {'title': '课程中心'}],
    '/school/article': [HOME, {'title': '超级学堂'}, {'title': '云鹤专栏'}],
    '/school/help': [HOME, {'title': '超级学堂'}, {'title': '帮助中心'}],
    '/tool/creativeTest': [HOME, TOOL, {'title': '创意测试'}],
    '/tool/creativeTest/detail': [HOME, TOOL, {'title': '创意测试', 'href': '/tool/creativeTest'}, {'title': '管理测试创意'}],
    '/tool/creativeTest/add': [HOME, TOOL, {'title': '创意测试', 'href': '/tool/creativeTest'}, {'title': '添加创意测试宝贝'}],
    '/tool/repeatWordManage': [HOME, TOOL, {'title': '重复词管理'}],
    '/tool/grabRanks': [HOME, TOOL, {'title': '抢排名词管理'}],
    '/tool/weekList': [HOME, TOOL, {'title': '托管周报告'}],
    '/tool/qualityLie': [HOME, TOOL, {'title': '质量分分布'}],
    '/tool/multiPlan/step1': [HOME, TOOL, {'title': '多计划推广', 'href': '/tool/multiPlan/step1'}],
    '/tool/multiPlan/step2': [HOME, TOOL, {'title': '多计划推广', 'href': '/tool/multiPlan/step1'}],
    '/tool/multiPlan/step3': [HOME, TOOL, {'title': '多计划推广', 'href': '/tool/multiPlan/step1'}],
    '/tool/multiPlan/step4': [HOME, TOOL, {'title': '多计划推广', 'href': '/tool/multiPlan/step1'}],
    '/tool/multiShop': [HOME, TOOL, {'title': '多店铺切换'}],
    '/tool/banWordSelItem': [HOME, TOOL, {'title': '违禁词检测', 'href': '/tool/banWordCheck'}],
    '/tool/banWordCheck': [HOME, TOOL, {'title': '违禁词检测', 'href': '/tool/banWordCheck'}],
    '/tool/banWordReport': [HOME, TOOL, {'title': '违禁词检测', 'href': '/tool/banWordCheck'}]
}