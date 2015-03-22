'use strict';

let { makeDispatch, makeErrors, twitterQuery } = require('./base');

exports.saveTweetDraft = function (args) {
    makeDispatch('saveTweetDraft', args)('success');
};

exports.sendTweet = function (args) {
    let dispatch = makeDispatch('sendTweet', args);
    dispatch('pending');

    twitterQuery('statuses/update', args)
    .then(() => dispatch('success'))
    .catch(error => dispatch('error', makeErrors(error)));
};
