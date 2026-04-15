const fs = require('fs');
const buf = fs.readFileSync('src/prophone_v3.jsx');
const text = buf.toString('latin1');
const idx = text.indexOf('COUNTRIES');
const slice = buf.slice(idx, idx+800);
console.log(slice.toString('utf8'));
