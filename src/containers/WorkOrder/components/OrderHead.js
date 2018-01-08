import React, { Component } from 'react';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isEmpty,isNumber, map, keyBy} from 'lodash'
import {
    Radio,
    Form,
    Select,
    Button,
    Row,
    Col,
    Input,
    DatePicker
} from 'antd';
import CreateOrder from './CreateOrder'
import { fetchWorkOrderList, fetchTicketList, fetchGroupList, fetchGetUserInfo } from './OrderRedux'
import './OrderHead.less'
import eventProxy from '@/utils/eventProxy'
import OrderStatus from '@/utils/config/OrderStatus'
import OrderType from '@/utils/config/OrderType'

const OrderTypeMap = keyBy(OrderType, 'value')
const { MonthPicker, RangePicker } = DatePicker;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;
const PageSize = 10
@connect( state => ( { location: state.location, dataObj: state.workOrder.list } ), dispatch => ( bindActionCreators( {
    fetchWorkOrderList,
    fetchTicketList,
    fetchGroupList,
    fetchGetUserInfo
}, dispatch ) ) )
@Form.create()
export default class OrderHead extends Component {
    state = {
        val: '0',
        pageNo: 1,
        isTest: false,
        isShowGroup: false,
        defaultGroup: '',
        allMemberNick: [],
        isInit:false,
        orderType: '',
        acceptanceStatus: '',
        column:'',
        direction:''
    }

    componentDidMount() {
        this.query( { pageNo: this.state.pageNo } )
        this.props.fetchGroupList( {} )

        this.props.fetchGetUserInfo( {} )

        eventProxy.on( 'changePageNo', ( pageNo ) => {
            this.setState( { pageNo: pageNo } )
            this.query( {
                pageNo: pageNo,
                column: this.state.column,
                direction: this.state.direction
            } )
        } );

        eventProxy.on('filter', (pagination, filters, sorter) => {
            console.log(pagination, filters, sorter)
            this.props.form.setFieldsValue({
                orderType: !isEmpty(filters.formatOrderType) ? filters.formatOrderType[0] : '',
                acceptanceStatus: !isEmpty(filters.formatAcceptanceStatus) ? filters.formatAcceptanceStatus[0] : '',
            })
            const column = 'commit_time'
            const direction = !isEmpty(sorter) ? (sorter.order === 'descend' ? 'desc' : 'asc') : ''

            this.setState({
                column:column,
                direction:direction
            })

            this.query({column: column, direction: direction})
        });
    }

    componentWillReceiveProps( nextProps ) {
        let groupList = nextProps.dataObj.groupList,
            userInfoObj = nextProps.dataObj.userInfoObj

        //set default group
        if ( !isEmpty( groupList ) && !isEmpty( userInfoObj ) ) {

            if ( !userInfoObj.isLowerManger ) {
                for ( let i in groupList.groups ) {
                    if ( groupList.groups[ i ].data && groupList.groups[ i ].data.indexOf( userInfoObj.cusNick ) != -1 ) {


                        if(!this.state.isInit){
                            this.setState( {
                                allMemberNick:groupList.newMembers[i],
                                isInit:true
                            })
                        }

                    }
                }
            }

        }

    }

    componentDidUpdate() {
        if ( this._needQuery ) {
            this._needQuery = false;

            this.query( { pageNo: this.state.pageNo } )
        }
    }

    query({pageNo=1, pageSize = PageSize, column, direction}) {
        this.props.form.validateFields((err, formObj) => {
            console.log(formObj);

            let commitObj = {}
            for ( let i in formObj ) {
                if ( i == "TimeArry" ) {
                    commitObj.commitTimeFrom = formObj[ i ][ 0 ].format( "YYYY-MM-DD" );
                    commitObj.commitTimeTo = formObj[ i ][ 1 ].format( "YYYY-MM-DD" );
                } else {
                    commitObj[ i ] = formObj[ i ];
                }
            }

            commitObj.pageNo = pageNo.toString()
            commitObj.pageSize = pageSize.toString()

            if (column && direction) {
                commitObj.column = column
                commitObj.direction = direction
            }

            this.props.fetchTicketList( commitObj )
        } )

    }

    getGroupData() {
        const { dataObj } = this.props
        // this.state.allMemberNick = dataObj.groupList.allMembers || []
        return dataObj.groupList.groups || [];
    }

    getDefaultGroup(){
        const { userInfoObj,groupList } = this.props.dataObj
        let index

        if(!isEmpty(userInfoObj) && !isEmpty(groupList)){
            if(userInfoObj.isLowerManger){
                index = ''
            }else {
                groupList.groups.forEach(function (elem) {
                    if(elem.data && elem.data.indexOf(userInfoObj.username)!=-1){
                        index = elem.id
                    }
                })
            }
            return {
                defaultGroup:isNumber(index)?index.toString():'',
                isLowerManger:userInfoObj.isLowerManger
            }
        }


    }

    // getShowMemberNick(){     const {dataObj} = this.props     return
    // dataObj.groupList.allMembers?dataObj.groupList.allMembers[this.groupType]:[]; }
    changeRadio = ( obj ) => {
        let target = obj.target
        if ( target.name == "ownerType" ) {
            let isShowGroup = false
            if ( target.value == "5" ) {
                isShowGroup = true
            } else {
                isShowGroup = false
            }

            this.setState( { pageNo: 1, isShowGroup: isShowGroup } )
        }
        this._needQuery = true;
    }

    getMemberNick (){
        const {dataObj}   = this.props
        const {  getFieldValue } = this.props.form;
        const index  = getFieldValue('groupId') || 'all'
        if (!dataObj.groupList.newMembers ) {
            return []
        }
        return this.state.isShowGroup ? dataObj.groupList.newMembers[index] :  dataObj.groupList.newMembers['all']
    }

    change = ( obj ) => {
        this.setState( { pageNo: 1 } )
        this._needQuery = true;
    }
    createNewOrder = () => {
        this.refs.createOrder && this.refs.createOrder.show();
    }

    render() {
        const dateFormat = 'YYYY-MM-DD';
        const { getFieldDecorator } = this.props.form
        let {acceptanceStatus, orderType} = this.state

        //set group data
        const groupData = this.getGroupData()

        //get member nick
        const memberNick = this.getMemberNick() || []

        //get defaultGroupObj
        const defaultGroupObj = this.getDefaultGroup()

        return ( <Form className="order-head">
            <Row>
                {
                    getFieldDecorator( 'ownerType', { initialValue: '1' } )( <RadioGroup onChange={this.changeRadio} size="large" name="ownerType">
                        <RadioButton value="1">我提交的工单</RadioButton>
                        <RadioButton value="2">我受理的工单</RadioButton>
                        <RadioButton value="5">全部工单</RadioButton>
                    </RadioGroup> )
                }
            </Row>
            <Row>
                {
                    this.state.isShowGroup && ( getFieldDecorator( 'groupId', { initialValue: defaultGroupObj.defaultGroup } )( <Select disabled={!defaultGroupObj.isLowerManger} className="select" onChange={this.change}>
                        <Option value="" key="">全部组</Option>
                        {groupData.map( o => ( <Option value={o.id.toString()} key={o.id}>{o.groupName}</Option> ) )}
                    </Select> ) )
                }
                {
                    !!memberNick.length && ( getFieldDecorator( 'memberNick', { initialValue: '' } )( <Select className="select" onChange={this.change} style={{width: '120px'}}>
                        <Option value="" key="">全部操作车手</Option>
                        {memberNick.map( o => ( <Option value={o} key={o}>{o}</Option> ) )}
                    </Select> ) )
                }
                {
                    getFieldDecorator('acceptanceStatus', {initialValue: acceptanceStatus})(<Select className="select"
                                                                                      onChange={this.change}>
                        <Option value="">全部状态</Option>
                        {
                            OrderStatus.map((elem, index) => {return (
                                <Option value={elem.value} key={index}>{elem.text}</Option>
                            )})
                        }
                    </Select> )
                }
                {
                    getFieldDecorator('orderType', {initialValue: orderType})(<Select className="select"
                                                                               onChange={this.change}>
                        <Option value="">全部类型</Option>
                        {
                            OrderType.map((elem, index) => {
                                return (
                                    <Option value={elem.value} key={index}>{elem.text}</Option>
                                )
                            })
                        }
                    </Select> )
                }
                {
                    getFieldDecorator( 'TimeArry', {
                        initialValue: [
                            moment( moment().subtract( 1, 'months' ), dateFormat ),
                            moment( moment(), dateFormat )
                        ]
                    } )( <RangePicker format={dateFormat} className="define-timer" showTime="showTime" onOk={this.change}/> )
                }

                {
                    getFieldDecorator('userNick', {initialValue: ''})(
                        <div className="seach-head-box mgl15">
                            <Search
                                placeholder="输入用户名搜索"
                                onSearch={this.change}
                            />
                        </div>
                    )
                }

            </Row>
            <Row>
                <Button onClick={this.createNewOrder} type="primary">新建工单
                    <CreateOrder ref="createOrder"  />
                </Button>
            </Row>
        </Form> )
    }
}
