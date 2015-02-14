/* @flow */

var React = require('react');
var App = require('./components/App');
var { document } = require('./window');
var actions = require('./actions');

var ss = require('chwitt-react/ss');
ss.add('body', {
    fontFamily: 'Verdana',
    fontSize: 12,
    margin: 0,
    height: '100vh',
});
document.body.className = ss.render('body');


React.render(<App />, document.body);


actions.verifyTokens();
