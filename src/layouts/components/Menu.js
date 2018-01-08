import './MenuStyle.less'

import React from 'react';
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {Menu, Button} from 'antd';
import classNames from 'classnames'
import {Link} from 'react-router'
import {isEqual} from 'lodash'

import Icon from 'containers/shared/Icon'
import MENU_CONFIG from 'utils/config/Menu'
import {findIndex} from "utils/tools";
import {fetchEngineList, addAutoEngine} from 'containers/Engine/EngineRedux'
import {fetchCampaignList} from 'containers/Campaign/CampaignRedux'

const {Item, SubMenu} = Menu

const OPEN_KEYS_DEFAULT = []

/**
 * mode :  vertical   horizontal
 */
@connect(state => ({
    location: state.location,
    user: state.user,
    sider: state.layout.sider,
    engine: state.engine.data,
    campaign: state.campaign.data
}), dispatch => (bindActionCreators({
    fetchEngineList,
    fetchCampaignList,
    addAutoEngine
}, dispatch)))
export default class MenuEX extends React.Component {
    state = {
        openKeys: getOpenKeysDefault()
    };

    componentWillMount() {
        this.props.fetchEngineList()
        this.props.fetchCampaignList()
    }

    handleClick  = (e) => {
        this.setState({
            openKeys: e.keyPath
        })
    }
    onOpenChange = (openKeys) => {
        this.setState({
            openKeys
        })
    }

    render() {
        let {user, engine, campaign, location, sider} = this.props;

        let menuClz  = classNames({menu: true, collapsed: sider.collapsed})
        let menuList = getItems(engine, campaign)
        // TODO openKeys 只是针对总共有2级目录的处理
        if (this.state.openKeys)
        return (
            <Menu onClick={this.handleClick}
                  onOpenChange={this.onOpenChange}
                  selectedKeys={this.state.openKeys}
                  openKeys={[this.state.openKeys[1]]}
                  mode={sider.collapsed ? 'vertical' : "inline"}
                  className={menuClz}>
                {menuList}
            </Menu>
        )
    }
}

/**
 * 获得主类目列表
 * @returns {Array}
 */
function getItems(engine, campaign) {
    return MENU_CONFIG.map(elem => {
        // 引擎列表
        if (elem.type === 'auto') {
            let subItems = getEngineItems(engine)
            return (
                <SubMenu key={elem.type} title={< span> <Icon type={elem.iconName}/> < span
                    className='menu-title'>{elem.name}</span></span>}>
                    {subItems.length > 0 ? subItems : null}
                </SubMenu>
            )
        }

        // 手动计划列表
        if (elem.type === 'manual') {
            let subItems = getCampaignItems(campaign)
            return (
                <SubMenu key={elem.type} title={< span> <Icon type={elem.iconName}/> < span
                    className='menu-title'>{elem.name}</span></span>}>
                    {subItems.length > 0 ? subItems : null}
                </SubMenu>
            )
        }

        // 主目录为跳转链接列表
        if (elem.href) {
            if (elem.blank) {
                return (
                    <Item key={elem.type}>
                        <a href={elem.href} target="_black">
                            <Icon type={elem.iconName}/>
                            <span className='menu-title'>{elem.name}</span>
                        </a>
                    </Item>
                )
            } else {
                return (
                    <Item key={elem.type}>
                        <Link to={elem.href}>
                            <Icon type={elem.iconName}/>
                            <span className='menu-title'>{elem.name}</span>
                        </Link>
                    </Item>
                )
            }
        }

        // 具有子类目列表
        if (elem.sub) {
            let subItems = getSubItems(elem.sub)
            return (
                <SubMenu key={elem.type} title={< span> <Icon type={elem.iconName}/> < span
                    className='menu-title'>{elem.name}</span></span>}>
                    {subItems}
                </SubMenu>
            )
        }

        // 默认
        return (
            <Item key={elem.type}>
                <Icon type={elem.iconName}/>
                <span className='menu-title'>{elem.name}</span>
            </Item>
        )
    })
}

/**
 * 获得子目录列表
 * @param list
 * @returns {Array}
 */
function getSubItems(list) {
    return list.map(elem => {
        return (
            <Item key={elem.type}><Link to={elem.href}>{elem.name}</Link></Item>
        )
    })
}

/**
 * 获得引擎目录列表
 * @param engine
 * @returns {Array}
 */
function getEngineItems(engine) {
    return engine.map((value) => {
        if (value.campaignId) {
            return (
                <Item key={value.engineNo}>
                    <Link to={{
                        pathname: '/list',
                        query: {campaignId: value.campaignId}
                    }}>
                        {value.engineNo}号引擎：{value.typeName}策略
                    </Link>
                </Item>
            )
        } else {
            return (
                <Item key={value.engineNo}>
                    {value.engineNo}号引擎：<Button size="small">{value.typeName}</Button>
                </Item>
            )
        }
    })
}

/**
 * 获得手动推广的目录列表
 * @param campaign
 * @returns {Array}
 */
function getCampaignItems(campaign) {
    return campaign.map(elem => {
        if (!elem.isMandate) {
            return (
                <Item key={elem.campaignId}>
                    <Link to={{pathname: '/list', query: {campaignId: elem.campaignId}}}>
                        {elem.title}
                    </Link>
                </Item>
            )
        }
    })
}

/**
 * 通过当前location获得openKeys
 * @param location
 * @param engine
 * @param campaign
 * @returns {*}
 */
function getOpenKeys(location, engine, campaign) {
    let index = -1
    switch (location.pathname) {
        case '/list':
            index = findIndex(engine, 'campaignId', location.query.campaignId)
            if (index === -1) {
                index = findIndex(campaign, 'campaignId', location.query.campaignId)
                if (index === -1) {
                    return getOpenKeysDefault()
                }
                return [parseInt(campaign[index].campaignId, 10), 'manual']
            }

            return [parseInt(engine[index].engineNo, 10), 'auto']
        default:
            index = findIndex(MENU_CONFIG, 'href', location.pathname)
            if (index === -1) {
                return getOpenKeysDefault()
            }
            return [MENU_CONFIG[findIndex(MENU_CONFIG, 'href', location.pathname)].type]
    }
}

/**
 * 获得默认的openKeys
 * @returns {*}
 */
function getOpenKeysDefault() {
    return Object.assign([], OPEN_KEYS_DEFAULT)
}