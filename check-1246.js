const fs = require('fs');
let c = fs.readFileSync('src/prophone_v3.jsx', 'utf8');
const lines = c.split('\n');
const line = lines[1245];
console.log('Bytes:', Buffer.from(line).toString('hex'));
