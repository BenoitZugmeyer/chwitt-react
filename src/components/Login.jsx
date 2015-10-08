'use strict';
let React = require('react');
let Component = require('chwitt-react/Component');
let actions = require('chwitt-react/actions');
let userStore = require('chwitt-react/stores/user');
let ss = require('../ss');


class Login extends Component {

    constructor(props) {
        super(props);
        this.state = this.getStateFromActionStore();
    }

    render() {
        let loading = this.state.loading;
        return <div styles="main">
            {!!this.state.errors.length &&
                <ul styles="errors">
                    {this.state.errors.map((e, i) => <li key={i}>{e.message}</li>)}
                </ul>
            }
            <form styles="form" onSubmit={this.onSubmit.bind(this)}>
                <label styles="field">
                    User name or e-mail
                    <input
                        ref="username"
                        styles="input"
                        type="text"
                        disabled={loading} />
                </label>
                <label styles="field">
                    Password
                    <input
                        ref="password"
                        styles="input"
                        type="password"
                        disabled={loading} />
                </label>
                <div styles="buttons">
                    <input type="submit" styles="button" disabled={loading} />
                </div>
            </form>
        </div>;
    }

    getStateFromActionStore() {
        return {
            errors: userStore.loginErrors,
            loading: userStore.loading,
        };
    }

    onChange() {
        this.setState(this.getStateFromActionStore());
    }

    onSubmit(e) {
        e.preventDefault();
        actions.loginWithCredentials(
            this.refs.username.value,
            this.refs.password.value
        );
    }

}

Login.styles = {
    main: {
        maxWidth: '15em',
    },

    form: {
        backgroundColor: '#BDC3C7',
        padding: ss.vars.gap,
        $rounded: true,
    },

    field: {
        display: 'block',
        marginBottom: ss.vars.gap,
    },

    input: {
        $text: true,
        width: '100%',
        boxSizing: 'border-box',
    },

    errors: {
        backgroundColor: ss.vars.errorColor,
        color: 'white',
        $rounded: true,
        padding: ss.vars.gap,
        fontWeight: 'bold',
        listStyleType: 'none',
        margin: `0 0 ${ss.vars.gap}px`,
    },

    buttons: {
        textAlign: 'right',
    },

    button: {
        $button: true,
    },
};

Login.listenTo(userStore);

module.exports = Login;
