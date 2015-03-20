'use strict';
let querystring = require('querystring');
let urlModule = require('url');
let conf = require('./conf');
let request = require('chwitt-react/request');

function findCandidate(id, params) {
    let candidates = conf.routes.get(id);
    if (!candidates) throw new Error(`Route ${id} not found`);
    let missingParameters;
    let candidate;
    for (candidate of candidates) {
        missingParameters = candidate.params.filter(param => !params[param]);
        if (missingParameters.length === 0) break;
    }
    if (missingParameters.length) throw new Error(`Missing parameters for ${id}: ${missingParameters.join(', ')}`);
    return candidate;
}

module.exports = function query(oauthConf, id, params) {
    if (!params) params = {};

    let candidate = findCandidate(id, params);

    params = Object.assign(params);

    let path = candidate.path.replace(/:(\w+)/g, (whole, param) => {
        let value = params[param];
        delete params[param];
        return value;
    });

    let options = {
        oauth: oauthConf,
        method: candidate.method,
        url: urlModule.resolve(conf.urls.apiBase, path) + '.json',
    };
    if (candidate.method === 'POST') options.data = params;
    else options.url += `?${querystring.stringify(params)}`;

    return request(options)
    .then(res => {
        return request.read(res).then(body => {
            body = JSON.parse(body);
            if (body.errors) {
                throw Object.assign(
                    new Error('Twitter error(s): ' + body.errors.map(e => e.message).join(', ')),
                    { errors: body.errors }
                );
            }
            return body;
        });
    });
};
