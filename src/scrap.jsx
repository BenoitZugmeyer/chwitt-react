'use strict';
var hp = require('htmlparser2');
var cssSelect = require('css-select');
var { decodeHTML } = require('entities');
var iconv = require('iconv-lite');


function extractHeadersFromHTML(body) {
    var re = /<meta\s+http-equiv=["'](\S+)["']\s+content=["'](.+?)["']/ig;

    var headers = new Map();
    while (true) {
        var matches = re.exec(body);
        if (!matches) break;
        headers.set(matches[1].toLowerCase(), matches[2]);
    }

    return headers;
}

function normalizeEncoding(encoding) {
    return encoding.replace(/-/g, '').trim().toLowerCase();
}

function extractEncodingFromHTML(body) {
    var headers = extractHeadersFromHTML(body);
    if (headers.has('content-type')) {
        var match = /charset=(.*)/i.exec(headers.get('content-type'));
        if (match) return normalizeEncoding(match[1]);
    }
}

function parse(page) {
    var decoded;
    if (Buffer.isBuffer(page)) {
        decoded = page.toString('utf8');
        var htmlEncoding = extractEncodingFromHTML(decoded);
        if (htmlEncoding && htmlEncoding !== 'utf8' && iconv.encodingExists(htmlEncoding)) {
            decoded = iconv.decode(page, htmlEncoding);
        }
    }
    else {
        decoded = page;
    }
    return hp.parseDOM(decoded);
}

function query(element, q) {
    return cssSelect.selectOne(q, element);
}

function queryAll(element, q) {
    return cssSelect(q, element);
}

function text(element) {
    return decodeHTML(hp.DomUtils.getText(element));
}

function normalizeWhiteSpaces(s) {
    return s.trim().replace(/\s+/g, ' ');
}

module.exports = {
    parse,
    query,
    queryAll,
    decode: decodeHTML,
    text,
    normalizeWhiteSpaces,
};
