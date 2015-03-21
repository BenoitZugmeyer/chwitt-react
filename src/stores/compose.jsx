'use strict';
let Store = require('chwitt-react/Store');

class ComposeStore extends Store {

    constructor() {
        super();

        this.text = '';
        this.errors = [];
        this.loading = false;

        this.match([
            'sendTweet pending', ],
            () => this.update({
                loading: true,
                errors: [],
            })
        );

        this.match([
            'sendTweet success', ],
            () => this.update({
                loading: false,
                errors: [],
                text: '',
            })
        );

        this.match([
            'sendTweet error', ],
            ({ errors }) => this.update({
                loading: false,
                errors,
            })
        );

        this.match(
            'saveTweetDraft success',
            ({ arguments: { text } }) => this.update({
                text
            })
        );

    }

}

module.exports = new ComposeStore();

