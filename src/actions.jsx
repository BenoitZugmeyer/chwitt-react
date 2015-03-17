'use strict';
var dispatcher = require('./dispatcher');
var twitter = require('./twitter');
var Storage = require('./Storage');

var oauthConf = {
    consumerKey: '9hGVCwklGAEI6a4Q6E1c3g',
    consumerSecret: 'xehhaaXR8tJTG8oNDdNm2xBjdJXk8glrDIrRwegkI',
};

var oauthTokenStorage = new Storage('oauthTokens');
var oauthTokens = {
    token: oauthTokenStorage.get('token'),
    tokenSecret: oauthTokenStorage.get('tokenSecret'),
};

function twitterQuery(path, params) {
    return twitter.query(Object.assign({}, oauthConf, oauthTokens), path, params);
}

function makeDispatch(type, args) {
    return function dispatch(state, payload) {
        dispatcher.handleViewAction(Object.assign({
            type,
            state,
            get full() {
                return this.type + ' ' + this.state;
            },
            arguments: args || {},
        }, payload));
    };
}

function makeErrors(error) {
    console.error(error.stack || error);
    if (error.errors) { console.error(error.errors); }
    return { errors: error.errors || [error] };
}

exports.loginWithCredentials = function (username, password) {
    var args = { username, password };
    var dispatch = makeDispatch('loginWithCredentials', args);
    dispatch('pending');

    var promise = twitter.login.getOAuthAccessTokenFromCredentials(oauthConf, username, password)
    .then(tokens => {
        oauthTokens = tokens;
        oauthTokenStorage.set('token', tokens.token);
        oauthTokenStorage.set('tokenSecret', tokens.tokenSecret);
        dispatch('success');
    });
    promise.catch(error => dispatch('error', makeErrors(error)));
    promise.then(exports.verifyTokens);
};

exports.verifyTokens = function () {
    if (oauthTokens.token && oauthTokens.tokenSecret) {
        var dispatch = makeDispatch('verifyTokens', {});
        dispatch('pending');

        twitterQuery('account/verify_credentials')
        .then(user => dispatch('success', { user }))
        .catch(error => dispatch('error', makeErrors(error)));
    }
};

exports.logout = function () {
    oauthTokens = {};
    oauthTokenStorage.delete('token');
    oauthTokenStorage.delete('tokenSecret');
    makeDispatch('logout')('success');
};

exports.loadTimeline = function (query) {
    var dispatch = makeDispatch('loadTimeline', { query });
    dispatch('pending');

    twitterQuery(query.route, query.data)
    .then(timeline => dispatch('success', { timeline }))
    .catch(error => dispatch('error', makeErrors(error)));
};

exports.loadUser = function (id) {
    var dispatch = makeDispatch('loadUser', { id });
    dispatch('pending');

    twitterQuery('users/show', { user_id: id })
    .then(user => dispatch('success', { user }))
    .catch(error => dispatch('error', makeErrors(error)));
};

exports.openUserTimeline = function (args) {
    var dispatch = makeDispatch('openUserTimeline', args);
    dispatch('success');
};

exports.openNewColumn = function (args) {
    makeDispatch('openNewColumn', args)('success');
};

exports.setFirstVisibleColumn = function (name) {
    makeDispatch('setFirstVisibleColumn', { name })('success');
};


exports.saveTweetDraft = function (args) {
    makeDispatch('saveTweetDraft', args)('success');
};

exports.sendTweet = function (args) {
    var dispatch = makeDispatch('sendTweet', args);
    dispatch('pending');

    twitterQuery('statuses/update', args)
    .then(() => dispatch('success'))
    .catch(error => dispatch('error', makeErrors(error)));
};