'use strict';
var Component = require('chwitt-react/Component');

class Column extends Component {

    render() {
        return <div styles="main">
            {this.renderHeader()}
            {this.renderContent()}
        </div>;
    }

    renderHeader() {
        return <h1 styles="title">{this.props.column.title}</h1>;
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
