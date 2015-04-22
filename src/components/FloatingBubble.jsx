'use strict';
let React = require('react');
let Component = require('../Component');
let ss = require('../ss');
let { addEventListener, removeEventListener } = require('../window');

let pointSize = 6;
let color = '#BDC3C7';
let sqrt2 = Math.sqrt(2);

class FloatingBubble extends Component {

    constructor(props) {
        super(props);
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

        let target = this.state.targets[0];
        let pointPosition = {
            top: target.y - pointSize,
            left: target.x + pointSize / 2,
        };
        let contentPosition = {
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
        super.componentDidUpdate();
        if (this.state.content) {
            this.listen();
        }
        else {
            this.ignore();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
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
