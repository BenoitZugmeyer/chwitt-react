var hp = require('htmlparser2');
var CSSselect = require('css-select');
var { decodeHTML } = require('entities');

function parse(page) {
    return hp.parseDOM(page);
}

function query(element, q) {
    return CSSselect.selectOne(q, element);
}

function queryAll(element, q) {
    return CSSselect(q, element);
}

function text(element) {
    return hp.DomUtils.getText(element);
}

module.exports = {
    parse,
    query,
    queryAll,
    decode: decodeHTML,
    text,
};
