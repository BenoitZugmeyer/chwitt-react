'use strict';
let hp = require('htmlparser2');
let cssSelect = require('css-select');
let { decodeHTML } = require('entities');
let iconv = require('iconv-lite');


function extractHeadersFromHTML(body) {
    let re = /<meta\s+http-equiv=["'](\S+)["']\s+content=["'](.+?)["']/ig;

    let headers = new Map();
    while (true) {
        let matches = re.exec(body);
        if (!matches) break;
        headers.set(matches[1].toLowerCase(), matches[2]);
    }

    return headers;
}

function normalizeEncoding(encoding) {
    return encoding.replace(/-/g, '').trim().toLowerCase();
}

function extractEncodingFromHTML(body) {
    let headers = extractHeadersFromHTML(body);
    if (headers.has('content-type')) {
        let match = /charset=(.*)/i.exec(headers.get('content-type'));
        if (match) return normalizeEncoding(match[1]);
    }
}

function parse(page) {
    let decoded;
    if (Buffer.isBuffer(page)) {
        decoded = page.toString('utf8');
        let htmlEncoding = extractEncodingFromHTML(decoded);
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
