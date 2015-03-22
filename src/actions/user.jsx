'use strict';
let { makeDispatch, makeErrors, twitterQuery } = require('./base');

exports.loadUser = function (id) {
    let dispatch = makeDispatch('loadUser', { id });
    dispatch('pending');

    twitterQuery('users/show', { user_id: id })
    .then(user => dispatch('success', { user }))
    .catch(error => dispatch('error', makeErrors(error)));
};

