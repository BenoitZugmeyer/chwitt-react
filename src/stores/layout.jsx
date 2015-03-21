'use strict';
let Store = require('chwitt-react/Store');
let window = require('chwitt-react/window');
let ss = require('chwitt-react/ss');

class WindowStore extends Store {

    constructor() {
        super();

        this.update();
        window.addEventListener('resize', this.update.bind(this));
    }

    update() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        let sidebarWidth = ss.vars.avatarSize + 2 * ss.vars.gap;
        super.update({
            width,
            height,
            columnsAreaWidth: width - sidebarWidth,
            sidebarWidth,
        });
    }

}

module.exports = new WindowStore();
