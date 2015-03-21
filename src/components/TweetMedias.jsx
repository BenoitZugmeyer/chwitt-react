'use strict';
let Component = require('chwitt-react/Component');
let asserts = require('chwitt-react/asserts');
let Image = require('./Image');
let Video = require('./Video');
let Overlay = require('./Overlay');

class TweetMedias extends Component {
    render() {
        let {videos, images} = this.props;
        let count = images.length + videos.length;
        if (count === 0) return <div></div>;

        let firstImage = images[0] || videos[0] && videos[0].thumbnail;

        let content;
        if (!firstImage) {
            content = 'todo';
        }
        else {
            content = <Image image={firstImage} preview={true} title={this.props.title} link={this.props.link} />;
        }

        return <div className={this.style('main')}>
            <Overlay content={this.renderContent.bind(this)}>
                {content}
                <div className={this.style('badges')}>
                    {videos.length ? <div className={this.style('play')}>&#9654;</div> : ''}
                    {count > 1 ? <div className={this.style('count')}>{count}</div> : ''}
                </div>
            </Overlay>
        </div>;
    }

    renderContent() {
        let {videos, images} = this.props;
        let render = (key, el) => (
            <div key={key} className={this.style('overlayImage')}>
                {el}
            </div>
        );

        return <div className={this.style('overlay')}>
            {images.map((image, i) => render(`image-${i}`, <Image image={image} shadow={true} />))}
            {videos.map((video, i) => render(`video-${i}`, <Video video={video} shadow={true} />))}
        </div>;
    }
}

TweetMedias.propTypes = {
    images: asserts.option(asserts.arrayOf(asserts.isImage)).prop,
    videos: asserts.option(asserts.arrayOf(asserts.isVideo)).prop,
    title: asserts.option(asserts.isString).prop,
    link: asserts.option(asserts.isString).prop,
};

TweetMedias.defaultProps = {
    images: [],
    videos: [],
};

TweetMedias.styles = {
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
        $smallBoxShadow: true,
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

module.exports = TweetMedias;
