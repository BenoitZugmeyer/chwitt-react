'use strict';
let Store = require('chwitt-react/Store');

class UsersStore extends Store {

    constructor() {
        super();
        this.users = new Map();

        this.match([
            'verifyTokens success',
            'loadUser success', ],
            ({ user }) => {
                this._add(user);
                this.trigger();
            }
        );
        this.match(
            'loadTimeline success',
            ({ timeline }) => {
                this._addFromTweets(timeline);
                this.trigger();
            }
        );

        this.match(
            'loadTweet success',
            ({ tweet }) => {
                this._addFromTweet(tweet);
                this.trigger();
            }
        );
    }

    isLoaded(query) {
        return this.users.has(query);
    }

    get(query) {
        return this.users.get(query);
    }

    _add(user) {
        if (!this.users.has(user.id_str)) {
            this.users.set(user.id_str, user);
        }
    }

    _addFromTweet(tweet) {
        this._add(tweet.user);
        if (tweet.retweeted_status) {
            this._add(tweet.retweeted_status.user);
        }
    }

    _addFromTweets(tweets) {
        tweets.forEach(this._addFromTweet, this);
    }

}

module.exports = new UsersStore();
