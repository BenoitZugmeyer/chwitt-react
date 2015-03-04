'use strict';
var dispatcher = require('./dispatcher');
var twitterLogin = require('./twitterLogin');
var { localStorage } = require('./window');

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

var tokens = {
    token: localStorage.getItem('token'),
    tokenSecret: localStorage.getItem('tokenSecret'),
};

function makeErrors(error) {
    console.error(error.stack || error);
    if (error.errors) { console.error(error.errors); }
    return { errors: error.errors || [error] };
}

exports.loginWithCredentials = function (username, password) {
    var args = { username, password };
    var dispatch = makeDispatch('loginWithCredentials', args);
    dispatch('pending');

    var promise = twitterLogin.getOAuthAccessTokenFromCredentials(username, password)
    .then(tokens_ => {
        tokens = tokens_;
        localStorage.setItem('token', tokens.token);
        localStorage.setItem('tokenSecret', tokens.tokenSecret);
        dispatch('success');
    });
    promise.catch(error => dispatch('error', makeErrors(error)));
    promise.then(exports.verifyTokens);
};

exports.verifyTokens = function () {
    if (tokens.token && tokens.tokenSecret) {
        var dispatch = makeDispatch('verifyTokens', {});
        dispatch('pending');

        twitterLogin.request('account/verify_credentials', tokens)
        .then(user => dispatch('success', { user }))
        .catch(error => dispatch('error', makeErrors(error)));
    }
};

exports.logout = function () {
    tokens = {};
    localStorage.removeItem('token');
    localStorage.removeItem('tokenSecret');
    makeDispatch('logout')('success');
};

exports.loadTimeline = function (query) {
    var dispatch = makeDispatch('loadTimeline', { query });
    dispatch('pending');

    twitterLogin.request(query, tokens)
    .then(timeline => dispatch('success', { timeline }))
    .catch(error => dispatch('error', makeErrors(error)));
};
