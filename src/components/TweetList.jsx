'use strict';
var Tweet = require('./Tweet');
var Component = require('chwitt-react/Component');
var asserts = require('chwitt-react/asserts');
var ss = require('chwitt-react/ss');

class TweetList extends Component {

    render() {
        return (
            <div className={this.style('main')}>
                {this.props.tweets.map(tweet => <Tweet key={tweet.id_str} tweet={tweet} column={this.props.column} />, this)}
            </div>
        );
    }
}

TweetList.propTypes = {
    tweets: asserts.arrayOf(asserts.isTweet).prop,
    column: asserts.isColumn.prop,
};

TweetList.styles = {
    main: {
        margin: '0 auto',
        overflow: 'auto',
        flex: 1,
        padding: [0, ss.vars.gap],
        boxSizing: 'border-box',
    }
};

module.exports = TweetList;
