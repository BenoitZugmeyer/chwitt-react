var urlModule = require('url');
var querystring = require('querystring');
var crypto = require('crypto');

function urlEncode(s) {
    return encodeURIComponent(s)
        .replace(/\!/g, "%21")
        .replace(/\'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/\*/g, "%2A");
}

function urlEncoded(chunks, ...args) {
    return chunks
        .map((chunk, i) => chunk + (i < args.length ? urlEncode(args[i]) : ''))
        .join('');
}

function addParameter(mergedParameters, name, value) {
    mergedParameters.push([urlEncode(name), urlEncode(value)]);
}

function addParameters(mergedParameters, parameters) {
    if (!parameters) return;
    for (var name in parameters) {
        var value = parameters[name];
        if (Array.isArray(value)) {
            for (var subvalue of value) addParameter(mergedParameters, name, subvalue);
        }
        else {
            addParameter(mergedParameters, name, value);
        }
    }
}

function generateNonce() {
    var result = '';
    for (var i = 0; i < 4; i++) result += Math.floor(Math.random() * 1e10).toString(36);
    return result;
}

function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}

function getAuthorizationHeader(options) {
    if (!options || !options.consumerKey || !options.consumerSecret) {
        throw new Error('consumerKey and consumerSecret are required');
    }

    var oauthParameters = {
        oauth_consumer_key: options.consumerKey,
        oauth_nonce: generateNonce(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: getTimestamp(),
        oauth_version: '1.0',
    };

    for (var optionalParameter of ['token', 'callback', 'verifier']) {
        if (options[optionalParameter]) {
            oauthParameters['oauth_' + optionalParameter] = options[optionalParameter];
        }
    }

    oauthParameters.oauth_signature = getSignature(options, oauthParameters);

    var parameters = Object.keys(oauthParameters)
        .map(key => urlEncoded`${key}="${oauthParameters[key]}"`)
        .join(', ');
    return `OAuth ${parameters}`;
}

function getSignature(
    {
        method,
        url,
        baseURL,
        urlParameters,
        bodyParameters,
        consumerSecret,
        tokenSecret,
    },
    oauthParameters
) {

    if (!method) throw new Error('"method" option is required');

    method = method.toUpperCase();

    if (url) {
        if (typeof url === 'string') {
            url = urlModule.parse(url);
        }

        baseURL = urlModule.format({
            protocol: url.protocol,
            hostname: url.hostname,
            pathname: url.pathname,
        });

        if (url.search) {
            urlParameters = querystring.parse(url.search.slice(1));
        }
    }
    else if (!baseURL) {
        throw new Error('Either "url" or "baseURL" option is required');
    }

    var mergedParameters = [];

    addParameters(mergedParameters, oauthParameters);
    addParameters(mergedParameters, bodyParameters);
    addParameters(mergedParameters, urlParameters);

    mergedParameters.sort(([keyA, valueA], [keyB, valueB]) => {
        return (
            keyA > keyB ? 1 :
            keyA < keyB ? -1 :
            valueA > valueB ? 1 :
            valueA < valueB ? -1 :
                0
        );
    });

    var parameters = mergedParameters.map(kv => kv[0] + '=' + kv[1]).join('&');
    var signatureBaseString = urlEncoded`${method}&${baseURL}&${parameters}`;

    var signingKey = urlEncoded`${consumerSecret}&${tokenSecret || ''}`;

    var hash = crypto.createHmac('sha1', signingKey)
        .update(signatureBaseString)
        .digest('base64');

    return hash;
}

exports.getAuthorizationHeader = getAuthorizationHeader;
