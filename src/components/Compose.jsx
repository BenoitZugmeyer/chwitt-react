'use strict';
let punycode = require('punycode');

let Component = require('chwitt-react/Component');
let ss = require('chwitt-react/ss');
let actions = require('../actions');
let composeStore = require('../stores/compose');
let FloatingBubble = require('./FloatingBubble');

class Compose extends Component {

    constructor(props) {
        super(props);
        this.state = Object.assign({
            charCount: 0,
        }, this.getStateFromStores());
    }

    getStateFromStores() {
        return {
            loading: composeStore.loading,
            errors: composeStore.errors,
            text: composeStore.text,
        };
    }

    onChange() {
        if (this.state.loading && !composeStore.loading) {
            FloatingBubble.hide();
        }
        else {
            this.setState(this.getStateFromStores());
        }
    }

    render() {
        let loading = this.state.loading;
        let text = this.state.text;
        return <div>
            {!!this.state.errors.length &&
                <ul styles="errors">
                    {this.state.errors.map((e, i) => <li key={i}>{e.message}</li>)}
                </ul>
            }
            <textarea ref="text" styles="text" disabled={loading} onChange={this.onTextChange.bind(this)} value={text} />
            <div styles="buttons">
                <span styles={['count', this.state.charCount > 140 && 'countError']}>{this.state.charCount} / 140</span>
                &nbsp;
                <button styles="submit" type="button" disabled={loading} onClick={this.onSubmit.bind(this)}>Tweet</button>
            </div>
        </div>;
    }

    componentDidMount() {
        super.componentDidMount();
        this.refs.text.getDOMNode().focus();
    }

    getText() {
        return this.refs.text.getDOMNode().value;
    }

    onTextChange() {
        let text = this.getText();
        let charCount = punycode.ucs2.decode(text).length;
        this.setState({ charCount, text });
        actions.saveTweetDraft({ text });
    }

    onSubmit() {
        actions.sendTweet({ status: this.getText() });
    }

}

Compose.listenTo(composeStore);

Compose.styles = {

    text: {
        $text: true,
        display: 'block',
        resize: 'none',
        height: '7em',
        width: 200,
    },

    buttons: {
        textAlign: 'right',
        marginTop: ss.vars.gap,
    },

    submit: {
        $button: true,
    },

    errors: {
        color: ss.vars.errorColor,
        listStyleType: 'none',
        padding: 0,
        margin: [0, 0, ss.vars.gap],
    },

    count: {
    },

    countError: {
        color: ss.vars.errorColor,
        fontWeight: 'bold',
    },

};

module.exports = Compose;

