import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';
import 'moment/locale/zh-cn';
import classNames from 'classnames'
import { DatePicker } from 'antd';
import { hashHistory } from 'react-router';
import './DateRangePicker.less'

moment.locale( 'zh-cn' );
const { RangePicker } = DatePicker;

const defaultRanges = {
    'default': {
        '今天': [
            moment( ), moment( )
        ],
        '昨天': [
            moment( ).subtract( 1, 'days' ),
            moment( ).subtract( 1, 'days' )
        ],
        '最近7天': [
            moment( ).subtract( 7, 'days' ),
            moment( ).subtract( 1, 'days' )
        ],
        '最近14天': [
            moment( ).subtract( 14, 'days' ),
            moment( ).subtract( 1, 'days' )
        ],
        '最近21天': [
            moment( ).subtract( 21, 'days' ),
            moment( ).subtract( 1, 'days' )
        ],
        '最近30天': [
            moment( ).subtract( 30, 'days' ),
            moment( ).subtract( 1, 'days' )
        ]
    }
}
const TIME_F = "YYYY-MM-DD";
@connect(state => ({ location: state.location }))
export default class DateRangePicker extends React.Component {
    state = {
        fromDate: this.props.fromDate ? moment( this.props.fromDate ) : moment( ).subtract( 7, 'days' ),
        toDate: this.props.toDate ? moment( this.props.toDate ) : moment( ).subtract( 1, 'days' )
    }
    componentDidMount( ) {
        const { fromDate, toDate } = this.state;
        this.state.fromStr = fromDate.format( TIME_F )
        this.state.toStr = toDate.format( TIME_F )
    }
    componentWillReceiveProps( nextProps ) {
        const { fromDate, toDate } = nextProps
        this.setState({fromDate: moment( fromDate ), toDate: moment( toDate )})
    }
    onChange = ( date, dateString ) => {
        this.state.fromStr = dateString[0]
        this.state.toStr = dateString[1]
        this.setState({fromDate: date[0], toDate: date[1]})
    }
    onOk = ( ) => {
        const { location, onOk } = this.props
        const { fromStr, toStr } = this.state
        if ( onOk ) {
            onOk({ fromDate: fromStr, toDate: toStr })
            return;
        }
        if ( fromStr && toStr ) {
            hashHistory.push({
                ...location,
                query: {
                    ...location.query,
                    fromDate: fromStr,
                    toDate: toStr
                }
            });
        }
    }
    getStatus( ) {
        const { fromStr, toStr } = this.state
        return { fromDate: fromStr, toDate: toStr }
    }
    renderExtraFooter( ) {
        return (
            <div>(留空)扩展的额外内容</div>
        )
    }
    render( ) {
        const { className, onOk } = this.props;
        const { fromDate, toDate } = this.state
        const cn = classNames( "data-range-picker", className )
        return ( <RangePicker
            allowClear={false}
            className={cn}
            pickerClass='asdf'
            format="YYYY-MM-DD"
            value={[ fromDate, toDate ]}
            renderExtraFooter={this.renderExtraFooter}
            ranges={defaultRanges.default}
            showTime
            onChange={this.onChange}
            onOk={this.onOk}/> )
    }
}
