'use strict';
var Component = require('chwitt-react/Component');
var makeProtocol = require('chwitt-react/makeProtocol');
var asserts = require('chwitt-react/asserts');
var Link = require('./Link');

var maxHeight = 200;


class Image extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cropShadow: props.preview,
        };
    }

    render() {
        var title;
        if (this.props.title) {
            title = <div className={this.style('title')}>{
                this.props.link ?
                    <Link href={this.props.link} light={true}>{this.props.title}</Link> :
                    this.props.title
            }</div>;
        }

        return <div className={this.style('main', this.props.preview && 'preview', this.props.shadow && 'shadow')}>
            {title}
            <img
                ref="img"
                onLoad={this.onLoad.bind(this)}
                src={this.getSrc()}
                className={this.style('img')} />
            {this.state.cropShadow ? <div className={this.style('cropShadow')} /> : ''}
        </div>;
    }

    getSrc() {
        return makeProtocol(this.props.image.src);
    }

    onLoad() {
        if (this.props.preview) {
            this.setState({
                cropShadow: this.refs.img.getDOMNode().getBoundingClientRect().height > maxHeight,
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
        maxHeight,
        overflow: 'hidden'
    },

    cropShadow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 10,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
    },

    img: {
        maxWidth: '100%',
        display: 'block',
        margin: [0, 'auto'],
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
