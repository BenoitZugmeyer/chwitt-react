'use strict';
let { Dispatcher } = require('flux');

class AppDispatcher extends Dispatcher {

    constructor() {
        super();
        this._payloads = [];
    }

    handleViewAction(action) {
        this._dispatch({
            source: 'view',
            action: action,
        });
    }

    handleAPIAction(action) {
        this._dispatch({
            source: 'api',
            action: action,
        });
    }

    dispatch(payload) {
        console.group('Dispatch ' + payload.source + ':', payload.action);
        super.dispatch(payload);
        console.groupEnd();
        if (this._payloads.length) {
            this.dispatch(this._payloads.shift());
        }
    }

    _dispatch(payload) {
        if (this.isDispatching()) {
            this._payloads.push(payload);
        }
        else {
            this.dispatch(payload);
        }
    }

}

module.exports = new AppDispatcher();
