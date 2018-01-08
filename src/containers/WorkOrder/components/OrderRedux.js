import ajax from '@/utils/ajax'
import { notify } from '@/utils/tools'
import { normalize, schema } from 'normalizr'
import { isEmpty, map,isNumber } from 'lodash'
import moment from 'moment';
const { Entity } = schema;

export const REQ_GETUSER_INFO = 'REQ_GETUSER_INFO'
export const RES_GETUSER_INFO = 'RES_GETUSER_INFO'

export const REQ_WORKORDER_LIST = 'REQ_WORKORDER_LIST'
export const RES_WORKORDER_LIST = 'RES_WORKORDER_LIST'

export const REQ_TICKET_LIST = 'REQ_TICKET_LIST'
export const RES_TICKET_LIST = 'RES_TICKET_LIST'

export const REQ_GROUP_LIST = 'REQ_GROUP_LIST'
export const RES_GROUP_LIST = 'RES_GROUP_LIST'

export const REQ_SERIAL_NUM = 'REQ_SERIAL_NUM'
export const RES_SERIAL_NUM = 'RES_SERIAL_NUM'

export const REQ_ACCEPT_SERVICE = 'REQ_ACCEPT_SERVICE'
export const RES_ACCEPT_SERVICE = 'RES_ACCEPT_SERVICE'

export const REQ_COMMITTER = 'REQ_COMMITTER'
export const RES_COMMITTER = 'RES_COMMITTER'

export const REQ_WORKORDER = 'REQ_WORKORDER'
export const RES_WORKORDER = 'RES_WORKORDER'

export const REQ_GETORDERDETAIL = 'REQ_GETORDERDETAIL'
export const RES_GETORDERDETAIL = 'RES_GETORDERDETAIL'

export const REQ_GETORDERDETAILLOGS = 'REQ_GETORDERDETAILLOGS'
export const RES_GETORDERDETAILLOGS = 'RES_GETORDERDETAILLOGS'

export const REQ_POSTPROCESS = 'REQ_POSTPROCESS'
export const RES_POSTPROCESS = 'RES_POSTPROCESS'

//------------   get order list
export const reqGetUserInfo = () => {
    return {
        type: REQ_GETUSER_INFO,
        data: {
        }
    }
}
export const resGetUserInfo = ( data ) => {
    console.log( 'normalize Result : ', data )

    switch (data.data.cus.cusNick){
        case "快云科技:小优":
            data.data.cus.isManger = true
            data.data.cus.isLowerManger = true
            break;
        case "快云科技:暮暮":
        case "快云科技:木子":
            data.data.cus.isLowerManger = true
            break;
        default:
            break;
    }

    return {
        type: RES_GETUSER_INFO,
        data: {
            userInfoObj: data.data.cus
        }
    }
}
export function fetchGetUserInfo( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqGetUserInfo() )
        return ajax( {
            api: '/users/user/info/query',
            method: 'post',
            body: params,
            format: json => {
                return json
            },
            success: data => dispatch( resGetUserInfo( data ) )
        } )
    }
}

export const formatTicketList = (obj) => {
    const formatOrderTypeMap = {
        1:"退款",
        2:"暂停",
        3:"转店铺",
        4:"换车手",
        8:"差评",
        // 9:"投诉",
        10:"反馈-旧",
        11:"反馈-意向退款",
        12:"反馈-投诉",
        13:"反馈-其他",
        14:"反馈-找车手",
        15:"反馈-换软件"
    };
    const formatAcceptanceStatus = {
        '-1':"已关闭",
        '0':"待受理",
        '1':"受理中",
        '8':"已驳回",
        '9':"已完结"
    };

    var orderType,formatOrderType,orderType;
    obj.vos.forEach(function (elem) {

        if(elem.orderType==10){
            if(elem.type==0){
                orderType = 11;
            }else if(elem.type==1){
                orderType = 12;
            }else if(elem.type==2){
                orderType = 14;
            }else if(elem.type==3){
                orderType = 15;
            }else if(elem.type==4){
                orderType = 13;
            }
        }else {
            orderType = elem.orderType;
        }

        if(orderType==4){
            formatOrderType = elem.turnRider.originalRiderNick+"-换车手-"+elem.turnRider.targetRiderNick;
        }else {
            formatOrderType = formatOrderTypeMap[orderType];
        }

        elem.formatCommitTime = moment(elem.commitTime).format('YYYY-MM-DD HH:mm')
        elem.formatOrderType = formatOrderType
        elem.formatAcceptanceStatus = formatAcceptanceStatus[elem.acceptanceStatus]
        
    });

    return obj
}

//------------   get order list
export const reqTicketList = () => {
    // notify( '检索咯~~' )
    return {
        type: REQ_TICKET_LIST,
        data: {
            isFetchingTicketList: true
        }
    }
}
export const resTicketList = ( data ) => {
    console.log( 'normalize Result : ', data )
    return {
        type: RES_TICKET_LIST,
        data: {
            dataObj: data,
            // orderMap: data.entities.orderItem,
            isFetchingTicketList: false
        }
    }
}
export function fetchTicketList( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqTicketList() )
        return ajax( {
            api: '/feedback/ticket/list',
            method: 'post',
            body: params,
            format: json => {
                if ( json.success ) {
                    // return normalize( json.data, { vos: [ orderItem ] } )
                    return formatTicketList(json.data)
                } else {
                    return []
                }
            },
            success: data => dispatch( resTicketList( data ) )
        } )
    }
}

//--------   get  all groups
export const formatGroupList = (obj) => {
   obj.allMembers = []

    let newMembers = {}
   for(let i in obj.members){
       obj.allMembers = obj.allMembers.concat(obj.members[i])
   }

   // for(let i in obj.groups){
   //     obj.groups[i].data = obj.members[i]
   //     obj.groups[i].groupKey = i
   // }
    //new format data
    for(let j in obj.groups){
        obj.groups[j].data = obj.members[obj.groups[j].id]
        newMembers[obj.groups[j].id] = obj.members[obj.groups[j].id]
    }
    newMembers.all = obj.allMembers
    
    obj.newMembers = newMembers

    return obj
}

export const reqGroupList = (data) => {
    return {
        type: REQ_GROUP_LIST,
        data: {
            groupList:data
        }
    }
}
export const resGroupList = ( data ) => {
    console.log( 'normalize Result : ', data )
    return {
        type: RES_GROUP_LIST,
        data: {
            groupList:data
        }
    }
}
export function fetchGroupList( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqGroupList({}) )
        return ajax( {
            api: '/feedback/ticket/groups',
            method: 'GET',
            body: params,
            format: json => {
                if ( json.success ) {
                    // return normalize( json.data, { vos: [ orderItem ] } )
                    return formatGroupList(json.data)
                } else {
                    return []
                }
            },
            success: data => dispatch( resGroupList( data ) )
        } )
    }
}

// remind trigger
export const reqRemind = () => {
    return {
        type: '',
        data: {
        }
    }
}
export const resRemind = ( data ) => {
    console.log( 'normalize Result : ', data )

    if(data.success){
        notify(data.data.message)
    }
    return {
        type: '',
        data: {
            remindData: data
        }
    }
}
export function remindTrigger( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqRemind() )
        return ajax( {
            api: '/feedback/ticket/remind/trigger',
            method: 'post',
            body: params,
            isClearCache:true,
            success: data => dispatch( resRemind( data ) )
        } )
    }
}

// leader view
export const reqLeaderView = () => {
    return {
        type: '',
        data: {
        }
    }
}
export const resLeaderView = ( data ) => {
    console.log( 'normalize Result : ', data )

    if(data.success){
        notify(data.data.message)
    }
    return {
        type: '',
        data: {
        }
    }
}
export function postLeaderView( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqLeaderView() )
        return ajax( {
            api: '/feedback/ticket/leader/review',
            method: 'post',
            body: params,
            isClearCache:true,
            success: data => dispatch( resLeaderView( data ) )
        } )
    }
}

//finishe order
export function finishOrder(params,cb) {
    return ajax( {
        api: '/feedback/ticket/finish',
        method: 'post',
        body: params,
        success: function (data) {
            cb && cb(data)
        }
    } )
}

// get new serialNumber
export const reqSerialNum = () => {
    return {
        type: REQ_SERIAL_NUM,
        data: {
        }
    }
}
export const resSerialNum = ( data ) => {
    console.log( 'normalize Result : ', data )
    return {
        type: RES_SERIAL_NUM,
        data: {
            serialNumber:data
        }
    }
}
export function fetchSerialNum( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqSerialNum() )
        return ajax( {
            api: '/feedback/ticket/init',
            method: 'post',
            body: params,
            format: json => {
                if ( json.success ) {
                    // return normalize( json.data, { vos: [ orderItem ] } )
                    return json.data
                } else {
                    return []
                }
            },
            success: data => dispatch( resSerialNum( data ) )
        } )
    }
}

// get new userNick

export const reqAcceptService = (data) => {
    return {
        type: REQ_SERIAL_NUM,
        data: {
            riderNickData:data
        }
    }
}
export const resAcceptService = ( data ) => {
    console.log( 'normalize Result : ', data )
    return {
        type: RES_SERIAL_NUM,
        data: {
            riderNickData:data
        }
    }
}
export function fetchAcceptService( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqAcceptService(null) )
        return ajax( {
            api: '/feedback/ticket/accept/service',
            method: 'GET',
            body: params,
            success: data => dispatch( resAcceptService( data ) )
        } )
    }
}

// get new committer
export const formatCommitter = (obj) => {
    let allArry = []
    allArry = allArry.concat(obj.riders)
    allArry = allArry.concat(obj.dxs)

    return allArry
}
export const reqCommitter = () => {
    return {
        type: REQ_COMMITTER,
        data: {
        }
    }
}
export const resCommitter = ( data ) => {
    console.log( 'normalize Result : ', data )
    return {
        type: RES_COMMITTER,
        data: {
            committerArry:data
        }
    }
}

export const s = ()=> {
    
}
export function fetchCommitter( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqCommitter() )
        return ajax( {
            api: '/feedback/ticket/committer',
            method: 'GET',
            body: params,
            format: json => {
                if ( json.success ) {
                    return formatCommitter(json.data)
                } else {
                    return []
                }
            },
            success: data => dispatch( resCommitter( data ) )
        } )
    }
}

// post new order
export const reqWorkOrder = (data) => {
    notify( '新建工单咯~' )
    return {
        type: REQ_WORKORDER,
        data: {
            postWordOrder:data
        }
    }
}
export const resWorkOrder = ( data ) => {
    console.log( 'normalize Result : ', data )
    return {
        type: RES_WORKORDER,
        data: {
            postWordOrder:data
        }
    }
}

export function postWorkOrder( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqWorkOrder({}) )
        return ajax( {
            api: '/feedback/ticket/new',
            method: 'post',
            body: params,
            success: data => dispatch( resWorkOrder( data ) )
        } )
    }
}

export function cbpostWorkOrder(params,cb) {
    return ajax( {
        api: '/feedback/ticket/new',
        method: 'post',
        body: params,
        success: data => {
            cb && cb(data)
        }
    } )
}

// post new log
export const reqNewLog = () => {
    notify( '提交工单咯~' )
    return {
        type: '',
        data: {
        }
    }
}
export const resNewLog = ( data ) => {
    console.log( 'normalize Result : ', data )
    return {
        type: '',
        data: {
        }
    }
}

export function postNewLog( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqNewLog() )
        return ajax( {
            api: '/feedback/ticket/new/log',
            method: 'post',
            body: params,
            format: json => {

                return json
            },
            success: data => dispatch( resNewLog( data ) )
        } )
    }
}

export function cbpostNewLog( params,cb ) {
    console.log( 'fetch params ：', params )
    return ajax( {
        api: '/feedback/ticket/new/log',
        method: 'post',
        body: params,
        success: function (json) {
            cb && cb(json)
        }
    } )
}

//get detail order
export const reqGetDetail = (data) => {
    // notify( '新建工单咯~' )
    return {
        type: REQ_GETORDERDETAIL,
        data: {
            isFetchingGetDetail:true,
            orderDetail:data
        }
    }
}
export const resGetDetail = ( data ) => {
    console.log( 'normalize Result : ', data )

    if(data.vo){
        data.vo.type = (data.vo.type || isNumber(data.vo.type))?data.vo.type.toString():''
        data.vo.channel = (data.vo.channel || isNumber(data.vo.channel))?data.vo.channel.toString():''
    }

    return {
        type: RES_GETORDERDETAIL,
        data: {
            isFetchingGetDetail:false,
            orderDetail:data
        }
    }
}

export function fetGetDetail( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqGetDetail({}) )
        return ajax( {
            api: '/feedback/ticket/detail',
            method: 'GET',
            body: params,
            format: json => {
                if ( json.success ) {
                    return json.data
                } else {
                    return []
                }
            },
            success: data => dispatch( resGetDetail( data ) )
        } )
    }
}

export function cbFetGetDetail(params,cb) {
    return ajax( {
        api: '/feedback/ticket/detail',
        method: 'GET',
        body: params,
        success: data => {
            cb && cb(data)
        }
    } )
}

//get detail orderLogs
export const reqGetDetailLogs = () => {
    // notify( '新建工单咯~' )
    return {
        type: REQ_GETORDERDETAILLOGS,
        data: {
            isFetchingDetailLogs:true
        }
    }
}
export const resGetDetailLogs = ( data ) => {
    console.log( 'normalize Result : ', data )
    
    return {
        type: RES_GETORDERDETAILLOGS,
        data: {
            detailLogs:data,
            isFetchingDetailLogs:false
        }
    }
}

function fomatDetailLogs(obj) {

    obj.newList = []

    let previousName
    obj.list.forEach(function (elem) {
        elem.formatupdTime = moment(elem.updTime).format('YYYY-MM-DD HH:mm')
        elem.key = elem.id

        
        if(previousName!=elem.username){
            obj.newList.push(elem)
            previousName = elem.username
        }

    })

    return obj
}

export function fetGetDetailLogs( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqGetDetailLogs() )
        return ajax( {
            api: '/feedback/ticket/logs',
            method: 'GET',
            body: params,
            format: json => {
                if ( json.success ) {
                    return fomatDetailLogs(json.data)
                } else {
                    return []
                }
            },
            success: data => dispatch( resGetDetailLogs( data ) )
        } )
    }
}

// handle process
export const reqProcess = (data) => {
    // notify( '新建工单咯~' )
    return {
        type: REQ_POSTPROCESS,
        data: {
            processData:data
        }
    }
}
export const resProcess = ( data ) => {
    console.log( 'normalize Result : ', data )
    return {
        type: RES_POSTPROCESS,
        data: {
            processData:data
        }
    }
}
export function postProcess( params ) {
    console.log( 'fetch params ：', params )
    return dispatch => {
        dispatch( reqProcess(null) )
        return ajax( {
            api: '/feedback/ticket/process',
            method: 'post',
            body: params,
            success: data => dispatch( resProcess( data ) )
        } )
    }
}

export function cbPostProcess(params,cb) {
    return ajax( {
        api: '/feedback/ticket/process',
        method: 'post',
        body: params,
        success: function (data) {
            cb && cb(data)
        }
    } )
}


//upload images base64
export function uploadBase64(params,cb) {
    return ajax( {
        api: '/feedback/ticket/attachment/upload/base64',
        method: 'post',
        body: params,
        success: function (data) {
            cb && cb(data)
        }
    } )
}


const defaultState = {
    userInfoObj:{},
    orderDetail:{},
    detailLogs:[],
    processData:null,
    postWordOrder:{},
    committerArry:[],
    riderNickData:null,
    serialNumber:{},
    groupList:{},
    dataObj:{},
    orderList: [],
    orderMap: {}
}
export default function orderReducer( state = defaultState, action ) {
    switch ( action.type ) {
        case REQ_GETUSER_INFO:
        case RES_GETUSER_INFO:
            return {
                ...state,
                ...action.data
            }
        case REQ_WORKORDER_LIST:
        case RES_WORKORDER_LIST:
            return {
                ...state,
                ...action.data
            }
        case REQ_TICKET_LIST:
        case RES_TICKET_LIST:
            return {
                ...state,
                ...action.data
            }
        case REQ_GROUP_LIST:
        case RES_GROUP_LIST:
            return {
                ...state,
                ...action.data
            }
        case REQ_SERIAL_NUM:
        case RES_SERIAL_NUM:
            return {
                ...state,
                ...action.data
            }
        case REQ_ACCEPT_SERVICE:
        case RES_ACCEPT_SERVICE:
            return {
                ...state,
                ...action.data
            }
        case REQ_COMMITTER:
        case RES_COMMITTER:
            return {
                ...state,
                ...action.data
            }
        case REQ_WORKORDER:
        case RES_WORKORDER:
            return {
                ...state,
                ...action.data
            }
        case REQ_GETORDERDETAIL:
        case RES_GETORDERDETAIL:
            return {
                ...state,
                ...action.data
            }
        case REQ_GETORDERDETAILLOGS:
        case RES_GETORDERDETAILLOGS:
            return {
                ...state,
                ...action.data
            }
        default:
            return state
    }
}
