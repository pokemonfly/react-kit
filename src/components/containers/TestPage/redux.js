import { put, call, takeLatest } from 'redux-saga/effects'
import ajax from 'utils/ajax'

const REQ_LIST = 'REQ_LIST'
const RES_LIST = 'RES_LIST'


function reqList( data ) {
    return {
        type: REQ_LIST,
        data: data
    }
}

function resList( data ) {
    return {
        type: RES_LIST,
        data: data
    }
}

function* getListSaga( { payload } ) {
    const data = yield call( getList, payload )
    yield put( resList( data ) )
}
export function* TestSaga( action ) {
    // 接收最近一次请求，然后调用getListSaga子Saga
    yield takeLatest( REQ_LIST, getListSaga )
}

function getList( params = {
    page: 1,
    per_page: 10
} ) {
    return fetch( {
        ...API.getPostList,
        data: Object.assign( {}, initParam, params )
    } ).then( res => {
        if ( res ) {
            let data = formatPostListData( res.data )
            return {
                total: parseInt( res.headers[ 'X-WP-Total'.toLowerCase() ], 10 ),
                totalPages: parseInt( res.headers[ 'X-WP-TotalPages'.toLowerCase() ], 10 ),
                ...data
            }
        }
    } )
}

export default function reducer( state = {}, action ) {
    switch ( action.type ) {
        case RES_LIST:
            return {
                ...state,
                data: action.data
            }
    }
}