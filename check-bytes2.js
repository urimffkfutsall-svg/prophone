const fs = require('fs');
let c = fs.readFileSync('src/prophone_v3.jsx', 'utf8');
const lines = c.split('\n');
[1045, 1472].forEach(n => {
  const line = lines[n-1];
  console.log('Line ' + n + ' bytes:', Buffer.from(line.substring(0, 80)).toString('hex'));
});
