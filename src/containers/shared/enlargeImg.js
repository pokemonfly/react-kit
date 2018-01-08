import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';


import { Dialog } from '@/containers/shared/Dialog';
import { notify } from '@/utils/tools'

@Dialog( { title: '',wrapClassName:"enlarge", width: 1000, hasForm: false, hasConnect: true, noFooter: true } )


export default class EnlargeImg extends Component {
    
    state = {
      imgSrc:''
    }

    handleSubmit = () =>{

    }
    
    closeCallback(){

    }

    componentWillUnmount(){
        
    }
    
    submit =(elem) =>{
      
    }
    
    componentWillReceiveProps(nextProps){
        const {dataObj} = nextProps
        
    }
    componentDidMount = (next) =>{
    }

 

    changeUser = () =>{

    }
    onCommit = () => {
        
    }



    getData(){
        let props = this.props
        
        return props.imgsrc;
    }

    render() {
        
        const src = this.getData()

        return (
            <div>
                <img src={src} alt=""/>
            </div>

        )


    }
}
