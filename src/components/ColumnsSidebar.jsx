'use strict';
let React = require('react');
let tweenState = require('react-tween-state');

let Component = require('chwitt-react/Component');
let columnsStore = require('chwitt-react/stores/columns');
let ss = require('chwitt-react/ss');
let Scroller = require('chwitt-react/components/Scroller');
let actions = require('chwitt-react/actions');

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
        let firstVisibleIndex = columnsStore.firstVisibleIndex;
        let visibleCount = columnsStore.visibleCount;

        return {
            visibilityTop: firstVisibleIndex * (ss.vars.avatarSize + ss.vars.gap),
            visibilityHeight: visibleCount * (ss.vars.avatarSize + ss.vars.gap),
        };
    }

    onChange() {
        let position = this.getVisibilityPosition();

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
        let renderColumn = column => {
            return <div key={column.name} styles="column" onClick={this.onShowColumn.bind(this, column)}></div>;
        };
        let visibilityStyle = {
            top: this.getTweeningValue('visibilityTop'),
            height: this.getTweeningValue('visibilityHeight'),
        };

        return <div styles="main">
            <Scroller scrollbar="none" shadows internalStyle={this.getStyle('scrollerInner')}>
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
        position: 'relative',
        margin: `${ss.vars.gap / 2}px 0`,
        height: ss.vars.avatarSize,
        width: ss.vars.avatarSize,
        zIndex: 1,
        flexShrink: 0,
    },

    visibility: {
        position: 'absolute',
        backgroundColor: '#BDC3C7',
        left: 0,
        right: 0,
    },

    scrollerInner: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },

};

module.exports = ColumnsSidebar;

