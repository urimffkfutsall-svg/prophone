const fs = require('fs');
const buf = fs.readFileSync('src/prophone_v3.jsx');
const text = buf.toString('latin1');
// Find "9.99" to get euro sign bytes
const idx = text.indexOf('9.99');
if (idx >= 0) {
  const slice = buf.slice(idx, idx+15);
  console.log('9.99 area hex:', slice.toString('hex'));
  console.log('9.99 area utf8:', slice.toString('utf8'));
}
// Find "—" dash area
const idx2 = text.indexOf('|| "');
if (idx2 >= 0) {
  const slice = buf.slice(idx2, idx2+15);
  console.log('dash area hex:', slice.toString('hex'));
  console.log('dash area utf8:', slice.toString('utf8'));
}
