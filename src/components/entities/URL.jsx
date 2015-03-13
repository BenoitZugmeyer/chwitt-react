'use strict';
var Component = require('chwitt-react/Component');
var resolveURL = require('chwitt-react/resolveURL');
var Link = require('chwitt-react/components/Link');
var TweetMedias = require('chwitt-react/components/TweetMedias');

function displayableURL(url) {
    var match = /\/\/(.*?)\/?$/.exec(url);
    url = match ? match[1] : url;
    if (url.length > 20) url = url.slice(0, 20) + '\u2026';
    return url;
}

class URLEntity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            infos: { pageURL: props.entity.expanded_url },
            infosResolved: false,
        };
    }

    componentWillMount() {
        if (!this.state.infosResolved) {
            var url = this.state.infos.pageURL;
            var infos = resolveURL.getFromCache(url);
            if (infos) {
                this.setState({ infos });
            }
            else {
                resolveURL(url)
                .then(infos => this.setState({ infos }))
                .catch(e => console.error(e.stack));
            }
        }
    }

    render() {
        var infos = this.state.infos;
        var title = infos.pageTitle || displayableURL(infos.pageURL + '/');

        var videos = infos.videos || infos.video ? [infos.video] : [];
        var images = infos.images || infos.image ? [infos.image] : [];

        if (videos.length || images.length) {
            return <TweetMedias videos={videos} images={images} link={infos.pageURL} title={title} />;
        }
        return <Link href={infos.pageURL}>{title}</Link>;
    }
}

URLEntity.styles = {
    main: {
        wordWrap: 'break-word'
    }
};

module.exports = URLEntity;
