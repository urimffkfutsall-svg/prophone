const fs = require('fs');
const buf = fs.readFileSync('src/prophone_v3.jsx');
const lines = buf.toString('utf8').split('\n');

// Line 611
const l611 = lines[610];
const idx611 = l611.indexOf('IMEI');
console.log('L611 after IMEI:', Buffer.from(l611.substring(idx611, idx611+30)).toString('hex'));

// Line 775
const l775 = lines[774];
const idx775 = l775.indexOf('mimi');
console.log('L775 before mimi:', Buffer.from(l775.substring(idx775-5, idx775+10)).toString('hex'));

// Line 848
const l848 = lines[847];
console.log('L848:', Buffer.from(l848.substring(0, 80)).toString('hex'));
