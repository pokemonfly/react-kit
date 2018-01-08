import React from 'react';
import ReactDOM from 'react-dom';
import {
    Modal,
    Radio,
    Form,
    Input,
    Checkbox,
    Tooltip
} from 'antd'
import { omit } from 'lodash'
let _cache = {}

// 组件弹窗化 并显示
export function SimpleDialog( {
    wrapClassName = '',
    maskClosable = true,
    width = 320,
    zIndex = 1000,
    title = '弹窗',
    hasForm = false,
    sid = null,
    single = true,
    noFooter = false
} ) {
    return( WrappedComponent ) => {
        return( props ) => {
            // 防止重复弹窗
            if ( sid && single && _cache[ sid ] ) {
                return
            }
            // 追加DOM
            let div = document.createElement( 'div' );
            document.body.appendChild( div );
            _cache[ sid ] = div

            function remove() {
                const unmountResult = ReactDOM.unmountComponentAtNode( div );
                if ( unmountResult && div.parentNode ) {
                    div.parentNode.removeChild( div );
                }
                if ( _cache[ sid ] ) {
                    delete _cache[ sid ]
                }
            }

            class HOC extends React.Component {
                componentDidMount() {
                    // https://github.com/ant-design/ant-design/pull/2992  很绝望
                    this.wc = hasForm ? this.refs.wc.refs.wrappedComponent.refs.formWrappedComponent : this.refs.wc
                }
                close = () => {
                    this.wc.closeCallback && this.wc.closeCallback();
                    remove()
                }
                ok = () => {
                    let r = true;
                    this.wc.okCallback && ( r = this.wc.okCallback( remove ) );
                    if ( r ) {
                        remove()
                    }
                }
                render() {
                    let p = {
                        visible: true,
                        width,
                        maskClosable,
                        title,
                        wrapClassName,
                        zIndex
                    }
                    if ( noFooter ) {
                        p.footer = null
                    }
                    return ( <Modal onCancel={this.close} onOk={this.ok} {... p}>
                        <WrappedComponent {...props} ref="wc"/>
                    </Modal> )
                }
            }
            ReactDOM.render( ( <HOC/> ), div );
        }
    }
}


export function Dialog( {
    wrapClassName = '',
    maskClosable = true,
    width = 320,
    zIndex = 1000,
    title = '弹窗',
    hasForm = false,
    hasConnect = true,
    sid = null,
    single = true,
    noFooter = false
} ) {
    return( WrappedComponent ) => {
        class HOC extends React.Component {
            state = {
                visible: false
            }
            componentDidMount() {
                this.componentDidUpdate()
            }
            componentDidUpdate() {
                if ( this.refs.wc ) {
                    let rf = this.refs.wc
                    if ( hasConnect && rf.getWrappedInstance) {
                        rf = rf.getWrappedInstance();
                    }
                    if ( hasForm ) {
                        rf = rf.refs.wrappedComponent.refs.formWrappedComponent
                    }
                    this.rf = rf;
                    this.rf.close = this.close;
                }
            }
            close = () => {
                this.rf.closeCallback && this.rf.closeCallback();
                this.hide()
            }
            ok = () => {
                let r = true;
                this.rf.okCallback && ( r = this.rf.okCallback( this.hide ) );
                if ( r ) {
                    this.hide()
                }
            }
            setStatus( obj ) {
                this.rf && ( this.rf.setState( obj ) );
            }
            showWithState( obj ) {
                this.setState( {
                    visible: true
                }, () => {
                    this.setStatus( obj )
                } )
            }
            show = ( cb ) => {
                this.setState( {
                    visible: true
                }, cb )
            }
            hide = () => {
                this.setState( { visible: false } )
            }
            render() {
                let p = {
                    width,
                    maskClosable,
                    title,
                    wrapClassName,
                    zIndex
                }
                if ( noFooter ) {
                    p.footer = null
                }
                return (this.state.visible?<Modal {... p} onCancel={this.close} onOk={this.ok} visible={this.state.visible}>
                    <WrappedComponent {...this.props} {...omit(this.state, ['visible'])} ref="wc"/>
                </Modal>:null )
            }
        }
        return HOC;
    }
}
// 反向继承 试验中
export function DialogR( {
    wrapClassName = '',
    maskClosable = true,
    width = 320,
    zIndex = 1000,
    title = '弹窗',
    hasForm = false,
    hasConnect = true,
    sid = null,
    single = true,
    noFooter = false
} ) {
    return( WrappedComponent ) => class extends WrappedComponent {
        static displayName = `HOC(${ getDisplayName( WrappedComponent ) })`;
        constructor( p ) {
            super()
            // this.state.visible = false
        }
        setStatus( obj ) {
            this.setState( obj );
            return this
        }
        close = () => {
            this.closeCallback && this.closeCallback();
            this.hide()
        }
        ok = () => {
            let r = true;
            this.okCallback && ( r = this.okCallback( this.hide ) );
            if ( r ) {
                this.hide()
            }
        }
        show = () => {
            this.setState( { visible: true } )
        }
        hide = () => {
            this.setState( { visible: false } )
        }
        _render() {
            const elementsTree = super.render();
            const props = Object.assign( {}, elementsTree.props, this.state, { getRef: this.props.getRef } )
            const newElementsTree = React.cloneElement( elementsTree, props, elementsTree.props.children );
            return newElementsTree;
        }
        render() {
            let p = {
                width,
                maskClosable,
                title,
                wrapClassName,
                zIndex
            }
            if ( noFooter ) {
                p.footer = null
            }
            return ( <Modal {... p} onCancel={this.close} onOk={this.ok} visible={this.state.visible}>
                {this._render()}
            </Modal> )
        }
    }
}

function getDisplayName( WrappedComponent ) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
