'use strict';
let { makeDispatch, makeErrors, twitterQuery } = require('./base');

exports.loadTweet = function (id) {
    let dispatch = makeDispatch('loadTweet', { id });
    dispatch('pending');

    twitterQuery('statuses/show', { id })
    .then(tweet => dispatch('success', { tweet }))
    .catch(error => dispatch('error', makeErrors(error)));
};
