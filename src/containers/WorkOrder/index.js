import { injectReducer } from '../../redux/reducers';

export default( store ) => ( {
    path: 'workOrder',
    /* https://react-guide.github.io/react-router-cn/docs/API.html
        getComponent(location, callback)   callback(err, component) */
    getComponent( nextState, cb ) {
        require.ensure( [], ( require ) => {
            const WorkOrder = require( './WorkOrder' ).default
            const reducer = require( './WorkOrderRedux' ).default
            document.title = "工单列表"
            injectReducer( store, {
                key: 'workOrder',
                reducer
            } )
            cb( null, WorkOrder )
        }, 'workOrder' );
    }
} )
