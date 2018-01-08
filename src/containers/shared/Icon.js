import React from 'react';
import classNames from 'classnames'
import { omit } from 'lodash'
import './Icon.less'

// TODO SVG 支持
const Icon = ( props ) => {
    const {
        type,
        className = '',
        spin,
        size
    } = props;

    let classString = classNames( {
        iconfont: true,
        'anticon-spin': !!spin,
        [ `icon-${ type }` ]: true,
        'iconfont-small': size == 'small'
    }, className )

    return <i {...omit(props, ['spin', 'type', 'size'])} className={classString}></i>
}
export default Icon;
