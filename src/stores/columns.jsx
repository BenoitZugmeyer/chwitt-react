'use strict';
let Store = require('chwitt-react/Store');
let layoutStore = require('chwitt-react/stores/layout');

let MIN_COLUMN_WIDTH = 300;
let MAX_COLUMN_WIDTH = 600;

function getColumnInfos(name, options) {
    switch (name) {
    case 'home':
        return {
            name,
            type: 'Timeline',
            query: { route: 'statuses/home_timeline' },
            title: 'Home',
        };
    case 'mentions':
        return {
            name,
            type: 'Timeline',
            query: { route: 'statuses/mentions_timeline' },
            title: 'Mentions',
        };
    case 'new_column':
        return {
            name,
            type: 'NewColumn',
        };
    case 'user':
        return {
            name: `${name}_${options.id}`,
            type: 'User',
            query: { route: 'statuses/user_timeline', data: { user_id: options.id } },
            userId: options.id,
        };
    }
}

class ColumnsStore extends Store {

    constructor() {
        super();

        this.columns = [
            getColumnInfos('home'),
            getColumnInfos('mentions'),
        ];

        this._computeVisibleCount();

        layoutStore.listen(() => {
            this._computeVisibleCount();
            this.trigger();
        });

        this._setVisible('home');

        this.match(
            'openColumn success',
            ({ arguments: { name='new_column', options, replace, after } }) => {
                this._addColumn(getColumnInfos(name, options), { replace, after });
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

        this.match(
            'removeColumn success',
            ({ arguments: { name }}) => {
                this._removeColumn(name);
                this.trigger();
            }
        );

    }

    getColumnIndex(name, throws) {
        return this.columns.indexOf(this.getColumn(name, throws));
    }

    getColumn(name, throws) {
        if (typeof name === 'object') name = name.name;
        for (let column of this.columns) {
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

    _addColumn(infos, { after, replace }) {
        let current = this.getColumn(infos.name, false);
        let currentIndex = current && this.getColumnIndex(current);

        let injected = false;

        this.columns = this.columns.slice();

        if (replace) {
            let replaceIndex = this.getColumnIndex(replace);
            if (replaceIndex >= 0) {
                if (current) {
                    infos = current;
                    // Delete previous column
                    this.columns.splice(currentIndex, 1);
                }
                // Create the column at the replacement index
                this.columns[replaceIndex] = infos;
                injected = true;
            }
        }
        else if (after) {
            let afterIndex = this.getColumnIndex(after);
            if (afterIndex >= 0) {
                if (current) {
                    // Move the current column at the next index
                    infos = current;
                }
                this.columns.splice(afterIndex + 1, 0, infos);
                injected = true;
            }
        }

        if (!injected && !current) {
            this.columns.splice(0, 0, infos);
        }

        this._computeVisibleCount();
        this._setVisible(infos.name);
    }

    _removeColumn(name) {
        this.columns = this.columns.slice();
        this.columns.splice(this.getColumnIndex(name), 1);
        this._computeVisibleCount();
    }

    _computeVisibleCount() {
        let width = layoutStore.columnsAreaWidth;
        this.visibleCount = Math.min(Math.floor(width / MIN_COLUMN_WIDTH), this.columns.length);
        this.columnWidth = Math.min(width / this.visibleCount, MAX_COLUMN_WIDTH);
    }

    _setFirstVisible(name) {
        this._setFirstVisibleIndex(this.getColumnIndex(name));
    }

    _setVisible(name) {
        let index = this.getColumnIndex(name);
        if (this.isVisibleIndex(index)) return;

        let startIndex =
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
