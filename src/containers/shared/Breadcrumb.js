/**
 * 面包屑
 * @fileOverview
 * @author crow
 * @time 2017/11/27
 */
import "./Breadcrumb.less"

import React, {Component} from 'react';
import {Breadcrumb, Menu, Dropdown, Icon, Tag} from 'antd';
import {Link} from 'react-router'

export default class BreadcrumbEX extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        let {campaign, list, dropDownClick} = this.props

        let breadcrumb = getBreadcrumbItem(list, campaign, dropDownClick)

        return (
            <Breadcrumb className="breadcrumb">
                {breadcrumb}
            </Breadcrumb>
        )
    }
}

/**
 * 获得面包屑item
 * @param list
 * @param campaign
 * @param dropDownClick
 * @returns {Array}
 */
function getBreadcrumbItem(list, campaign, dropDownClick) {
    let items = list.map((elem, index) => {
        if (elem.href) {
            return <Breadcrumb.Item key={index}><Link
                to={elem.href}>{elem.title}</Link></Breadcrumb.Item>
        } else {
            return <Breadcrumb.Item key={index}>{elem.title}</Breadcrumb.Item>
        }
    })
    if (campaign.list.length > 0) {
        let menuItems = getMenuItem(campaign, dropDownClick)
        items.splice(campaign.index, 0, <Breadcrumb.Item
            key={campaign.index + list.length}>{menuItems}</Breadcrumb.Item>)
    }
    return items
}

/**
 * 获得下拉元素
 * @param campaign
 * @param dropDownClick
 * @returns {XML}
 */
function getMenuItem(campaign, dropDownClick) {
    let activeData
    let items = campaign.list.map(elem => {
        let key = elem.isMandate ? elem.engineNo + '_auto' : elem.campaignId + '_manual'
        if (elem.campaignId.toString() === campaign.campaignIdActive) {
            activeData = elem
        }
        return (
            <Menu.Item key={key}>
                <Link to={{
                    pathname: '/list',
                    query: {campaignId: elem.campaignId}
                }}><Tag>{elem.tagName}</Tag> {elem.title}</Link>
            </Menu.Item>
        )
    })


    if (activeData) {
        if (activeData.isMandate) {
            return (
                <Dropdown overlay={<Menu onClick={dropDownClick}>{items}</Menu>}>
                    <a className="ant-dropdown-link">
                        <Tag>{activeData.tagName}</Tag>{activeData.title} （计划加入自动优化：{activeData.createTimeFormat}）<Icon
                        type="down"/>
                    </a>
                </Dropdown>
            )
        } else {
            return (
                <Dropdown overlay={<Menu onClick={dropDownClick}>{items}</Menu>}>
                    <a className="ant-dropdown-link">
                        <Tag>{activeData.tagName}</Tag>{activeData.title} <Icon type="down"/>
                    </a>
                </Dropdown>
            )
        }
    }
}