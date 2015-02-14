'use strict';

var { EventEmitter } = require('events');
var dispatcher = require('./dispatcher');


class Store {

    constructor() {
        this._emitter = new EventEmitter();
        this._dispatchToken = dispatcher.register(this.onDispatch.bind(this));
        this._callbacks = [];
    }

    listen(callback) {
        this._emitter.addListener('change', callback);
    }

    ignore(callback) {
        this._emitter.removeListener('change', callback);
    }

    trigger() {
        this._emitter.emit('change');
    }

    match(selector, callback) {
        this._callbacks.push(({ action }) => {
            var match = typeof selector === 'string' ?
                action.full === selector :
                selector.indexOf(action.full) >= 0;

            if (match) callback(action);
        });
    }

    update(object) {
        Object.assign(this, object);
        this.trigger();
    }

    onDispatch(action) {
        for (var callback of this._callbacks) {
            callback(action);
        }
    }
}

module.exports = Store;
