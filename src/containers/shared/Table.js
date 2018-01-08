import React from 'react';
import PropTypes from "prop-types";
import { AutoSizer, Column, Table, Grid } from 'react-virtualized';
import WindowScroller from './WindowScroller'
import { Checkbox, Affix } from 'antd';
import PubSub from 'pubsub-js';
import {
    get,
    omit,
    fill,
    pull,
    without,
    isBoolean
} from 'lodash'
import { fromJS, is, isKeyed, Set } from 'immutable'
import cn from "classnames";
import { requestAnimationTimeout, cancelAnimationTimeout } from "@/utils/requestAnimationTimeout";
import './Table.less'

class TableHoc extends Table {
    render() {
        const {
            children,
            className,
            disableHeader,
            gridClassName,
            gridStyle,
            headerHeight,
            headerRowRenderer,
            height,
            id,
            noRowsRenderer,
            rowClassName,
            rowStyle,
            scrollToIndex,
            style,
            width,
            rowRangeRenderer
        } = this.props;
        const { scrollbarWidth } = this.state;

        const availableRowsHeight = disableHeader ? height : height - headerHeight;

        const rowClass = typeof rowClassName === "function" ? rowClassName( { index: -1 } ) : rowClassName;
        const rowStyleObject = typeof rowStyle === "function" ? rowStyle( { index: -1 } ) : rowStyle;

        this._cachedColumnStyles = [];
        React.Children.toArray( children ).forEach( ( column, index ) => {
            const flexStyles = this._getFlexStyleForColumn( column, column.props.style );

            this._cachedColumnStyles[ index ] = {
                ...flexStyles,
                overflow: "hidden"
            };
        } );

        return ( <div className={cn( "ReactVirtualized__Table", className )} id={id} role="grid" style={style}>
            {
                !disableHeader && headerRowRenderer( {
                    className: cn( "ReactVirtualized__Table__headerRow", rowClass ),
                    columns: this._getHeaderColumns(),
                    style: {
                        ...rowStyleObject,
                        height: headerHeight,
                        overflow: "hidden",
                        paddingRight: scrollbarWidth,
                        width: width
                    }
                } )
            }

            <Grid
                {...this.props}
                autoContainerWidth={true}
                className={cn( "ReactVirtualized__Table__Grid", gridClassName )}
                cellRenderer={this._createRow}
                cellRangeRenderer={rowRangeRenderer}
                columnWidth={width}
                columnCount={1}
                height={availableRowsHeight}
                id={undefined}
                noContentRenderer={noRowsRenderer}
                onScroll={this._onScroll}
                onSectionRendered={this._onSectionRendered}
                ref={this._setRef}
                role="rowgroup"
                scrollbarWidth={scrollbarWidth}
                scrollToRow={scrollToIndex}
                style={{
                    ...gridStyle,
                    overflowX: "hidden"
                }}/>
        </div> );
    }
}
/* TODOList
分页
局部滚动 固定
额外固定的行 (定向数据)
排序
*/
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
        isGroup: false,
        hasCheckbox: false,
        groupSetting: [],
        checkDetailVisiable: () => [],
        noRowsRenderer: () => ( <span className="no-data">暂无数据</span> )
    }
    constructor( props ) {
        super( props );
        this.state = {
            extraHeadVisible: false,
            data: [],
            reRenderRows: Set(),
            _cacheData: null,
            groupVisiable: fill( Array( props.groupSetting.length ), true ),
            checkMap: {},
            currentHoverKey: null
        }
        this.cellCache = {};
        this.rowCache = {};
        this._delayRemoveArr = [];
        window.table = this
    }
    componentWillMount() {
        this.calcWidth()
        this.formatDataSource()
    }
    _compareProps( a, b ) {}
    componentWillReceiveProps( nextProps ) {
        const thisProps = this.props || {};
        const arr = [
            // 'columns',  TODO   orz包含React对象
            'filters',
            'isGroup',
            'groupSetting',
            'dataSource',
            'checkDetailVisiable'
        ]
        this.__shouldUpdate = false
        for ( const i in arr ) {
            // 排除function的影响
            if ( JSON.stringify( thisProps[ arr[ i ] ] ) != JSON.stringify( nextProps[ arr[ i ] ] ) ) {
                console.log( `${ arr[ i ] } changed, re-render` )
                this.__shouldUpdate = true
                break;
            }
        }
        if ( this.__shouldUpdate ) {
            this.calcWidth( nextProps )
            this.formatDataSource( nextProps )
            this.rowCache = {};
            this.state.reRenderRows = this.state.reRenderRows.clear()
        }
    }
    componentDidUpdate() {
        PubSub.subscribe( 'table.resize', () => {
            this.refs.windowScroller && this.refs.windowScroller.updatePosition();
        } )
        if ( this._delayRemoveArr && this._delayRemoveArr.length ) {
            this._delayRemoveArr.forEach( ( key ) => {
                this.state.reRenderRows = this.state.reRenderRows.delete( key )
            } )
            this._delayRemoveArr = [];
        }
    }
    componentWillUnmount() {
        PubSub.unsubscribe( 'table.resize' );
        this.scrollBar.removeEventListener( "scroll", this.onBarScroll )
    }
    shouldComponentUpdate( nextProps = {}, nextState = {} ) {
        // __shouldUpdate 用于防御table导致父组件render后（checkbox的回调）的componentWillReceiveProps的再render
        if ( isBoolean( this.__shouldUpdate ) ) {
            let r = this.__shouldUpdate
            this.__shouldUpdate = null;
            console.log( `==============shouldComponentUpdate  ${ r } ===================` )
            return r;
        }
        return true;
    }
    //=======================================================
    clearCheckbox() {
        this._setCheckStatus( this.state.checkMap.list, false )
    }
    // Event
    triggerCheckboxEvent = () => {
        const { selectionEvent } = this.props
        const { checkMap } = this.state
        if ( selectionEvent.onChange ) {
            selectionEvent.onChange( {
                selectedRowKeys: checkMap.list.filter( key => checkMap[ key ] )
            } )
        }
    }
    _setCheckStatus( arr, checked ) {
        const { checkMap } = this.state
        let obj = {}
        arr.forEach( key => {
            obj[ key ] = checked
        } )
        let newStatus = {
            ...checkMap,
            ...obj
        }
        this.syncCheckStatus( newStatus );
        this.setState( {
            checkMap: newStatus
        }, this.triggerCheckboxEvent )
    }
    // 同步选中的状态到data 同时确定需要更新的列
    syncCheckStatus( obj ) {
        let { reRenderRows, data } = this.state
        for ( const key in obj ) {
            const s = obj[ key ]
            if ( isBoolean( s ) ) {
                const ind = data.findIndex( ( v, i ) => {
                    return v.get( 'key' ) == key
                } )
                if ( !!data.getIn( [ ind, 'checked' ] ) != s ) {
                    data = data.setIn( [
                        ind, 'checked'
                    ], s )
                    reRenderRows = reRenderRows.add( +key )
                }
            }
        }
        console.log( 'reRenderRows:   ' + reRenderRows.toJSON() )
        this.setState( { reRenderRows, data } )
    }
    onCheckboxAllChange = ( e ) => {
        this._setCheckStatus( this.state.checkMap.list, e.target.checked )
    }
    onCheckboxChange = ( e ) => {
        const { checked, value } = e.target
        let newStatus = {
            ...this.state.checkMap,
            [ value ]: checked
        }
        this.syncCheckStatus( newStatus );
        this.setState( {
            checkMap: newStatus
        }, this.triggerCheckboxEvent )
    }
    onClickGroupTitle( index, e ) {
        if ( e.target.type == 'checkbox' ) {
            return;
        }
        let { groupVisiable } = this.state
        groupVisiable[ index ] = !groupVisiable[ index ];
        // key发生了变化 缓存失效
        this.rowCache = {};
        this.state.reRenderRows = this.state.reRenderRows.clear();
        this.setState( { groupVisiable } )
        this.formatDataSource()
    }
    onClickGroupTitleCheckbox = ( e ) => {
        const { checked, value } = e.target
        const { checkMap } = this.state
        let obj = {}
        checkMap.group[ value ].forEach( key => {
            obj[ key ] = checked
        } )
        let newStatus = {
            ...checkMap,
            ...obj
        }
        this.syncCheckStatus( newStatus );
        this.setState( {
            checkMap: newStatus
        }, this.triggerCheckboxEvent )
    }
    // 固定表头
    onScrollHead = ( extraHeadVisible ) => {
        this.setState( { extraHeadVisible } )
    }
    onResize = () => {
        // 宽度变化了，重绘
        this.rowCache = {};
    }
    //同步滚动
    onBarScroll = ( e ) => {
        this.tableDiv.scrollLeft = this.tableHead.scrollLeft = e.target.scrollLeft
    }
    // Hover
    onRowMouseOver = ( { event, index, rowData } ) => {
        if ( event.target.className.indexOf( 'rowColumn' ) == -1 ) {
            return false;
        }
        if ( rowData.get( '_isChildren' ) ) {
            return false;
        }
        if ( this.state.currentHoverKey != index ) {
            let { data } = this.state
            data = data.map( ( o, key ) => {
                if ( o.get( 'hover' ) && index != key ) {
                    o = o.set( 'hover', false )
                } else if ( key == index ) {
                    o = o.set( 'hover', true )
                }
                return o
            } )
            this.setState( { currentHoverKey: index, data, reRenderRows: this.calcReRenderRows( data ) } )
        }
    }
    // 引用
    setTableDivRef = ( dom ) => {
        this.tableDiv = dom;
    }
    setTableHeadRef = ( dom ) => {
        this.tableHead = dom;
    }
    bindScrollEvent = ( dom ) => {
        this.scrollBar = dom
        this.scrollBar && this.scrollBar.addEventListener( "scroll", this.onBarScroll.bind( this ) )
    }

    // ======================== props => state=========================
    formatDataSource( nextProps ) {
        const { filters, isGroup, groupSetting, dataSource, checkDetailVisiable } = nextProps || this.props;
        const { groupVisiable, data } = this.state;
        let dataArr = [],
            arr = dataSource,
            disabledList = [],
            group = {};
        // 过滤
        if ( filters ) {
            for ( let f in filters ) {
                let o = filters[ f ];
                arr = arr.filter( o.fn.bind( null, o.type, o.key ) )
            }
        }
        // 分组
        if ( isGroup && groupSetting.length && arr.length ) {
            let tempArr = []
            groupSetting.forEach( ( obj, index ) => {
                let t = arr.filter( obj.filter )
                tempArr.push( {
                    ...omit( obj, 'filter' ),
                    _isGroupTitle: true,
                    count: t.length,
                    key: index
                } )
                group[ index ] = t.map( i => i.key )
                if ( groupVisiable[ index ] ) {
                    tempArr = tempArr.concat( t );
                }
            } )
            arr = tempArr
        }
        // 细分数据
        arr.forEach( i => {
            dataArr.push( i );
            if ( i.disabled ) {
                disabledList.push( i.key )
            }
            if ( i.children ) {
                let _arr = checkDetailVisiable( i.children, i.detailStatus )
                _arr.forEach( ( j, ind ) => {
                    dataArr.push( {
                        ...j,
                        _isChildren: true,
                        _row: ind,
                        _status: i.detailStatus,
                        _key: i.key
                    } )
                } )
            }
        } )
        const _data = fromJS( dataArr );
        this.setState( {
            data: _data,
            _cacheData: _data,
            reRenderRows: this.state.reRenderRows.clear(),
            checkMap: {
                ...this.state.checkMap,
                disabledList,
                group,
                list: arr.filter( i => !i._isGroupTitle ).map( i => i.key )
            }
        } )
    }
    calcWidth( nextProps ) {
        const { columns } = nextProps || this.props;
        let contentWidth = 0,
            fixedLeftWidth = 0,
            fixedRightWidth = 0,
            columnsLeft = [],
            columnsCenter = [],
            columnsRight = [];
        columns.forEach( i => {
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
        } )
        this.setState( {
            minWidth: contentWidth + fixedLeftWidth + fixedRightWidth,
            contentWidth,
            fixedLeftWidth,
            fixedRightWidth,
            columnsLeft,
            columnsCenter,
            columnsRight,
            fixedLeft: !!fixedLeftWidth,
            fixedRight: !!fixedRightWidth
        } )
    }
    calcReRenderRows( now, old = this.state._cacheData ) {
        let { reRenderRows } = this.state
        now.forEach( ( obj, key ) => {
            if ( !old ) {
                reRenderRows = reRenderRows.add( +obj.get( 'key' ) )
            } else if ( !is( obj, old.get( key ) ) ) {
                reRenderRows = reRenderRows.add( +obj.get( 'key' ) )
            }
        } )
        this.state._cacheData = now;
        console.log( 'reRenderRows:   ' + reRenderRows.toJSON() )
        return reRenderRows
    }
    //============= 表格渲染组件==========================================
    groupTitleRender = ( {
        rowData,
        key,
        className,
        style,
        position,
        a11yProps
    } ) => {
        const { checkMap } = this.state;
        const rowKey = rowData.get( 'key' );
        let checked,
            indeterminate,
            disabled,
            onChange;
        if ( position == 'left' ) {
            const items = checkMap.group[ rowKey ]
            const checkedCount = items.filter( key => checkMap[ key ] ).length
            const disabledCount = items.filter( key => checkMap.disabledList[ key ] ).length
            checked = checkedCount > 0 && checkedCount == items.length
            indeterminate = checkedCount > 0
            disabled = disabledCount == items.length
        }
        return ( <div role="row" key={key} className={className} style={style} onClick={this.onClickGroupTitle.bind( this, rowKey )}>
            {
                position == 'left' && ( <div className="ReactVirtualized__Table__rowColumn table-group-title">
                    <Checkbox
                        checked={checked}
                        className="table-checkbox"
                        disabled={disabled}
                        indeterminate={indeterminate}
                        onChange={this.onClickGroupTitleCheckbox}
                        value={rowKey}/> {rowData.get( 'title' )}
                    ({rowData.get( 'count' )})
                </div> )
            }
            {
                position != 'left' && ( <div className="ReactVirtualized__Table__rowColumn table-group-title">
                    <span>&nbsp;</span>
                </div> )
            }
        </div> )
    }
    cellDataGetter( { dataKey, rowData } ) {
        if ( typeof rowData.get === "function" ) {
            return rowData.get( dataKey );
        } else {
            return get( rowData, dataKey );
        }
    }
    cellRenderer = ( {
        cellData,
        columnData,
        rowData,
        dataKey,
        columnIndex,
        rowIndex
    } ) => {
        if ( rowData.get( '_isGroupTitle' ) ) {
            return '';
        }
        if ( columnData && columnData.render ) {
            //TODO no time to fix cache
            this.cellCache[rowIndex + '-' + columnIndex + dataKey] = this.cellCache[rowIndex + '-' + columnIndex + dataKey] || columnData.render( cellData, rowData )
            // return this.cellCache[rowIndex + '-' + columnIndex + dataKey]
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
    headerRowRenderer( { className, columns, style } ) {
        return ( <div className={className} role="row" style={style}>
            {columns}
        </div> );
    }
    rowRenderer = ( position, {
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
    } ) => {
        const { reRenderRows } = this.state;
        const rowKey = rowData.get( 'key' ),
            isChildren = rowData.get( '_isChildren' ),
            childrenStatus = rowData.get( '_status' );
        // 检查是否需要更新
        if ( reRenderRows.size && reRenderRows.has( rowKey ) ) {
            this._delayRemoveArr.push( rowKey )
        } else if ( this.rowCache[rowKey + position] ) {
            return this.rowCache[rowKey + position]
        }
        const a11yProps = {};
        if ( onRowClick || onRowDoubleClick || onRowMouseOut || onRowMouseOver || onRowRightClick ) {
            a11yProps[ "aria-label" ] = "row";
            a11yProps.tabIndex = 0;

            if ( onRowClick ) {
                a11yProps.onClick = event => onRowClick( { event, index, rowData } );
            }
            if ( onRowDoubleClick ) {
                a11yProps.onDoubleClick = event => onRowDoubleClick( { event, index, rowData } );
            }
            if ( onRowMouseOut ) {
                // a11yProps.onMouseOut = event => onRowMouseOut({ event, index, rowData });
                a11yProps.onMouseLeave = event => onRowMouseOut( { event, index, rowData } );
            }
            if ( onRowMouseOver ) {
                // a11yProps.onMouseOver = event => onRowMouseOver({ event, index, rowData });
                a11yProps.onMouseEnter = event => onRowMouseOver( { event, index, rowData } );
            }
            if ( onRowRightClick ) {
                a11yProps.onContextMenu = event => onRowRightClick( { event, index, rowData } );
            }
        }

        // 这里禁用掉overflow 是为了显示绝对定位的自定义内容 分组的支持
        if ( isChildren || rowData.get( '_isGroupTitle' ) ) {
            delete style.overflow
        }
        if ( rowData.get( '_isGroupTitle' ) ) {
            return this.groupTitleRender( {
                rowData,
                key,
                className,
                style,
                position,
                a11yProps
            } )
        }
        if ( rowData.get( 'hover' ) || rowData.get( 'active' ) ) {
            className += ' active'
        }
        console.log( "行re-render " );
        let r = ( <div role="row" {...a11yProps} key={key} className={className} style={style}>
            {columns}
        </div> );
        this.rowCache[rowKey + position + ( isChildren ? childrenStatus : '' )] = r
        return r;
    }
    renderCheckbox = ( type, { cellData, rowData, dataKey, columnIndex } ) => {
        const { checkMap } = this.state;
        const { detailRowRender, rowHeight } = this.props;
        let indeterminate = false,
            disabled = false,
            checked = false,
            onChange
        if ( type == 'cell' ) {
            disabled = rowData.get( 'disabled' )
            checked = checkMap[ cellData ]
            onChange = this.onCheckboxChange
        } else {
            onChange = this.onCheckboxAllChange
            const items = checkMap.list
            const checkedCount = items.filter( key => checkMap[ key ] ).length
            const disabledCount = items.filter( key => checkMap.disabledList[ key ] ).length
            checked = checkedCount > 0 && checkedCount == items.length
            indeterminate = checkedCount > 0
            disabled = disabledCount == items.length
        }
        if ( rowData && rowData.get( '_isChildren' ) ) {
            return detailRowRender( { columnIndex, dataKey, rowData, rowHeight, width: this.state.fixedLeftWidth } ) || ( <span>&nbsp;</span> )
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

        let r = columns.map( ( obj, index ) => {
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
        } )
        if ( hasCheckbox && position == 'left' ) {
            r.unshift( <Column
                key='checkbox'
                dataKey='checkbox'
                width={32}
                cellDataGetter={( { rowData } ) => ( rowData.get( 'key' ) )}
                headerRenderer={this.renderCheckbox.bind( null, 'header' )}
                cellRenderer={this.renderCheckbox.bind( null, 'cell' )}/> )
        }
        return r;
    }
    // 覆盖自带方法，使用缓存 https://github.com/bvaughn/react-virtualized/blob/master/source/Grid/defaultCellRangeRenderer.js
    rowRangeRenderer = ( {
        cellCache,
        cellRenderer,
        columnSizeAndPositionManager,
        columnStartIndex,
        columnStopIndex,
        deferredMeasurementCache,
        horizontalOffsetAdjustment,
        isScrolling,
        parent,
        rowSizeAndPositionManager,
        rowStartIndex,
        rowStopIndex,
        styleCache,
        verticalOffsetAdjustment,
        visibleColumnIndices,
        visibleRowIndices
    } ) => {
        let { reRenderRows } = this.state
        const renderedCells = [];
        const areOffsetsAdjusted = columnSizeAndPositionManager.areOffsetsAdjusted() || rowSizeAndPositionManager.areOffsetsAdjusted();
        const canCacheStyle = !isScrolling && !areOffsetsAdjusted;
        for ( let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++ ) {
            let rowDatum = rowSizeAndPositionManager.getSizeAndPositionOfCell( rowIndex );
            for ( let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++ ) {
                let columnDatum = columnSizeAndPositionManager.getSizeAndPositionOfCell( columnIndex );
                let isVisible = columnIndex >= visibleColumnIndices.start && columnIndex <= visibleColumnIndices.stop && rowIndex >= visibleRowIndices.start && rowIndex <= visibleRowIndices.stop;
                let key = `${ rowIndex}-${ columnIndex }`;
                let style;
                if ( canCacheStyle && styleCache[ key ] ) {
                    style = styleCache[ key ];
                } else {
                    if ( deferredMeasurementCache && !deferredMeasurementCache.has( rowIndex, columnIndex ) ) {
                        style = {
                            height: "auto",
                            left: 0,
                            position: "absolute",
                            top: 0,
                            width: "auto"
                        };
                    } else {
                        style = {
                            height: rowDatum.size,
                            left: columnDatum.offset + horizontalOffsetAdjustment,
                            position: "absolute",
                            top: rowDatum.offset + verticalOffsetAdjustment,
                            width: columnDatum.size
                        };
                        styleCache[ key ] = style;
                    }
                }
                let cellRendererParams = {
                    columnIndex,
                    isScrolling,
                    isVisible,
                    key,
                    parent,
                    rowIndex,
                    style
                };
                let renderedCell;
                if ( isScrolling && !horizontalOffsetAdjustment && !verticalOffsetAdjustment ) {
                    if ( !cellCache[ key ] ) {
                        cellCache[ key ] = cellRenderer( cellRendererParams );
                    }
                    renderedCell = cellCache[ key ];
                } else if ( reRenderRows.size && reRenderRows.has( rowIndex ) ) {
                    this.state.reRenderRows = reRenderRows.delete( rowIndex )
                    // 更新需要更新的行
                    renderedCell = cellCache[ key ] = cellRenderer( cellRendererParams )
                } else {
                    renderedCell = cellCache[ key ] = cellCache[ key ] || cellRenderer( cellRendererParams );
                }
                if ( renderedCell == null || renderedCell === false ) {
                    continue;
                }
                renderedCells.push( renderedCell );
            }
        }
        return renderedCells;
    }
    tableHeadRender( { width, columns, position } ) {
        const { headHeight } = this.props
        return ( <Table
            autoHeight={true}
            height={headHeight}
            headerRowRenderer={this.headerRowRenderer}
            width={width}
            headerHeight={headHeight}
            rowHeight={0}
            rowCount={0}
            rowGetter={() => null}>
            {this.renderExtraColumns( columns, position )}
        </Table> )
    }
    tableRender( { height, scrollTop, width, columns, position } ) {
        const { noRowsRenderer, rowHeight } = this.props
        const { data } = this.state
        return ( <TableHoc
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
            rowGetter={( { index } ) => data.get( index )}
            onRowMouseOut={this.onRowMouseOut}
            onRowMouseOver={this.onRowMouseOver}>
            {this.renderExtraColumns( columns, position )}
        </TableHoc> )
        //        rowRangeRenderer={this.rowRangeRenderer}
    }
    // ===============Table head ====================
    renderTableHead() {
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
        return ( <AutoSizer disableHeight={true} onResize={this.onResize}>
            {
                ( { width } ) => ( <Affix offsetTop={extraHeadHeight} onChange={this.onScrollHead} style={{
                        width
                    }}>
                    {extraHeadVisible && extraHead}
                    {
                        ( !fixedLeft && !fixedRight || width > minWidth ) ? ( <div className="table-grid">
                            {this.tableHeadRender( { width: width, columns: columns, position: 'left' } )}
                        </div> ) : ( <div className="table-grid">
                            {
                                fixedLeft && ( <div
                                    className="fixed-part-left"
                                    style={{
                                        width: fixedLeftWidth
                                    }}>
                                    {this.tableHeadRender( { width: fixedLeftWidth, columns: columnsLeft, position: 'left' } )}
                                </div> )
                            }
                            <div className="scroll-part" ref={this.setTableHeadRef}>
                                <AutoSizer disableHeight={true}>
                                    {
                                        ( { width } ) => ( <div style={{
                                                width
                                            }}>
                                            {this.tableHeadRender( { width: contentWidth, columns: columnsCenter, position: 'center' } )}
                                        </div> )
                                    }
                                </AutoSizer>
                            </div>
                            {
                                fixedRight && ( <div
                                    className="fixed-part-right"
                                    style={{
                                        width: fixedRightWidth
                                    }}>
                                    {this.tableHeadRender( { width: fixedRightWidth, columns: columnsRight, position: 'right' } )}
                                </div> )
                            }
                        </div> )
                    }
                </Affix> )
            }
        </AutoSizer> )
    }
    // ===============Table body ===============
    renderBaseTable( obj ) {
        const { paddingTop } = obj;
        return ( <div className="table-gird" style={{
                paddingTop
            }}>
            <div className="table-grid">
                {
                    this.tableRender( {
                        ...obj,
                        columns: this.props.columns,
                        position: 'left'
                    } )
                }
            </div>
        </div> )
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
        return ( <div style={{
                width,
                paddingTop
            }}>
            <div className="table-grid">
                {
                    fixedLeft && ( <div className="fixed-part-left" style={{
                            width: fixedLeftWidth
                        }}>
                        {
                            this.tableRender( {
                                ...obj,
                                width: fixedLeftWidth,
                                columns: columnsLeft,
                                position: 'left'
                            } )
                        }
                    </div> )
                }
                <div className="scroll-part" ref={this.setTableDivRef}>
                    <AutoSizer disableHeight={true}>
                        {
                            ( { width } ) => ( <div style={{
                                    width
                                }}>
                                {
                                    this.tableRender( {
                                        ...obj,
                                        width: contentWidth,
                                        columns: columnsCenter,
                                        position: 'center'
                                    } )
                                }
                            </div> )
                        }
                    </AutoSizer>
                </div>
                {
                    fixedRight && ( <div className="fixed-part-right" style={{
                            width: fixedRightWidth
                        }}>
                        {
                            this.tableRender( {
                                ...obj,
                                width: fixedRightWidth,
                                columns: columnsRight,
                                position: 'right'
                            } )
                        }
                    </div> )
                }
            </div>
            <Affix
                offsetBottom={0}
                style={{
                    marginLeft: fixedLeftWidth,
                    marginRight: fixedRightWidth,
                    width: width - fixedLeftWidth - fixedRightWidth
                }}>
                <AutoSizer disableHeight={true}>
                    {
                        ( { width } ) => ( <div className="scroll-bar" ref={this.bindScrollEvent} style={{
                                width
                            }}>
                            <div className="scroll-bar-content" style={{
                                    width: contentWidth
                                }}></div>
                        </div> )
                    }
                </AutoSizer>
            </Affix>
        </div> )
    }
    renderTable( obj ) {
        const { headHeight } = this.props
        const { fixedLeft, fixedRight, extraHeadVisible, minWidth } = this.state;
        const paddingTop = extraHeadVisible ? headHeight : 0;;
        return ( <AutoSizer disableHeight={true}>
            {
                ( { width } ) => {
                    if ( !fixedLeft && !fixedRight || width > minWidth ) {
                        return this.renderBaseTable( {
                            ...obj,
                            width,
                            paddingTop
                        } );
                    } else {
                        return this.renderSeprateTable( {
                            ...obj,
                            width,
                            paddingTop
                        } )
                    }
                }
            }
        </AutoSizer> )
    }
    render() {
        const { isLoading } = this.props
        return ( <div>
            {this.renderTableHead()}
            {
                !isLoading && ( <WindowScroller ref="windowScroller" scrollingResetTimeInterval={50}>
                    {( obj ) => this.renderTable( obj )}
                </WindowScroller> )
            }
            {isLoading && ( <div className='table-loading'>Now Loading...</div> )}
        </div> )
    }

}
