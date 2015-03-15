'use strict';
var querystring = require('querystring');
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

    return tag ? scrap.normalizeWhiteSpaces(scrap.text(tag)) : '';
}

function runCustomExtractors(url, page) {
    var result = {};
    var promises = [];
    for (var re of extractors.keys()) {
        var match = re.exec(url);
        if (match) {
            var res = extractors.get(re)(page, match);
            if (res instanceof Promise) {
                promises.push(res.then(
                    infos => Object.assign(result, infos),
                    error => console.error(`Error while fetching infos for ${url}: ${error.stack}`)
                ));
            } else {
                Object.assign(result, res);
            }
        }
    }
    return Promise.all(promises).then(() => result);
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

function isSupportedVideoType(type) {
    return /^video\/(?:webm|mp4)/.test(type);
}

extractors.set(glob('http{s,}://www.youtube.com/watch\\?v={*}'), (page, params) => {
    return request('http://www.youtube.com/get_video_info?video_id=' + params[2])
    .then(res => res.body())
    .then(body => {
        body = querystring.parse(body.toString());
        if (body.url_encoded_fmt_stream_map) {
            var qualities = {};
            for (var qualityString of body.url_encoded_fmt_stream_map.split(',')) {
                var quality = querystring.parse(qualityString);
                if (quality.type && isSupportedVideoType(quality.type)) {
                    qualities[quality.quality] = quality.url;
                }
            }

            var result = {
                title: body.title,
                video: {
                    thumbnail: { src: body.iurlhq || body.iurl },
                    quality: qualities,
                }
            };
            return result;
        }
    });
});

extractors.set(glob('http://imgur.com/{a,gallery}/*'), page => {
    return {
        images: scrap.queryAll(page, 'meta[property="og:image"][content]')
            .map(image => { return { src: image.attribs.content.replace(/\?fb$/, '') }; })
    };
});

function extractInfos(res, body) {
    var page = scrap.parse(body);
    return runCustomExtractors(res.url, page)
    .then(custom => Object.assign({
        pageURL: res.url,
        pageTitle: extractTitle(page),
    }, custom));
}

function followRedirects(url, maxRedirect) {
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
                    result.image = { src: res.url };
                }
                return result;
            }
        })
        .then(res => {
            cache.set(url, res);
            runningResolves.delete(url);
            return res;
        })
        .catch(e => { throw new Error(`Error while resolving ${url}: ${e.stack || e}`); });

        runningResolves.set(url, result);
    }

    return runningResolves.get(url);
}

resolveURL.getFromCache = (url) => cache.get(makeProtocol(url));

module.exports = resolveURL;
