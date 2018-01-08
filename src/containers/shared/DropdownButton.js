import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Button } from 'antd'
import Trigger from '@/containers/shared/Trigger';
import { omit } from 'lodash'
/*
使用 @DropdownButton 来扩展原组件
参考 EditMultiWordPrice 的使用方式
*/
export default function DropdownButton( WrappedComponent ) {
    return class HOC extends React.Component {
        // 二选一
        static propTypes = {
            menu: PropTypes.array,
            getMenu: PropTypes.func
        }

        onVisibleChange = ( flag ) => {
            if ( flag ) {
                this.refs.trigger.setPopupVisible( false )
            }
        }

        handleButtonClick = ( key ) => {
            const { menuMap } = this.state
            key = key || this.state.key
            if ( key != this.state.key ) {
                this.setState( { key, currentName: menuMap[ key ].name } )
            }
            this.refs.trigger.setPopupVisible( true )
        }

        componentWillMount() {
            const menuMap = {}
            const menu = this.props.menu || this.props.getMenu()
            const key = menu[ 0 ].key;
            menu.forEach( i => {
                menuMap[ i.key ] = i
            } )
            this.state = {
                menuMap,
                key,
                currentName: menuMap[ key ].name
            }
        }

        getMenuItem() {
            const menu = this.props.menu || this.props.getMenu()
            return menu.filter( obj => ( obj.key != this.state.key ) ).map( obj => ( <Menu.Item key={obj.key}>
                <a onClick={this.handleButtonClick.bind( null, obj.key )}>{obj.name}</a>
            </Menu.Item> ) )
        }
        render() {
            const { currentName } = this.state
            const menu = this.props.menu || this.props.getMenu()
            const isSingle = menu.length == 1;
            if ( isSingle ) {
                const { name, key } = menu[ 0 ]
                return ( <Trigger ref='trigger' popup={( <WrappedComponent {...omit(this.props, ['menu'])} activeKey={this.state.key}></WrappedComponent> )}>
                    <Button type="primary" onClick={this.handleButtonClick.bind( null, key )}>{name}</Button>
                </Trigger> )
            } else {
                return ( <Trigger popup={( <WrappedComponent {...omit(this.props, ['menu'])} activeKey={this.state.key}></WrappedComponent> )} ref='trigger'>
                    <Dropdown.Button
                        type="primary"
                        trigger={[ 'click' ]}
                        placement="bottomCenter"
                        onClick={this.handleButtonClick.bind( null, null )}
                        onVisibleChange={this.onVisibleChange}
                        overlay={( <Menu selectedKeys={[]}>
                            {this.getMenuItem()}
                        </Menu> )}>
                        {currentName}
                    </Dropdown.Button>
                </Trigger> )
            }
        }
    }
}
