'use strict';
var Column = require('chwitt-react/components/Column');
var TweetList = require('chwitt-react/components/TweetList');
var timelinesStore = require('chwitt-react/stores/timelines');
var actions = require('chwitt-react/actions');

class Timeline extends Column {

    constructor(props) {
        super(props);
        this.state = this.getStateFromStores();
    }

    getStateFromStores() {
        var query = this.props.column.query;
        return {
            loaded: timelinesStore.isLoaded(query),
            timeline: timelinesStore.get(query),
        };
    }

    onChange() {
        this.setState(this.getStateFromStores());
    }

    componentWillMount() {
        if (!this.state.loaded) {
            actions.loadTimeline(this.props.column.query);
        }
    }

    renderContent() {
        if (!this.state.loaded) return <div>Loading...</div>;
        return <div styles="content"><TweetList tweets={this.state.timeline} column={this.props.column} /></div>;
    }

}

Timeline.listenTo(timelinesStore);

Timeline.styles = {
    content: {
        flex: 1,
        display: 'flex',
    },
};

module.exports = Timeline;
