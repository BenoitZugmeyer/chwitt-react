'use strict';

class Timer {
    constructor({ debounce=true, callback=null, delay=200 }={}) {
        this._debounce = debounce;
        this._callback = callback;
        this._delay = delay;
        this._currentDelayTarget = Infinity;
    }

    launch(callback=this._callback, delay=this._delay) {
        let now = Date.now();
        let delayTarget = now + delay;
        if (this._debounce || this._currentDelayTarget < now || this._currentDelayTarget > delayTarget ) {
            this.clear();
            this._currentDelayTarget = delayTarget;
            this._timeout = setTimeout(() => {
                this._currentDelayTarget = Infinity;
                callback();
            }, delay);
        }
    }

    clear() {
        this._currentDelayTarget = Infinity;
        clearTimeout(this._timeout);
    }
}

module.exports = Timer;
