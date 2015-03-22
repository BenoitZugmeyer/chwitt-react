'use strict';
let twitter = require('../twitter');
let dispatcher = require('../dispatcher');

let oauthConf;

function twitterQuery(path, params) {
    return twitter.query(oauthConf, path, params);
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
    if (error.errors) console.error(error.errors);
    return { errors: error.errors || [error] };
}

function setOauthConf(oauth) {
    oauthConf = oauth;
}

module.exports = { makeErrors, makeDispatch, twitterQuery, setOauthConf };
