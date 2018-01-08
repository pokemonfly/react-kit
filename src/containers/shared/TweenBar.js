import React, { Component, PropTypes } from 'react';
import Icon from '@/containers/shared/Icon'
import classnames from 'classnames';
import { debounce } from 'lodash';
import './TweenBar.less'
// 参考了 https://github.com/react-component/tabs/blob/master/src/ScrollableTabBarMixin.js
export default class TweenBar extends React.Component {
    state = {
        offset: 0,
        next: true,
        prev: true
    }
    componentDidMount( ) {
        this.resizeEvent = debounce( ( ) => {
            this.setNextPrev( );
        }, 200 );
        window.addEventListener( "resize", this.resizeEvent, false );

    }
    componentWillUnmount( ) {
        if ( this.resizeEvent ) {
            window.removeEventListener( "resize", this.resizeEvent );
        }
    }
    saveRef( name ) {
        return node => {
            this[name] = node;
        };
    }
    move( dr ) {
        const navWrapNode = this.navWrap;
        const navWrapNodeWH = this.getOffsetWH( navWrapNode );
        const { offset } = this.state;
        this.setOffset( offset + navWrapNodeWH * dr );
    }
    setTransform( style, v ) {
        style.transform = v;
        style.webkitTransform = v;
        style.mozTransform = v;
    }

    setOffset( offset, checkNextPrev = true ) {
        console.log( 'offset' + offset )
        const target = Math.min( 0, offset );
        if ( this.state.offset !== target ) {
            this.state.offset = target;
            this.setTransform( this.nav.style, `translate3d(${ target }px,0,0)` );
            if ( checkNextPrev ) {
                this.setNextPrev( );
            }
        }
    }
    setNextPrev( ) {
        const navNode = this.nav;
        const navNodeWH = this.getOffsetWH( navNode );
        const navWrapNode = this.navWrap;
        const navWrapNodeWH = this.getOffsetWH( navWrapNode );
        let { offset } = this.state;
        const minOffset = navWrapNodeWH - navNodeWH;
        let { next, prev } = this.state;
        if ( minOffset >= 0 ) {
            next = false;
            this.setOffset( 0, false );
            offset = 0;
        } else if ( minOffset < offset ) {
            next = ( true );
        } else {
            next = ( false );
            this.setOffset( minOffset, false );
            offset = minOffset;
        }

        if ( offset < 0 ) {
            prev = ( true );
        } else {
            prev = ( false );
        }

        this.setNext( next );
        this.setPrev( prev );
        return { next, prev };
    }
    getOffsetWH( node ) {
        return node['offsetWidth'];
    }
    setPrev( v ) {
        if ( this.state.prev !== v ) {
            this.setState({ prev: v });
        }
    }
    setNext( v ) {
        if ( this.state.next !== v ) {
            this.setState({ next: v });
        }
    }
    renderChild( ) {
        const { dataSource, config } = this.props;
        return Object.keys( config ).map(( key ) => {
            let num = dataSource[key]
            if (!Number.isFinite( + num )) {
                num = '-'
            }
            return (
                <li className="item" key={key}>
                    <p className="dataDes">
                        {config[key].name}{config[key].unit ? `（${ config[key].unit }）` : ''}
                    </p>
                    <p className="dataNum">{num}</p>
                </li>
            )
        })
    }
    render( ) {
        const { next, prev } = this.state
        const showNextPrev = prev || next;
        return (
            <div className="tween-bar">
                <div className="switch-area">
                    <div
                        className={classnames({
                        [ `arrow-prev` ]: 1,
                        [ `arrow-disabled` ]: !prev,
                        [ `arrow-show` ]: showNextPrev
                    })}
                        onClick={this.move.bind( this, 1 )}>
                        <Icon type="left-blod"/>
                    </div>
                    <div className="content" ref={this.saveRef( 'navWrap' )}>
                        <div className="items-wrap">
                            <ul className="items" ref={this.saveRef( 'nav' )}>
                                {this.renderChild( )}
                            </ul>
                        </div>
                    </div>
                    <div
                        className={classnames({
                        [ `arrow-next` ]: 1,
                        [ `arrow-disabled` ]: !next,
                        [ `arrow-show` ]: showNextPrev
                    })}
                        onClick={this.move.bind( this, -1 )}>
                        <Icon type="right-blod"/>
                    </div>
                </div>

            </div>
        )
    }
}
