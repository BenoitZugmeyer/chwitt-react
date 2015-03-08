'use strict';
var Tweet = require('./Tweet');
var Component = require('chwitt-react/Component');

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
    tweets: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    column: React.PropTypes.object.isRequired,
};

TweetList.styles = {
    main: {
        margin: '0 auto',
        overflow: 'auto',
        flex: 1,
        padding: 10,
        boxSizing: 'border-box',
    }
};

module.exports = TweetList;
