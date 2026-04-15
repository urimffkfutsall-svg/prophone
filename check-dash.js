const fs = require('fs');
const buf = fs.readFileSync('src/prophone_v3.jsx');
const text = buf.toString('latin1');
const idx = text.indexOf('Klienti');
if (idx >= 0) {
  const slice = buf.slice(idx+20, idx+50);
  console.log('Hex:', slice.toString('hex'));
  console.log('Text:', slice.toString('utf8'));
}
