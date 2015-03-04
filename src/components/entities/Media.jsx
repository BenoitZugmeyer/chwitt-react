'use strict';
var Component = require('chwitt-react/Component');
var Images = require('chwitt-react/components/Images');

class MediaEntity extends Component {

    render() {
        var images = this.props.entities.map(e => {
            var src = e.media_url_https || e.media_url;
            if (e.sizes.large) {
                src += ':large';
            }

            var video;

            if (e.video_info) {
                video = {
                    src: e.video_info.variants[0].url,
                };

                if (e.type === 'animated_gif') {
                    video.autoPlay = true;
                    video.loop = true;
                }
                else {
                    video.controls = true;
                }
            }

            return { src, video };
        });

        return <Images images={images} />;
    }

}

MediaEntity.propTypes = {
    entities: React.PropTypes.array.isRequired,
};

module.exports = MediaEntity;
