import React from 'react';
import {
    Layout,
    Checkbox,
    Row,
    Col,
    Alert,
    Button
} from 'antd';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { remove as removeArr, compact, map as mapObj } from 'lodash'
import './More.less'

const SortableItem = SortableElement(({ obj }) => <li className="sort-item">{obj.name}</li>);
const SortableList = SortableContainer(({ items }) => {
    return (
        <ul className="sort-list">
            {items.map(( obj, index ) => ( <SortableItem key={`item-${ obj.key }`} index={index} obj={obj}/> ))}
        </ul>
    );
});

/*
props :
hint : 提示文案,  string
map：默认列表Map,
limit ： 可以同时选中的上限
sort ： 当前已经选中的项目
 onOkCallback
 onCloseCallback
*/
export default class More extends React.Component {
    constructor( props ) {
        super( props )
        this.state = {
            activeArr: this.props.sort,
            active: this.props.sort.map(( i ) => ({
                ...this.props.map[i],
                key: i
            })),
            list: Object.keys( this.props.map )
        };
    }
    onSortEnd({ oldIndex, newIndex }) {
        const active = arrayMove( this.state.active, oldIndex, newIndex )
        this.setState({
            active,
            activeArr: active.map( obj => obj.key )
        });
    }

    onChange( e ) {
        const { checked } = e.target;
        const key = e.target.value
        let { activeArr, active } = this.state;
        if ( checked ) {
            active.push({
                ...this.props.map[key],
                key
            })
            activeArr.push( key );
        } else {
            removeArr(active, obj => ( obj.key == key ))
            removeArr( activeArr, obj => obj == key )
        }
        this.setState({ active, activeArr });
    }

    onReset( ) {
        let arr = compact(mapObj(this.props.map, ( a, b ) => ( a.sortNum > -1 && b )))
        this.setState({
            activeArr: arr,
            active: arr.map(( i ) => ({
                ...this.props.map[i],
                key: i
            }))
        })
    }
    onCommit( ) {
        this.props.onCloseCallback( )
        this.props.onOkCallback( this.state.activeArr );
    }
    onCancel( ) {
        this.props.onCloseCallback( )
    }
    render( ) {
        const { list, active, activeArr } = this.state;
        const { hint, map, limit } = this.props
        return (
            <Layout className="more-panel  float-panel">
                {hint && ( <Alert message={hint} type="warning"/> )}
                <Row type="flex" gutter={16} className="row">
                    <Col span={15}>
                        <span className="title">选择度量</span>
                        <Row className="item-list">
                            {list.map(obj => {
                                return (
                                    <Col span={12} key={obj} className="item">
                                        <Checkbox
                                            value={obj}
                                            onChange={this.onChange.bind( this )}
                                            checked={activeArr.indexOf( obj ) > -1}
                                            disabled={limit && activeArr.indexOf( obj ) == -1 && activeArr.length >= limit}>
                                            {map[obj].name}
                                        </Checkbox>
                                    </Col>
                                )
                            })}
                        </Row>
                    </Col>
                    <Col span={9}>
                        <span className="title">列表</span>
                        <SortableList items={this.state.active} onSortEnd={this.onSortEnd.bind( this )} helperClass="sort-helper" lockAxis="y"/>
                    </Col>
                </Row>
                <div className="footer">
                    <Button onClick={this.onCommit.bind( this )}>确定</Button>
                    <a href="javascript:;" className="cancel-btn" onClick={this.onCancel.bind( this )}>取消</a>
                    <a href="javascript:;" className="reset-btn" onClick={this.onReset.bind( this )}>恢复默认</a>
                </div>
            </Layout>
        )
    }
}
