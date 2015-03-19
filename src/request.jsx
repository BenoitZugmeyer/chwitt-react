'use strict';
var urlModule = require('url');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var oauthModule = require('./oauth');
var asserts = require('./asserts');

var defaultUserAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36';

function buildQuery(data) {
    return querystring.stringify(data)
        .replace(/\!/g, "%21")
        .replace(/\'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/\*/g, "%2A");
}

function setDefaultHeader(headers, name, value) {
    if (!headers[name]) {
        headers[name] = value;
    }
}

function request(url, { data={}, method='GET', headers={}, oauth }) {

    asserts.isString(method);
    asserts.isObject(headers);

    if (typeof url === 'string') {
        url = urlModule.parse(url);
    }

    if (oauth) {
        asserts.isObject(data);

        var oauthOptions = Object.assign({
            url,
            method,
            bodyParameters: data
        }, oauth);

        setDefaultHeader(headers, 'Authorization', oauthModule.getAuthorizationHeader(oauthOptions));
    }

    setDefaultHeader(headers, 'User-Agent', defaultUserAgent);

    if (method.toUpperCase() === 'POST') {
        setDefaultHeader(headers, 'Content-Type', 'application/x-www-form-urlencoded');
    }

    var module = url.protocol === 'https:' ? https : http;

    var defer = Promise.defer();

    var request = module.request(Object.assign(url, { method, headers }), defer.resolve);

    request.on('error', defer.reject);

    if (data) {
        request.write(typeof data === 'object' ? buildQuery(data) : data);
    }

    request.end();

    return defer.promise;
}

function read(response) {
    var defer = Promise.defer();
    var body = [];
    response.on('error', defer.reject);
    response.on('data', data => body.push(data));
    response.on('end', () => defer.resolve(Buffer.concat(body)));
    return defer.promise;
}


module.exports = Object.assign(request, { read });
