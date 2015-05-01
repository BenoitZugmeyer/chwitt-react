'use strict';
let querystring = require('querystring');
let urls = require('./conf').urls;
let scrap = require('chwitt-react/scrap');
let request = require('chwitt-react/request');

function setCookies(response) {
    return response.headers['set-cookie'] || [].map(cookie => cookie.split(';')[0]).join('; ');
}

function fakeLogin(authorizeURL, username, password) {
    let headers = { 'Accept-Language': 'en-US,en;q=0.5' };
    return request({ url: authorizeURL, headers })
    .then(response => {
        headers.Cookie = setCookies(response);
        return request.read(response);
    })
    .then(body => {
        body = scrap.parse(body);
        let authenticityToken = scrap.query(body, 'input[name=authenticity_token]');
        let oauthToken = scrap.query(body, 'input[name=oauth_token]');
        if (!authenticityToken || !oauthToken) {
            throw new Error(`Can't parse authorize page`);
        }

        let data = {
            authenticity_token: authenticityToken.attribs.value,
            oauth_token: oauthToken.attribs.value,
            'session[username_or_email]': username,
            'session[password]': password,
            remember_me: '0'
        };

        return request({ url: urls.authorize, method: 'post', data, headers });
    })
    .then(response => {
        let location = response.headers.location;
        if (location && location.includes('/login/error?')) {
            throw new Error('Invalid user name or password');
        }
        return request.read(response);
    })
    .then(body => {
        body = scrap.parse(body);
        let code = scrap.query(body, 'code');
        if (!code) {
            let error = scrap.query(body, '.error p');
            if (error && scrap.text(error).startsWith('Invalid user name or password')) {
                throw new Error('Invalid user name or password');
            }
            throw new Error(`Can't find PIN code`);
        }
        return scrap.text(code);
    });
}

function getOAuthToken(oauthConf, type, extra) {
    return request({
        url: urls[type + 'Token'],
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
        let result = querystring.parse(body.toString());
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
