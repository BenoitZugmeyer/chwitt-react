'use strict';
var Component = require('chwitt-react/Component');
var entities = require('./entities');
var actions = require('chwitt-react/actions');
var asserts = require('chwitt-react/asserts');


class Tweet extends Component {

    getOriginalTweet() {
        return this.props.tweet.retweeted_status || this.props.tweet;
    }

    render() {
        var tweet = this.props.tweet;
        var originalTweet = tweet.retweeted_status || tweet;

        return <div styles="main" onClick={() => console.log(tweet)}>
            <div styles="avatar">
                <img src={originalTweet.user.profile_image_url} />
            </div>
            <div styles="content">
                {this.renderUserName(originalTweet.user)}
                {tweet.retweeted_status ?
                    <span> via {this.renderUserName(tweet.user)}</span> :
                    ''}
                {this.renderTweetContent()}
            </div>
        </div>;
    }

    renderUserName(user) {
        return <span styles="userName" onClick={this.onClickUser.bind(this, user)}>{user.name}</span>;
    }

    renderTweetContent() {
        var tweet = this.getOriginalTweet();

        return <div>
            {entities.renderTextWithEntities(tweet.text, [tweet.extended_entities, tweet.entities], {
                column: this.props.column
            })}
        </div>;
    }

    onClickUser(user) {
        actions.openUserTimeline({
            id: user.id_str,
            after: this.props.column.name,
        });
    }

}

Tweet.propTypes = {
    tweet: asserts.isTweet.prop,
    column: asserts.isObject.prop,
};

Tweet.styles = {
    main: {
        display: 'flex',
        alignItems: 'flex-start',
        margin: '10px 0',
        wordWrap: 'break-word',
    },
    content: {
        flex: 1,
        whiteSpace: 'pre-wrap',
    },
    userName: {
        inherit: 'link',
        fontWeight: 'bold',
    },
    avatar: {
        inherit: 'avatar',
        marginRight: 10,
    },
};


module.exports = Tweet;
