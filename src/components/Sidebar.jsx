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
            <div styles="entry">
                <Avatar user={this.state.user} />
            </div>
            <div styles="entry button compose" onClick={this.onCompose.bind(this)}></div>
            <div styles="entry columns">
                <ColumnsSidebar />
            </div>
        </div>;
    }

    onCompose() {
        console.log('COMPOSE');
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
    },

    entry: {
        marginTop: ss.vars.gap,
        flexShrink: 0,
    },

    button: {
        $button: true,
        height: 48,
        width: 48,
        backgroundSize: [40, 40],
    },

    columns: {
        flex: 1,
        display: 'flex',
    },

    compose: {
        $penIcon: true,
    },

};

module.exports = Sidebar;
