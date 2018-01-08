import React from 'react';
import { Input, Icon as AntdIcon } from 'antd'
import Icon from '@/containers/shared/Icon'
import './EditableText.less';

export default class EditableText extends React.Component {
    state = {
        value: this.props.value || '',
        editable: false
    }
    componentWillReceiveProps( nextProps ) {
        this.setState( {
            value: nextProps.value || ''
        } )
    }
    getValue = () => {
        return this.state.value
    }
    onChange = ( e ) => {
        const value = e.target.value;
        this.setState( {
            value
        }, () => {
            // 触发父元素的检查
            if ( this.props.onChange ) {
                this.props.onChange( this.state.value );
            }
        } );
    }
    check = () => {
        let r = true;
        if ( this.props.onCommit ) {
            r = this.props.onCommit( this.state.value );
        }
        if ( r !== false ) {
            this.setState( { editable: false, lastValue: this.state.value } );
        }
    }
    cancel = () => {
        this.setState( {
            editable: false,
            value: this.state.lastValue || this.props.value || ''
        }, () => {
            // 触发父元素的检查
            if ( this.props.onChange ) {
                this.props.onChange( this.state.value );
            }
        } );
    }
    edit = () => {
        this.setState( { editable: true, lastValue: this.state.value } );
    }
    render() {
        const { editable, value } = this.state
        const { width } = this.props
        return editable ? ( <span className="editable-text">
            <Input value={value} onChange={this.onChange} style={{
                    width: width - 10
                }}/>
            <AntdIcon type="check" className="editable-cell-icon-check check" onClick={this.check}/>
            <AntdIcon type="close" className="editable-cell-icon-check close" onClick={this.cancel}/>
        </span> ) : ( <span style={{
                width: width
            }} className="editable-text">
            {value.toString()}
            <Icon type="xiugaibi" className="edit-icon" onClick={this.edit}/>
        </span> )
    }
}
