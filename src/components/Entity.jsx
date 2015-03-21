'use strict';
let Component = require('chwitt-react/Component');
let asserts = require('chwitt-react/asserts');

class Entity extends Component {

}

Entity.propTypes = {
    entity: asserts.isObject.prop,
    column: asserts.isColumn.prop,
    preview: asserts.option(asserts.isBoolean).prop,
    light: asserts.option(asserts.isBoolean).prop,
};

Entity.defaultProps = {
    preview: true,
    light: false,
};

module.exports = Entity;
