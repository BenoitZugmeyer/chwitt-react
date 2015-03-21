'use strict';
let React = require('react');
let Component = require('chwitt-react/Component');
let Avatar = require('chwitt-react/components/Avatar');
let entities = require('./entities');
let actions = require('chwitt-react/actions');
let asserts = require('chwitt-react/asserts');
let ss = require('chwitt-react/ss');

class Tweet extends Component {

    getOriginalTweet() {
        return this.props.tweet.retweeted_status || this.props.tweet;
    }

    render() {
        let tweet = this.props.tweet;
        let originalTweet = tweet.retweeted_status || tweet;

        return <div styles="main" onClick={() => console.log(tweet)}>
            <Avatar user={originalTweet.user} mainStyle={this.getStyle('avatar')} />
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
        let tweet = this.getOriginalTweet();

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
        padding: [ss.vars.gap, 0],
        wordWrap: 'break-word',
        borderBottom: ss.vars.border,
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
        marginRight: ss.vars.gap,
    },
};


module.exports = Tweet;
