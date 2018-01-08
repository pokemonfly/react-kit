import React from 'react';
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux';
import {Layout, Button, Avatar} from 'antd';
import Icon from '../../containers/shared/Icon';
import {toggleSider} from './LayoutsRedux'
import './SiderStyle.less'

@connect(state => ({
    user: state.user,
    sider: state.layout.sider
}), dispatch => ( bindActionCreators({
    toggleSider
}, dispatch) ))
export default class MenuSider extends React.Component {
    render() {
        const {user, sider} = this.props;
        const avatarSize    = sider.collapsed ? 'default' : "large"
        return (
            <Layout.Sider collapsible collapsed={sider.collapsed} width="160" collapsedWidth="60" trigger={null}
                          className="sider">
                <div className="sider-trigger" onClick={this.props.toggleSider}>
                    <Icon type="shouqi1"/>
                </div>
                <div className="sider-user-logo">
                    <div className="user-pic">
                        <Avatar size={avatarSize}
                                src={`http://wwc.taobaocdn.com/avatar/getAvatar.do?userId=${ user.userId }&width=60&height=60&type=sns`}/>
                    </div>
                    <p className='user-nick'>{user.userNick}</p>
                </div>
                <div className="op-btn">
                    <Button type="primary" size="small">续费/升级</Button>
                    <Button type="primary" size="small">签到有礼</Button>
                </div>
                {this.props.children}
            </Layout.Sider>
        )
    }
}
