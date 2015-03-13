'use strict';
var Component = require('chwitt-react/Component');
var asserts = require('chwitt-react/asserts');

class Entity extends Component {

}

Entity.propTypes = {
    entity: asserts.isObject.prop,
    column: asserts.isColumn.prop,
};

module.exports = Entity;
