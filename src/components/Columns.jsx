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
        this.refs.main.getDOMNode().scrollLeft = this.getTweeningValue('left');
    }

    onScroll(e) {
        var main = this.refs.main.getDOMNode();
        if (!this.state.tweenQueue.length && e.target === main) {
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

    render() {
        var syncScroll = this.syncScroll.bind(this);
        var i;
        for (i = 0; i < this.state.columns.length; i++) {
            if (this.state.columns[i].visible) break;
        }
        var scroll = i * this.state.columnWidth;
        this._firstVisibleColumnIndex = i;
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

    onWheel() {
        // Just after the onScroll
        setTimeout(this.syncScroll.bind(this), 0);
    }

    syncScroll() {
        clearTimeout(this._scrollTimeout);
        var currentScroll = this.refs.main.state.left;
        if (Math.floor(currentScroll) !== Math.floor(this._scroll)) {
            var index = Math[currentScroll > this._scroll ? 'ceil' : 'floor'](currentScroll / this.state.columnWidth);
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
