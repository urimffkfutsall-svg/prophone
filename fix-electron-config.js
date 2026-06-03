const fs = require('fs');
const p = require('./package.json');

// Fix: electron-builder duhet ta dijë ku është main process file
p.build.files = [
  'build/**/*',
  'electron/**/*'
];

// Explicit: mos përdor react-cra preset
p.build.extends = null;

// Entry point i saktë
p.build.extraMetadata = {
  main: 'electron/main.js'
};

// Output directory
p.build.directories = {
  output: 'dist',
  buildResources: 'public'
};

fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
console.log('OK - electron-builder config u rregullua');
