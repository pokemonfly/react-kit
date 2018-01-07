// ------------------------------------ Constants ------------------------------------
export const LOCATION_CHANGE = 'LOCATION_CHANGE'

// ------------------------------------ Actions ------------------------------------
export function locationChange( location = '/' ) {
    return { type: LOCATION_CHANGE, payload: location }
}

// ------------------------------------ Specialized Action Creator ------------------------------------
export const updateLocation = ({ dispatch }) => {
    return ( nextLocation ) => dispatch(locationChange( nextLocation ))
}

// ------------------------------------ Reducer ------------------------------------
const initialState = {
    query: {}
}
export default function locationReducer( state = initialState, action ) {
    return action.type === '@@router/LOCATION_CHANGE' ? action.payload : state
}
