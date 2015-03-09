var fs = require('fs');
var path = require('path');
var app = require('app');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

app.on('window-all-closed', function () {
  app.quit();
});

var mainWindow;

function getEnv() {
  var env = process.env.NODE_ENV;
  if (env) return env;
  var envPath = path.join(__dirname, 'NODE_ENV');
  if (fs.existsSync(envPath)) {
    return fs.readFileSync(envPath, {encoding: 'utf-8'}).trim();
  }
  return 'development';
}

process.env.NODE_ENV = getEnv();

app.on('ready', function () {
  mainWindow = new BrowserWindow({});
  mainWindow.loadUrl('file://' + __dirname + '/blank.html');
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
