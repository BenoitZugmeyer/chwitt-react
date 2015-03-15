'use strict';
var Tweet = require('./Tweet');
var Component = require('chwitt-react/Component');
var Scroller = require('chwitt-react/components/Scroller');
var asserts = require('chwitt-react/asserts');
var ss = require('chwitt-react/ss');

class TweetList extends Component {

    render() {
        return (
            <div styles="main">
                <Scroller shadows internalStyle={this.getStyle('scroller')}>
                    {this.props.tweets.map(tweet => <Tweet key={tweet.id_str} tweet={tweet} column={this.props.column} />, this)}
                </Scroller>
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
        flex: 1,
        maxWidth: '100%',
        boxSizing: 'border-box',
        display: 'flex',
    },

    scroller: {
        padding: [0, ss.vars.gap],
    },

};

module.exports = TweetList;
