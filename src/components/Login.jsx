var React = require('react');
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
                    <input
                        ref="username"
                        styles="input"
                        type="text"
                        placeholder="User name or e-mail"
                        defaultValue="" />
                </label>
                <label styles="field">
                    <input
                        ref="password"
                        styles="input"
                        type="password"
                        placeholder="Password"
                        defaultValue="" />
                </label>
                <input type="submit" disabled={this.state.loading} />
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
    },

    errors: {
        color: 'red',
    }
};

Login.listenTo(userStore);

module.exports = Login;
