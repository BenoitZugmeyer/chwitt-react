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

if (!process.env.NODE_ENV) {
    let envPath = path.join(__dirname, 'NODE_ENV');
    if (fs.existsSync(envPath)) {
        process.env.NODE_ENV = fs.readFileSync(envPath, {encoding: 'utf-8'}).trim();
    }
    else {
        process.env.NODE_ENV = 'development';
    }
}

app.on('ready', function () {
    mainWindow = new BrowserWindow({});
    mainWindow.loadUrl('file://' + path.join(__dirname, 'blank.html'));
    if (process.env.NODE_ENV !== 'production') {
        mainWindow.openDevTools();
    }
    mainWindow.webContents.executeJavaScript(
        `
        process.env.NODE_ENV = require('remote').process.env.NODE_ENV;
        require('./bootstrap-jsx');
        require('./src/launch');
        `
    );
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});
