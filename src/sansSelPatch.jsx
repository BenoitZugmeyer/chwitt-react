'use strict';
let React = require('react');
let ReactCurrentOwner = require('react/lib/ReactCurrentOwner');

let original = React.createElement.__beforePatchedForSansSel || React.createElement;
React.createElement = function (type, config) {
    if (config && config.styles) {
        if (config.className) throw new Error(`An element can\'t have both a className and a styles`);
        let styles = config.styles;
        if (typeof styles === 'string') styles = styles.split(' ').map(s => s.trim());
        let component = ReactCurrentOwner.current.getPublicInstance();
        config.className = component.style.apply(component, styles);
        delete config.styles;
    }
    return original.apply(this, arguments);
};
React.createElement.__beforePatchedForSansSel = original;
