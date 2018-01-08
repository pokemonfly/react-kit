// import项参考 https://github.com/ecomfe/echarts/blob/master/index.js
import React from 'react'
import {
    max,
    includes,
    isEmpty,
    forIn,
    zipObject,
    isEqual,
    find,
    result
} from 'lodash'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/component/legendScroll'
import 'echarts/lib/component/markLine'
import 'echarts/lib/component/title'
import moment from 'moment';
import { encodeHTML } from '@/utils/tools'

const baseOption = {
    tooltip: {
        trigger: 'axis'
    },
    grid: {
        left: 20,
        top: '20px',
        right: 20,
        bottom: '40px',
        containLabel: true
    },
    color: [
        "#1B58B8",
        "#001E4E",
        "#15992A",
        "#FF2E12",
        "#1FAEFF",
        "#691BB8",
        "#FCAF17",
        "#569CE3",
        "#B81B6C",
        "#E56C19",
        "#2673EC",
        "#FF7D23",
        "#91D100",
        "#B01E00",
        "#199900",
        "#7200AC",
        "#f08300",
        "#006AC1",
        "#ff6b00",
        "#ff984e",
        "#b6ef65"
    ]
}
const realTimeColors = [ "#94b854", "#24b0de" ];

export default class Chart extends React.Component {
    state = {}
    componentWillMount() {
        this.getOption()
    }
    componentDidMount() {
        this.draw()
    }
    shouldComponentUpdate( nextProps, nextState ) {
        if ( isEqual( nextProps.option, this.props.option ) ) {
            return false;
        }
        return true;
    }
    componentWillUpdate( nextProps, nextState ) {
        this.getOption( nextProps );
    }
    componentDidUpdate() {
        this.draw()
    }
    onResize = () => {
        this.echart && this.echart.resize()
    }
    draw = () => {
        const option = this.state.option;
        this.echart = echarts.init( this.chart )
        if ( !isEmpty( option ) ) {
            console.log( option )
            this.echart.setOption( option, true );
        }
        if ( this.props.option.isLoading ) {
            this.showLoading()
        } else {
            this.hideLoading()
        }
        this.bindEvent();
    }
    showLoading() {
        this.echart.showLoading()
    }
    hideLoading() {
        this.echart.hideLoading()
    }
    bindEvent() {
        if ( !this._bindEvent ) {
            this.echart.on( 'legendselectchanged', ( e ) => {
                const { type } = this.props.option
                let option;
                if ( type == 'dayReport' ) {
                    option = this.fixYAxis( this.state.option, e.selected )
                }
                if ( type == 'realTimeReport' ) {
                    option = this.fixLegend( this.state.option, e.name )
                }
                console.log( option )
                this.echart.setOption( option, true );
            } )
            window.addEventListener( "resize", this.onResize, false );
            this._bindEvent = true
        }
    }
    fixLegend( config, name ) {
        if ( config.legend ) {
            forIn( config.legend.selected, ( v, k ) => {
                config.legend.selected[ k ] = k == name
            } );
            this.state.activeLegend = name;
            this.props.onLegendChange && this.props.onLegendChange( name )
        }
        return config
    }
    // 动态修正y轴左右位置
    fixYAxis( config, selLegend = {} ) {
        let idx = [],
            isLeft = true,
            offset = 0;
        config.legend.selected = selLegend;
        config.series.forEach( ( o, i ) => {
            if ( selLegend[ o.name ] ) {
                idx.push( i )
            }
        } )
        config.yAxis.forEach( ( o, i ) => {
            if ( idx.indexOf( i ) > -1 ) {
                o.show = true;
                o.position = isLeft ? 'left' : 'right';
                o.offset = 20 * ~~ ( offset / 2 );
                o.axisLine = {
                    show: offset < 2
                }
                o.axisTick = {
                    show: offset < 2
                }
                isLeft = !isLeft;
                offset++;
            } else {
                o.offset = 0
            }
        } )
        return config;
    }
    componentWillUnmount() {
        echarts.dispose( this.chart )
        window.removeEventListener( "resize", this.onResize, false );
    }
    getOption( props = this.props ) {
        const { option } = props;
        let opt
        switch ( option.type ) {
            case 'dayReport':
                opt = this.getDayReport( option );
                break;
            case 'realTimeReport':
                opt = this.getRealTimeReport( option );
                break;
        }
        this.state.option = opt
    }
    // 按天显示的报表数据
    getDayReport( opt ) {
        if ( !opt.series.length ) {
            return {}
        }
        const { fromDate, toDate, mandateDate } = opt;
        let timeArr = [],
            yAxis = [];
        // 给series data标记时间 用
        for (let fromTime = moment( fromDate ), toTime = moment( toDate ); fromTime.isSameOrBefore( toTime );) {
            timeArr.push( +fromTime.format( 'x' ) );
            fromTime.add( 1, 'd' )
        }
        opt.series.forEach( ( s, ind ) => {
            let obj = {
                show: false,
                splitNumber: 7,
                axisLabel: {
                    formatter: s.unit ? '{value}' + s.unit: '{value}'
                }
            }
            yAxis.push( obj )
        } )
        let series = opt.series.map( ( i, ind ) => ( {
            type: 'line',
            smooth: true,
            yAxisIndex: ind,
            label: {
                normal: {
                    formatter: '{c}'
                }
            },
            name: i.name,
            data: i.data.map( ( val, ind ) => [ timeArr[ind], val ] )
        } ) );
        let selectedLegend = {}

        // 竖虚线
        if ( mandateDate ) {
            series.push( {
                type: 'line',
                markLine: {
                    symbol: 'circle',
                    label: {
                        normal: {
                            position: 'middle',
                            formatter: '{b}'
                        }
                    },
                    data: [
                        [
                            {
                                name: '加入自动优化',
                                xAxis: mandateDate,
                                y: '20px'
                            }, {
                                xAxis: mandateDate,
                                yAxis: 0
                            }
                        ]
                    ]
                }
            } )
        }

        let r = {
            ...baseOption,
            legend: {
                data: opt.series.map( i => {
                    selectedLegend[ i.name ] = opt.defaultLegends ? includes( opt.defaultLegends, i.name ): true;
                    return i.name
                } ),
                selected: selectedLegend,
                bottom: '10px'
            },
            xAxis: {
                type: 'time',
                minInterval: 1,
                maxInterval: 8.64e7, // 按天分段 ms
                boundaryGap: false,
                splitLine: {
                    show: false
                },
                axisLabel: {
                    formatter: ( value, index ) => moment( value ).format( 'MM-DD' )
                }
            },
            yAxis,
            series
        }
        r = this.fixYAxis( r, selectedLegend )
        return r;
    }
    // 实时报表
    getRealTimeReport( opt ) {
        if ( !opt.dataMap ) {
            return {}
        }
        if ( opt.isNoData ) {
            this.props.onLegendChange && this.props.onLegendChange( this.state.activeLegend || opt.legend[ 0 ] )
            return this._getNoDataOption( '暂时没有实时数据' );
        }
        let series = [];
        forIn( opt.dataMap, ( v, k ) => {
            series = series.concat( v.map( ( i, ind ) => ( {
                type: 'line',
                name: opt.nameMap[k],
                lineStyle: {
                    normal: {
                        color: realTimeColors[ ind ]
                    }
                },
                encode: {
                    tooltip: 1
                },
                data: i.map( i => i.concat( ind ) ) // 为了区分数据是哪个系的 有可能只有一天的数据
            } ) ) )
        } )
        let xAxisData
        if ( opt.isLowVer ) {
            let firstHour = result( find( series, i => {
                return i.data.length
            } ), 'data[0][0]' )
            xAxisData = Array( 8 ).fill( firstHour ).map( ( i, d ) => i + d * 3 )
            // 修正数据的x轴对齐
            series.forEach( row => {
                if ( row.data.length ) {
                    row.data.forEach( pt => {
                        pt[ 3 ] = pt[ 0 ];
                        pt[ 0 ] = Math.floor( pt[ 0 ] / 3 )
                    } )
                }
            } )
        } else {
            xAxisData = Array( 24 ).fill( 0 ).map( ( i, d ) => d )
        }
        let selected = zipObject( opt.legend, Array( opt.legend.length ).fill( false ) );
        let r = {
            ...baseOption,
            legend: {
                data: opt.legend,
                selected,
                bottom: '10px'
            },
            xAxis: {
                data: xAxisData,
                boundaryGap: false,
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                show: false
            },
            series
        }
        r.tooltip.formatter = ( arr ) => {
            /* 通常24小时的数据  arr[0].data =  [x轴位置（=真实时间）， 数据， 数据对应哪天]
                低级版本 只有8个小时 arr[0].data =  [x轴位置， 数据， 数据对应哪天，真实时间] */
            let h = [],
                hour = arr[ 0 ].data.length == 4 ? arr[ 0 ].data[ 3 ] : arr[ 0 ].data[ 0 ];
            h.push( hour + '时  ' + arr[ 0 ].seriesName );
            arr.forEach( i => {
                h.push( this.getTooltipMarker( realTimeColors[ i.data[ 2 ] ] ) + opt.keyName[ i.data[ 2 ] ] + ' : ' + i.value[ 1 ] + opt.legendUnitMap[ i.seriesName ] )
            } )
            return h.join( '<br/>' );
        }
        r = this.fixLegend( r, this.state.activeLegend || opt.legend[ 0 ] )
        return r;
    }
    // https://github.com/ecomfe/echarts/blob/8d44355b53833ae0b9a42f3872e6bac699190a9e/src/util/format.js
    getTooltipMarker( color, extraCssText ) {
        return color ? '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + encodeHTML( color ) + ';' +
                ( extraCssText || '' ) + '"></span>' : '';
    }
    _getNoDataOption( str ) {
        return {
            title: {
                show: true,
                textStyle: {
                    fontSize: 14
                },
                text: str,
                left: 'center',
                top: 'center'
            },
            xAxis: {
                show: false
            },
            yAxis: {
                show: false
            },
            series: []
        };
    }
    showNoData( str ) {
        var msgOption = this._getNoDataOption( str )
        this.echart.hideLoading()
        this.echart.setOption( msgOption, true )
    }
    render() {
        const {
            width = "100%",
            height = "300px"
        } = this.props
        return ( <div ref={chart => this.chart = chart} style={{
                width,
                height
            }}></div> )
    }
}
