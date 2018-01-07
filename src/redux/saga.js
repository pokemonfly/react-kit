import { fork } from 'redux-saga/effects'
//  fork所有saga分支
const makeRootSaga = ( sagas ) => {
    return function* rootSaga() {
        yield sagas.map( saga => fork( saga ) )
    }
}
// 插入异步saga，更新store中fork的saga
const injectSagas = ( store, { key, sagas } ) => {
    if ( store.asyncSagas[ key ] ) {
        return
    }
    store.asyncSagas[ key ] = sagas
    store.runSaga( makeRootSaga( sagas ) )
}

export {
    makeRootSaga,
    injectSagas
}
