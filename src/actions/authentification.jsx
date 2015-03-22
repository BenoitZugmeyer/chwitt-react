'use strict';
let { makeDispatch, makeErrors, setOauthConf, twitterQuery } = require('./base');
let Storage = require('../Storage');
let twitter = require('../twitter');

let oauthConf = {
    consumerKey: '9hGVCwklGAEI6a4Q6E1c3g',
    consumerSecret: 'xehhaaXR8tJTG8oNDdNm2xBjdJXk8glrDIrRwegkI',
};

let oauthTokenStorage = new Storage('oauthTokens');
let oauthTokens = {
    token: oauthTokenStorage.get('token'),
    tokenSecret: oauthTokenStorage.get('tokenSecret'),
};

exports.loginWithCredentials = function (username, password) {
    let args = { username, password };
    let dispatch = makeDispatch('loginWithCredentials', args);
    dispatch('pending');

    let promise = twitter.login.getOAuthAccessTokenFromCredentials(oauthConf, username, password)
    .then(tokens => {
        setOauthConf(Object.assign({}, oauthConf, tokens));
        oauthTokenStorage.set('token', tokens.token);
        oauthTokenStorage.set('tokenSecret', tokens.tokenSecret);
        dispatch('success');
    });
    promise.catch(error => dispatch('error', makeErrors(error)));
    promise.then(exports.verifyTokens);
};

exports.verifyTokens = function () {
    if (oauthTokens.token && oauthTokens.tokenSecret) {
        let dispatch = makeDispatch('verifyTokens', {});
        dispatch('pending');

        setOauthConf(Object.assign({}, oauthConf, oauthTokens));
        twitterQuery('account/verify_credentials')
        .then(user => {
            dispatch('success', { user });
        })
        .catch(error => dispatch('error', makeErrors(error)));
    }
};

exports.logout = function () {
    setOauthConf({});
    oauthTokenStorage.delete('token');
    oauthTokenStorage.delete('tokenSecret');
    makeDispatch('logout')('success');
};
