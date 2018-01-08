import ReactDOM from 'react-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {syncHistoryWithStore} from 'react-router-redux';
import {hashHistory} from 'react-router';
import {Router} from 'react-router';

import routes from './routes/createRoute';
import DevTools from './redux/DevTools';
import configureStore from './redux/configureStore';

const store   = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

ReactDOM.render((
    <Provider store={store}>
        <div>
            <Router history={history} children={routes(store)}/> {< DevTools/>}
        </div>
    </Provider>
), document.getElementById('root'));
//__DEV__ &&
