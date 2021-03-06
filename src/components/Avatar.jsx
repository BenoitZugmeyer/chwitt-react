'use strict';
let React = require('react');
let Component = require('chwitt-react/Component');
let asserts = require('chwitt-react/asserts');

class Avatar extends Component {

    render() {
        let onClick = this.props.onClick;
        return <div styles={['main', this.props.mainStyle]}>
            <img
                styles={['img', onClick && 'clickable']}
                onClick={onClick}
                src={this.props.user.profile_image_url_https} />
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
        display: 'block',
    },

    img: {
        display: 'block',
    },

    clickable: {
        $button: true,
        padding: 0,
        backgroundColor: 'transparent',
    },
};

module.exports = Avatar;
