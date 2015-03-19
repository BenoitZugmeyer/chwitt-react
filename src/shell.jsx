var window = require('./window');
try {
    var gui = window.require('nw.gui');
    exports.openExternal = gui.Shell.openExternal;
}
catch (e) {
    console.log(e.stack);
    var shell = require('shell');
    exports.openExternal = shell.openExternal;
}
