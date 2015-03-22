'use strict';
let { makeDispatch, makeErrors, twitterQuery } = require('./base');

exports.loadTimeline = function (query) {
    let dispatch = makeDispatch('loadTimeline', { query });
    dispatch('pending');

    twitterQuery(query.route, query.data)
    .then(timeline => dispatch('success', { timeline }))
    .catch(error => dispatch('error', makeErrors(error)));
};
