const fs = require('fs');
const buf = fs.readFileSync('src/prophone_v3.jsx');
const text = buf.toString('latin1');
const idx = text.indexOf('Pezullo');
if (idx >= 0) {
  const slice = buf.slice(idx-15, idx+10);
  console.log('Hex:', slice.toString('hex'));
  console.log('UTF8:', slice.toString('utf8'));
}
const idx2 = text.indexOf('acc.phone');
if (idx2 >= 0) {
  const slice = buf.slice(idx2+10, idx2+25);
  console.log('Phone fallback hex:', slice.toString('hex'));
  console.log('Phone fallback utf8:', slice.toString('utf8'));
}
