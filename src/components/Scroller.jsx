'use strict';
let React = require('react');
let { document } = require('../window');
let tweenState = require('react-tween-state');
let Component = require('chwitt-react/Component');
let asserts = require('chwitt-react/asserts');


function getElementPosition(relativeRect, element) {
    let elementRect = element.getBoundingClientRect();
    return {
        top: elementRect.top - relativeRect.top,
        left: elementRect.left - relativeRect.left,
    };
}


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
            {this.props.shadows &&
                <div>
                    <div ref="topShadow" styles="topShadow"></div>
                    <div ref="rightShadow" styles="rightShadow"></div>
                    <div ref="bottomShadow" styles="bottomShadow"></div>
                    <div ref="leftShadow" styles="leftShadow"></div>
                </div>
            }
        </div>;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.fixed) {
            let scroller = this._scrollerElement;
            let rect = scroller.getBoundingClientRect();
            let fixedElement = document.elementFromPoint(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2
            ) || scroller.childNodes[0];
            if (fixedElement) {
                this._fixedInfos = {
                    element: fixedElement,
                    position: getElementPosition(rect, fixedElement),
                };
            }
        }
        else {
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
    }

    componentDidMount() {
        this.updateShadows();
    }

    componentDidUpdate() {
        let fixedInfos = this._fixedInfos;

        if (fixedInfos) {
            let scroller = this._scrollerElement;
            if (scroller.contains(fixedInfos.element)) {
                let newPosition = getElementPosition(scroller.getBoundingClientRect(), fixedInfos.element);
                this.setState({
                    top: this.state.top + (newPosition.top - fixedInfos.position.top),
                    left: this.state.left + (newPosition.left - fixedInfos.position.left),
                });
                this._fixedInfos = null;
            }
        }
        else {
            this.syncScroll();
        }
    }

    componentDidMove() {
        this.syncScroll();
    }

    syncScroll() {
        let scroller = this._scrollerElement;
        scroller.scrollLeft = this.getTweeningValue('left');
        scroller.scrollTop = this.getTweeningValue('top');
        this.updateShadows();
    }

    isScrolling() {
        return this.state.tweenQueue.length > 0;
    }

    onMouseDown(e) {
        this._isMouseDown = e.target === this._scrollerElement;
    }

    onMouseUp() {
        this._isMouseDown = false;
    }

    updateShadows() {
        if (!this.props.shadows) return;

        let scroller = this._scrollerElement;
        let updateShadow = (name, distance) => {
            let opacity = distance > 100 ? 1 : distance / 100;
            this.refs[name].getDOMNode().style.opacity = opacity;
        };

        updateShadow('topShadow', scroller.scrollTop);
        updateShadow('bottomShadow', scroller.scrollHeight - (scroller.scrollTop + scroller.clientHeight));
        updateShadow('leftShadow', scroller.scrollLeft);
        updateShadow('rightShadow', scroller.scrollWidth - (scroller.scrollLeft + scroller.clientWidth));
    }

    onScroll(e) {
        let scroller = this._scrollerElement;
        this.updateShadows();

        if (!this.isScrolling() && e.target === scroller) {
            this.setState({
                left: scroller.scrollLeft,
                top: scroller.scrollTop,
            }, this.props.onScroll.bind(this, { withScrollbar: this._isMouseDown }));
        }
    }

    get _scrollerElement() {
        return this.refs.scroller.getDOMNode();
    }

}

let shadowWidth = 10;

Scroller.styles = {
    main: {
        overflow: 'hidden',
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

    shadow: {
        position: 'absolute',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
        zIndex: 1,
    },

    leftShadow: {
        inherit: 'shadow',
        left: -shadowWidth,
        top: 0,
        bottom: 0,
        width: shadowWidth,
    },

    rightShadow: {
        inherit: 'shadow',
        right: -shadowWidth,
        top: 0,
        bottom: 0,
        width: shadowWidth,
    },

    topShadow: {
        inherit: 'shadow',
        top: -shadowWidth,
        left: 0,
        right: 0,
        height: shadowWidth,
    },

    bottomShadow: {
        inherit: 'shadow',
        bottom: -shadowWidth,
        left: 0,
        right: 0,
        height: shadowWidth,
    },
};

Scroller.propTypes = {
    left: asserts.option(asserts.isNumber).prop,
    top: asserts.option(asserts.isNumber).prop,
    scrollbar: asserts.option(asserts.oneOf(['none', 'native'])).prop,
    onScroll: asserts.option(asserts.isFunction).prop,
    shadows: asserts.option(asserts.isBoolean).prop,
};

Scroller.defaultProps = {
    scrollbar: 'native',
    onScroll: () => {},
    shadows: false,
};

module.exports = Scroller;
