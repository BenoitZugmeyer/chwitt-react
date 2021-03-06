'use strict';
let React = require('react');
let Component = require('chwitt-react/Component');
let userStore = require('chwitt-react/stores/user');
let actions = require('chwitt-react/actions');
let Login = require('./Login');
let Columns = require('./Columns');
let Sidebar = require('./Sidebar');
let FloatingBubble = require('./FloatingBubble');

class App extends Component {

    constructor(props) {
        super(props);
        this.state = this.getStateFromStores();
    }

    getStateFromStores() {
        return {
            authenticated: userStore.authenticated,
            user: userStore.user,
        };
    }

    render() {
        if (!this.state.authenticated) return <Login />;

        return <div styles="main">
            <FloatingBubble />
            <Sidebar />
            <div styles="columns">
                <Columns />
            </div>
        </div>;
    }

    onClick() {
        actions.logout();
    }

    onChange() {
        this.setState(this.getStateFromStores());
    }
}

App.listenTo(userStore);

App.styles = {
    main: {
        display: 'flex',
        height: '100%',
        flex: 1,
    },

    columns: {
        flex: 1,
        display: 'flex',
    }
};

module.exports = App;
