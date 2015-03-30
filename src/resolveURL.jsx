'use strict';
let querystring = require('querystring');
let request = require('./request');
let hp = require('htmlparser2');
let glob = require('./glob');
let scrap = require('./scrap');
let DefaultMap = require('./DefaultMap');
let makeProtocol = require('./makeProtocol');
let mime = require('./mime');
let { JSONStorage } = require('./Storage');

let cache = new JSONStorage('resolveURL');

// function extractOGInfos(page) {
//     let re = /^og:/i;
//     let metas = hp.DomUtils.findAll(
//         el =>
//             el.type === 'tag' &&
//             el.name === 'meta' &&
//             el.attribs.property && re.test(el.attribs.property) &&
//             el.attribs.content,
//         page
//     );
//     let result = {};
//     for (let meta of metas) {
//         result[meta.attribs.property.slice(3).toLowerCase()] = meta.attribs.content;
//     }
//     return result;
// }

function extractTitle(page) {
    let tag = hp.DomUtils.findOne(
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
    let result = {};
    let promises = [];
    for (let re of extractors.keys()) {
        let match = re.exec(url);
        if (match) {
            let res = extractors.get(re)(page, match);
            if (res instanceof Promise) {
                promises.push(res.then(
                    infos => Object.assign(result, infos),
                    error => console.error(`Error while fetching infos for ${url}: ${error.stack}`)
                ));
            }
            else {
                Object.assign(result, res);
            }
        }
    }
    return Promise.all(promises).then(() => result);
}

let extractors = new Map();

extractors.set(glob('https://www.facebook.com/media/set/*'), page => {
    let thumbs = [];
    for (let hiddenElem of scrap.queryAll(page, '.hidden_elem')) {
        if (hiddenElem && hiddenElem.children.length && hiddenElem.children[0].type === 'comment') {
            let dom = hp.parseDOM(hiddenElem.children[0].data);
            thumbs.push.apply(thumbs, scrap.queryAll(dom, '[data-starred-src]'));
        }
    }

    return {
        images: thumbs.map(t => Object.assign({ src: scrap.decode(t.attribs['data-starred-src']) }))
    };
});

extractors.set(glob('https://twitter.com/*/status/{*}'), (page, params) => {
    return {
        tweet: params[1],
    };
});

extractors.set(glob('http{s,}://www.youtube.com/watch\\?v={*}'), (page, params) => {
    return request({ url: 'http://www.youtube.com/get_video_info?video_id=' + params[2] })
    .then(request.read)
    .then(body => {
        body = querystring.parse(body.toString());
        if (body.url_encoded_fmt_stream_map) {
            let qualities = {};
            for (let qualityString of body.url_encoded_fmt_stream_map.split(',')) {
                let quality = querystring.parse(qualityString);
                if (quality.type && mime.isVideo(quality.type)) {
                    qualities[quality.quality] = quality.url;
                }
            }

            return {
                title: body.title,
                video: {
                    thumbnail: { src: body.iurlhq || body.iurl },
                    quality: qualities,
                }
            };
        }
    });
});

extractors.set(glob('http://imgur.com/{a,gallery}/*'), page => {
    return {
        images: scrap.queryAll(page, 'meta[property="og:image"][content]')
        .map(image => {
            return { src: image.attribs.content.replace(/\?fb$/, '') };
        })
    };
});

function extractInfos(res, pageURL, body) {
    let page = scrap.parse(body);
    return runCustomExtractors(pageURL, page)
    .then(custom => Object.assign({
        pageURL,
        pageTitle: extractTitle(page),
    }, custom));
}

function followRedirects(url, maxRedirect) {
    if (maxRedirect === 0) {
        return Promise.reject(new Error(`${url} does not redirect correctly`));
    }

    return request({ url, method: 'head' })
    .then(response => {
        if (response.headers.location) {
            return followRedirects(makeProtocol(response.headers.location, url),
                                   maxRedirect - 1);
        }
        return { response, url };
    });
}

function isHTMLResponse(res) {
    return /^text\/html\b/.test(res.headers['content-type']);
}

let runningResolves = new DefaultMap(runResolveURL);

function runResolveURL(url) {
    return followRedirects(url, 10)
    .then(({ response, url }) => {
        if (isHTMLResponse(response)) {
            return request({ url }).then(request.read).then(body => extractInfos(response, url, body));
        }
        else {
            let result = { pageURL: url };
            if (mime.isImage(response.headers['content-type'])) {
                result.image = { src: url };
            }
            return result;
        }
    })
    .then(infos => {
        cache.set(url, infos);
        runningResolves.delete(url);
        return infos;
    })
    .catch(e => {
        throw new Error(`Error while resolving ${url}: ${e.stack || e}`);
    });
}

function resolveURL(url) {
    if (typeof url !== 'string') {
        throw new Error('resolveURL argument should be a string');
    }

    if (cache.has(url)) {
        return Promise.resolve(cache.get(url));
    }

    return runningResolves.get(makeProtocol(url));
}

resolveURL.getFromCache = (url) => cache.get(makeProtocol(url));

module.exports = resolveURL;
