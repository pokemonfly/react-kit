import React, { Component, PropTypes } from 'react';
import classNames from 'classnames'
import Icon from './Icon'
import { Button, Input } from 'antd';

export default class Search extends Input.Search {
    constructor( props ) {
        super( props )
    }
    clear() {
        this.input && ( this.input.refs.input.value = '' )
    }
    render() {
        const {
            className,
            prefixCls,
            inputPrefixCls,
            suffix,
            width = 200,
            ...others
        } = this.props;
        delete others.onSearch;
        const addonAfter = ( <span onClick={this.onSearch}>
            <Icon type="search"/>
            <span>
                搜索
            </span>
        </span> );
        return ( <Input
            style={{
                width
            }}
            onPressEnter={this.onSearch}
            {...others}
            className={classNames( prefixCls, className )}
            prefixCls={inputPrefixCls}
            addonAfter={addonAfter}
            ref={node => this.input = node}/> );
    }
}
