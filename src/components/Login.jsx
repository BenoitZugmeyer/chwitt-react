'use strict';
var Component = require('chwitt-react/Component');
var actions = require('chwitt-react/actions');
var userStore = require('chwitt-react/stores/user');


class Login extends Component {

    constructor(props) {
        super(props);
        this.state = this.getStateFromActionStore();
    }

    render() {
        return <div>
            <ul styles="errors">
                {this.state.errors.map((e, i) => <li key={i}>{e.message}</li>)}
            </ul>
            <form onSubmit={this.onSubmit.bind(this)}>
                <label styles="field">
                    User name or e-mail
                    <input
                        ref="username"
                        styles="input"
                        type="text"
                        defaultValue="" />
                </label>
                <label styles="field">
                    Password
                    <input
                        ref="password"
                        styles="input"
                        type="password"
                        defaultValue="" />
                </label>
                <input type="submit" styles="button" disabled={this.state.loading} />
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
            this.refs.username.getDOMNode().value,
            this.refs.password.getDOMNode().value
        );
    }

}

Login.styles = {
    field: {
        display: 'block',
        margin: [30, 'auto'],
        maxWidth: '15em',
    },

    input: {
        width: '100%',
        border: '1px solid #34495E',
        $rounded: true,
        $inputPadding: true,
        outline: 0,
    },

    errors: {
        color: 'red',
    },

    button: {
        $button: true,
    },
};

Login.listenTo(userStore);

module.exports = Login;
