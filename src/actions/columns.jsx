'use strict';
let { makeDispatch } = require('./base');

exports.openColumn = function (args) {
    makeDispatch('openColumn', args)('success');
};

exports.setFirstVisibleColumn = function (name) {
    makeDispatch('setFirstVisibleColumn', { name })('success');
};

exports.removeColumn = function (name) {
    makeDispatch('removeColumn', { name })('success');
};
