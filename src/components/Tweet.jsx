var React = require('react');
var Component = require('chwitt-react/Component');
var entities = require('./entities');
var { decodeHTML } = require('entities');
var punycode = require('punycode');


class Tweet extends Component {

    getOriginalTweet() {
        return this.props.tweet.retweeted_status || this.props.tweet;
    }

    render() {
        var tweet = this.props.tweet;
        var originalTweet = tweet.retweeted_status || tweet;

        return <div className={this.style('main')} onClick={() => console.log(tweet)}>
            <div className={this.style('avatar')}>
                <img src={originalTweet.user.profile_image_url} />
            </div>
            <div className={this.style('content')}>
                <span className={this.style('userName')}>
                    {originalTweet.user.name}
                </span>
                {tweet.retweeted_status ?
                    <span> via <span className={this.style('userName')}>
                        {tweet.user.name}
                    </span></span> :
                    ''}
                {this.renderTweetContent()}
            </div>
        </div>;
    }

    renderTweetContent() {
        var tweet = this.getOriginalTweet();
        var content = [];
        var index = 0;
        var text = punycode.ucs2.decode(tweet.text);
        var medias = [];

        function getTextSlice(from, to) {
            return decodeHTML(punycode.ucs2.encode(text.slice(from, to)));
        }

        for (var {entity, Type} of getEntities(tweet)) {
            content.push(getTextSlice(index, entity.indices[0]));
            if (Type) {
                content.push(<Type key={`${tweet.id_str}-${entity.indices[0]}`} entity={entity} />);
            }
            else {
                medias.push(entity);
            }
            index = entity.indices[1];
        }

        content.push(getTextSlice(index));

        if (medias.length) {
            content.push(<entities.Media key={`${tweet.id_str}-media`} entities={medias} />);
        }

        return <div>
            {content}
        </div>;
    }

}

Tweet.propTypes = {
    tweet: React.PropTypes.object.isRequired,
};

Tweet.styles = {
    main: {
        display: 'flex',
        alignItems: 'flex-start',
        margin: '10px 0',
    },
    content: {
        flex: 1,
        letterSpacing: '0.2px',
    },
    userName: {
        fontWeight: 'bold',
    },
    avatar: {
        marginRight: 10,
        borderRadius: 4,
        overflow: 'hidden',
    },
};

function getEntities(tweet) {
    var result = [];
    var ids = new Set();

    function addEntities(list, Type) {
        if (!list) return;
        for (let entity of list) {
            if (entity.id_str) {
                if (ids.has(entity.id_str)) continue;
                ids.add(entity.id_str);
            }
            result.push({ Type, entity });
        }
    }

    addEntities(tweet.entities.urls, entities.URL);
    addEntities(tweet.entities.user_mentions, entities.UserMention);
    addEntities(tweet.entities.hashtags, entities.Hashtag);
    // addEntities(tweet.entities.symbols, entities.Symbol);
    if (tweet.extended_entities) {
        addEntities(tweet.extended_entities.media);
    }
    addEntities(tweet.entities.media);

    result.sort((a, b) => a.entity.indices[0] - b.entity.indices[0]);

    return result;
}

module.exports = Tweet;
