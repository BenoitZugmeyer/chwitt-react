'use strict';
var Store = require('chwitt-react/Store');
var windowStore = require('chwitt-react/stores/window');

class ColumnsStore extends Store {

    constructor() {
        super();

        this.columns = [
            {
                name: 'home',
                type: 'Timeline',
                query: { route: 'statuses/home_timeline' },
                title: 'Home',
            },
            {
                name: 'mentions',
                type: 'Timeline',
                query: { route: 'statuses/mentions_timeline' },
                title: 'Mentions',
            },
        ];

        this.setVisible(this.columns[0].name);

        this.match(
            'openUserTimeline success',
            ({ arguments: { id, after } }) => {
                this.addColumn({
                    name: 'user_' + id,
                    type: 'Timeline',
                    query: { route: 'statuses/user_timeline', data: { user_id: id } }
                }, after);
                this.trigger();
            }
        );

        this.match(
            'setFirstVisibleColumn success',
            ({ arguments: { name } }) => {
                this.setFirstVisible(name);
                this.trigger();
            }
        );

    }

    addColumn(infos, after) {
        var current = this.getColumn(infos.name);
        if (!current) {
            var index;
            if (after) {
                var afterIndex = this.getColumnIndex(after);
                if (afterIndex >= 0) {
                    index = afterIndex + 1;
                }
            }

            this.columns.splice(index, 0, infos);
        }
        this.setVisible(infos.name);
    }

    getColumnIndex(name) {
        return this.columns.indexOf(this.getColumn(name));
    }

    getColumn(name) {
        if (typeof name === 'object') return name;
        for (var column of this.columns) {
            if (column.name === name) {
                return column;
            }
        }
    }

    getVisibleCount() {
        return Math.min(Math.floor(windowStore.width / 300), this.columns.length);
    }

    getColumnWidth() {
        return windowStore.width / this.getVisibleCount();
    }

    setFirstVisible(name) {
        this._setFirstVisibleIndex(this.getColumnIndex(name));
    }

    setVisible(name) {
        var visibleCount = this.getVisibleCount();
        var visibleColumn = this.getColumn(name);
        if (!visibleColumn || visibleColumn.visible) return;
        var visibleColumnIndex = this.getColumnIndex(visibleColumn);

        // get first visible column index
        var firstVisibleColumnIndex = -1;
        for (let column of this.columns) {
            if (column.visible) {
                firstVisibleColumnIndex = this.getColumnIndex(column);
                break;
            }
        }

        var startIndex;
        if (firstVisibleColumnIndex < 0) {
            startIndex = visibleColumnIndex;
        }
        else if (firstVisibleColumnIndex < visibleColumnIndex) {
            startIndex = Math.max(firstVisibleColumnIndex,
                                  visibleColumnIndex - visibleCount + 1);
        }
        else {
            startIndex = Math.min(firstVisibleColumnIndex - visibleCount + 1,
                                  visibleColumnIndex);
        }

        this._setFirstVisibleIndex(startIndex);
    }

    _setFirstVisibleIndex(startIndex) {
        var visibleCount = this.getVisibleCount();
        startIndex = Math.max(0, Math.min(this.columns.length - visibleCount, startIndex));

        for (var index = 0; index < this.columns.length; index++) {
            this.columns[index].visible = index >= startIndex && index < startIndex + visibleCount;
        }
    }

}

module.exports = new ColumnsStore();
