'use strict';
let React = require('react');
let Column = require('chwitt-react/components/Column');
let ss = require('chwitt-react/ss');
let actions = require('chwitt-react/actions');

class NewColumn extends Column {

    renderContent() {
        return <div styles="content">
            <div styles="button" onClick={() => this.onNewColumn('home')}>Home</div>
            <div styles="button" onClick={() => this.onNewColumn('mentions')}>Mentions</div>
        </div>;
    }

    onNewColumn(name) {
        actions.openColumn({ name, replace: this.props.column.name });
    }

}

NewColumn.defaultProps = {
    title: 'New column',
};

NewColumn.styles = {
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },

    button: {
        $button: true,
        margin: [ss.vars.gap],
    },
};

module.exports = NewColumn;
