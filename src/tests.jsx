'use strict';

module.exports = function tests(name, fn) {
    if (process.env.NODE_ENV === 'test') {
        console.log('Running', name);
        fn();
    }
};
