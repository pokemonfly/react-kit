import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isEmpty, map, keyBy} from 'lodash'
import eventProxy from '@/utils/eventProxy'
import { Form, Icon, Input, Button, Checkbox,Select,Row,Col, Upload,Modal } from 'antd'
import { Dialog } from '@/containers/shared/Dialog';
import { postWorkOrder,fetchSerialNum,fetchAcceptService,uploadBase64,cbpostWorkOrder,fetchCommitter,reqAcceptService,resWorkOrder } from './OrderRedux'
import { notify } from '@/utils/tools'

const FormItem = Form.Item;
const {TextArea} = Input;
@Dialog( { title: '新建反馈工单', width: 800, hasForm: true, hasConnect: true,maskClosable:false } )
@connect( state => ( { query: state.location.query,dataObj: state.workOrder.list } ), dispatch => ( bindActionCreators( {
    postWorkOrder,
    fetchSerialNum,
    fetchAcceptService,
    fetchCommitter,
    resWorkOrder,
    reqAcceptService
}, dispatch ) ), null, { withRef: true } )
@Form.create( { withRef: true } )
export default class CreateOrder extends Component {

    state = {
        imagesArry:[],
        memberNick:'',
        committerArry:[],
        attachment:'',
        serialNumber:''
    }
    
    closeCallback(){
        // this.restart()
    }

    okCallback( closeHandler ) {
        this.props.form.validateFields( ( err, formObj ) => {
            console.log( formObj );

            if(!err){
                formObj.serialNumber = this.state.serialNumber
                // formObj.reason = this.state.reason
                cbpostWorkOrder( formObj, (json) =>{

                    if(json.success){
                        let data = json.data

                        if(data.status==-1){
                            notify('error','操作信息',data.message)
                        }else {
                            closeHandler();
                            eventProxy.trigger('changePageNo', 1);
                            this.state.imagesArry.forEach( (elem) => {
                                uploadBase64({
                                    logId:data.logId,
                                    base64Data:elem,
                                    serialNumber:this.state.serialNumber
                                },function () {

                                })
                            })
                        }
                     
                        
                    }

                })
            }
        } )
    }
    handleSubmit = (e) =>{

    }

    updateState(){
        let props = this.props

    }

    updateData(){
        if(!this.props.isOwnedSerialNumber){
            this.props.fetchSerialNum({
                orderType:'10'
            })
        }

        this.props.fetchCommitter({})
    }

    componentWillUnmount(){
        this.props.reqAcceptService(null)
    }

    componentWillReceiveProps(nextProps){
        let riderNickData = nextProps.dataObj.riderNickData,
            committerArry  = nextProps.dataObj.committerArry,
            serialNumber = nextProps.dataObj.serialNumber,
            postWordOrder = nextProps.dataObj.postWordOrder

        //format createOrder
        if(!isEmpty(postWordOrder)){
            this.props.resWorkOrder({})
            this.close()
            eventProxy.trigger( 'changePageNo', 1 );
        }


        //format serialNum
        if(this.props.isOwnedSerialNumber){
            this.setState({serialNumber:nextProps.logObj.serialNumber})
        }else {
            if(serialNumber) this.setState({serialNumber:serialNumber.serialNumber})
        }

        //format nick
        let memberNick
        if((riderNickData && riderNickData.status==-1) || !riderNickData){
            memberNick = ''
        }else {
            memberNick = riderNickData.data.riderNick
        }
        if(memberNick) this.setState({memberNick:memberNick})

        //format
        if(committerArry.length)this.setState({committerArry:committerArry})

    }

    componentDidMount(next){
        this.updateData()
    }

    changeUser = (e) => {
        let val = e.target.value
        this.props.fetchAcceptService({
            userNick:val
        })
    }

    addImages = (ob) =>{

        if(ob.fileList && ob.fileList.length){
            let arry = []
            ob.fileList.forEach(function (elem) {
                if(elem.thumbUrl)arry.push(elem.thumbUrl)
            })
            this.setState({
                imagesArry:arry
            })
        }

    }
    
    changeReason = (e) =>{
        let val = e.target.innerHTML
        this.setState({
            reason:val
        })
    }

    changeAttachment = (e) =>{
        let val = e.target.innerHTML
        this.setState({
            attachment:val
        })
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

        const { getFieldDecorator } = this.props.form

        const acceptanceServiceSelectConfig = {
            rules:[
                {
                    required:true,
                    message: '请选择处理人!'
                }
            ]
        }
        if(this.state.memberNick)acceptanceServiceSelectConfig.initialValue = this.state.memberNick;

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem
                {...bigFormItemLayout}
                label={(
                        <span>
                          用户名
                        </span>
                    )}
            >
                    <Row gutter={12}>
                        <Col span={12}>
                            {getFieldDecorator('userNick', {
                                rules: [
                                    {
                                        required: true, message: '请输入用户名',whitespace: true
                                    }
                                ]
                            })(
                                <Input onChange={this.changeUser} />
                            )}
                        </Col>
                        <Col span={12}>
                            {this.state.memberNick && (
                                <div className="">
                                    操作车手:{this.state.memberNick}
                                </div>
                            )}
                        </Col>
                    </Row>

                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label={(
                        <span>
                          处理人
                        </span>
                    )}
                >
                    {this.state.committerArry.length && (
                        getFieldDecorator( 'acceptanceService', acceptanceServiceSelectConfig )(
                            <Select className="select" placeholder="请选择处理人" onChange={this.change}>
                                {this.state.committerArry.map(o => (
                                    <Select.Option value={o} key={o}>{o}</Select.Option>
                                ))}
                            </Select>
                        )
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={(
                        <span>
                          反馈类型
                        </span>
                    )}
                >
                    {getFieldDecorator('type', {
                        initialValue: '0',
                        rules:[
                            {
                                required:true
                            }
                        ]
                    })(
                        <Select className="select">
                            <Select.Option value="0">意向退款</Select.Option>
                            <Select.Option value="1">投诉</Select.Option>
                            <Select.Option value="4">其他</Select.Option>
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
                        initialValue: '0',
                        rules:[
                            {
                                required:true
                            }
                        ]
                    })(
                        <Select className="select">
                            <Select.Option value="0">QQ</Select.Option>
                            <Select.Option value="1">旺旺</Select.Option>
                            <Select.Option value="2">钉钉</Select.Option>
                            <Select.Option value="3">电话</Select.Option>
                            <Select.Option value="4">微信</Select.Option>
                            <Select.Option value="5">销售</Select.Option>
                            <Select.Option value="6">客服旺旺</Select.Option>
                            <Select.Option value="7">售后投诉QQ</Select.Option>
                            <Select.Option value="8">售后旺旺</Select.Option>
                            <Select.Option value="9">后台投诉</Select.Option>
                            <Select.Option value="10">车手</Select.Option>
                            <Select.Option value="11">其他渠道</Select.Option>
                        </Select>
                    )}
                </FormItem>
                <FormItem
                    {...bigFormItemLayout}
                    label={(
                        <span>
                          详细描述
                        </span>
                    )}
                >

                    {getFieldDecorator('reason', {

                    })(
                        <TextArea rows={6} />
                    )}
                </FormItem>
                <FormItem
                    {...bigFormItemLayout}
                    label="附件"
                >
                    <div className="dropbox">
                        <Upload.Dragger name="image"
                                        onChange={this.addImages}
                                        withCredentials={true}
                                        multiple={true}
                                        listType="picture-card"
                                        data={{serialNumber: this.state.serialNumber}}
                                                    >
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">点击/拖拽文件进来</p>
                        </Upload.Dragger>
                    </div>
                </FormItem>
            </Form>
        )
    }
}
