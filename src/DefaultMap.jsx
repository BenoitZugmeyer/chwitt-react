'use strict';
let tests = require('./tests');

class DefaultMap {

    constructor(default_, iterator) {
        this._backend = new Map(iterator);
        this.default = default_;
    }

    get(key) {
        if (!this._backend.has(key) && this.default !== undefined) {
            this._backend.set(key, typeof this.default === 'function' ? this.default(key) : this.default);
        }
        return this._backend.get(key);
    }

}

function wrapBackend(descriptor, name) {
    let fn = descriptor[name];
    if (typeof fn !== 'function') return undefined;

    descriptor[name] = function () {
        return fn.apply(this._backend, arguments);
    };
}

function completeProperty(name, target, source) {
    let descriptor = Object.getOwnPropertyDescriptor(source, name);
    if (target.hasOwnProperty(name)) return;
    console.log(name);
    wrapBackend(descriptor, 'get');
    wrapBackend(descriptor, 'set');
    wrapBackend(descriptor, 'value');
    Object.defineProperty(target, name, descriptor);
}

function complete(target, source) {
    for (let name of Object.getOwnPropertyNames(source)) {
        completeProperty(name, target, source);
    }
    for (let symbol of Object.getOwnPropertySymbols(source)) {
        completeProperty(symbol, target, source);
    }
}

complete(DefaultMap.prototype, Map.prototype);

module.exports = DefaultMap;

tests('DefaultMap', () => {
    let assert = require('assert');
    let map = new DefaultMap();

    assert.equal(map.size, 0);
    assert.equal(map.get('foo'), undefined);
    map.set('foo', 'bar');
    assert.equal(map.size, 1);
    assert.equal(map.get('foo'), 'bar');
    assert.equal(map.get('baz'), undefined);
    assert.equal(map.size, 1);
    map.default = 1;
    assert.equal(map.get('baz'), 1);
    assert.equal(map.size, 2);
    map.clear();
    assert.equal(map.size, 0);
    map.default = () => [];
    assert.deepEqual(map.get('foo'), []);
    map.get('bar').push(1);
    assert.deepEqual(map.get('bar'), [1]);
    assert.deepEqual(map.get('foo'), []);
    assert.equal(map.size, 2);
    assert.equal(map.has('biz'), false);
    assert.equal(map.size, 2);

    let collect = [];
    for (let kv of map) {
        collect.push(kv);
    }
    assert.deepEqual(collect, [['foo', []], ['bar', [1]]]);
});
