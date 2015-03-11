'use strict';
var request = require('./request');
var hp = require('htmlparser2');
var glob = require('./glob');
var scrap = require('./scrap');
var makeProtocol = require('./makeProtocol');
var { JSONStorage } = require('./Storage');

var cache = new JSONStorage('resolveURL');
var runningResolves = new Map();

// function extractOGInfos(page) {
//     var re = /^og:/i;
//     var metas = hp.DomUtils.findAll(
//         el =>
//             el.type === 'tag' &&
//             el.name === 'meta' &&
//             el.attribs.property && re.test(el.attribs.property) &&
//             el.attribs.content,
//         page
//     );
//     var result = {};
//     for (var meta of metas) {
//         result[meta.attribs.property.slice(3).toLowerCase()] = meta.attribs.content;
//     }
//     return result;
// }

function extractTitle(page) {
    var tag = hp.DomUtils.findOne(
        el =>
            el.type === 'tag' &&
            el.name === 'title' &&
            el.children.length &&
            el.children[0].type === 'text',
        page
    );

    return tag ? scrap.decode(tag.children[0].data) : '';
}

function runCustomExtractors(url, page) {
    var result = {};
    for (var re of extractors.keys()) {
        if (re.test(url)) {
            Object.assign(result, extractors.get(re)(page));
        }
    }
    return result;
}

var extractors = new Map();

extractors.set(glob('https://www.facebook.com/media/set/*'), page => {
    var thumbs = [];
    for (var hiddenElem of scrap.queryAll(page, '.hidden_elem')) {
        if (hiddenElem && hiddenElem.children.length && hiddenElem.children[0].type === 'comment') {
            var dom = hp.parseDOM(hiddenElem.children[0].data);
            thumbs.push.apply(thumbs, scrap.queryAll(dom, '[data-starred-src]'));
        }
    }

    return {
        images: thumbs.map(t => Object.assign({ src: scrap.decode(t.attribs['data-starred-src']) }))
    };
});

function extractInfos(res, body) {
    var page = hp.parseDOM(body);
    return Object.assign(
        {
            pageURL: res.url,
            pageTitle: extractTitle(page),
        },
        runCustomExtractors(res.url, page)
    );
}

function followRedirects(url, maxRedirect) {
    if (cache.has(url)) {
        return Promise.resolve(cache.get(url));
    }

    if (maxRedirect === 0) {
        return Promise.reject(new Error(`${url} does not redirect correctly`));
    }

    return request(url, { method: 'head' })
    .then(res => {
        if (res.headers.location) {
            return followRedirects(makeProtocol(res.headers.location, url),
                                   maxRedirect - 1);
        }
        return res;
    });
}

function isHTMLResponse(res) {
    return /^text\/html\b/.test(res.headers['content-type']);
}

function resolveURL(url) {
    if (typeof url !== 'string') {
        throw new Error('resolveURL argument should be a string');
    }

    if (cache.has(url)) {
        return Promise.resolve(cache.get(url));
    }

    url = makeProtocol(url);

    if (!runningResolves.has(url)) {
        var result = followRedirects(url, 10)
        .then(res => request(res.url))
        .then(res => {
            if (isHTMLResponse(res)) {
                return res.body().then(body => extractInfos(res, body));
            }
            else {
                var result = { pageURL: res.url };
                if (/^image\//.test(res.headers['content-type'])) {
                    result.image = res.url;
                }
                return result;
            }
        })
        .then(res => {
            cache.set(url, res);
            runningResolves.delete(url);
            return res;
        })
        .catch(e => { throw new Error(`Error while resolving ${url}: ${e}`); });

        runningResolves.set(url, result);
    }

    return runningResolves.get(url);
}

resolveURL.getFromCache = (url) => cache.get(makeProtocol(url));

module.exports = resolveURL;
