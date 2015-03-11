'use strict';
var { localStorage } = require('./window');
var namespaces = new Set();

function assertType(value, type, subject) {
    if (typeof value !== type) throw new TypeError(`${subject} should be of type ${type}, not ${typeof value}`);
}

class Storage {
    constructor(namespace) {
        assertType(namespace, 'string', 'Storage namespace');
        if (namespaces.has(namespace)) {
            throw new Error(`A storage with namepsace ${namespace} already exists`);
        }
        this._namespace = namespace;
    }

    get(key) {
        var result = localStorage.getItem(this._getKey(key));
        return result === null ? undefined : result;
    }

    set(key, value) {
        assertType(value, 'string', 'Storage value');
        localStorage.setItem(this._getKey(key), value);
    }

    delete(key) {
        localStorage.removeItem(this._getKey(key));
    }

    has(key) {
        return this.get(key) !== undefined;
    }

    _getKey(key) {
        assertType(key, 'string', 'Storage key');
        return this._namespace + ':' + key;
    }
}

class JSONStorage extends Storage {
    get(key) {
        var result = super.get(key);
        return result === undefined ? result : JSON.parse(result);
    }

    set(key, value) {
        super.set(key, JSON.stringify(value));
    }
}

Storage.JSONStorage = JSONStorage;

module.exports = Storage;
