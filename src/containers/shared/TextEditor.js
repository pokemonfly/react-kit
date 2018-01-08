import React from 'react';
import classnames from 'classnames'
import PropTypes from 'prop-types';
import { Input } from 'antd'
import { trim } from 'lodash'
import './TextEditor.less'

// 待扩展
const { TextArea } = Input;
const reg = new RegExp( "[`~!@#$^&*()=|{}':;',\\[\\]<>/?~！@#￥……&*（）—|{}【】‘；：”“'。，、？]", 'g' );

export default class TextEditor extends React.Component {
    static propTypes = {
        hint: PropTypes.func
    }
    state = {
        text: this.props.text,
        limit: this.props.limit || Number.MAX_VALUE,
        len: 0,
        hint: false
    }
    getTextArr( text = this.state.text ) {
        return text.split( "\n" ).map(e => trim( e ).replace( reg, ' ' )).filter( e => e.length > 0 );
    }
    clear( ) {
        this.setState({ text: '' })
    }
    change = ( e ) => {
        const { limit } = this.state;
        let text = e.target.value,
            len = this.getTextArr( text ).length;
        if ( len > limit ) {
            return false
        }
        this.setState({ text, len })
    }
    render( ) {
        const { placeholder, className, hint } = this.props
        const { text, len } = this.state;
        const cn = classnames('text-editor', className, { 'with-foot': hint })
        return (
            <div className={cn}>
                <TextArea placeholder={placeholder} value={text} onChange ={this.change}></TextArea>
                {hint && (
                    <div className="foot">
                        {hint( len )}
                    </div>
                )}
            </div>
        )
    }
}
