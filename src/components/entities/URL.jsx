'use strict';
let React = require('react');
let Entity = require('chwitt-react/components/Entity');
let resolveURL = require('chwitt-react/resolveURL');
let Link = require('chwitt-react/components/Link');
let TweetMedias = require('chwitt-react/components/TweetMedias');

function displayableURL(url) {
    let match = /\/\/(.*?)\/?$/.exec(url);
    url = match ? match[1] : url;
    if (url.length > 20) url = url.slice(0, 20) + '\u2026';
    return url;
}

class URLEntity extends Entity {

    constructor(props) {
        super(props);
        this.state = {
            infos: { pageURL: props.entity.expanded_url },
            infosResolved: false,
        };
    }

    componentWillMount() {
        if (!this.state.infosResolved) {
            let url = this.state.infos.pageURL;
            let infos = resolveURL.getFromCache(url);
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
        let infos = this.state.infos;
        let title = infos.pageTitle || displayableURL(infos.pageURL + '/');

        if (this.props.preview) {
            let videos = infos.videos || (infos.video ? [infos.video] : []);
            let images = infos.images || (infos.image ? [infos.image] : []);

            if (videos.length || images.length) {
                return <TweetMedias videos={videos} images={images} link={infos.pageURL} title={title} />;
            }
        }
        return <Link href={infos.pageURL} light={this.props.light}>{title}</Link>;
    }
}

URLEntity.styles = {
    main: {
        wordWrap: 'break-word'
    }
};

module.exports = URLEntity;
