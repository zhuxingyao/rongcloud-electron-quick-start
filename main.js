// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const RCInit = require('@rongcloud/electron')
// 主进程

let rcService

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('api-test-v5/index.html')
  // mainWindow.loadFile('index.html')
    // mainWindow.loadURL('http://127.0.0.1:5173/')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  
   // 在 app 的 ready 事件通知后进行初始化
   rcService = RCInit({
    /**
     * 【必填】Appkey , 自 5.6.0 版本起，必须填该参数
     * [option]
     */
    appkey: 'c9kqb3rdc25yj',
    /**
     * 【选填】消息数据库的存储位置，不推荐修改
     * [option]
     */
    dbPath: app.getPath('userData'),
    /**
     * 【选填】日志等级
     * [option] 0 - DEBUG, 1 - INFO, 2(default) - WARN, 3 - ERROR
     */
    logLevel: 2,
    /**
     * 【选填】当需要对 SDK 内的日志落盘时，在此实现落盘方法
     * [option]
     */
    logStdout (logLevel, tag, ...args) {
      console.log(tag, ...args)
    }
  })
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  app.on('before-quit', () => {
    // 在 app 退出时清理状态
    rcService.getCppProto().destroy()
  })
  function handleOpenWindow () {
    const mainWindow = new BrowserWindow({
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: false,
        nodeIntegration: true
      }
    })
    mainWindow.loadFile('api-test-v5/index.html')
  }
  ipcMain.on('open-window', handleOpenWindow)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
