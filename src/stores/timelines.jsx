'use strict';
let Store = require('chwitt-react/Store');
let { getTimelineId } = require('../util');
let DefaultMap = require('../DefaultMap');

class TimelinesStore extends Store {

    constructor() {
        super();
        this.timelines = new DefaultMap(() => []);

        this.match(
            'loadTimeline success',
            ({ arguments: { id }, timeline }) => {
                var currentTimeline = this.timelines.get(id);
                this.timelines.set(id, timeline.concat(currentTimeline));
                this.trigger();
            }
        );
    }

    isLoaded(query) {
        return this.timelines.has(getTimelineId(query));
    }

    get(query) {
        return this.timelines.get(getTimelineId(query));
    }


}

module.exports = new TimelinesStore();
