'use strict';
var Component = require('chwitt-react/Component');
var asserts = require('chwitt-react/asserts');
var Overlay = require('./Overlay');
var shell = require('shell');

class Link extends Component {

    render() {
        var content = () =>
            <div className={this.style('webviewContainer')}>
                {React.createElement('webview', {className: this.style('webview'), src: this.props.href})}
            </div>;
        return <Overlay content={content}>
            <span
                className={this.style(this.props.light ? 'link-light' : 'link')}
                onClick={this.onClick.bind(this)}>
                {this.props.children}
            </span>
        </Overlay>;
    }

    onClick(e) {
        if (e.button === 1) {
            shell.openExternal(this.props.href);
            e.stopPropagation();
        }
    }
}

Link.propTypes = {
    href: asserts.isString.prop,
    light: asserts.option(asserts.isBoolean).prop,
};

Link.defaultProps = {
    light: false,
};

Link.styles = {
    webviewContainer: {
        position: 'relative',
        flex: 1,
    },
    webview: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
};

module.exports = Link;
