'use strict';
var Component = require('chwitt-react/Component');
var asserts = require('chwitt-react/asserts');
var Image = require('./Image');
var Overlay = require('./Overlay');

class Images extends Component {
    render() {
        var images = this.props.images;
        var hasVideo = images.some(i => i.video);
        return <div className={this.style('main')}>
            <Overlay content={this.renderContent.bind(this)}>
                <Image title={this.props.title} link={this.props.link} src={images[0].src} preview={true} />
                <div className={this.style('badges')}>
                    {hasVideo ? <div className={this.style('play')}>&#9654;</div> : ''}
                    {images.length > 1 ? <div className={this.style('count')}>{images.length}</div> : ''}
                </div>
            </Overlay>
        </div>;
    }

    renderContent() {
        return <div className={this.style('overlay')}>
            {this.props.images.map(
                (img, i) => <div key={i} className={this.style('overlayImage')}>
                    <Image src={img.src} video={img.video} shadow={true} />
                </div>
            )}
        </div>;
    }
}

Images.propTypes = {
    images: asserts.all(
        asserts.instanceOf(Array),
        asserts.arrayOf(asserts.isImage)
    ).prop,
};

Images.styles = {
    main: {
        position: 'relative'
    },

    badges: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },

    badge: {
        backgroundColor: '#3498DB',
        boxShadow: '0 0 5px rgba(0, 0, 0, .8)',
        color: 'white',
        borderRadius: 1000,
        padding: 5,
        width: 20,
        height: 20,
        marginLeft: 5,
        textAlign: 'center',
        lineHeight: '20px',
        display: 'inline-block',
    },

    count: {
        inherit: 'badge',
    },

    overlayImage: {
        display: 'inline-block',
    },

    overlay: {
        textAlign: 'center',
    },

    play: {
        inherit: 'badge',
    }
};

module.exports = Images;
