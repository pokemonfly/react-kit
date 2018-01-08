import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { Form, Row, Button,Col,Input,Select,Icon,Table,Upload } from 'antd'
import { Dialog } from '@/containers/shared/Dialog';
import { postWorkOrder,fetGetDetail,fetchCommitter,finishOrder,uploadBase64,cbpostNewLog,fetGetDetailLogs,remindTrigger,postLeaderView,postNewLog } from './OrderRedux'
import { notify } from '@/utils/tools'

const FormItem = Form.Item;
const { TextArea } = Input;
@Dialog( { title: '提交工单', width: 750, hasForm: true, hasConnect: true, noFooter: true } )
@connect( state => ( { query: state.location.query,dataObj: state.workOrder.list } ), dispatch => ( bindActionCreators( {
    postWorkOrder,
    fetGetDetail,
    fetGetDetailLogs,
    remindTrigger,
    postLeaderView,
    fetchCommitter,
    postNewLog
}, dispatch ) ), null, { withRef: true } )
@Form.create( { withRef: true } )
export default class OrderDetail extends Component {

    state = {
        committerArry:[],
        imagesArry:[],
        content:'',
        serialNumber:'',
        userInfoObj:{}
    }

    handleSubmit = () =>{

    }

    // restart = () =>{
    //     this.setState({
    //         committerArry:[],
    //         content:'',
    //         serialNumber:''
    //     })
    // }


    finishOrderAction = ()=>{

        this.props.form.validateFields( ( err, formObj ) => {

            if(!err){
                formObj.serialNumber = this.state.serialNumber
                finishOrder(formObj,(json)=>{
                    let data = json.data
                    if(json.success){
                        this.state.imagesArry.forEach((elem) => {
                            if(elem){
                                uploadBase64({
                                    base64Data:elem,
                                    logId:data.logId,
                                    serialNumber:this.state.serialNumber
                                }, (json) => {
                                })
                            }
                        })
                    }
                    notify( '终结完毕~~' )
                    this.close()
                })
            }

        } )
        
       
    }
    
    updateData() {

        this.props.fetchCommitter({})
    }

    componentWillReceiveProps(nextProps){
        const {dataObj} = nextProps
        let committerArry  = nextProps.dataObj.committerArry

        if(nextProps.submitObj){
            this.setState({
                serialNumber:nextProps.submitObj.serialNumber
            })
        }

        if(dataObj.userInfoObj.id){
            this.setState({
                userInfoObj:dataObj.userInfoObj
            })
        }

        //format
        if(committerArry.length)this.setState({committerArry:committerArry})

    }
    componentDidMount = (next) =>{
       this.updateData()
    }

    changeReason = (e) =>{
        let val = e.target.innerHTML
        this.setState({
            content:val
        })
    }



    submit(recordType){
        this.props.form.validateFields( ( err, formObj ) => {

            if(!err){
                formObj.serialNumber = this.state.serialNumber
                // formObj.content = this.state.content
                formObj.recordType = recordType
                // this.props.postNewLog( formObj )
                cbpostNewLog(formObj,(json) => {
                    console.log(json)
                    let data = json.data

                    if(json.success){

                        this.state.imagesArry.forEach((elem) => {
                            if(elem){
                                uploadBase64({
                                    base64Data:elem,
                                    logId:data.logId,
                                    serialNumber:this.state.serialNumber
                                }, (json) => {
                                })
                            }


                        })
                        this.close();

                    }

                })
                // this.close();
            }

        } )
    }j

    addImages = (ob) =>{
        let arry = this.state.imagesArry.concat(ob.file.thumbUrl)
        this.setState({
            imagesArry:arry
        })
    }

    triggerRemind = () =>{
        this.props.remindTrigger({
            serialNumber:this.props.detailObj.serialNumber
        })
    }

    operateLeaderView = () =>{
        this.props.postLeaderView({
            serialNumber:this.props.detailObj.serialNumber
        })
    }

    render() {
        const { orderId } = this.state
        // 需要自定义提交按钮

        // samll input
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 8 }
            }
        }

        const bigFormItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 }
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

        const responsiblity = [
            "用户",
            "车手",
            "销售",
            "其他"
        ]

        const { getFieldDecorator } = this.props.form

        return (<div>
                <Form onSubmit={this.handleSubmit}>

                    <FormItem
                        {...formItemLayout}
                        label={(
                        <span>
                          组长联系状态
                        </span>
                    )}
                    >
                        {getFieldDecorator('leader', {
                            initialValue: '1',
                            required:true
                        })(
                            <Select className="select">
                                <Option value="1">已联系</Option>
                                <Option value="2">未联系</Option>
                            </Select>
                        )}
                    </FormItem>
                    {this.state.userInfoObj.isManger && (
                        <FormItem
                            {...formItemLayout}
                            label={(
                        <span>
                          请选择责任人
                        </span>
                    )}
                        >
                            {getFieldDecorator( 'responsity', {
                                rules:[
                                    {
                                        required:true,
                                        message: '请选择责任人!'
                                    }
                                ]
                            } )(
                                <Select className="select" placeholder="请选择责任人" onChange={this.change}>
                                    {responsiblity.map(o => (
                                        <Option value={o} key={o}>{o}</Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    )}
                    <FormItem
                        {...formItemLayout}
                        label={(
                        <span>
                          处理结果
                        </span>
                    )}
                    >
                        {getFieldDecorator('process', {
                            rules:[
                                {
                                    required:true,
                                    message: '请选择处理结果!'
                                }
                            ]
                        })(
                            <Select className="select" placeholder="请选择处理结果">
                                <Option value="0">未处理</Option>
                                <Option value="1">处理中</Option>
                                <Option value="2">处理结束</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={(
                        <span>
                          处理方式
                        </span>
                    )}
                    >
                        {getFieldDecorator('processType', {
                            rules:[
                                {
                                    required:true,
                                    message: '请选择处理方式!'
                                }
                            ]
                        })(
                            <Select className="select" placeholder="请选择处理方式">
                                <Option value="0">未处理</Option>
                                <Option value="1">电话沟通</Option>
                                <Option value="2">QQ沟通</Option>
                                <Option value="3">微信沟通</Option>
                                <Option value="4">旺旺沟通</Option>
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
                        {getFieldDecorator('content', {

                        })(
                            <TextArea rows={6} />
                        )}
                    </FormItem>
                    <FormItem
                        {...bigFormItemLayout}
                        label="附件"
                    >
                        <div className="dropbox">
                            <Upload.Dragger name="image" onChange={this.addImages} withCredentials={true} multiple={true} listType="picture-card" data={{serialNumber: this.state.serialNumber}} >
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox" />
                                </p>
                                <p className="ant-upload-text">点击/拖拽文件进来</p>
                            </Upload.Dragger>
                        </div>
                    </FormItem>
                </Form>
                <div className="text-center">
                    {!this.state.userInfoObj.isManger && (
                        <Button type="primary" onClick={this.submit.bind(this,0)} className="mgr15">阶段提交</Button>
                    )}
                    {!this.state.userInfoObj.isManger && (
                        <Button type="primary" onClick={this.submit.bind(this,1)}>最终提交</Button>
                    )}
                    {this.state.userInfoObj.isManger && (
                        <Button type="primary" onClick={this.finishOrderAction} className="mgl10" size="small">终结工单</Button>
                    )}
                </div>
            </div>


        )


    }
}
