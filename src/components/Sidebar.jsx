'use strict';
var Component = require('chwitt-react/Component');
var Avatar = require('chwitt-react/components/Avatar');
var ColumnsSidebar = require('chwitt-react/components/ColumnsSidebar');
var layoutStore = require('chwitt-react/stores/layout');
var userStore = require('chwitt-react/stores/user');
var ss = require('chwitt-react/ss');
var actions = require('chwitt-react/actions');

class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = this.getStateFromStores();
    }

    getStateFromStores() {
        return {
            width: layoutStore.sidebarWidth,
            user: userStore.user,
        };
    }

    onChange() {
        this.setState(this.getStateFromStores());
    }

    render() {
        var style = {
            minWidth: this.state.width,
            maxWidth: this.state.width,
        };

        return <div styles="main" style={style}>
            <div styles="entry avatar">
                <Avatar user={this.state.user} />
            </div>
            <div styles="entry button compose" onClick={this.onCompose.bind(this)}></div>
            <div styles="middle">
                <div styles="entry columns">
                    <ColumnsSidebar />
                </div>
                <div styles="entry button newColumn" onClick={this.onNewColumn.bind(this)}>
            </div>
            </div>
        </div>;
    }

    onCompose() {
        console.log('COMPOSE');
    }

    onNewColumn() {
        actions.openNewColumn();
    }

}

Sidebar.listenTo(layoutStore);
Sidebar.listenTo(userStore);

Sidebar.styles = {
    main: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#ECF0F1',
        padding: [ss.vars.gap / 2, 0],
    },

    entry: {
        flexShrink: 0,
    },

    button: {
        margin: [ss.vars.gap / 2, 0],
        $button: true,
        height: 24,
        width: 24,
    },

    avatar: {
        margin: [ss.vars.gap / 2, 0],
    },

    columns: {
        display: 'flex',
        flexShrink: 1,
    },

    middle: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },

    compose: {
        $penIcon: true,
        backgroundSize: [18, 18],
    },

    newColumn: {
        backgroundSize: [24, 24],
        height: 24,
        width: 24,
        backgroundColor: '#95A5A6',
        $svgBackground: `
        <path fill="#fff" d="
            M10 10
            l 0 -4 l 4  0 l 0  4
            l 4  0 l 0  4 l-4  0
            l 0  4 l-4  0 l 0 -4
            l-4  0 l 0 -4 l 4  0
        " />
        `,
    },

};

module.exports = Sidebar;
