import Frame from '../layouts/Frame';
import WorkOrder from '../containers/WorkOrder/index';

export const createRoutes = ( store ) => ( {
    path: '/',
    component: Frame,
    indexRoute: WorkOrder( store ),
    childRoutes: [ WorkOrder( store ) ]
} )

export default createRoutes
