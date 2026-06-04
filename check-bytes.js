const fs = require('fs');
let c = fs.readFileSync('src/prophone_v3.jsx', 'utf8');
const lines = c.split('\n');
[336, 1057, 1398].forEach(n => {
  const line = lines[n-1];
  const idx = line.indexOf('\u00e2');
  if (idx >= 0) {
    const chunk = line.substring(idx, idx+10);
    console.log('Line ' + n + ' bytes:', Buffer.from(chunk).toString('hex'));
    console.log('Line ' + n + ' text:', JSON.stringify(chunk));
  }
});
