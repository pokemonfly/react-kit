import React from 'react';
import { connect } from 'react-redux'
import { Dropdown, Button } from 'antd'
import styles from './header.less';
import Icon from '@/containers/shared/Icon'
@connect( state => ( { user: state.user } ) )
export default class Header extends React.Component {
    state = {
        csDropdownVisible: false
    }
    handleVisibleChange( key, flag ) {
        this.setState( { [ key ]: flag } );
    }
    render() {
        let { user } = this.props
        const { csDropdownVisible } = this.state
        return ( <div className='page-header'>
            <span className="title">CRM - 新版</span>
        </div> );
    }
}
