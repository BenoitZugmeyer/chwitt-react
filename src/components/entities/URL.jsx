var React = require('react');
var Component = require('chwitt-react/Component');
var resolveURL = require('chwitt-react/resolveURL');
var Image = require('chwitt-react/components/Image');
var Images = require('chwitt-react/components/Images');
var Overlay = require('chwitt-react/components/Overlay');
var Link = require('chwitt-react/components/Link');

function displayableURL(url) {
    var match = /\/\/(.*?)\/?$/.exec(url);
    url = match ? match[1] : url;
    if (url.length > 20)
        url = url.slice(0, 20) + '\u2026';
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

        function displayImage() {
            return <Image src={infos.image} shadow={true} />;
        }

        var content;
        if (infos.images) {
            content = <Images title={title} link={infos.pageURL} images={infos.images} />;
        }
        else if (infos.image) {
            content = <Overlay content={displayImage}>
                <Image title={title} link={infos.pageURL} src={infos.image} preview={true} />
            </Overlay>;
        }
        else {
            content = <Link href={infos.pageURL}>{title}</Link>;
        }

        return content;
    }
}

URLEntity.styles = {
    main: {
        wordWrap: 'break-word'
    }
};

module.exports = URLEntity;
