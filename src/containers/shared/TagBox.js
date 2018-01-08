import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames'
import { Tag } from 'antd'
import './TagBox.less'

export default class TagBox extends React.Component {
    static propTypes = {
        hint: PropTypes.func,
        close: PropTypes.func
    }

    render( ) {
        const { hint, items, close, className } = this.props
        const cn = classnames( 'tag-box', className )
        return (
            <div className={cn}>
                <div className="main">
                    {items.map(( i, ind ) => {
                        return (
                            <Tag key={ind} closable onClose={close.bind( null, i )}>{i}</Tag>
                        )
                    })}
                </div>
                {hint && (
                    <div className="foot">
                        {hint( items.length )}
                    </div>
                )}
            </div>
        )
    }
}
