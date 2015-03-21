'use strict';
let Entity = require('chwitt-react/components/Entity');

class HashtagEntity extends Entity {
    render() {
        let entity = this.props.entity;
        return <span className={this.style('link')}>
            #{entity.text}
        </span>;
    }
}

module.exports = HashtagEntity;
