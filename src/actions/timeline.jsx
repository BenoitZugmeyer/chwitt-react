'use strict';
let { makeDispatch, makeErrors, twitterQuery } = require('./base');
let { getTimelineId } = require('../util');
let Timer = require('../Timer');

const MIN_UPDATE_INTERVAL = 10e3;
const DEFAULT_UPDATE_INTERVAL = 120e3;

class TimelineUpdater {

    constructor(id, query) {
        this._id = id;
        this._query = query;
        this._isUpdating = this._isRunning = false;
        this._lastUpdate = 0;
        this._mostRecentTweet = null;
        this._updateTimer = new Timer({ callback: () => this.update(), delay: DEFAULT_UPDATE_INTERVAL, debounce: false });
    }

    get id() {
        return this._id;
    }

    isRunning() {
        return this._isRunning;
    }

    update() {
        if (this._isUpdating) return;

        if (this._lastUpdate + MIN_UPDATE_INTERVAL > Date.now()) return;

        this._isUpdating = true;

        this._update()
        .then(() => {
            this._isUpdating = false;
            this._programNextUpdate();
        })
        .catch(() => {
            this._isUpdating = false;
        });
    }

    _update() {
        let dispatch = makeDispatch('loadTimeline', { id: this.id, since_id: this._mostRecentTweet });
        dispatch('pending');

        let data = Object.assign({}, this._query);
        delete data.route;

        if (this._mostRecentTweet) data.since_id = this._mostRecentTweet;

        let result = twitterQuery(this._query.route, data);

        result.then(timeline => {
            this._lastUpdate = Date.now();
            if (timeline[0]) {
                this._mostRecentTweet = timeline[0].id_str;
            }
            dispatch('success', { timeline });
        })
        .catch(error => {
            dispatch('error', makeErrors(error));
        });

        return result;
    }

    _programNextUpdate() {
        if (!this._isRunning) return;

        console.log(`NEXT UPDATE IN ${DEFAULT_UPDATE_INTERVAL} for ${this._id}`);
        this._updateTimer.launch();
    }

    start() {
        if (this._isRunning) return;
        this._isRunning = true;
        this._programNextUpdate();
    }

    stop() {
        if (!this._isRunning) return;
        this._isRunning = false;
        this._updateTimer.clear();
    }

}


function getTimelineUpdater(query) {
    let id = getTimelineId(query);
    let updater = updaters.get(id);

    if (!updater) {
        updater = new TimelineUpdater(id, query);
        updaters.set(id, updater);
    }

    return updater;
}


let updaters = new Map();


exports.startTimelineUpdate = function (query) {
    getTimelineUpdater(query).start();
};

exports.stopTimelineUpdate = function (query) {
    getTimelineUpdater(query).stop();
};

exports.updateTimeline = function (query) {
    getTimelineUpdater(query).update();
};
