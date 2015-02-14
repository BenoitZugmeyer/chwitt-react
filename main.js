
var app = require('app');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

app.on('window-all-closed', function () {
  app.quit();
});

var mainWindow;

app.on('ready', function () {
  mainWindow = new BrowserWindow({});
  mainWindow.loadUrl('file://' + __dirname + '/blank.html');
  mainWindow.openDevTools();
  mainWindow.webContents.executeJavaScript('require("./bootstrap-jsx"); require("./src/launch");');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
});
