var urlModule = require('url');
var request = require('./request');
var scrap = require('./scrap');
var querystring = require('querystring');

var twitterURLs = {
    requestToken: 'https://api.twitter.com/oauth/request_token',
    accessToken: 'https://api.twitter.com/oauth/access_token',
    authorize: 'https://api.twitter.com/oauth/authorize',
    apiBase: 'https://api.twitter.com/1.1/',
};

var oauthConf = {
    consumerKey: '9hGVCwklGAEI6a4Q6E1c3g',
    consumerSecret: 'xehhaaXR8tJTG8oNDdNm2xBjdJXk8glrDIrRwegkI',
};

function fakeLogin(authorizeURL, username, password) {
    var headers = { 'Accept-Language': 'en-US,en;q=0.5' };
    return request(authorizeURL, { headers })
    .then(res => res.body())
    .then(body => {
        body = scrap.parse(body);
        var authenticityToken = scrap.query(body, 'input[name=authenticity_token]');
        var oauthToken = scrap.query(body, 'input[name=oauth_token]');
        if (!authenticityToken || !oauthToken) {
            throw new Error(`Can't parse authorize page`);
        }

        var data = {
            authenticity_token: authenticityToken.attribs.value,
            oauth_token: oauthToken.attribs.value,
            'session[username_or_email]': username,
            'session[password]': password,
            remember_me: '0'
        };

        return request(twitterURLs.authorize, { method: 'post', data, headers });
    })
    .then(res => res.body())
    .then(body => {
        body = scrap.parse(body);
        var code = scrap.query(body, 'code');
        if (!code) {
            var error = scrap.query(body, '.error p');
            if (error && scrap.text(error).startsWith('Invalid user name or password')) {
                throw new Error('Invalid user name or password');
            }
            throw new Error(`Can't find PIN code`);
        }
        return scrap.text(code);
    });
}

function getOAuthToken(oauthConf, type, extra) {
    return request(twitterURLs[type + 'Token'], {
        oauth: Object.assign({}, oauthConf, extra),
        method: 'post',
    })
    .then(res => {
        if (res.statusCode !== 200) {
            throw new Error(`Error while getting the oauth ${type} token (HTTP ${res.statusCode})`);
        }
        return res.body();
    })
    .then(body => {
        var result = querystring.parse(body);
        return { token: result.oauth_token, tokenSecret: result.oauth_token_secret };
    });
}

function getOAuthAccessTokenFromCredentials(oauthConf, username, password) {
    return getOAuthToken(oauthConf, 'request', { callback: 'oob' })
    .then(tokens =>
        fakeLogin(`${twitterURLs.authorize}?oauth_token=${tokens.token}`, username, password)
        .then(verifier => getOAuthToken(oauthConf, 'access', Object.assign({ verifier }, tokens))));
}

module.exports = {
    getOAuthAccessTokenFromCredentials: getOAuthAccessTokenFromCredentials.bind(null, oauthConf),
    request(url, tokens, options) {
        return request(
            urlModule.resolve(twitterURLs.apiBase, url) + '.json',
            Object.assign({ oauth: Object.assign({}, oauthConf, tokens) }, options)
        )
        .then(res => res.body().then(body => Object.assign({}, res, {body: JSON.parse(body)})))
        .then(res => {
            if (res.body.errors) throw Object.assign(new Error('Twitter errors'),
                                                     { errors: res.body.errors });
            return res.body;
        });
    }
};
