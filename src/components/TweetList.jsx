'use strict';
let React = require('react');
let Tweet = require('./Tweet');
let Component = require('chwitt-react/Component');
let Scroller = require('chwitt-react/components/Scroller');
let asserts = require('chwitt-react/asserts');
let ss = require('chwitt-react/ss');

class TweetList extends Component {

    render() {
        return (
            <div styles="main">
                <Scroller
                    ref="scroller"
                    shadows
                    fixed
                    internalStyle={this.getStyle('scroller')}>
                    {this.props.tweets.map(
                        tweet => <Tweet key={tweet.id_str} tweetId={tweet.id_str} column={this.props.column} />
                    )}
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
        flexDirection: 'column',
        minWidth: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        display: 'flex',
    },

    scroller: {
        padding: [0, ss.vars.gap],
    },

};

module.exports = TweetList;
