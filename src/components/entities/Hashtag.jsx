var React = require('react');
var Component = require('chwitt-react/Component');

class HashtagEntity extends Component {
    render() {
        var entity = this.props.entity;
        return <span className={this.style('link')}>
            #{entity.text}
        </span>;
    }
}

module.exports = HashtagEntity;
