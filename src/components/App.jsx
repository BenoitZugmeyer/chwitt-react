'use strict';
var Component = require('chwitt-react/Component');
var userStore = require('chwitt-react/stores/user');
var actions = require('chwitt-react/actions');
var Login = require('./Login');
var Columns = require('./Columns');
var Sidebar = require('./Sidebar');

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
    },

    columns: {
        flex: 1,
        display: 'flex',
    }
};

module.exports = App;
