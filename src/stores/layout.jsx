'use strict';
var Store = require('chwitt-react/Store');
var window = require('chwitt-react/window');
var ss = require('chwitt-react/ss');

class WindowStore extends Store {

    constructor() {
        super();

        this.update();
        window.addEventListener('resize', this.update.bind(this));
    }

    update() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var sidebarWidth = ss.vars.avatarSize + 2 * ss.vars.gap;
        super.update({
            width,
            height,
            columnsAreaWidth: width - sidebarWidth,
            sidebarWidth,
        });
    }

}

module.exports = new WindowStore();
