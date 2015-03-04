'use strict';
var Component = require('chwitt-react/Component');
var actions = require('chwitt-react/actions');

class UserMentionEntity extends Component {
    render() {
        var entity = this.props.entity;
        return <span styles="link" onClick={this.onClick.bind(this)}>@{entity.screen_name}</span>;
    }

    onClick() {
        actions.openUserTimeline(this.props.entity.id_str);
    }
}

module.exports = UserMentionEntity;
