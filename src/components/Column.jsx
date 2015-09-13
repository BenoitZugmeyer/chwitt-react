'use strict';
let React = require('react');
let Component = require('chwitt-react/Component');
let asserts = require('chwitt-react/asserts');
let actions = require('chwitt-react/actions');
let ss = require('chwitt-react/ss');

class Column extends Component {

    constructor(props) {
        super(props);
        this.state = {
            settingsOpen: false,
        };
    }

    render() {
        return <div styles="main">
            {this.renderHeader()}
            {this.state.settingsOpen && this.renderSettings()}
            {this.renderContent()}
        </div>;
    }

    renderHeader() {
        return <div styles="header">
            <h1 styles="title">{this.props.title || this.props.column.title}</h1>
            {this.renderSettingsIcon()}
        </div>;
    }

    renderSettings() {
        return <div styles="settings">
            <button styles="button" onClick={this.onRemoveColumn.bind(this)}>
                Remove column
            </button>
        </div>;
    }

    renderContent() {
    }

    renderSettingsIcon() {
        return <div styles="settingsIcon" onClick={this.onToggleSettings.bind(this)} />;
    }

    onToggleSettings() {
        this.setState({ settingsOpen: !this.state.settingsOpen });
    }

    onRemoveColumn() {
        actions.removeColumn(this.props.column.name);
    }

}

Column.propTypes = {
    column: asserts.isColumn.prop,
};

Column.styles = {
    main: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        borderRight: ss.vars.border,
    },

    header: {
        borderBottom: ss.vars.border,
        display: 'flex',
        alignItems: 'center',
        padding: ss.vars.gap,
        flexShrink: 0,
    },

    title: {
        margin: 0,
        fontFamily: 'Fira Sans Thin',
        flex: 1,
        lineHeight: 1,
    },

    settingsIcon: {
        $cogWheelIcon: '#95A5A6',
        height: 24,
        width: 24,
        $button: true,
        backgroundColor: 'transparent',
    },

    settings: {
        borderBottom: ss.vars.border,
        padding: ss.vars.gap,
        flexShrink: 0,
    },

    button: {
        $button: true,
    },

};

module.exports = Column;
