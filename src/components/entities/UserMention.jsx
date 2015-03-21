'use strict';
let Entity = require('chwitt-react/components/Entity');
let actions = require('chwitt-react/actions');

class UserMentionEntity extends Entity {
    render() {
        let entity = this.props.entity;
        return <span
            styles={this.props.light ? "link-light" : "link"}
            onClick={this.onClick.bind(this)}>
            @{entity.screen_name}
        </span>;
    }

    onClick() {
        actions.openUserTimeline({
            id: this.props.entity.id_str,
            after: this.props.column.name
        });
    }
}

module.exports = UserMentionEntity;
