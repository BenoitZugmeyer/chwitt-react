'use strict';
var Store = require('chwitt-react/Store');
var window = require('chwitt-react/window');

class WindowStore extends Store {

    constructor() {
        super();

        this.update();
        window.addEventListener('resize', this.update.bind(this));
    }

    update() {
        super.update({ width: window.innerWidth, height: window.innerHeight });
    }

}

module.exports = new WindowStore();
