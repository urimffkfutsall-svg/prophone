const fs = require('fs');
let c = fs.readFileSync('src/prophone_v3.jsx', 'utf8');
const lines = c.split('\n');
lines.forEach((line, i) => {
  if (line.includes('\u00e2')) {
    console.log('Line ' + (i+1) + ':', JSON.stringify(line.substring(0, 100)));
  }
});
