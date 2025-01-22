const { app, BrowserWindow, screen } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let window;
console.log("Start...")

function createWindows() {
  const display = screen.getPrimaryDisplay();

  // Create a BrowserWindow
  window = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.bounds.width,
    height: display.bounds.height,
    fullscreen: true,
    frame: false, // Removes window borders
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load content - this could be a local file or URL
  window.loadURL(`file://${__dirname}/display1.html`);

  window.webContents.openDevTools();

  // Spawn the Python script
  const pythonProcess = spawn('python', ['-u', 'C:\\Users\\Arsov\\PycharmProjects\\pythonProject\\continuesReading.py']);

  // Listen to output from the Python process
  pythonProcess.stdout.on('data', (data) => {
    const message = data.toString();
    console.log(`Received from Python: ${message}`); // Log the received data
    window.webContents.send('nfc-data', message);
  });

  // Listen for errors from the Python process
  pythonProcess.stderr.on('data', (data) => {
    const errorMessage = data.toString(); // Convert Buffer to string
    console.error(`Python error: ${errorMessage}`); // Log the error message
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });
}

app.on('ready', createWindows);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindows();
});