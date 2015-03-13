'use strict';
var urlModule = require('url');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var oauth = require('./oauth');

function createResponse(options, res) {
    return {
        url: urlModule.format(options),
        statusCode: res.statusCode,
        headers: res.headers,
        body: () => new Promise((resolve, reject) => {
            var body = [];
            res.on('error', reject);
            res.on('data', data => body.push(data));
            res.on('end', () => resolve(Buffer.concat(body)));
        }),
    };
}

module.exports = function request(url, options) {
    options = Object.assign({}, typeof url === 'object' ? url : urlModule.parse(url), options);
    if (options.oauth) {
        if (!options.headers) options.headers = {};
        if (options.data && typeof options.data !== 'object') throw new Error('"data" option should be an object for oauth requests');
        options.headers.Authorization = oauth.getAuthorizationHeader(
            Object.assign({}, options.oauth, { url: options, method: options.method || 'GET', bodyParameters: options.data })
        );
        delete options.oauth;
    }
    // TODO set default user agent
    var module = options.protocol === 'https:' ? https : http;
    return new Promise((resolve, reject) => {
        setTimeout(function () { // This is an ugly fix but launching a request inside promise sometimes won't work on atom-shell 0.21.2
            var req = module.request(options, res => resolve(createResponse(options, res)));
            req.on('error', reject);
            if (options.data) {
                req.write(typeof options.data === 'object' ? querystring.stringify(options.data) : options.data);
            }
            req.end();
        }, 10);
    });
};
