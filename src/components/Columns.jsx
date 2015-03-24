'use strict';
let React = require('react');
let Component = require('chwitt-react/Component');
let Scroller = require('chwitt-react/components/Scroller');
let columnsStore = require('chwitt-react/stores/columns');
let actions = require('chwitt-react/actions');
let columns = require('./columns');
let Timer = require('../Timer');

class Columns extends Component {

    constructor(props) {
        super(props);
        this.state = this.getStateFromStores();
        this._timer = new Timer();
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
        return <div
            ref="main"
            styles="main"
            onMouseUp={this.onMouseUp.bind(this)}
            onWheel={this.onWheel.bind(this)}>
            <Scroller
                ref="scroller"
                left={this.getScroll()}
                internalStyle={this.getStyle('columns')}
                onScroll={this.onScroll.bind(this)}>

                {this.state.columns.map(this.renderColumn, this)}
            </Scroller>
        </div>;
    }

    componentWillUnmount() {
        this._timer.clear();
    }

    renderColumn(column) {
        let Type = columns[column.type];
        let style = {
            minWidth: this.state.columnWidth,
            maxWidth: this.state.columnWidth,
        };
        return <div key={column.name} style={style} styles="columnContainer">
            <Type column={column} />
        </div>;
    }

    onChange() {
        this.setState(this.getStateFromStores());
    }

    onScroll(e) {
        if (!e.withScrollbar) {
            this._timer.launch(() => this.syncScroll(), 200);
        }
    }

    onMouseUp() {
        this.syncScroll();
    }

    onWheel(e) {
        if (e.deltaX) {
            e.preventDefault();
            this.syncScroll(e.deltaX < 0 ? -1 : 1);
        }
    }

    syncScroll(force) {
        this._timer.clear();
        if (this.refs.scroller.isScrolling()) return;

        let index;

        if (force) {
            index = this.state.firstVisibleColumnIndex + force;
        }
        else {
            let currentScroll = this.refs.scroller.state.left;
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
    },

    columnContainer: {
        display: 'flex',
    },

    columns: {
        display: 'flex',
    },
};

Columns.listenTo(columnsStore);

module.exports = Columns;
