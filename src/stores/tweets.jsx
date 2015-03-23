'use strict';
let Store = require('chwitt-react/Store');

class TweetsStore extends Store {

    constructor() {
        super();
        this.tweets = new Map();

        this.match(
            'loadTimeline success',
            ({ timeline }) => {
                this._addTweets(timeline);
                this.trigger();
            }
        );

        this.match(
            'loadTweet success',
            ({ tweet }) => {
                this._addTweet(tweet);
                this.trigger();
            }
        );
    }

    isLoaded(id) {
        return this.tweets.has(id);
    }

    get(id) {
        return this.tweets.get(id);
    }

    _addTweet(tweet) {
        this.tweets.set(tweet.id_str, tweet);
        if (tweet.retweeted_status) {
            this._addTweet(tweet.retweeted_status);
        }
    }

    _addTweets(tweets) {
        tweets.forEach(this._addTweet, this);
    }

}

module.exports = new TweetsStore();
