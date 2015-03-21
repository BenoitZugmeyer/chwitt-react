'use strict';
let Component = require('chwitt-react/Component');
let asserts = require('chwitt-react/asserts');
let tweenState = require('react-tween-state');
let { getComputedStyle } = require('chwitt-react/window');

class Overlay extends Component {

    constructor(props) {
        super(props);
        this.state = { open: 0 };
        this.applyMixin(tweenState.Mixin);
    }

    render() {
        let open = this.getTweeningValue('open');
        let style = {
            opacity: open,
        };

        return <div onClick={this.open.bind(this)} className={this.style('main')}>
            {this.props.children}
            {open ?
                <div
                    onClick={this.close.bind(this)}
                    onWheel={this.onWheel.bind(this)}
                    style={style}
                    className={this.style('overlay')}>
                    <span className={this.style('back')}>Back</span>
                    <div className={this.style('content')}>
                        {this.props.content()}
                    </div>
                </div> :
                ''}
        </div>;
    }

    open(e) {
        e.stopPropagation();
        this.tweenState('open', {
            duration: 200,
            endValue: 1,
        });
    }

    close(e) {
        e.stopPropagation();
        this.tweenState('open', {
            duration: 200,
            endValue: 0,
        });
    }

    onWheel(e) {
        if (e.target.tagName === 'WEBVIEW') {
            return;
        }

        function getScrollable(element) {
            if (!element || element.nodeType !== 1) return null;
            let overflow = getComputedStyle(element).overflowY;
            return overflow === 'auto' || overflow === 'scroll' ? element : getScrollable(element.parentNode);
        }

        let scroller = getScrollable(e.target);
        if (scroller) {
            if ((e.deltaY > 0 && scroller.scrollHeight <= scroller.scrollTop + scroller.clientHeight) ||
                (e.deltaY < 0 && scroller.scrollTop <= 0)) {
                e.preventDefault();
            }
        }
    }
}


Overlay.propTypes = {
    content: asserts.isFunction.prop,
};


Overlay.styles = {
    main: {
        cursor: 'pointer',
        display: 'inline',
    },

    overlay: {
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        zIndex: 10,
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, .9)',
    },

    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1,
        overflow: 'auto',
    },

    back: {
        inherit: 'link-light',
        display: 'block',
        margin: [5, 10],
    }
};

module.exports = Overlay;
