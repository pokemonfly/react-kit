import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { Layout, Table, Button, Pagination, Icon,Spin } from 'antd'
import { fetchWorkOrderList, fetchTicketList, fetchGroupList, remindTrigger,cbFetGetDetail } from './OrderRedux'
import OrderDetail from './OrderDetail'
import './OrderList.less'
import eventProxy from '@/utils/eventProxy'
import OrderStatus from '@/utils/config/OrderStatus'
import OrderType from '@/utils/config/OrderType'


const nowTime = moment()
@connect( state => ( { location: state.location, dataObj: state.workOrder.list } ), dispatch => ( bindActionCreators( {
    fetchTicketList,
    remindTrigger
}, dispatch ) ) )
export default class OrderList extends Component {
    columns = [
        {
            title: '用户名',
            dataIndex: 'userNick',
            key: 'userNick'
        }, {
            title: '操作车手',
            dataIndex: 'memberNick',
            key: 'memberNick'
        }, {
            title: '类型',
            dataIndex: 'formatOrderType',
            key: 'formatOrderType',
            filters: OrderType,
            filterMultiple: false
        }, {
            title: '提交人',
            dataIndex: 'commitService',
            key: 'commitService'
        }, {
            title: '提交时间',
            dataIndex: 'formatCommitTime',
            key: 'formatCommitTime',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.age - b.age
        }, {
            title: '状态',
            dataIndex: 'formatAcceptanceStatus',
            key: 'formatAcceptanceStatus',
            filters: OrderStatus,
            filterMultiple: false,
            render:(text, row, index)=>{
                const { commitTime, acceptanceStatus, editable, processible } = row
                if(acceptanceStatus==0 || acceptanceStatus==1){
                    return (<span className="order-list-point">{row.formatAcceptanceStatus}</span>)
                }else {
                    return row.formatAcceptanceStatus
                }
            }
        }, {
            title: '待处理人',
            dataIndex: 'acceptanceService',
            key: 'acceptanceService'
        }, {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            render: ( text, row, index ) => {
                const { commitTime, acceptanceStatus, editable, processible } = row
                const diffTime = nowTime.diff( moment( commitTime ), 'hours' )

                const isOver = acceptanceStatus != -1 && acceptanceStatus != 9
                // if ( acceptanceStatus != -1 && acceptanceStatus != 9 ) {
                    return ( <div>
                        { isOver && (
                            <div className="inline-block">
                                {processible && ( <Icon type="upload" onClick={this.showDetail.bind( this, row )} className="operation-icon"/> )}
                                {diffTime>=1 && (
                                    <div className="inline-block mgl5 mgr5">
                                        逾期{diffTime}小时
                                    </div>
                                )}
                                <Button type="primary" onClick={this.triggerRemind.bind( this, row )} size="small">催单</Button>
                            </div>
                        )}
                        <Button type="primary" className="mgl5 inline-block" onClick={this.showDetail.bind( this, row )} size="small">显示详情</Button>
                    </div> )
                // } else {
                //     return null
                // }
            }
        }
    ];

    state = {
        total: 0,
        pageNo: 1,
        currentOrderData: {}
    }

    showDetail( obj,e ) {
        e.stopPropagation();

        switch (obj.orderType) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 8:
                this.redirectOldCrm(obj.serialNumber)
                break;
            default:
                obj.isCouldChange = false;
                obj.isShowBtns = true;
                this.setState( {
                    currentOrderData: obj
                }, () => {
                    this.refs.orderDetail && this.refs.orderDetail.show();
                } )
                break;
        }


    }

    getData() {
        const { dataObj } = this.props
        let vos = dataObj.dataObj.vos || []
        // return orderList.map(id => orderMap[id])
        return dataObj.dataObj.vos;
    }

    triggerRemind( obj,e ) {
        e.stopPropagation();
        this.props.remindTrigger( { serialNumber: obj.serialNumber } )

    }

    componentDidMount = (next) =>{
        let props = this.props,
            location = props.location

        if(location.query.serialNumber){
            let row = {
                isCouldChange:false,
                isShowBtns:false,
                serialNumber:location.query.serialNumber
            }
            this.setState( {
                currentOrderData: row
            }, () => {
                this.refs.orderDetail && this.refs.orderDetail.show();
            } )
        }

    }

    change( page, pageSize ) {
        eventProxy.trigger( 'changePageNo', page );
    }

    componentWillReceiveProps( nextProps ) {
        const { dataObj } = nextProps
        let paging = dataObj.dataObj.paging

        if ( paging ) {
            this.setState( { pageNo: paging.pageNoInt, total: paging.totalRecordCount } )
        }
    }

    handleTableChange = (pagination, filters, sorter) => {
        eventProxy.trigger('filter', pagination, filters, sorter);
    }

    edit = ( record ) => {
        this.orderDetail.showWithState( { orderId: record.id } )
    }

    redirectOldCrm (serialNumber){
        cbFetGetDetail({
            serialNumber:serialNumber
        },(json)=>{

            if(json.success){
                let data = json.data
                let newWindow = window.open();
                newWindow.location.href = data.redirectUrl;

            }

        })
    }

    getIsReading = () =>{
        const {dataObj} = this.props

        return dataObj.isFetchingTicketList
    }

    onRowClick = ( row, index, e ) => {

        switch (row.orderType){
            case 1:
            case 2:
            case 3:
            case 4:
            case 8:

                this.redirectOldCrm(row.serialNumber)

                break;
            default:
                // TODO 行点击
                row.isCouldChange = false;
                row.isShowBtns = false;
                this.setState( {
                    currentOrderData: row
                }, () => {
                    this.refs.orderDetail && this.refs.orderDetail.show();
                } )
                break;


        }


    }
    render() {
        const dataSource = this.getData()

        const isReading = this.getIsReading();

        return ( <Layout>
            <Spin spinning={isReading} size="large">
                <Table dataSource={dataSource} onChange={this.handleTableChange}  pagination={false} columns={this.columns} rowKey="id" bordered={true} />
                <div className="clearfix">
                    <Pagination onChange={this.change} className="pull-right mgt10" total={this.state.total} current={this.state.pageNo} defaultPageSize={10}/>
                </div>
            </Spin>
            <OrderDetail ref="orderDetail" detailObj={this.state.currentOrderData}/>
        </Layout> )
    }
}
