'use strict';
var Component = require('chwitt-react/Component');

class Column extends Component {

    render() {
        var column = this.props.column;
        return <div styles="main">
            <h1 styles="title">{column.title}</h1>
            {this.renderContent()}
        </div>;
    }

    renderContent() {
    }

}

Column.styles = {
    main: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },

    title: {
        margin: 0,
    },
};

module.exports = Column;
