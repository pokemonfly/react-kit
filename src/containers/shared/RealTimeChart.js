import React, { Component } from 'react';
import { Alert, Select, Icon, Button, Radio } from 'antd'
import {
    isEqual,
    find,
    result,
    pick,
    mapKeys,
    mapValues,
    forIn
} from 'lodash';
import moment from 'moment';
import Chart from './Chart';
import { keywordReports } from '@/utils/constants'
import DateRangePicker from './DateRangePicker';
import './RealTimeChart.less';
import { add, divide } from '@/utils/math';

// signupTime  订购时间
const Option = Select.Option;
const TIME_F = "YYYY-MM-DD";
const keyMap = (( obj ) => {
    let m = {};
    forIn(obj, ( v, k ) => {
        m[v.name] = k
    });
    return m
})( keywordReports );

export default class RealTimeChart extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            isSum: false,
            mode: 'day',
            limitHour: moment( ).hour( ),
            compareDate: moment( ).subtract( 1, 'd' ).format( TIME_F ), // 默认对比昨天
            selectArr: this._getSelectData( props ),
            fromDate: moment( ).subtract( 7, 'd' ).format( TIME_F ),
            toDate: moment( ).format( TIME_F ),
            chartData: {
                type: 'realTimeReport',
                isLowVer: props.isLowVer
            }
        }
    }
    componentWillMount( ) {
        // 调用父组件获得数据
        this._change( );
    }
    componentWillReceiveProps( nextProps ) {
        if (!isEqual( nextProps.data, this.props.data )) {
            this.setData( nextProps.data )
        }
    }
    _getSelectData( props ) {
        const { signupTime } = props;
        let r = [],
            i,
            arr = [],
            time = moment( ),
            lim = 7;
        // 购买时间短的话 ，减少选项
        if ( signupTime ) {
            lim = Math.min(lim, moment( ).endOf( 'day' ).diff( moment( signupTime ), 'd' ));
        }
        for ( let i = 0; i < 7; i++ ) {
            let day = time.subtract( 1, 'd' ).format( TIME_F );
            arr.push( day );
        }
        r.push({name: '昨天', value: arr[0]})
        if ( lim > 6 ) {
            r.push({name: '上周同日', value: arr[6]})
        }
        for ( i = 1; i < Math.min( lim, 6 ); i++ ) {
            r.push({'value': arr[i], 'name': arr[i]});
        }
        return r;
    }
    getStatus( ) {
        return this.state
    }
    setData( data ) {
        if ( data ) {
            const { chartData, isSum, mode, compareDate, selectArr } = this.state;
            let keyName;
            if ( mode == 'day' ) {
                const str = result( find(selectArr, ( o ) => {
                    return o.value == compareDate
                }), 'name' ) || compareDate
                keyName = isSum ? [ '汇总' ] : [ '今日', str ]
            } else {
                keyName = [ 'PC', '无线' ]
            }
            this.setState({
                chartData: {
                    ...chartData,
                    ...data,
                    keyName
                }
            })
        }
    }
    _change = ( ) => {
        const r = this.props.onChange( this.state )
        if ( r ) {
            this.setData( r )
        }
        // this.refs.chart && this.refs.chart.showLoading( )
    }
    onSwitchData = ( isSum ) => {
        this.setState( {
            isSum
        }, this._change )
    }
    onModeChange = ( e ) => {
        this.setState( {
            mode: e.target.value
        }, this._change )
    }
    onSelectChange = ( compareDate ) => {
        this.setState( {
            compareDate
        }, this._change )
    }
    onLegendChange = ( name ) => {
        let valueA,
            valueB;
        const { chartData, limitHour, isSum, mode } = this.state;
        const lim = mode == 'day' && !isSum ? limitHour : 24;
        const unit = keywordReports[keyMap[name]].unit;

        let data = mapValues(chartData.dataMap, v => v[0])
        valueA = this.getSum( data, name )
        if ( valueA != null ) {
            valueA += unit;
        } else {
            valueA = '暂无'
        }
        if ( mode != 'day' || !isSum ) {
            // FIXME 这里加的容错 小概率切换时isSum = false ，但chartData数据没有
            data = mapValues(chartData.dataMap, v => (v.length == 2 ? v[1] : [ ]))
            valueB = this.getSum( data, name, lim )
            if ( valueB != null ) {
                valueB += unit;
            } else {
                valueB = '暂无'
            }
        }

        let obj = {
            keyName: name,
            valueA,
            valueB
        }
        if (!isEqual(obj, pick(this.state, [ 'keyName', 'valueA', 'valueB' ]))) {
            this.setState( obj )
        }
    }
    onDateChange = ({ fromDate, toDate }) => {
        this.setState( {
            fromDate,
            toDate
        }, this._change )
    }
    dividePercent( val1, val2 ) {
        if ( val1 == null || val2 == null ) {
            return null
        }
        let num = divide( val1, val2 );
        num *= 100;
        return + num.toFixed( 2 )
    }
    // arr = chart 显示用的单条数据   [[hour, data], [hour, data]....]
    getSum( obj, key, lim = 24 ) {
        key = keyMap[key] || key;
        const SP_KEY = [ "ctr", "cpc", "realRoi", "cvr" ];
        if ( SP_KEY.indexOf( key ) > -1 ) {
            switch ( key ) {
                case 'ctr':
                    // 点击率 = 点击量 / 展现量
                    return this.dividePercent(this.getSum( obj, 'click', lim ), this.getSum( obj, 'impressions', lim ))
                case 'cpc':
                    // PPC = 实时花费 / 点击量
                    return this.dividePercent(this.getSum( obj, 'cost', lim ), this.getSum( obj, 'click', lim ))
                case 'realRoi':
                    // ROI = 成交额 / 实时花费
                    return this.dividePercent(this.getSum( obj, 'pay', lim ), this.getSum( obj, 'cost', lim ))
                case 'cvr':
                    // 点击转化率 = 总成交数 /  点击量
                    return this.dividePercent(this.getSum( obj, 'payCount', lim ), this.getSum( obj, 'click', lim ))
            }
        } else {
            if ( obj[key].length == 0 ) {
                return null
            }
            return obj[key].map(i => ( i[0] < lim ? i[1] : 0 )).reduce( ( a = 0, b = 0 ) => {
                return add( a, b )
            }, 0 )
        }
    }
    render( ) {
        const {
            keyName = '-',
            valueA = '-',
            valueB = '-',
            limitHour,
            selectArr,
            isSum,
            fromDate,
            toDate,
            mode,
            compareDate,
            chartData
        } = this.state
        return (
            <div className="real-time-chart">
                <div className="control-row">
                    {!isSum && (
                        <div >
                            {mode == 'day' && (
                                <span>
                                    <span>{`今日实时${ keyName } : ${ valueA }`}</span>
                                    <span className="cp-str">对比</span>
                                    <Select value={compareDate} defaultValue={selectArr[0].value} className="select" onChange={this.onSelectChange}>
                                        {selectArr.map(o => (
                                            <Option value={o.value} key={o.value}>{o.name}</Option>
                                        ))}
                                    </Select>
                                    <span>{`${ keyName }：${ valueB } （截止${ limitHour }点的数据）`}</span>
                                </span>
                            )}
                            {mode == 'device' && (
                                <span>{`PC${ valueA }  无线${ valueB }`}</span>
                            )}
                            <Button onClick={this.onSwitchData.bind( this, true )} className="sw-btn">切换成累计数据</Button>
                        </div>
                    )}
                    {isSum && (
                        <div>
                            {mode == 'day' && (
                                <span>
                                    <span>{`汇总：${ valueA }`}</span>
                                    <DateRangePicker {...{fromDate, toDate}} onOk={this.onDateChange} className="sw-btn"/>
                                </span>
                            )}
                            {mode == 'device' && (
                                <span>{`PC : ${ valueA }  无线 : ${ valueB }`}</span>
                            )}
                            <Button onClick={this.onSwitchData.bind( this, false )} className="sw-btn">切换成今日数据</Button>
                        </div>
                    )}
                    <Radio.Group onChange={this.onModeChange} value={mode}>
                        <Radio.Button value="day">汇总</Radio.Button>
                        <Radio.Button value="device">PC/无线</Radio.Button>
                    </Radio.Group>
                </div>
                <Alert message=" 1、实时数据因淘宝接口的误差，有可能和直通车后台不一致，属于正常情况。2、超过15天未登录，系统将不再同步实时概况数据" showIcon type="warning"/>
                <Chart option={chartData} ref='chart' onLegendChange={this.onLegendChange}/>
            </div>
        )
    }
}
