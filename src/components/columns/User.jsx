'use strict';
let React = require('react');
let Timeline = require('./Timeline');
let Avatar = require('chwitt-react/components/Avatar');
let actions = require('chwitt-react/actions');
let usersStore = require('chwitt-react/stores/users');
let l10n = require('chwitt-react/l10n');
let ss = require('chwitt-react/ss');
let entities = require('chwitt-react/components/entities');

class User extends Timeline {

    getStateFromStores() {
        let userId = this.props.column.userId;
        return Object.assign(super.getStateFromStores(), {
            userLoaded: usersStore.isLoaded(userId),
            user: usersStore.get(userId),
        });
    }

    componentWillMount() {
        super.componentWillMount();
        if (!this.state.userLoaded) {
            actions.loadUser(this.props.column.userId);
        }
    }

    renderHeader() {
        let user = this.state.user;
        if (!user) return null;
        let style = {
            backgroundColor: `#${user.profile_background_color}`,
        };
        if (user.profile_banner_url) {
            style.backgroundImage = `url(${user.profile_banner_url})`;
        }

        let description = user.url && entities.renderTextWithEntities(user.description, [user.entities.description], {
            column: this.props.column,
            light: true,
            preview: false
        });

        let url = user.url && entities.renderTextWithEntities(user.url, [user.entities.url], {
            column: this.props.column,
            light: true,
            preview: false
        });

        return <div style={style} styles="header">
            <Avatar user={user} mainStyle={this.getStyle('avatar')} />
            <div styles="infos">
                <div styles="name">
                    <div styles="realName">{user.name}</div>
                    <div styles="screenName">@{user.screen_name}</div>
                    {this.renderSettingsIcon()}
                </div>
                {description && <div styles="description">{description}</div>}
                {url && <div styles="url">{url}</div>}
                <div styles="counts">
                    <div styles="count">{l10n.formatNumber(user.statuses_count)} tweets</div>
                    <div styles="count">{l10n.formatNumber(user.friends_count)} friends</div>
                    <div styles="count">{l10n.formatNumber(user.followers_count)} followers</div>
                </div>
            </div>
        </div>;
    }

}

User.listenTo(usersStore);

User.styles = {
    header: {
        inherit: 'header',
        display: 'flex',
        backgroundSize: 'cover',
        alignItems: 'flex-start',
        padding: 0,
    },
    avatar: {
        margin: ss.vars.gap,
        $smallBoxShadow: true,
    },
    infos: {
        color: '#fff',
        margin: `${ss.vars.gap}px ${ss.vars.gap}px ${ss.vars.gap}px 0`,
        backgroundColor: 'rgba(0, 0, 0, .8)',
        $rounded: true,
        padding: `4px ${ss.vars.gap}`,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: ss.vars.avatarSize,
        boxSizing: 'border-box',
    },
    name: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    realName: {
        fontWeight: 'bold',
        flexShrink: 1,
        wordBreak: 'break-word',
    },
    screenName: {
        textAlign: 'right',
        flexShrink: 1,
        marginLeft: ss.vars.gap,
    },
    description: {
        marginTop: 5,
    },
    counts: {
        display: 'flex',
        marginTop: 5,
    },
    count: {
        textAlign: 'center',
        flex: 1,
        $smallFontSize: true,
    },
    url: {
        marginTop: 5,
    },
    settingsIcon: {
        inherit: 'settingsIcon',
        $cogWheelIcon: '#BDC3C7',
    },
};

module.exports = User;
