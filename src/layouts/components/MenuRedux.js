/**
 * @fileOverview
 * @author crow
 * @time 2017/11/30
 */

const UPDATE_CURRENT = 'UPDATE_CURRENT'
const UPDATE_CURRENT_BY_INDEX = 'UPDATE_CURRENT_BY_INDEX'

export default function menuReducer (state = {current: []}, action) {
    switch (action.type) {
        case UPDATE_CURRENT:
            return {
                ...state,
                ...action.data
            }
        case UPDATE_CURRENT_BY_INDEX:
            state.current[action.data.index] = action.data.value
            return Object.assign([], state)
        default:
            return state
    }
}

/**
 * 更新侧边栏当前状态
 * 类型依赖 config/menu
 * ex: ['1', 'auto'], ['123123', 'manual']
 * @param arr
 * @returns {{type: string, data: {current: Array}}}
 */
export function updateCurrent(arr = []) {
    return {
        type: UPDATE_CURRENT,
        data: {
            current: arr
        }
    }
}

export function updateCurrentByIndex(value, index) {
    return {
        type: UPDATE_CURRENT_BY_INDEX,
        data: {
            value,
            index
        }
    }
}