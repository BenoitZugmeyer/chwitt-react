'use strict';
let Component = require('chwitt-react/Component');
let asserts = require('chwitt-react/asserts');
let makeProtocol = require('chwitt-react/makeProtocol');

class Video extends Component {
    render() {
        let props = {
            controls: true,
        };
        if (this.props.video.type === 'animated_gif') {
            props.autoPlay = true;
            props.loop = true;
            props.controls = false;
        }

        return <video src={this.getSrc()} {...props} />;
    }

    getSrc() {
        let video = this.props.video;
        let src = video.src || video.quality.high || video.quality.medium || video.quality.low;
        return makeProtocol(src);
    }
}

Video.propTypes = {
    video: asserts.isVideo.prop,
};

Video.defaultProps = {
    controls: true,
    loop: false,
    autoPlay: false,
};

module.exports = Video;

