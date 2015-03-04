var urlModule = require('url');
var conf = require('./conf');
var request = require('chwitt-react/request');

function findCandidate(id, params) {
    var candidates = conf.routes.get(id);
    if (!candidates) throw new Error(`Route ${id} not found`);
    var missingParameters;
    for (var candidate of candidates) {
        missingParameters = candidate.params.filter(param => !params[param]);
        if (missingParameters.length === 0) break;
    }
    if (missingParameters.length) throw new Error(`Missing parameters for ${id}: ${missingParameters.join(', ')}`);
    return candidate;
}

module.exports = function query(oauthConf, id, params) {
    if (!params) params = {};

    var candidate = findCandidate(id, params);

    params = Object.assign(params);

    var path = candidate.path.replace(/:(\w+)/g, (whole, param) => {
        var value = params[param];
        delete params[param];
        return value;
    });

    var options = { oauth: oauthConf, method: candidate.method };
    if (candidate.method === 'POST') options.data = params;

    return request(urlModule.resolve(conf.urls.apiBase, path) + '.json', options)
    .then(res => res.body().then(body => JSON.parse(body)))
    .then(body => {
        if (body.errors) {
            throw Object.assign(
                new Error('Twitter error(s): ' + body.errors.map(e => e.message).join(', ')),
                { errors: body.errors }
            );
        }
        return body;
    });
};
