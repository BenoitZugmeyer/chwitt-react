'use strict';

var punycode = require('punycode');
var { decodeHTML } = require('entities');

exports.Hashtag = require('./Hashtag');
exports.Media = require('./Media');
exports.URL = require('./URL');
exports.UserMention = require('./UserMention');
exports.renderTextWithEntities = function renderTextWithEntities(text, entityLists, props) {
    var content = [];
    var index = 0;
    text = punycode.ucs2.decode(text);
    var medias = [];

    function getTextSlice(from, to) {
        return decodeHTML(punycode.ucs2.encode(text.slice(from, to)));
    }

    for (var {entity, Type} of getEntities(entityLists)) {
        content.push(getTextSlice(index, entity.indices[0]));
        if (Type) {
            content.push(<Type key={`${entity.indices[0]}`} entity={entity} {...props} />);
        }
        else {
            medias.push(entity);
        }
        index = entity.indices[1];
    }

    content.push(getTextSlice(index));

    if (medias.length) {
        content.push(<exports.Media key="media" entities={medias} {...props} />);
    }
    return content;
};

function getEntities(lists) {
    var result = [];
    var ids = new Set();

    function addEntities(list, Type) {
        if (!list) return;
        for (let entity of list) {
            if (entity.id_str) {
                if (ids.has(entity.id_str)) continue;
                ids.add(entity.id_str);
            }
            result.push({ Type, entity });
        }
    }

    for (let entities of lists) {
        if (entities) {
            addEntities(entities.urls, exports.URL);
            addEntities(entities.user_mentions, exports.UserMention);
            addEntities(entities.hashtags, exports.Hashtag);
            // addEntities(tweet.entities.symbols, entities.Symbol);
            addEntities(entities.media);
        }
    }

    result.sort((a, b) => a.entity.indices[0] - b.entity.indices[0]);

    return result;
}
