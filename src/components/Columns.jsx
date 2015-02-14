'use strict';
var React = require('react');
var Component = require('chwitt-react/Component');
var columnsStore = require('chwitt-react/stores/columns');
var columns = require('./columns');

class Columns extends Component {

    constructor(props) {
        super(props);
        this.state = this.getStateFromStores();
    }

    getStateFromStores() {
        return {
            columns: columnsStore.columns,
        };
    }

    render() {
        return <div styles="main">
            {this.state.columns.map(this.renderColumn, this)}
        </div>;
    }

    onChange() {
        this.setState(this.getStateFromStores());
    }

    renderColumn(column) {
        var Type = columns[column.type];
        return <Type key={column.name} column={column} />;
    }

}

Columns.styles = {
    main: {
        display: 'flex',
        flex: 1,
    },
    column: {
        flex: 1,
    }
};

Columns.listenTo(columnsStore);

module.exports = Columns;
