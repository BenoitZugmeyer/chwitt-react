'use strict';
var Component = require('chwitt-react/Component');
var asserts = require('chwitt-react/asserts');
var Overlay = require('./Overlay');
var shell = require('../shell');

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}

class Link extends Component {

    render() {
        // Damn react does not support nwdisable and nwfaketop attributes
        var frame = { __html: `
        <iframe src="${escapeHtml(this.props.href)}" nwdisable nwfaketop class="${this.style('webview')}"></iframe>
        `};
        var content = () =>
            <div className={this.style('webviewContainer')} dangerouslySetInnerHTML={frame} />;
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
        display: 'flex',
    },

    webview: {
        flex: 1,
        border: 0,
    }
};

module.exports = Link;
