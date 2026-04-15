const fs = require('fs');
const c = fs.readFileSync('src/prophone_v3.jsx', 'utf8');
const idx = c.indexOf('mimi (');
if (idx >= 0) console.log('Found:', JSON.stringify(c.substring(idx-5, idx+20)));
const idx2 = c.indexOf('Cmimi');
if (idx2 >= 0) console.log('Cmimi:', JSON.stringify(c.substring(idx2-5, idx2+20)));
const idx3 = c.indexOf('mimi"');
if (idx3 >= 0) console.log('mimi":', JSON.stringify(c.substring(idx3-5, idx3+20)));
