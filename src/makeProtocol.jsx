var urlModule = require('url');

function makeProtocol(url, base) {
    if (/^https?:\/\//.test(url)) {
        return url;
    }
    if (/^\/\//.test(url)) {
        return 'https:' + url;
    }
    if (base) {
        return urlModule.resolve(makeProtocol(base), url);
    }
    throw new Error('Not an absolute URL');
}

module.exports = makeProtocol;
