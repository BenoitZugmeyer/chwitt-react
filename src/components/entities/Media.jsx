'use strict';
let React = require('react');
let Entity = require('chwitt-react/components/Entity');
let asserts = require('chwitt-react/asserts');
let TweetMedias = require('chwitt-react/components/TweetMedias');
let mime = require('../../mime');

class MediaEntity extends Entity {

    render() {
        let images = [];
        let videos = [];

        for (let entity of this.props.entities) {
            let src = entity.media_url_https || entity.media_url;
            if (entity.sizes.large) {
                src += ':large';
            }

            if (entity.video_info) {
                for (let variant of entity.video_info.variants) {
                    if (mime.isVideo(variant.content_type)) {
                        videos.push({
                            thumbnail: { src },
                            src: variant.url,
                            type: entity.type,
                        });
                        break;
                    }
                }
            }
            else {
                images.push({ src });
            }
        }

        return <TweetMedias images={images} videos={videos} />;
    }

}

MediaEntity.propTypes = {
    entities: asserts.arrayOf(asserts.isObject).prop,
};

module.exports = MediaEntity;
