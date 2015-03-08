'use strict';
var Component = require('chwitt-react/Component');

class Entity extends Component {

}

Entity.propTypes = {
    entity: React.PropTypes.object.isRequired,
    column: React.PropTypes.object.isRequired,
};

module.exports = Entity;
