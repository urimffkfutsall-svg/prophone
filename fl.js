const fs = require('fs');
const lines = fs.readFileSync('src/prophone_v3.jsx', 'utf8').split('\n');
lines[1342] = String.raw`  if (!job) return <div style=padding:40,textAlign:"center",color:"#94a3b8">Puna nuk u gjet.</div>;`;
fs.writeFileSync('src/prophone_v3.jsx', lines.join('\n'), 'utf8');
console.log('Done:', lines[1342]);
