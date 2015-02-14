'use strict';
var Store = require('chwitt-react/Store');

class ColumnsStore extends Store {

    constructor() {
        super();

        this.columns = [
            {
                name: 'home',
                type: 'Timeline',
                query: 'statuses/home_timeline',
                title: 'Home',
            },
            {
                name: 'mentions',
                type: 'Timeline',
                query: 'statuses/mentions_timeline',
                title: 'Mentions',
            },
        ];
    }

}

module.exports = new ColumnsStore();
