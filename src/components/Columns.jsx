'use strict';
var tweenState = require('react-tween-state');
var Component = require('chwitt-react/Component');
var columnsStore = require('chwitt-react/stores/columns');
var actions = require('chwitt-react/actions');
var columns = require('./columns');

class Scroller extends Component {
    constructor(props) {
        super(props);
        this.state = { left: 0, top: 0 };
        this.applyMixin(tweenState.Mixin);
    }

    render() {
        return <div ref="main" {...this.props} onScroll={this.onScroll.bind(this)}>
            {this.props.children}
        </div>;
    }

    componentWillReceiveProps(nextProps) {
        if ('left' in nextProps) {
            this.tweenState('left', {
                duration: 200,
                endValue: nextProps.left
            });
        }
    }

    getDOMNode() {
        return this.refs.main.getDOMNode();
    }

    componentDidUpdate() {
        this.getDOMNode().scrollLeft = this.getTweeningValue('left');
    }

    isScrolling() {
        return this.state.tweenQueue.length > 0;
    }

    onScroll(e) {
        var main = this.getDOMNode();
        if (!this.isScrolling() && e.target === main) {
            this.setState({
                left: main.scrollLeft,
                top: main.scrollTop,
            }, this.props.onScroll);
        }
    }

}

class Columns extends Component {

    constructor(props) {
        super(props);
        this.state = this.getStateFromStores();
    }

    getStateFromStores() {
        return {
            columns: columnsStore.columns,
            columnWidth: columnsStore.getColumnWidth(),
        };
    }

    getFirstVisibleColumnIndex() {
        for (var i = 0; i < this.state.columns.length; i++) {
            if (this.state.columns[i].visible) return i;
        }
    }

    render() {
        var syncScroll = this.syncScroll.bind(this);
        var scroll = this.getFirstVisibleColumnIndex() * this.state.columnWidth;
        this._scroll = scroll;
        return <Scroller
            styles="main"
            ref="main"
            left={scroll}
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
        e.preventDefault();

        if (e.deltaX) {
            this.syncScroll(e.deltaX < 0 ? -1 : 1);
        }
    }

    syncScroll(force) {
        clearTimeout(this._scrollTimeout);
        if (this.refs.main.isScrolling()) return;

        var index;

        if (force) {
            index = this.getFirstVisibleColumnIndex() + force;
        }
        else {
            var currentScroll = this.refs.main.state.left;
            if (Math.floor(currentScroll) !== Math.floor(this._scroll)) {
                index = Math[currentScroll > this._scroll ? 'ceil' : 'floor'](currentScroll / this.state.columnWidth);
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
