var React = require('react');
var Component = require('chwitt-react/Component');
var tweenState = require('react-tween-state');

function applyMixin(instance, mixin) {
    for (var property in mixin) {
        if (property === 'getInitialState') {
            instance.state = Object.assign(instance.state || {}, mixin.getInitialState());
        }
        else if (typeof mixin[property] === 'function') {
            if (instance[property]) {
                throw new Error(`Can't override instance property ${property}`);
            }
            instance[property] = mixin[property].bind(instance);
        }
        else {
            throw new Error(`Can't handle property type ${typeof mixin[property]}`);
        }
    }
    Object.defineProperty(instance, 'isMounted', { value: () => true });
}

class Overlay extends Component {

    constructor(props) {
        super(props);
        this.state = { open: 0 };
        applyMixin(this, tweenState.Mixin);
    }

    render() {
        var open = this.getTweeningValue('open');
        var style = {
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
            if (!element || element.nodeType !== 1) return;
            var overflow = getComputedStyle(element).overflowY;
            return overflow === 'auto' || overflow === 'scroll' ? element : getScrollable(element.parentNode);
        }

        var scroller = getScrollable(e.target);
        if (scroller) {
            if ((e.deltaY > 0 && scroller.scrollHeight <= scroller.scrollTop + scroller.clientHeight) ||
                (e.deltaY < 0 && scroller.scrollTop <= 0)) {
                e.preventDefault();
            }
        }
    }
}


Overlay.propTypes = {
    content: React.PropTypes.func.isRequired
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
        zIndex: 1,
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
