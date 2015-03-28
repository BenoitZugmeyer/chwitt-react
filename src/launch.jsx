'use strict';

require('babel').polyfill();

require('./componentDidMovePatch');
require('./sansSelPatch');

let React = require('react');

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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});
document.body.className = ss.render('body');


React.render(React.createElement(App), document.body);


actions.verifyTokens();
