'use strict';
var Store = require('chwitt-react/Store');

class ColumnsStore extends Store {

    constructor() {
        super();

        this.columns = [
            {
                name: 'home',
                type: 'Timeline',
                query: { route: 'statuses/home_timeline' },
                title: 'Home',
            },
            {
                name: 'mentions',
                type: 'Timeline',
                query: { route: 'statuses/mentions_timeline' },
                title: 'Mentions',
            },
        ];

        this.match(
            'openUserTimeline success',
            ({ arguments: { id } }) => {
                this.columns.push({
                    name: 'user_' + id,
                    type: 'Timeline',
                    query: { route: 'statuses/user_timeline', data: { user_id: id } }
                });
                this.trigger();
            }
        );

    }

}

module.exports = new ColumnsStore();
