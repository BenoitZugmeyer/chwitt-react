'use strict';
var Component = require('chwitt-react/Component');
var Scroller = require('chwitt-react/components/Scroller');
var columnsStore = require('chwitt-react/stores/columns');
var actions = require('chwitt-react/actions');
var columns = require('./columns');

class Columns extends Component {

    constructor(props) {
        super(props);
        this.state = this.getStateFromStores();
    }

    getStateFromStores() {
        return {
            columns: columnsStore.columns,
            columnWidth: columnsStore.columnWidth,
            firstVisibleColumnIndex: columnsStore.firstVisibleIndex,
        };
    }

    getScroll() {
        return this.state.firstVisibleColumnIndex * this.state.columnWidth;
    }

    render() {
        return <Scroller
            styles="main"
            ref="main"
            left={this.getScroll()}
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
            onWheel={this.onWheel.bind(this)}
            onScroll={this.onScroll.bind(this)}>

            {this.state.columns.map(this.renderColumn, this)}
        </Scroller>;
    }

    componentWillUnmount() {
        clearTimeout(this._scrollTimeout);
    }

    renderColumn(column) {
        var Type = columns[column.type];
        return <div key={column.name} style={{minWidth: this.state.columnWidth}} styles="columnContainer">
            <Type column={column} />
        </div>;
    }

    onChange() {
        this.setState(this.getStateFromStores());
    }

    onScroll() {
        clearTimeout(this._scrollTimeout);
        if (!this._isMouseDown) {
            this._scrollTimeout = setTimeout(() => {
                this.syncScroll();
            }, 200);
        }
    }

    onMouseDown(e) {
        this._isMouseDown = e.target === this.refs.main.getDOMNode();
    }

    onMouseUp() {
        this._isMouseDown = false;
        this.syncScroll();
    }

    onWheel(e) {
        if (e.deltaX) {
            e.preventDefault();
            this.syncScroll(e.deltaX < 0 ? -1 : 1);
        }
    }

    syncScroll(force) {
        clearTimeout(this._scrollTimeout);
        if (this.refs.main.isScrolling()) return;

        var index;

        if (force) {
            index = this.state.firstVisibleColumnIndex + force;
        }
        else {
            var currentScroll = this.refs.main.state.left;
            if (Math.floor(currentScroll) !== Math.floor(this.getScroll())) {
                index = Math[currentScroll > this.getScroll() ? 'ceil' : 'floor'](currentScroll / this.state.columnWidth);
            }
        }

        if (index !== undefined) {
            index = Math.max(0, Math.min(this.state.columns.length - 1, index));
            actions.setFirstVisibleColumn(this.state.columns[index].name);
        }
    }

}

Columns.styles = {
    main: {
        display: 'flex',
        flex: 1,
        overflow: 'auto',
    },

    columnContainer: {
        display: 'flex',
    },
};

Columns.listenTo(columnsStore);

module.exports = Columns;
