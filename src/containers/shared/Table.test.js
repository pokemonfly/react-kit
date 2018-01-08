import React from 'react';
import PropTypes from "prop-types";
import { AutoSizer, Column, Table, WindowScroller } from 'react-virtualized';
import { Checkbox, Affix } from 'antd';
import PubSub from 'pubsub-js';
import { get, omit, fill, pull } from 'lodash'
import './Table.less'
import { List } from 'immutable'
import { requestAnimationTimeout, cancelAnimationTimeout } from "@/utils/requestAnimationTimeout";
/* TODOList
分页
局部滚动 固定
额外固定的行 (定向数据)
排序
*/
let disablePointerEventsTimeoutId = null;
const DEFAULT_CELL_WIDTH = 100
export default class TableEX extends React.Component {
    static propTypes = {
        columns: PropTypes.array.isRequired,
        dataSource: PropTypes.array.isRequired,
        headHeight: PropTypes.number.isRequired,
        rowHeight: PropTypes.number.isRequired,
        // 内容过滤器
        filters: PropTypes.object,
        isLoading: PropTypes.bool,
        // 无内容时的render
        noRowsRenderer: PropTypes.any,
        // 滚动时 额外固定在页头的内容
        extraHead: PropTypes.any,
        extraHeadHeight: PropTypes.number,
        // 分组模式开关
        isGroup: PropTypes.bool,
        // 分组 设置
        groupSetting: PropTypes.array,
        // 控制细分数据显示
        checkDetailVisiable: PropTypes.func,
        // 细分数据 children数据 用 额外的render
        detailRowRender: PropTypes.func,
        //checkbox用
        hasCheckbox: PropTypes.bool,
        selectedRowKeys: PropTypes.array,
        selectionEvent: PropTypes.object
    }
    static defaultProps = {
        dataSource: [],
        headHeight: 40,
        rowHeight: 56,
        checkDetailVisiable: ( ) => [],
        noRowsRenderer: ( ) => (
            <span>暂无数据</span>
        )
    }
    constructor( props ) {
        super( props );
        this.state = {
            extraHeadVisible: false,
            data: List( ),
            groupVisiable: fill( Array( props.groupSetting.length ), true ),
            checkMap: {},
            activeRow: null
        }
        window.table = this
    }
    componentWillMount( ) {
        this.calcWidth( )
        this.formatDataSource( )
    }
    componentWillReceiveProps( nextProps ) {
        this.calcWidth( nextProps )
        this.formatDataSource( nextProps )
    }
    componentDidUpdate( ) {
        PubSub.subscribe('table.resize', ( ) => {
            this.refs.windowScroller && this.refs.windowScroller.updatePosition( );
        })
    }
    componentWillUnmount( ) {
        PubSub.unsubscribe( 'table.resize' );
        this.scrollBar.removeEventListener( "scroll", this.onBarScroll )
    }
    // 可以外部调用的
    clearCheckbox( ) {
        this._setCheckStatus( this.state.checkMap.list, false )
    }
    // Event
    triggerCheckboxEvent = ( ) => {
        const { selectionEvent } = this.props
        const { checkMap } = this.state
        if ( selectionEvent.onChange ) {
            selectionEvent.onChange({
                selectedRowKeys: checkMap.list.filter(key => checkMap[key])
            })
        }
    }
    _setCheckStatus( arr, checked ) {
        const { checkMap } = this.state
        let obj = {}
        arr.forEach(key => {
            obj[key] = checked
        })
        this.setState( {
            checkMap: {
                ...checkMap,
                ...obj
            }
        }, this.triggerCheckboxEvent )
    }
    onCheckboxAllChange = ( e ) => {
        this._setCheckStatus( this.state.checkMap.list, e.target.checked )
    }
    onCheckboxChange = ( e ) => {
        const { checked, value } = e.target
        this.setState( {
            checkMap: {
                ...this.state.checkMap,
                [ value ]: checked
            }
        }, this.triggerCheckboxEvent )
    }
    onClickGroupTitle( index, e ) {
        if ( e.target.type == 'checkbox' ) {
            return;
        }
        let { groupVisiable } = this.state
        groupVisiable[index] = !groupVisiable[index];
        this.setState({ groupVisiable })
        this.formatDataSource( )
    }
    onClickGroupTitleCheckbox = ( e ) => {
        const { checked, value } = e.target
        const { checkMap } = this.state
        let obj = {}
        checkMap.group[value].forEach(key => {
            obj[key] = checked
        })
        this.setState( {
            checkMap: {
                ...checkMap,
                ...obj
            }
        }, this.triggerCheckboxEvent )
    }
    // 固定表头
    onScrollHead = ( extraHeadVisible ) => {
        this.setState({ extraHeadVisible })
    }
    //同步滚动
    onBarScroll = ( e ) => {
        this.tableDiv.scrollLeft = this.tableHead.scrollLeft = e.target.scrollLeft
    }
    // Hover
    onRowMouseOut = ({ event, index, rowData }) => {
        // let { data } = this.state data = data.set(index, {     ...data.get( index ),     active: false }) if ( disablePointerEventsTimeoutId ) {
        // cancelAnimationTimeout( disablePointerEventsTimeoutId ); } disablePointerEventsTimeoutId = requestAnimationTimeout( ( ) => {
        // this.setState({ data }) }, 150 );
    }
    onRowMouseOver = ({ event, index, rowData }) => {
        // let { data } = this.state data = data.set(index, {     ...data.get( index ),     active: true })
        if ( disablePointerEventsTimeoutId ) {
            cancelAnimationTimeout( disablePointerEventsTimeoutId );
        }
        disablePointerEventsTimeoutId = requestAnimationTimeout( ( ) => {
            this.setState({ activeRow: index })
        }, 50 );
    }
    table = {}
    // 引用
    setTableRef = ( position, dom ) => {
        this.table[position] = dom
    }
    setTableDivRef = ( dom ) => {
        this.tableDiv = dom;
    }
    setTableHeadRef = ( dom ) => {
        this.tableHead = dom;
    }
    bindScrollEvent = ( dom ) => {
        this.scrollBar = dom
        this.scrollBar && this.scrollBar.addEventListener("scroll", this.onBarScroll.bind( this ))
    }

    // props => state
    formatDataSource( nextProps ) {
        const { filters, isGroup, groupSetting, dataSource, checkDetailVisiable } = nextProps || this.props;
        const { groupVisiable } = this.state;
        let data = List( ),
            arr = dataSource,
            disabledList = [],
            group = {};
        // 过滤
        if ( filters ) {
            for ( let f in filters ) {
                let o = filters[f];
                arr = arr.filter(o.fn.bind( null, o.type, o.key ))
            }
        }
        // 分组
        if ( isGroup && groupSetting.length && arr.length ) {
            let tempArr = [ ]
            groupSetting.forEach(( obj, index ) => {
                let t = arr.filter( obj.filter )
                tempArr.push({
                    ...omit( obj, 'filter' ),
                    _isGroupTitle: true,
                    count: t.length,
                    key: index
                })
                group[index] = t.map( i => i.key )
                if (groupVisiable[index]) {
                    tempArr = tempArr.concat( t );
                }
            })
            arr = tempArr
        }
        // 细分数据
        arr.forEach(i => {
            data = data.push( i );
            if ( i.disabled ) {
                disabledList.push( i.key )
            }
            if ( i.children ) {
                let _arr = checkDetailVisiable( i.children, i.detailStatus )
                _arr.forEach(( j, ind ) => {
                    data = data.push({
                        ...j,
                        _isChildren: true,
                        _row: ind,
                        _status: i.detailStatus,
                        _key: i.key
                    })
                })
            }
        })
        this.setState({
            data,
            checkMap: {
                ...this.state.checkMap,
                disabledList,
                group,
                list: arr.filter( i => !i._isGroupTitle ).map( i => i.key )
            }
        })
    }
    calcWidth( nextProps ) {
        const { columns } = nextProps || this.props;
        let contentWidth = 0,
            fixedLeftWidth = 0,
            fixedRightWidth = 0,
            columnsLeft = [],
            columnsCenter = [],
            columnsRight = [ ];
        columns.forEach(i => {
            let w = i.width || DEFAULT_CELL_WIDTH
            switch ( i.fixed ) {
                case 'left':
                    fixedLeftWidth += w
                    columnsLeft.push( i );
                    break
                case 'right':
                    fixedRightWidth += w
                    columnsRight.push( i );
                    break
                default:
                    contentWidth += w
                    columnsCenter.push( i )
            }
        })
        this.setState({
            minWidth: contentWidth + fixedLeftWidth + fixedRightWidth,
            contentWidth,
            fixedLeftWidth,
            fixedRightWidth,
            columnsLeft,
            columnsCenter,
            columnsRight,
            fixedLeft: !!fixedLeftWidth,
            fixedRight: !!fixedRightWidth
        })
    }

    // 表格渲染组件
    groupTitleRender = ({ rowData, key, className, style, position }) => {
        const { checkMap } = this.state;
        let checked,
            indeterminate,
            disabled,
            onChange;
        if ( position == 'left' ) {
            const items = checkMap.group[rowData.key]
            const checkedCount = items.filter(key => checkMap[key]).length
            const disabledCount = items.filter(key => checkMap.disabledList[key]).length
            checked = checkedCount > 0 && checkedCount == items.length
            indeterminate = checkedCount > 0
            disabled = disabledCount == items.length
        }
        return (
            <div role="row" key={key} className={className} style={style} onClick={this.onClickGroupTitle.bind( this, rowData.key )}>
                {position == 'left' && (
                    <div className="ReactVirtualized__Table__rowColumn table-group-title">
                        <Checkbox
                            checked={checked}
                            className="table-checkbox"
                            disabled={disabled}
                            indeterminate={indeterminate}
                            onChange={this.onClickGroupTitleCheckbox}
                            value={rowData.key}/> {rowData.title}
                        ({rowData.count})
                    </div>
                )}
                {position != 'left' && (
                    <div className="ReactVirtualized__Table__rowColumn table-group-title">
                        <span>&nbsp;</span>
                    </div>
                )}
            </div>
        )
    }
    cellDataGetter({ dataKey, rowData }) {
        if ( typeof rowData.get === "function" ) {
            return rowData.get( dataKey );
        } else {
            return get( rowData, dataKey );
        }
    }
    cellRenderer = ({ cellData, columnData, rowData, dataKey, columnIndex }) => {
        if ( rowData._isGroupTitle ) {
            return '';
        }
        if ( columnData && columnData.render ) {
            return columnData.render( cellData, rowData )
        } else {
            if ( cellData == 0 || cellData === undefined ) {
                return '-'
            }
            if ( columnData.accuracy ) {
                cellData = +cellData.toFixed( columnData.accuracy )
            }
            if ( columnData.unit ) {
                cellData += columnData.unit
            }
            return String( cellData );
        }
    }
    headerRowRenderer({ className, columns, style }) {
        return (
            <div className={className} role="row" style={style}>
                {columns}
            </div>
        );
    }
    rowRenderer = (position, {
        className,
        columns,
        index,
        key,
        onRowClick,
        onRowDoubleClick,
        onRowMouseOut,
        onRowMouseOver,
        onRowRightClick,
        rowData,
        style
    }) => {
        const a11yProps = {};

        if ( onRowClick || onRowDoubleClick || onRowMouseOut || onRowMouseOver || onRowRightClick ) {
            a11yProps["aria-label"] = "row";
            a11yProps.tabIndex = 0;

            if ( onRowClick ) {
                a11yProps.onClick = event => onRowClick({ event, index, rowData });
            }
            if ( onRowDoubleClick ) {
                a11yProps.onDoubleClick = event => onRowDoubleClick({ event, index, rowData });
            }
            if ( onRowMouseOut ) {
                a11yProps.onMouseOut = event => onRowMouseOut({ event, index, rowData });
            }
            if ( onRowMouseOver ) {
                a11yProps.onMouseOver = event => onRowMouseOver({ event, index, rowData });
            }
            if ( onRowRightClick ) {
                a11yProps.onContextMenu = event => onRowRightClick({ event, index, rowData });
            }
        }

        // 这里禁用掉overflow 是为了显示绝对定位的自定义内容 分组的支持
        if ( rowData._isChildren || rowData._isGroupTitle ) {
            delete style.overflow
        }
        if ( rowData._isGroupTitle ) {
            return this.groupTitleRender({ rowData, key, className, style, position })
        }
        // const { activeRows } = this.state if ( activeRows.indexOf( rowData.key ) > -1 ) { if ( this.state.activeRow == index ) {     className +=
        // ' active' }
        console.log( "我re-render了" );
        return (
            <div role="row" {...a11yProps} key={key} className={className} style={style}>
                {columns}
            </div>
        );
    }
    renderCheckbox = (type, { cellData, rowData, dataKey, columnIndex }) => {
        const { checkMap } = this.state;
        const { detailRowRender, rowHeight } = this.props;
        let indeterminate = false,
            disabled = false,
            checked = false,
            onChange
        if ( type == 'cell' ) {
            disabled = rowData.disabled
            checked = checkMap[cellData]
            onChange = this.onCheckboxChange
        } else {
            onChange = this.onCheckboxAllChange
            const items = checkMap.list
            const checkedCount = items.filter(key => checkMap[key]).length
            const disabledCount = items.filter(key => checkMap.disabledList[key]).length
            checked = checkedCount > 0 && checkedCount == items.length
            indeterminate = checkedCount > 0
            disabled = disabledCount == items.length
        }
        if ( rowData && rowData._isChildren ) {
            return detailRowRender({ columnIndex, dataKey, rowData, rowHeight, width: this.state.fixedLeftWidth }) || (
                <span>&nbsp;</span>
            )
        }
        return ( <Checkbox
            checked={checked}
            className="table-checkbox"
            disabled={disabled}
            indeterminate={indeterminate}
            onChange={onChange}
            value={cellData}/> )
    }
    renderExtraColumns( columns, position ) {
        const { hasCheckbox } = this.props

        let r = columns.map(( obj, index ) => {
            const className = obj.grow ? 'table-grow-cell' : null;
            return <Column
                label={obj.title}
                key={obj.key || obj.dataIndex || index}
                columnData={obj}
                cellDataGetter={this.cellDataGetter}
                cellRenderer={this.cellRenderer}
                dataKey={obj.dataIndex || obj.key}
                headerClassName={className}
                className={className}
                width={obj.width || 100}/>
        })
        if ( hasCheckbox && position == 'left' ) {
            r.unshift( <Column
                key='checkbox'
                dataKey='checkbox'
                width={32}
                cellDataGetter={({ rowData }) => ( rowData.key )}
                headerRenderer={this.renderCheckbox.bind( null, 'header' )}
                cellRenderer={this.renderCheckbox.bind( null, 'cell' )}/> )
        }
        return r;
    }
    tableHeadRender({ width, columns, position }) {
        const { headHeight } = this.props
        return (
            <Table
                autoHeight={true}
                height={headHeight}
                headerRowRenderer={this.headerRowRenderer}
                width={width}
                headerHeight={headHeight}
                rowHeight={0}
                rowCount={0}
                rowGetter={( ) => null}>
                {this.renderExtraColumns( columns, position )}
            </Table>
        )
    }
    tableRender({ height, scrollTop, width, columns, position }) {
        const { noRowsRenderer, rowHeight } = this.props
        const { data } = this.state
        return (
            <Table
                autoHeight={true}
                scrollTop={scrollTop}
                height={height}
                width={width}
                noRowsRenderer={noRowsRenderer}
                headerHeight={0}
                disableHeader={true}
                rowHeight={rowHeight}
                rowRenderer={this.rowRenderer.bind( this, position )}
                rowCount={data.size}
                rowGetter={({ index }) => data.get( index )}
                ref={this.setTableRef.bind( null, position )}
                onRowMouseOut={this.onRowMouseOut}
                onRowMouseOver={this.onRowMouseOver}>
                {this.renderExtraColumns( columns, position )}
            </Table>
        )
    }
    renderTableHead( ) {
        const { extraHead, extraHeadHeight, headHeight, columns } = this.props
        const {
            extraHeadVisible,
            fixedLeft,
            fixedRight,
            contentWidth,
            fixedLeftWidth,
            fixedRightWidth,
            columnsLeft,
            columnsCenter,
            columnsRight,
            minWidth
        } = this.state
        return (
            <AutoSizer disableHeight={true}>
                {({ width }) => (
                    <Affix offsetTop={extraHeadHeight} onChange={this.onScrollHead} style={{
                        width
                    }}>
                        {extraHeadVisible && extraHead}
                        {( !fixedLeft && !fixedRight || width > minWidth ) ? (
                            <div className="table-grid">
                                {this.tableHeadRender({ width: width, columns: columns, position: 'left' })}
                            </div>
                        ) : (
                            <div className="table-grid">
                                {fixedLeft && (
                                    <div
                                        className="fixed-part-left"
                                        style={{
                                        width: fixedLeftWidth
                                    }}>
                                        {this.tableHeadRender({ width: fixedLeftWidth, columns: columnsLeft, position: 'left' })}
                                    </div>
                                )}
                                <div className="scroll-part" ref={this.setTableHeadRef}>
                                    <AutoSizer disableHeight={true}>
                                        {({ width }) => (
                                            <div style={{
                                                width
                                            }}>
                                                {this.tableHeadRender({ width: contentWidth, columns: columnsCenter, position: 'center' })}
                                            </div>
                                        )}
                                    </AutoSizer>
                                </div>
                                {fixedRight && (
                                    <div
                                        className="fixed-part-right"
                                        style={{
                                        width: fixedRightWidth
                                    }}>
                                        {this.tableHeadRender({ width: fixedRightWidth, columns: columnsRight, position: 'right' })}
                                    </div>
                                )}
                            </div>
                        )}
                    </Affix>
                )}
            </AutoSizer>
        )
    }
    renderBaseTable( obj ) {
        const { paddingTop } = obj;
        return (
            <div className="table-gird" style={{
                paddingTop
            }}>
                <div className="table-grid">
                    {this.tableRender({
                        ...obj,
                        columns: this.props.columns,
                        position: 'left'
                    })}
                </div>
            </div>
        )
    }
    renderSeprateTable( obj ) {
        const { paddingTop, width } = obj;
        const {
            fixedLeft,
            fixedRight,
            contentWidth,
            fixedLeftWidth,
            fixedRightWidth,
            columnsLeft,
            columnsCenter,
            columnsRight
        } = this.state;
        return (
            <div style={{
                width,
                paddingTop
            }}>
                <div className="table-grid">
                    {fixedLeft && (
                        <div className="fixed-part-left" style={{
                            width: fixedLeftWidth
                        }}>
                            {this.tableRender({
                                ...obj,
                                width: fixedLeftWidth,
                                columns: columnsLeft,
                                position: 'left'
                            })}
                        </div>
                    )}
                    <div className="scroll-part" ref={this.setTableDivRef}>
                        <AutoSizer disableHeight={true}>
                            {({ width }) => (
                                <div style={{
                                    width
                                }}>
                                    {this.tableRender({
                                        ...obj,
                                        width: contentWidth,
                                        columns: columnsCenter,
                                        position: 'center'
                                    })}
                                </div>
                            )}
                        </AutoSizer>
                    </div>
                    {fixedRight && (
                        <div className="fixed-part-right" style={{
                            width: fixedRightWidth
                        }}>
                            {this.tableRender({
                                ...obj,
                                width: fixedRightWidth,
                                columns: columnsRight,
                                position: 'right'
                            })}
                        </div>
                    )}
                </div>
                <Affix
                    offsetBottom={0}
                    style={{
                    marginLeft: fixedLeftWidth,
                    marginRight: fixedRightWidth,
                    width: width - fixedLeftWidth - fixedRightWidth
                }}>
                    <AutoSizer disableHeight={true}>
                        {({ width }) => (
                            <div className="scroll-bar" ref={this.bindScrollEvent} style={{
                                width
                            }}>
                                <div className="scroll-bar-content" style={{
                                    width: contentWidth
                                }}></div>
                            </div>
                        )}
                    </AutoSizer>
                </Affix>
            </div>
        )
    }
    renderTable( obj ) {
        const { headHeight } = this.props
        const { fixedLeft, fixedRight, extraHeadVisible, minWidth } = this.state;
        const paddingTop = extraHeadVisible ? headHeight : 0;;
        return (
            <AutoSizer disableHeight={true}>
                {({ width }) => {
                    if ( !fixedLeft && !fixedRight || width > minWidth ) {
                        return this.renderBaseTable({
                            ...obj,
                            width,
                            paddingTop
                        });
                    } else {
                        return this.renderSeprateTable({
                            ...obj,
                            width,
                            paddingTop
                        })
                    }
                }}
            </AutoSizer>
        )
    }
    render( ) {
        const { isLoading } = this.props
        return (
            <div>
                {this.renderTableHead( )}
                {!isLoading && (
                    <WindowScroller ref="windowScroller" scrollingResetTimeInterval={1000}>
                        {( obj ) => this.renderTable( obj )}
                    </WindowScroller>
                )}
                {isLoading && (
                    <div className='table-loading'>Now Loading...</div>
                )}
            </div>
        )
    }
}
