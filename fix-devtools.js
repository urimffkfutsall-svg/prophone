const fs = require('fs');
const path = 'electron/main.js';
let s = fs.readFileSync(path, 'utf8');

const old = `  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  }`;

const fix = `  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(require('path').join(__dirname, '..', 'build', 'index.html'));
  }
  // Always open DevTools for debugging (remove later)
  mainWindow.webContents.openDevTools();`;

if (s.includes(old)) {
  s = s.replace(old, fix);
  fs.writeFileSync(path, s, 'utf8');
  console.log('OK - DevTools aktivizuar');
} else {
  // Provojmë me format tjetër - ndoshta path variable konfliktohet
  console.log('Pattern nuk u gjet, duke kontrolluar file-in...');
  console.log(s.substring(0, 800));
}
