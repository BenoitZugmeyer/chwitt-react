'use strict';
var Timeline = require('./Timeline');
//var TweetList = require('chwitt-react/components/TweetList');
var actions = require('chwitt-react/actions');
var usersStore = require('chwitt-react/stores/users');

class User extends Timeline {

    getStateFromStores() {
        var userId = this.props.column.userId;
        return Object.assign(super.getStateFromStores(), {
            userLoaded: usersStore.isLoaded(userId),
            user: usersStore.get(userId),
        });
    }

    componentWillMount() {
        super.componentWillMount();
        if (!this.state.userLoaded) {
            actions.loadUser(this.props.column.userId);
        }
    }

    renderHeader() {
        var user = this.state.user;
        if (!user) return;
        return <div>
            {user.screen_name}
        </div>;
    }

}

User.listenTo(usersStore);

module.exports = User;
