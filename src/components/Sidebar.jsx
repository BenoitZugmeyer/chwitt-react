'use strict';
let React = require('react');
let Component = require('chwitt-react/Component');
let Avatar = require('chwitt-react/components/Avatar');
let ColumnsSidebar = require('chwitt-react/components/ColumnsSidebar');
let layoutStore = require('chwitt-react/stores/layout');
let userStore = require('chwitt-react/stores/user');
let ss = require('chwitt-react/ss');
let actions = require('chwitt-react/actions');
let FloatingBubble = require('./FloatingBubble');
let Compose = require('./Compose');

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
        let style = {
            minWidth: this.state.width,
            maxWidth: this.state.width,
        };

        return <div styles="main" style={style}>
            <Avatar
                user={this.state.user}
                mainStyle={this.getStyle('entry', 'avatar')}
                onClick={this.onAvatarClick.bind(this)} />
            <div
                styles="entry entryButton compose"
                onClick={this.onCompose.bind(this)} />
            <div styles="middle">
                <div styles="entry columns">
                    <ColumnsSidebar />
                </div>
                <div styles="entry entryButton newColumn" onClick={this.onNewColumn.bind(this)}>
            </div>
            </div>
        </div>;
    }

    showBubble(entry, content) {
        let rect = entry.getBoundingClientRect();

        FloatingBubble.show([{
            position: 'left',
            x: ss.vars.gap * 2 + ss.vars.avatarSize,
            y: rect.top + rect.height / 2
        }], content);
    }

    onCompose(e) {
        this.showBubble(e.target, <Compose />);
    }

    onNewColumn() {
        actions.openColumn({ name: 'new_column' });
    }

    onAvatarClick(e) {
        this.showBubble(e.target, <div>
            <button
                type="button"
                className={this.style('button')}
                onClick={this.onLogOut.bind(this)}>Log out</button>
        </div>);
    }

    onLogOut() {
        actions.logout();
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
        padding: `${ss.vars.gap / 2}px 0`,
    },

    entry: {
        flexShrink: 0,
    },

    entryButton: {
        margin: `${ss.vars.gap / 2}px 0`,
        $button: true,
        height: 24,
        width: 24,
    },

    button: {
        $button: true,
        whiteSpace: 'nowrap',
    },

    avatar: {
        margin: `${ss.vars.gap / 2} 0`,
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
        backgroundSize: '18px 18px',
    },

    newColumn: {
        backgroundSize: '24px 24px',
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
