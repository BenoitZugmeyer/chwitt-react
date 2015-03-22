'use strict';
let asserts = require('./asserts');

exports.getTimelineId = function getTimelineId(query) {
    asserts.isString(query.route);

    let id = query.route;
    for (let key of Object.keys(query).sort()) {
        if (key !== 'route') id += `:${JSON.stringify(query[key])}`;
    }

    return id;
};
