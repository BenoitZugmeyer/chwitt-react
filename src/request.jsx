'use strict';
let urlModule = require('url');
let http = require('http');
let https = require('https');
let querystring = require('querystring');
let oauthModule = require('./oauth');
let asserts = require('./asserts');
let Timer = require('./Timer');

let defaultUserAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36';

function buildQuery(data) {
    return querystring.stringify(data)
        .replace(/\!/g, '%21')
        .replace(/\'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A');
}

function setDefaultHeader(headers, name, value) {
    if (!headers[name]) {
        headers[name] = value;
    }
}

let id = 0;
function requestLogger(url, options) {
    let myId = id;
    id++;
    if (typeof url === 'object') url = urlModule.format(url);
    console.log(`Request ${myId} ${url}`, options);
    let timer = new Timer();
    timer.launch(() =>console.warn(`Request ${myId} takes quite a long time...`), 10000);
    return timer;
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

    let result = new Promise((resolve, reject) => {
        let request = module.request(Object.assign(url, { method, headers }), resolve);

        request.on('error', reject);

        if (data) {
            request.write(typeof data === 'object' ? buildQuery(data) : data);
        }

        request.end();
    });

    if (process.env.NODE_ENV !== 'production') {
        let logTimer = requestLogger(url, { data, method, headers, oauth });
        result.then(() => logTimer.clear(), () => logTimer.clear());
    }

    return result;
}

function read(response) {
    return new Promise((resolve, reject) => {
        let body = [];
        response.on('error', reject);
        response.on('data', data => body.push(data));
        response.on('end', () => resolve(Buffer.concat(body)));
    });
}


module.exports = Object.assign(request, { read });
