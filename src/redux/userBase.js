// 获得用户基础信息 全局使用
import ajax from '../utils/ajax'
import moment from 'moment'
import { versionNameMap } from '@/utils/constants'
export const REQ_USER_INFO = 'REQ_USER_INFO'
export const RES_USER_INFO = 'RES_USER_INFO'

export const reqUserInfo = ( ) => {
    return {
        type: REQ_USER_INFO,
        data: {
            isFetching: true
        }
    }
}
export const resUserInfo = ( data ) => {
    return { type: RES_USER_INFO, data }
}

export function fetchUserInfo( ) {
    return dispatch => {
        dispatch(reqUserInfo( ))
        return ajax({
            api: '/sources/users',
            format: json => {
                let obj = json.data.users
                obj.versionName = versionNameMap[obj.versionNum] || '未知'
                obj.expireDate = moment( obj.expireDate ).format( 'YYYY-MM-DD' );
                return obj;
            },
            success: data => dispatch(resUserInfo( data )),
            error: err => console.error( err )
        })
    }
}

export default function userBaseReducer( state = {}, action ) {
    switch ( action.type ) {
        case REQ_USER_INFO:
        case RES_USER_INFO:
            return {
                ...state,
                ...action.data
            }
        default:
            return state
    }
}
