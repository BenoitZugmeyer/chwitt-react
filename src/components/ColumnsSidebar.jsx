'use strict';
var tweenState = require('react-tween-state');

var Component = require('chwitt-react/Component');
var columnsStore = require('chwitt-react/stores/columns');
var ss = require('chwitt-react/ss');
var Scroller = require('chwitt-react/components/Scroller');
var actions = require('chwitt-react/actions');

class ColumnsSidebar extends Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(
            this.getStateFromStores(),
            this.getVisibilityPosition()
        );
        this.applyMixin(tweenState.Mixin);
    }

    getStateFromStores() {
        return {
            columns: columnsStore.columns,
        };
    }

    getVisibilityPosition() {
        var firstVisibleIndex = columnsStore.firstVisibleIndex;
        var visibleCount = columnsStore.visibleCount;

        return {
            visibilityTop: firstVisibleIndex * (ss.vars.avatarSize + ss.vars.gap) + ss.vars.gap / 2,
            visibilityHeight: visibleCount * (ss.vars.avatarSize + ss.vars.gap),
        };
    }

    onChange() {
        var position = this.getVisibilityPosition();

        this.tweenState('visibilityTop', {
            duration: 200,
            endValue: position.visibilityTop,
        });

        this.tweenState('visibilityHeight', {
            duration: 200,
            endValue: position.visibilityHeight,
        });

        this.setState(this.getStateFromStores());
    }

    render() {
        var renderColumn = column => {
            return <div styles="column" onClick={this.onShowColumn.bind(this, column)}></div>;
        };
        var visibilityStyle = {
            top: this.getTweeningValue('visibilityTop'),
            height: this.getTweeningValue('visibilityHeight'),
        };

        return <div styles="main">
            <Scroller styles="scroller">
                <div styles="visibility" style={visibilityStyle}></div>
                {this.state.columns.map(renderColumn)}
            </Scroller>
        </div>;
    }

    onShowColumn(column) {
        actions.setFirstVisibleColumn(column.name);
    }
}

ColumnsSidebar.listenTo(columnsStore);

ColumnsSidebar.styles = {

    main: {
        flexShrink: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: ss.vars.avatarSize + 2 * ss.vars.gap,
    },

    column: {
        $button: true,
        marginTop: ss.vars.gap,
        height: ss.vars.avatarSize,
        width: ss.vars.avatarSize,
        zIndex: 1,
        'last-child': {
            marginBottom: ss.vars.gap,
        },
        flexShrink: 0,
    },

    visibility: {
        position: 'absolute',
        backgroundColor: '#BDC3C7',
        left: -ss.vars.gap,
        right: -ss.vars.gap,
    },

    scroller: {
        position: 'relative',
        overflow: 'auto',
        ':-webkit-scrollbar': {
            display: 'none',
        },
        marginBottom: ss.vars.gap,

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },

};

module.exports = ColumnsSidebar;

