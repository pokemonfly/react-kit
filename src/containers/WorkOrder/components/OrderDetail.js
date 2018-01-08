import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import HandleOrder from './HandleOrder'
import { isEmpty, map, keyBy} from 'lodash'
import CreateOrder from './CreateOrder'
import { Form, Row, Button,Col,Input,Select,Icon,Table,Spin } from 'antd'
import { Dialog } from '@/containers/shared/Dialog';
import { postWorkOrder,fetGetDetail,fetGetDetailLogs,finishOrder,resGetDetailLogs,remindTrigger,postLeaderView,postProcess,cbPostProcess } from './OrderRedux'
import { notify } from '@/utils/tools'
import EnlargeImg from '@/containers/shared/enlargeImg'

const FormItem = Form.Item;
@Dialog( { title: '', width: 1000, hasForm: true, hasConnect: true, noFooter: true } )
@connect( state => ( { query: state.location.query,dataObj: state.workOrder.list } ), dispatch => ( bindActionCreators( {
    postWorkOrder,
    fetGetDetail,
    fetGetDetailLogs,
    remindTrigger,
    postLeaderView,
    resGetDetailLogs,
    postProcess
}, dispatch ) ), null, { withRef: true } )
@Form.create( { withRef: true } )
export default class OrderDetail extends Component {


    // constructor(){
    //     super()
    // }

    columns = [
        {
            title: '日期',
            dataIndex: 'formatupdTime',
            key: 'formatupdTime',
            width:100
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            width:100
        },
        {
            title: '操作人',
            dataIndex: 'username',
            key: 'username',
            width:100
        },
        {
            title: '内容',
            dataIndex: 'content',
            key: 'content',
            width:220
        }
    ];

    state = {
        orderDataObj:{},
        orderLogs:[],
        newOrderLogs:[],
        formatDiffTime:'',
        isCouldChange:false,
        isShowBtns:true,
        firstRead:false,
        currentAttachImg:'',
        // isProcess:false,
        // isEdit:false,
        submitObj:{},
        userInfoObj:{},
        logObj:{}
    }

    handleSubmit = () =>{

    }

    // restart = () =>{
    //     this.setState({
    //         orderDataObj:{
    //             userNick:'',
    //             memberNick:''
    //         },
    //         orderLogs:[],
    //         formatDiffTime:'',
    //         isProcess:false,
    //         isEdit:false,
    //         submitObj:{},
    //         userInfoObj:{},
    //         logObj:{}
    //     })
    // }

    closeCallback(){
        //reset data
        this.props.resGetDetailLogs({})
    }

    componentWillUnmount(){
        
    }
    
    createNewOrder = (elem) => {
        this.setState({
            logObj:elem
        },()=>{
            this.refs.createOrder && this.refs.createOrder.show();
        })
    }

    updateData() {
        let detailObj = this.props.detailObj
        let diffTime = moment().diff(moment(this.props.detailObj.commitTime),'hours')

        // let iseditFlag = false,isProcessFlag = false
        // if(detailObj.editable){
        //     iseditFlag = true
        // }
        // if(detailObj.processible){
        //     isProcessFlag = true
        // }

        this.setState({
            formatDiffTime:`逾期${diffTime}小时`,
            isCouldChange:detailObj.isCouldChange,
            isShowBtns:detailObj.isShowBtns
        })

        this.props.fetGetDetailLogs({
            serialNumber:this.props.detailObj.serialNumber
        })
        this.props.fetGetDetail({
            serialNumber:this.props.detailObj.serialNumber
        })
    }

    submit =(elem) =>{
        this.setState({
            submitObj:elem
        },()=>{
            this.refs.handleOrder && this.refs.handleOrder.show();
        })
    }
    
    componentWillReceiveProps(nextProps){
        const {dataObj} = nextProps

        if(dataObj.orderDetail){
            this.setState({
                orderDataObj:dataObj.orderDetail.vo
            })
        }

        if(dataObj.userInfoObj.id){
            this.setState({
                userInfoObj:dataObj.userInfoObj
            })
        }

        //createNewOrder
        if(!isEmpty(dataObj.detailLogs) && !this.state.firstRead){
            let process
            dataObj.detailLogs.list.forEach(elem =>{
                process = elem.process

                if(elem.username!="快云科技:小优" && process==2){
                    process = 1
                }

                switch (process){
                    case 2:
                        elem.operation = <span >结束工单</span>
                        break;
                    case 1:
                        elem.operation = <span >提交工单</span>
                        break;
                    case 0:
                        elem.operation = <span >创建工单</span>
                        break;
                }

                elem.content =<div>
                    <div>{elem.content}</div>
                    {(elem.attachments && !!elem.attachments.length) &&
                    (elem.attachments.map((o,i)=>(
                        <a href="javascript:void(0)" className="order-detail-log-pic" target="_blank">
                            附件图{(i+1)}
                            <img src={o.attachmentUrl} key={i} alt=""/>
                        </a>
                    )))
                    }
                </div>




            })
            this.setState({
                orderLogs:dataObj.detailLogs.list,
                newOrderLogs:dataObj.detailLogs.newList,
                firstRead:true
            })
        }

        //format handle order data

    }
    componentDidMount = (next) =>{
       this.updateData()
    }

    handleOrder = () =>{

        cbPostProcess({
            serialNumber:this.props.detailObj.serialNumber
        }, (json) => {
            if(json.success){
                let data  = json.data

                if(data.redirect){
                    let newWindow = window.open();
                    newWindow.location.href = data.url;
                }

                if(data.dialog){

                    this.setState({
                        submitObj:{
                            serialNumber:this.props.detailObj.serialNumber
                        }
                    },()=>{
                        this.refs.handleOrder && this.refs.handleOrder.show();
                    })
                }

            }
        })

    }

    changeUser = () =>{

    }
    onCommit = () => {
        this.props.form.validateFields( ( err, formObj ) => {
            console.log( formObj );
            let commitObj = {}
            // this.props.postWorkOrder( commitObj )
            this.close();
            notify( '关掉咯~' )
        } )
    }

    triggerRemind = () =>{
        this.props.remindTrigger({
            serialNumber:this.props.detailObj.serialNumber
        })
    }

    enlargeImg = (obj) =>{
        this.setState({
            currentAttachImg:obj.attachmentUrl
        },()=>{
            this.refs.enlargeImg && this.refs.enlargeImg.show();
        })

    }
    
    operateLeaderView = () =>{
        this.props.postLeaderView({
            serialNumber:this.props.detailObj.serialNumber
        })
    }

    // finishOrder = ()=>{
    //     finishOrder({
    //         serialNumber:this.props.detailObj.serialNumber
    //     },(json)=>{
    //
    //         notify( '终结完毕~~' )
    //
    //     })
    // }

    getData(){
        let orderDataObj = this.state.orderDataObj

        return{
            ...orderDataObj
        }
    }

    getIsReading(){
        const {dataObj} = this.props

        let isReading = true

        if(!dataObj.isFetchingDetailLogs && !dataObj.isFetchingDetailLogs){
            isReading = false;
        }else {
            isReading = true;
        }

        return isReading
    }

    render() {

        // samll input
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 8 }
            }
        }

        const bigFormItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 }
            }
        }

        const submiterLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 }
            }
        }

        const { getFieldDecorator } = this.props.form

        const orderDataObj = this.getData()

        const isReading = this.getIsReading();

        return (
            <Spin spinning={isReading} size="large">
            <div className="specific-form">
                {orderDataObj.processible && (
                    <div className="mgb10 text-center">
                    <span className="mgr5">
                        {this.state.formatDiffTime}
                    </span>
                        <Button type="primary" onClick={this.triggerRemind} size="small">催单</Button>
                        <Button type="primary mgl10 mgr10" onClick={this.handleOrder} size="small">处理工单</Button>
                        {this.state.userInfoObj.isManger && (
                            <Button type="primary" onClick={this.operateLeaderView} size="small">组长评审</Button>
                        )}
                    </div>
                )}
                <Form >
                    <FormItem
                        {...bigFormItemLayout}
                        label={(
                        <span>
                          用户昵称
                        </span>
                    )}
                    >
                        <Row gutter={12}>
                            <Col span={12}>
                                {getFieldDecorator('userNick', {
                                    initialValue:orderDataObj.userNick,
                                    rules: [
                                        {
                                            required: true, message: '请输入用户名',whitespace: true
                                        }
                                    ]
                                })(
                                    <Input onChange={this.changeUser} disabled={true}  />
                                )}
                                <Col span={12}>
                                    <div className="">
                                        操作车手:{orderDataObj.memberNick}
                                    </div>
                                </Col>
                            </Col>

                        </Row>

                    </FormItem>
                    {this.state.newOrderLogs.length && (
                        <FormItem
                            {...submiterLayout}
                            label={(
                        <span>
                          提交人
                        </span>
                    )}
                        >
                        <Row gutter={24}>
                            {this.state.newOrderLogs.map((o,i)=>(
                                <Col span={5} key={i} >
                                    <div className="pull-left">
                                        <Input value={o.username} disabled={true}  />
                                        <div>{o.formatupdTime}</div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        </FormItem>
                    )}
                    <FormItem
                        {...formItemLayout}
                        label={(
                        <span>
                          反馈类型
                        </span>
                    )}
                    >
                        {getFieldDecorator('type', {
                            initialValue: orderDataObj.type,
                            required:true
                        })(
                            <Select className="select" disabled={!this.state.isCouldChange}>
                                <Option value="0">意向退款</Option>
                                <Option value="1">投诉</Option>
                                <Option value="4">其他</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={(
                        <span>
                          反馈渠道
                        </span>
                    )}
                    >
                        {getFieldDecorator('channel', {
                            initialValue: orderDataObj.channel,
                            required:true
                        })(
                            <Select className="select" disabled={!this.state.isCouldChange}>
                                <Option value="0">QQ</Option>
                                <Option value="1">旺旺</Option>
                                <Option value="2">钉钉</Option>
                                <Option value="3">电话</Option>
                                <Option value="4">微信</Option>
                                <Option value="5">销售</Option>
                                <Option value="6">客服旺旺</Option>
                                <Option value="7">售后投诉QQ</Option>
                                <Option value="8">售后旺旺</Option>
                                <Option value="9">后台投诉</Option>
                                <Option value="10">车手</Option>
                                <Option value="11">其他渠道</Option>
                            </Select>
                        )}
                    </FormItem>


                    {(orderDataObj.attachments && !!orderDataObj.attachments.length) && (
                        <FormItem
                            {...formItemLayout}
                            label={(<span>附件</span>)}
                        >
                            <ul className="attach-list clear">
                                {orderDataObj.attachments.map((o,i)=>(
                                    <li key={i} onClick={this.enlargeImg.bind(this,o)}>
                                        <img src={o.attachmentUrl} className="attach-img" alt=""/>
                                    </li>
                                ))}
                            </ul>
                        </FormItem>
                    )}

                </Form>
                <div>
                    <h3 className="mgb5">历史</h3>
                    <div className="define-ant-table">
                        <Table dataSource={this.state.orderLogs}  pagination={false}  columns={this.columns}/>
                    </div>
                </div>
                <EnlargeImg ref="enlargeImg" imgsrc={this.state.currentAttachImg} />
                <HandleOrder ref="handleOrder" submitObj={this.state.submitObj} />
                <CreateOrder ref="createOrder" isOwnedSerialNumber={true} logObj={this.state.logObj} />
            </div>
            </Spin>
        )


    }
}
