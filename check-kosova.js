const fs = require('fs');
const buf = fs.readFileSync('src/prophone_v3.jsx');
const text = buf.toString('latin1');
const idx = text.indexOf('Kosov');
const slice = buf.slice(idx, idx+15);
console.log('Hex:', slice.toString('hex'));
console.log('UTF8:', slice.toString('utf8'));
