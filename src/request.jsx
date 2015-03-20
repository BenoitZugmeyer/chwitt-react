'use strict';
let urlModule = require('url');
let http = require('http');
let https = require('https');
let querystring = require('querystring');
let oauthModule = require('./oauth');
let asserts = require('./asserts');

let defaultUserAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36';

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

let id = 0;
function requestLogger(url, options) {
    let timeout;
    let myId = id;
    id++;
    if (typeof url === 'object') url = urlModule.format(url);
    console.log(`Request ${myId} ${url}`, options);
    timeout = setTimeout(() => console.warn(`Request ${myId} takes quite a long time...`), 10000);
    return () => clearTimeout(timeout);
}

function request({ url, data={}, method='GET', headers={}, oauth }) {

    asserts.isString(method);
    asserts.isObject(headers);

    url = typeof url === 'string' ? urlModule.parse(url) : Object.assign({}, url);

    if (oauth) {
        asserts.isObject(data);

        let oauthOptions = Object.assign({
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

    let module = url.protocol === 'https:' ? https : http;

    let defer = Promise.defer();

    let request = module.request(Object.assign(url, { method, headers }), defer.resolve);

    if (process.env.NODE_ENV !== 'production') {
        let doneLog = requestLogger(url, { data, method, headers, oauth });
        defer.promise.then(doneLog, doneLog);
    }

    request.on('error', defer.reject);

    if (data) {
        request.write(typeof data === 'object' ? buildQuery(data) : data);
    }

    request.end();

    return defer.promise;
}

function read(response) {
    let defer = Promise.defer();
    let body = [];
    response.on('error', defer.reject);
    response.on('data', data => body.push(data));
    response.on('end', () => defer.resolve(Buffer.concat(body)));
    return defer.promise;
}


module.exports = Object.assign(request, { read });
