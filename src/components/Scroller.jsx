'use strict';
var tweenState = require('react-tween-state');
var Component = require('chwitt-react/Component');
var asserts = require('chwitt-react/asserts');

class Scroller extends Component {
    constructor(props) {
        super(props);
        this.state = { left: 0, top: 0 };
        this.applyMixin(tweenState.Mixin);
    }

    render() {
        return <div ref="main" styles="main">
            <div
                ref="scroller"
                styles={['scroller', this.props.scrollbar + 'Scrollbar', this.props.internalStyle]}
                onScroll={this.onScroll.bind(this)}
                onMouseDown={this.onMouseDown.bind(this)}
                onMouseUp={this.onMouseUp.bind(this)}>
                {this.props.children}
            </div>
        </div>;
    }

    componentWillReceiveProps(nextProps) {
        if ('left' in nextProps) {
            this.tweenState('left', {
                duration: 200,
                endValue: nextProps.left
            });
        }
        if ('top' in nextProps) {
            this.tweenState('top', {
                duration: 200,
                endValue: nextProps.top
            });
        }
    }

    componentDidUpdate() {
        var scroller = this.refs.scroller.getDOMNode();
        scroller.scrollLeft = this.getTweeningValue('left');
        scroller.scrollTop = this.getTweeningValue('top');
    }

    isScrolling() {
        return this.state.tweenQueue.length > 0;
    }

    onMouseDown(e) {
        this._isMouseDown = e.target === this.refs.scroller.getDOMNode();
    }

    onMouseUp() {
        this._isMouseDown = false;
    }

    onScroll(e) {
        var scroller = this.refs.scroller.getDOMNode();
        if (!this.isScrolling() && e.target === scroller) {
            this.setState({
                left: scroller.scrollLeft,
                top: scroller.scrollTop,
            }, this.props.onScroll.bind(this, { withScrollbar: this._isMouseDown }));
        }
    }

}

Scroller.styles = {
    main: {
        position: 'relative',
        display: 'flex',
    },

    scroller: {
        overflow: 'auto',
        flex: 1,
    },

    nativeScrollbar: {},
    noneScrollbar: {
        ':-webkit-scrollbar': {
            display: 'none',
        },
    },
};

Scroller.propTypes = {
    left: asserts.option(asserts.isNumber).prop,
    top: asserts.option(asserts.isNumber).prop,
    scrollbar: asserts.option(asserts.oneOf(['none', 'native'])).prop,
    onScroll: asserts.option(asserts.isFunction).prop,
};

Scroller.defaultProps = {
    scrollbar: 'native',
    onScroll: () => {},
};

module.exports = Scroller;
