'use strict';
let React = require('react');
let Component = require('chwitt-react/Component');
let asserts = require('chwitt-react/asserts');
let ss = require('chwitt-react/ss');

class Column extends Component {

    render() {
        return <div styles="main">
            {this.renderHeader()}
            {this.renderContent()}
        </div>;
    }

    renderHeader() {
        return <div styles="header">
            <h1 styles="title">{this.props.title || this.props.column.title}</h1>
        </div>;
    }

    renderContent() {
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
    },

    title: {
        margin: 0,
        padding: [ss.vars.gap / 2, ss.vars.gap],
        fontFamily: 'Fira Sans Thin',
    },
};

module.exports = Column;
