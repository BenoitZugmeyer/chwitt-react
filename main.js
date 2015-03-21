'use strict';
let fs = require('fs');
let path = require('path');
let app = require('app');
let BrowserWindow = require('browser-window');

require('crash-reporter').start();

app.on('window-all-closed', function () {
    app.quit();
});

let mainWindow;

function getEnv() {
    let env = process.env.NODE_ENV;
    if (env) return env;
    let envPath = path.join(__dirname, 'NODE_ENV');
    if (fs.existsSync(envPath)) {
        return fs.readFileSync(envPath, {encoding: 'utf-8'}).trim();
    }
    return 'development';
}

process.env.NODE_ENV = getEnv();

app.on('ready', function () {
    mainWindow = new BrowserWindow({});
    mainWindow.loadUrl('file://' + path.join(__dirname, 'blank.html'));
    if (process.env.NODE_ENV === 'production') {
        mainWindow.webContents.executeJavaScript('require("./src/launch");');
    }
    else {
        mainWindow.openDevTools();
        mainWindow.webContents.executeJavaScript('require("./bootstrap-jsx"); require("./src/launch");');
    }
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});
