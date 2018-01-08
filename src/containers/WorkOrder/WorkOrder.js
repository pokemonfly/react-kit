import React, { Component } from 'react';
import { Layout } from 'antd'
import OrderHead from './components/OrderHead'
import OrderList from './components/OrderList'
import './WorkOrder.less';

export default class WorkOrder extends Component {
    render() {
        return ( <Layout className="work-order">
            <OrderHead/>
            <OrderList/>
        </Layout> );
    }
}
