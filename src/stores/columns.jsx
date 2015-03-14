'use strict';
var Store = require('chwitt-react/Store');
var layoutStore = require('chwitt-react/stores/layout');

var MIN_COLUMN_WIDTH = 300;
var MAX_COLUMN_WIDTH = 600;

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

        this._computeVisibleCount();

        layoutStore.listen(() => {
            this._computeVisibleCount();
            this.trigger();
        });

        this._setVisible('home');

        this.match(
            'openUserTimeline success',
            ({ arguments: { id, after } }) => {
                this._addColumn({
                    name: 'user_' + id,
                    type: 'User',
                    query: { route: 'statuses/user_timeline', data: { user_id: id } },
                    userId: id,
                }, after);
                this.trigger();
            }
        );

        this.match(
            'setFirstVisibleColumn success',
            ({ arguments: { name } }) => {
                this._setFirstVisible(name);
                this.trigger();
            }
        );

    }

    getColumnIndex(name) {
        return this.columns.indexOf(this.getColumn(name));
    }

    getColumn(name, throws) {
        if (typeof name === 'object') name = name.name;
        for (var column of this.columns) {
            if (column.name === name) {
                return column;
            }
        }
        if (throws !== false) {
            throw new Error(`Can't find column ${name}`);
        }
    }

    isVisibleIndex(index) {
        return index >= this.firstVisibleIndex && index < this.firstVisibleIndex + this.visibleCount;
    }

    _addColumn(infos, after) {
        var current = this.getColumn(infos.name, false);
        if (!current) {
            var index = 0;
            if (after) {
                var afterIndex = this.getColumnIndex(after);
                if (afterIndex >= 0) {
                    index = afterIndex + 1;
                }
            }

            this.columns = this.columns.slice();
            this.columns.splice(index, 0, infos);
        }
        this._setVisible(infos.name);
    }

    _computeVisibleCount() {
        var width = layoutStore.columnsAreaWidth;
        this.visibleCount = Math.min(Math.floor(width / MIN_COLUMN_WIDTH), this.columns.length);
        this.columnWidth = Math.min(width / this.visibleCount, MAX_COLUMN_WIDTH);
    }

    _setFirstVisible(name) {
        this._setFirstVisibleIndex(this.getColumnIndex(name));
    }

    _setVisible(name) {
        var index = this.getColumnIndex(name);
        if (this.isVisibleIndex(index)) return;

        var startIndex =
            this.firstVisibleIndex === undefined ? index :
            this.firstVisibleIndex < index ?
                Math.max(this.firstVisibleIndex, index - this.visibleCount + 1) :
                Math.min(this.firstVisibleIndex - this.visibleCount + 1, index);

        this._setFirstVisibleIndex(startIndex);
    }

    _setFirstVisibleIndex(startIndex) {
        this.firstVisibleIndex = Math.max(0, Math.min(this.columns.length - this.visibleCount, startIndex));
    }

}

module.exports = new ColumnsStore();
