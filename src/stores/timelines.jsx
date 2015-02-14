'use strict';
var Store = require('chwitt-react/Store');

class TimelinesStore extends Store {

    constructor() {
        super();
        this.timelines = new Map();

        this.match(
            'loadTimeline success',
            ({ arguments: { query }, timeline }) => {
                this.timelines.set(query, timeline);
                this.trigger();
            }
        );
    }

    isLoaded(query) {
        return this.timelines.has(query);
    }

    get(query) {
        return this.timelines.get(query);
    }

}

module.exports = new TimelinesStore();
