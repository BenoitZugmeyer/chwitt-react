'use strict';
var Entity = require('chwitt-react/components/Entity');

class HashtagEntity extends Entity {
    render() {
        var entity = this.props.entity;
        return <span className={this.style('link')}>
            #{entity.text}
        </span>;
    }
}

module.exports = HashtagEntity;
