import React from 'react';
import { SimpleDialog } from './Dialog';

@SimpleDialog( { title: '详细日志', width: 500, hasForm: false, sid: "LogTextDialog", noFooter: true } )
export default class LogTextDialog extends React.Component {
    render() {
        return ( <div>
            <span dangerouslySetInnerHTML={{
                    __html: this.props.content
                }}></span>
        </div> )
    }
}
