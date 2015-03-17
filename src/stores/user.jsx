'use strict';
var Store = require('chwitt-react/Store');

class UserStore extends Store {

    constructor() {
        super();

        this.authenticated = false;
        this.user = {};
        this.loginErrors = [];
        this.loading = false;

        this.match([
            'verifyTokens pending',
            'loginWithCredentials pending' ],
            () => this.update({
                loading: true,
                loginErrors: [],
            })
        );

        this.match([
            'loginWithCredentials error',
            'verifyTokens error' ],
            ({ errors }) => this.update({
                loading: false,
                loginErrors: errors,
            })
        );

        this.match(
            'verifyTokens success',
            ({ user }) => this.update({
                loading: false,
                authenticated: true,
                loginErrors: [],
                user,
            })
        );

        this.match(
            'logout success',
            () => this.update({
                loading: false,
                authenticated: false,
                loginErrors: [],
                user: {},
            })
        );

    }
}

module.exports = new UserStore();
