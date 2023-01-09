const { app, BrowserWindow } = require('electron');
const path = require('path');
const ejse = require('ejs-electron')
const { dialog } = require('electron')

if (require('electron-squirrel-startup')) { 
  app.quit();
}
app.disableHardwareAcceleration();
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: __dirname + '/img/logo.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  mainWindow.loadURL(path.join(path.join('file://', __dirname), 'index.ejs'));
  // mainWindow.maximize();
  mainWindow.webContents
    .setVisualZoomLevelLimits(1, 5)
    .then(console.log("Zoom Levels Have been Set between 100% and 500%"))
    .catch((err) => console.log(err));
  mainWindow.setMenu(null);
  // mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});




