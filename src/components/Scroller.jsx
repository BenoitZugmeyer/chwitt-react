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

Scroller.propTypes = {
    left: asserts.option(asserts.isNumber).prop,
    top: asserts.option(asserts.isNumber).prop,
};

module.exports = Scroller;
