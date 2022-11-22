// Modules to control application life and create native browser window
const {app, BrowserWindow, desktopCapturer,mainWindow,ipcMain} = require('electron')
const path = require('path')

const RongIMLib = require('@rongcloud/electron-solution')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  // mainWindow.loadFile('calllib-v5-demo/index.html')
  mainWindow.loadFile('rtclib-v5-meeting/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.commandLine.appendSwitch('ignore-certificate-errors')
// app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
//   //允许私有证书
//   event.preventDefault()
//   callback(true)
// });
app.whenReady().then(() => {
  const rcService = RongIMLib({
    /**
     * [option]
     */
    dbPath: app.getPath('userData'),
    /**
     * [option] 0 - DEBUG, 1 - INFO, 2(default) - WARN, 3 - ERROR
     */
    logLevel: 2,
    /**
     * [option]
     */
    logStdout (logLevel, tag, ...args) {
      console.log(tag, ...args)
    }
  })

  createWindow()
  ipcMain.on('GET_SOURCE_LIST',(event)=>{
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
      event.sender.send('SET_SOURCE_LIST', sources)
    })
  })
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('before-quit', () => {
    rcService.getCppProto().destroy()
  })
  
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
