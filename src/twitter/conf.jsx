'use strict';

var urls = {
    requestToken: 'https://api.twitter.com/oauth/request_token',
    accessToken: 'https://api.twitter.com/oauth/access_token',
    authorize: 'https://api.twitter.com/oauth/authorize',
    apiBase: 'https://api.twitter.com/1.1/',
};

var rawRoutes = `
GET statuses/mentions_timeline
GET statuses/user_timeline
GET statuses/home_timeline
GET statuses/retweets_of_me
GET statuses/retweets/:id
GET statuses/show/:id
POST statuses/destroy/:id
POST statuses/update
POST statuses/retweet/:id
POST statuses/update_with_media
GET statuses/oembed
GET statuses/retweeters/ids
GET statuses/lookup
POST media/upload
GET direct_messages/sent
GET direct_messages/show
GET search/tweets
GET direct_messages
POST direct_messages/destroy
POST direct_messages/new
GET friendships/no_retweets/ids
GET friends/ids
GET followers/ids
GET friendships/incoming
GET friendships/outgoing
POST friendships/create
POST friendships/destroy
POST friendships/update
GET friendships/show
GET friends/list
GET followers/list
GET friendships/lookup
GET account/settings
GET account/verify_credentials
POST account/settings
POST account/update_delivery_device
POST account/update_profile
POST account/update_profile_background_image
POST account/update_profile_image
GET blocks/list
GET blocks/ids
POST blocks/create
POST blocks/destroy
GET users/lookup
GET users/show
GET users/search
POST account/remove_profile_banner
POST account/update_profile_banner
GET users/profile_banner
POST mutes/users/create
POST mutes/users/destroy
GET mutes/users/ids
GET mutes/users/list
GET users/suggestions/:slug
GET users/suggestions
GET users/suggestions/:slug/members
GET favorites/list
POST favorites/destroy
POST favorites/create
GET lists/list
GET lists/statuses
POST lists/members/destroy
GET lists/memberships
GET lists/subscribers
POST lists/subscribers/create
GET lists/subscribers/show
POST lists/subscribers/destroy
POST lists/members/create_all
GET lists/members/show
GET lists/members
POST lists/members/create
POST lists/destroy
POST lists/update
POST lists/create
GET lists/show
GET lists/subscriptions
POST lists/members/destroy_all
GET lists/ownerships
GET saved_searches/list
GET saved_searches/show/:id
POST saved_searches/create
POST saved_searches/destroy/:id
GET geo/id/:place_id
GET geo/reverse_geocode
GET geo/search
POST geo/place
GET trends/place
GET trends/available
GET application/rate_limit_status
GET help/configuration
GET help/languages
GET help/privacy
GET help/tos
GET trends/closest
POST users/report_spam
`;

var routes = new Map();

for (let route of rawRoutes.split('\n')) {
    if (!route) continue;
    let [method, path] = /(\w+) (.*)/.exec(route).slice(1);
    let params = [];
    let id = path.replace(/\/?:(\w+)/g, (whole, name) => {
        params.push(name);
        return '';
    });
    let candidate = { path, method, params };
    let candidates = routes.get(id);
    if (candidates) {
        candidates.push(candidate);
        candidates.sort((a, b) => a.length - b.length);
    }
    else {
        routes.set(id, [candidate]);
    }
}

module.exports = { urls, routes };
