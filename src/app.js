import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'babel-polyfill'
import Routes from './routes'
import { history, createStore, makeRootSaga } from './redux';

const store = createStore( {}, {
    // app: appReducer
}, makeRootSaga( [] ) )

ReactDOM.render( (
    <Provider store={store}>
    <div>
        <Routes history={history}/>
    </div>
</Provider>
), document.getElementById( 'root' ) );