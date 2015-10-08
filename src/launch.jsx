'use strict';

require('babel').polyfill();

require('./componentDidMovePatch');
require('./sansSelPatch');

let React = require('react');
let ReactDOM = require('react-dom');

if (process.env.NODE_ENV !== 'production') {
    global.Perf = require('react/lib/ReactDefaultPerf');
}

let App = require('./components/App');
let { document } = require('./window');
let actions = require('./actions');

let ss = require('chwitt-react/ss');
ss.add('body', {
    fontFamily: 'sans-serif',
    fontSize: 13,
    lineHeight: 1.4,
    letterSpacing: .2,
    margin: 0,
    height: '100vh',
});

ss.add('container', {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

document.body.className = ss.render('body');

const container = document.createElement('div');

container.className = ss.render('container');
ReactDOM.render(React.createElement(App), container);

document.body.appendChild(container);

actions.verifyTokens();
