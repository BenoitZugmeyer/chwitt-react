'use strict';

require('babel').polyfill();

// Global React so we don't have to include it in every jsx files, and eslint won't bother
var React = global.React = require('react');

if (process.env.NODE_ENV !== 'production') {
    global.Perf = require('react/lib/ReactDefaultPerf');
}

var App = require('./components/App');
var { document } = require('./window');
var actions = require('./actions');

var ss = require('chwitt-react/ss');
ss.add('body', {
    fontFamily: 'Verdana',
    fontSize: 12,
    lineHeight: 1.4,
    margin: 0,
    height: '100vh',
});
document.body.className = ss.render('body');


React.render(<App />, document.body);


actions.verifyTokens();
