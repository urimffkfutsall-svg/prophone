const fs = require('fs');
const p = require('./package.json');

p.main = 'electron/main.js';
p.homepage = './';
p.author = 'ProPhone';
p.description = 'ProPhone - Sistemi i menaxhimit te riparimeve';

p.scripts['electron-dev'] = 'set ELECTRON_DEV=true&& concurrently "npm start" "wait-on http://localhost:3000 && electron ."';
p.scripts['electron-build'] = 'npm run build && electron-builder --win';

p.build = {
  appId: 'com.prophone.app',
  productName: 'ProPhone',
  directories: { output: 'dist' },
  files: [
    'build/**/*',
    'electron/**/*',
    'node_modules/**/*'
  ],
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    icon: 'public/logo192.png'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: 'public/logo192.png',
    uninstallerIcon: 'public/logo192.png',
    installerHeaderIcon: 'public/logo192.png'
  }
};

fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
console.log('OK - package.json u perditesua me Electron config');
