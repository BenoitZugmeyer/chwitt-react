'use strict';
var Component = require('../Component');
var ss = require('../ss');
var { addEventListener, removeEventListener } = require('../window');

var pointSize = 6;
var color = '#BDC3C7';
var sqrt2 = Math.sqrt(2);

class FloatingBubble extends Component {

    constructor() {
        global._floatingInstance = this.constructor.instance = this;
        this.state = { targets: null, content: null };

        this._hideIfClickOutside = e => {
            if (!this.refs.container.getDOMNode().contains(e.target)) {
                this.constructor.hide();
            }
        };
    }

    render() {
        if (!this.state.content) return <div></div>;

        var target = this.state.targets[0];
        var pointPosition = {
            top: target.y - pointSize,
            left: target.x + pointSize / 2,
        };
        var contentPosition = {
            top: target.y - pointSize * 2,
            left: target.x + pointSize,
        };

        return <div ref="container" styles="container">
            <div styles="pointShadow" style={pointPosition}></div>
            <div styles="point" style={pointPosition}></div>
            <div styles="content" style={contentPosition}>
                {this.state.content}
            </div>
        </div>;
    }

    componentDidUpdate() {
        if (this.state.content) {
            this.listen();
        }
        else {
            this.ignore();
        }
    }

    componentWillUnmount() {
        this.ignore();
    }

    listen() {
        addEventListener('mousedown', this._hideIfClickOutside, true);
    }

    ignore() {
        removeEventListener('mousedown', this._hideIfClickOutside, true);
    }

    static show(targets, content) {
        this.instance.setState({ targets, content });
    }

    static hide() {
        this.instance.setState({ targets: null, content: null });
    }
}

FloatingBubble.instance = global._floatingInstance;

FloatingBubble.styles = {
    content: {
        $smallBoxShadow: true,
        position: 'absolute',
        backgroundColor: color,
        padding: ss.vars.gap,
        $rounded: true,
        zIndex: 1,
    },

    point: {
        position: 'absolute',
        height: pointSize * sqrt2,
        width: pointSize * sqrt2,
        transform: 'rotate(45deg)',
        backgroundColor: color,
        zIndex: 2,
    },

    pointShadow: {
        inherit: 'point',
        $smallBoxShadow: true,
        backgroundColor: 'transparent',
        zIndex: 0,
    },

    container: {
        position: 'fixed',
        zIndex: 10,
    },
};

module.exports = FloatingBubble;
