'use strict';
let tests = require('./tests');

module.exports = function glob(s) {
    let regex = s
    .replace(/([\\\-.*+\?\^$()\[\]{}|])/g, '\\$1')
    .replace(/(\\*)(\\[*?{}\\]|,)/g, function (whole, slashes, ch) {
        slashes = slashes.slice(slashes.length / 2);
        return slashes + (
            slashes.length % 2 === 1 ? ch.slice(-1) :
            ch === ',' ? '|' :
            ch === '\\*' ? '.*' :
            ch === '\\?' ? '.' :
            ch === '\\{' ? '(' :
            ch === '\\}' ? ')' :
                ''
        );
    });

    return new RegExp('^' + regex + '$');
};

tests('glob', () => {
    let assert = require('assert');
    let glob = module.exports;

    assert.equal(String(glob('?')), '/^.$/');
    assert.equal(String(glob('{a,b}')), '/^(a|b)$/');
    assert.equal(String(glob('\\\\')), '/^\\\\$/');
    assert.equal(String(glob('\\?')), '/^\\?$/');
    assert.equal(String(glob('\\*')), '/^\\*$/');
    assert.equal(String(glob('\\\\*')), '/^\\\\.*$/');
    assert.equal(String(glob('\\\\\\*')), '/^\\\\\\*$/');
    assert.equal(String(glob('\\,')), '/^\\,$/');
    assert.equal(String(glob('\\\\,')), '/^\\\\|$/');
    console.log('OK');
});
