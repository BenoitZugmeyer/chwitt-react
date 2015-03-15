'use strict';
var Column = require('chwitt-react/components/Column');
var ss = require('chwitt-react/ss');
var actions = require('chwitt-react/actions');

class NewColumn extends Column {

    renderContent() {
        return <div styles="content">
            <div styles="button" onClick={() => this.onNewColumn('home')}>Home</div>
            <div styles="button" onClick={() => this.onNewColumn('mentions')}>Mentions</div>
        </div>;
    }

    onNewColumn(name) {
        actions.openNewColumn({ column: { name }, replace: this.props.column.name });
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
        color: 'white',
        padding: [4, 10],
        margin: [ss.vars.gap],
        textAlign: 'center',
        maxWidth: 200,
    },
};

module.exports = NewColumn;
