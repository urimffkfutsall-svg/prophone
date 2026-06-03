const fs = require('fs');
const c = fs.readFileSync('src/prophone_v3.jsx', 'utf8');
const idx = c.indexOf('Puna nuk u gjet');
if (idx >= 0) {
  console.log('Found:', c.substring(idx-100, idx+50));
}
const idx2 = c.indexOf('jobStatus');
if (idx2 >= 0) {
  console.log('jobStatus context:', c.substring(idx2-20, idx2+300));
}
