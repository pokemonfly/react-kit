import axios from 'axios'

function ajax( option ) {
    let params = {
        baseURL: ''
    }
    if ( Object.prototype.toString.call( option ) === '[object String]' ) {
        params.url = option
        params.method = 'GET'
    } else {
        params = Object.assign( params, option )
        if ( ( option.method ).toUpperCase() === 'GET' ) {
            params.params = params.data
            delete params.data
        }
    }
    return axios( params ).then( res => {
        if ( res.data ) {
            return {
                data: res.data,
                headers: res.headers
            }
        }
        return Promise.reject( new Error( 'No response data.' ) )
    } )
}

export default ajax