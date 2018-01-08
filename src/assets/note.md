// @connect(state => ({ user: state.user, sider: state.layout.sider }), dispatch => ({
//     toggleSider: bindActionCreators( toggleSider, dispatch )
// }))
@connect(state => ({ user: state.user, sider: state.layout.sider }), dispatch => (bindActionCreators( {
    toggleSider
}, dispatch )))

等价的
