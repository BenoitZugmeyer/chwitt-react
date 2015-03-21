'use strict';
let { localStorage } = require('./window');
let { isString } = require('./asserts');
let namespaces = new Set();

class Storage {
    constructor(namespace) {
        isString(namespace);
        if (namespaces.has(namespace)) {
            throw new Error(`A storage with namepsace ${namespace} already exists`);
        }
        this._namespace = namespace;
    }

    get(key) {
        let result = localStorage.getItem(this._getKey(key));
        return result === null ? undefined : result;
    }

    set(key, value) {
        isString(value);
        localStorage.setItem(this._getKey(key), value);
    }

    delete(key) {
        localStorage.removeItem(this._getKey(key));
    }

    has(key) {
        return this.get(key) !== undefined;
    }

    empty() {
        let prefix = this._getKey('');
        for (let key in localStorage) {
            if (key.startsWith(prefix)) localStorage.removeItem(key);
        }
    }

    _getKey(key) {
        isString(key);
        return this._namespace + ':' + key;
    }
}

class JSONStorage extends Storage {
    get(key) {
        let result = super.get(key);
        return result === undefined ? result : JSON.parse(result);
    }

    set(key, value) {
        super.set(key, JSON.stringify(value));
    }
}

Storage.JSONStorage = JSONStorage;

module.exports = Storage;
