import ajax from '../../utils/ajax'
import { normalize, schema } from 'normalizr'
import { getEngineType } from '@/utils/constants'
import { union, omit } from 'lodash'
const { Entity } = schema;

export const SIDER_TOGGLE = 'SIDER_TOGGLE'
export const REQ_ENGINES_INFO = 'REQ_ENGINES_INFO'
export const RES_ENGINES_INFO = 'RES_ENGINES_INFO'
export const REQ_CAMPAIGN_INFO = 'REQ_CAMPAIGN_INFO'
export const RES_CAMPAIGN_INFO = 'RES_CAMPAIGN_INFO'

export function toggleSider( ) {
    return { type: SIDER_TOGGLE }
}
export const reqEnginesInfo = ( ) => {
    return {
        type: REQ_ENGINES_INFO,
        data: {
            isFetching: true
        }
    }
}
export const resEnginesInfo = ( data ) => {
    return {
        type: RES_ENGINES_INFO,
        data: {
            engines: data.result.engines,
            // 虽然fetchCampaignInfo都拿到了，因为是异步的所以这里也要有,最后合并
            campaignMap: data.entities.campaign,
            isFetching: false
        }
    }
}
const campaign = new Entity('campaign', {}, {
    idAttribute: 'campaignId',
    processStrategy: ( obj ) => ({
        ...obj,
        typeName: getEngineType( obj.type )
    })
});

export function fetchEnginesInfo( ) {
    return dispatch => {
        dispatch(reqEnginesInfo( ))
        return ajax({
            api: '/sources/users/engines',
            format: json => {
                let obj;
                obj = normalize(json.data, {engines: [ campaign ]});
                return obj;
            },
            success: data => dispatch(resEnginesInfo( data )),
            error: err => console.error( err )
        })
    }
}

export const reqCampaignInfo = ( ) => {
    return {
        type: REQ_CAMPAIGN_INFO,
        data: {
            isFetching: true
        }
    }
}
export const resCampaignInfo = ( data ) => {
    return {
        type: RES_CAMPAIGN_INFO,
        data: {
            campaignMap: data.entities.campaign,
            manual: data.manual,
            isFetching: false
        }
    }
}

export function fetchCampaignInfo( ) {
    return dispatch => {
        dispatch(reqCampaignInfo( ))
        return ajax({
            api: '/sources/campaign',
            format: json => {
                const { data } = json;
                let obj;
                obj = normalize(data, {campaigns: [ campaign ]});
                obj.manual = data.campaigns.filter( obj => !obj.isMandate ).map( obj => obj.campaignId )
                return obj;
            },
            success: data => dispatch(resCampaignInfo( data )),
            error: err => console.error( err )
        })
    }
}

const defaultState = {
    sider: {
        collapsed: false
    },
    menu: {
        current: 'home'
    },
    engines: [],
    manual: [],
    campaignMap: {}
}
export default function layoutReducer( state = defaultState, action ) {
    switch ( action.type ) {
        case SIDER_TOGGLE:
            return {
                ...state,
                sider: {
                    collapsed: !state.sider.collapsed
                }
            }
        case REQ_ENGINES_INFO:
        case RES_ENGINES_INFO:
        case REQ_CAMPAIGN_INFO:
        case RES_CAMPAIGN_INFO:
            return {
                ...state,
                ...omit( action.data, 'campaignMap' ),
                campaignMap: {
                    ...state.campaignMap,
                    ...action.data.campaignMap
                }
            }
        default:
            return state
    }
}