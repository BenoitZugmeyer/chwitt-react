'use strict';
var Component = require('chwitt-react/Component');
var asserts = require('chwitt-react/asserts');

class Avatar extends Component {

    render() {
        return <div styles="main">
            <img styles="img" src={this.props.user.profile_image_url_https} />
        </div>;
    }

}

Avatar.propTypes = {
    user: asserts.isUser.prop,
};

Avatar.styles = {
    main: {
        $rounded: true,
        overflow: 'hidden',
        display: 'inline-block',
    },

    img: {
        display: 'block',
    }
};

module.exports = Avatar;
