/**
 * @fileOverview
 * @author crow
 * @time 2017/11/27
 */

import {findIndex} from 'utils/tools'
import ROUTER_CONFIG from 'utils/config/Router'


const GO_TO_PAGE = 'GO_TO_PAGE'

export default function breadcrumbReducer(state = {}, action) {
    let campaignId, index
    switch (action.type) {
        case 'GO_TO_PAGE':
            return {
                ...state,
                ...action.data
            }
        default:
            return state
    }
}


export function goToPage(pathname) {
    return {
        type: GO_TO_PAGE,
        data: {
            ...ROUTER_CONFIG[pathname]
        }
    }
}
