'use strict';
var querystring = require('querystring');
var urls = require('./conf').urls;
var scrap = require('chwitt-react/scrap');
var request = require('chwitt-react/request');

function fakeLogin(authorizeURL, username, password) {
    var headers = { 'Accept-Language': 'en-US,en;q=0.5' };
    return request(authorizeURL, { headers })
    .then(request.read)
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

        return request(urls.authorize, { method: 'post', data, headers });
    })
    .then(request.read)
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
    return request(urls[type + 'Token'], {
        oauth: Object.assign({}, oauthConf, extra),
        method: 'post',
    })
    .then(res => {
        if (res.statusCode !== 200) {
            throw new Error(`Error while getting the oauth ${type} token (HTTP ${res.statusCode})`);
        }
        return request.read(res);
    })
    .then(body => {
        var result = querystring.parse(body.toString());
        return { token: result.oauth_token, tokenSecret: result.oauth_token_secret };
    });
}

function getOAuthAccessTokenFromCredentials(oauthConf, username, password) {
    return getOAuthToken(oauthConf, 'request', { callback: 'oob' })
    .then(tokens =>
        fakeLogin(`${urls.authorize}?oauth_token=${tokens.token}`, username, password)
        .then(verifier => getOAuthToken(oauthConf, 'access', Object.assign({ verifier }, tokens))));
}

module.exports = {
    getOAuthAccessTokenFromCredentials,
};
