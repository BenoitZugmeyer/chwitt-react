'use strict';
var React = require('react');
var Component = require('chwitt-react/Component');
var userStore = require('chwitt-react/stores/user');
var actions = require('chwitt-react/actions');
var Login = require('./Login');
var Columns = require('./Columns');

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
            <div>
                <span>Welcome {this.state.user.screen_name}!</span>
                <button onClick={this.onClick.bind(this)}>Log out</button>
            </div>
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
        flexDirection: 'column',
        height: '100%',
    },

    columns: {
        flex: 1,
        display: 'flex',
    }
};

module.exports = App;
