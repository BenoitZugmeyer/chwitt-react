'use strict';
var Component = require('chwitt-react/Component');

class UserMentionEntity extends Component {
    render() {
        var entity = this.props.entity;
        return <span className={this.style('link')}>@{entity.screen_name}</span>;
    }
}

module.exports = UserMentionEntity;
