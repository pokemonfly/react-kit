import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { routerReducer } from 'react-router-redux';
import { hashHistory } from 'react-router';
import createFetchMiddleware from 'redux-composable-fetch';
import ThunkMiddleware from 'redux-thunk';
import { browserHistory } from 'react-router'
import reducer from './reducers';
import DevTools from './DevTools';
import { updateLocation } from './location'

const FetchMiddleware = createFetchMiddleware({
    afterFetch({ action, result }) {
        return result.json( ).then(data => {
            return Promise.resolve({ action, result: data });
        });
    }
});

const finalCreateStore = compose(applyMiddleware( ThunkMiddleware, FetchMiddleware ), DevTools.instrument( ))( createStore );

export default function configureStore( initialState ) {
    const store = finalCreateStore( reducer( ), initialState );
    store.asyncReducers = {};
    store.unsubscribeHistory = browserHistory.listen(updateLocation( store ));

    return store;
}
