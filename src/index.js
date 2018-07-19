const { app, BrowserWindow } = require('electron')
const childProcess = require('child_process')
const shellPath = require('shell-path')

const READY_REGEX = /Ready on http:\/\/localhost:(\d+)/

let vueCliProcess

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
  })

  vueCliProcess = childProcess.spawn('vue', ['ui', '--headless'], {
    env: Object.assign({}, process.env, {
      PATH: shellPath.sync(),
    }),
  })

  vueCliProcess.stdout.on('data', chunk => {
    const message = chunk.toString()
    const isReady = READY_REGEX.test(message)

    if (isReady) {
      const [_all, port] = READY_REGEX.exec(message)

      window.loadURL(`http://localhost:${port}/project/select`)
      window.show()
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (vueCliProcess) vueCliProcess.kill()
})

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
