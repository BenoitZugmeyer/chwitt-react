'use strict';
var Store = require('./Store');

class ActionStore extends Store {

    constructor() {
        super();
        this._actions = Object.create(null);
        this._emptyAction = {};
    }

    _getAction(type) {
        return this._actions[type] || this._emptyAction;
    }

    onDispatch(payload) {
        var { action } = payload;
        this._actions[action.type] = action;
        this.trigger();
    }

    getState(action) {
        return this._getAction(action).state;
    }

    getErrors(action) {
        return this._getAction(action).errors || [];
    }

}

module.exports = new ActionStore();
