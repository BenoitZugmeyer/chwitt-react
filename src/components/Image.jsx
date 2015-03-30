'use strict';
let React = require('react');
let Component = require('chwitt-react/Component');
let makeProtocol = require('chwitt-react/makeProtocol');
let asserts = require('chwitt-react/asserts');
let Link = require('./Link');

const PREVIEW_HEIGHT = 200;


class Image extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cropShadow: props.preview,
        };
    }

    render() {
        let { preview, title, shadow, link } = this.props;

        return <div className={this.style('main', preview && 'preview', shadow && 'shadow')}>
            {title &&
                <div className={this.style('title')}>
                    {link ?
                        <Link href={link} light={true}>{title}</Link> :
                        title
                    }
                </div>
            }
            <img
                ref="img"
                onLoad={this.onLoad.bind(this)}
                src={this.getSrc()}
                className={this.style('img', preview && 'imgPreview')} />
            {this.state.cropShadow ? <div className={this.style('cropShadow')} /> : ''}
        </div>;
    }

    getSrc() {
        return makeProtocol(this.props.image.src);
    }

    onLoad() {
        if (this.props.preview) {
            this.setState({
                cropShadow: this.refs.img.getDOMNode().getBoundingClientRect().height > PREVIEW_HEIGHT,
            });
        }
    }
}

Image.propTypes = {
    image: asserts.isImage.prop,
    preview: asserts.option(asserts.isBoolean).prop,
    shadow: asserts.option(asserts.isBoolean).prop,
    title: asserts.option(asserts.isString).prop,
    link: asserts.option(asserts.isString).prop,
};

Image.defaultProps = {
    preview: false,
};

Image.styles = {
    main: {
        position: 'relative',
    },

    preview: {
        height: PREVIEW_HEIGHT,
        overflow: 'hidden',
    },

    cropShadow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 5,
        backgroundColor: 'rgba(255, 255, 255, .4)',
    },

    img: {
        maxWidth: '100%',
        display: 'block',
        margin: [0, 'auto'],
    },

    imgPreview: {
        minHeight: '100%',
        objectFit: 'cover',
    },

    title: {
        color: 'white',
        position: 'absolute',
        padding: [5, 10],
        backgroundColor: 'rgba(0, 0, 0, .8)',
        top: 0,
        left: 0,
        right: 0,
    },

    shadow: {
        margin: 10,
        boxShadow: '0 0 10px rgba(0, 0, 0, .8)',
        display: 'inline-block',
        verticalAlign: 'middle',
    },

};

module.exports = Image;
