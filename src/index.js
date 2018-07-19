const { app, BrowserWindow } = require('electron')
const childProcess = require('child_process')
const shellPath = require('shell-path')

const READY_REGEX = /Ready on http:\/\/localhost:(\d+)/

let vueCliProcess

function createWindow() {
  // Create the browser window.
  const window = new BrowserWindow({
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
}

app.on('ready', createWindow)

app.on('before-quit', () => {
  if (vueCliProcess) vueCliProcess.kill()
})
