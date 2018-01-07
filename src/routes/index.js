import React, { Component } from 'react'
import { Route, Switch } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import AsyncComponent from '../utils/AsyncComponent'
// 具体模块 代码分割
const TestPage = AsyncComponent( () =>
    import ( /* webpackChunkName: "topics" */ '../components/containers/TestPage' )
)
const TestPage2 = AsyncComponent( () =>
    import ( /* webpackChunkName: "topics" */ '../components/containers/TestPage2' )
)
@connect()
export default class Routes extends Component {
    render() {
        return (
            <ConnectedRouter history={this.props.history}>
                 <Switch>
                       <Route exact path='/' component={TestPage} />
                       <Route path='/test' component={TestPage} />
                        <Route path='/test2' component={TestPage2} />
                 </Switch>
             </ConnectedRouter>
        )
    }
}