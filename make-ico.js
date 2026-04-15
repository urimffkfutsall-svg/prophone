const pngToIco = require('png-to-ico');
const fs = require('fs');

console.log('Type:', typeof pngToIco);
console.log('Keys:', Object.keys(pngToIco));

const fn = pngToIco.default || pngToIco;

fn('public/icon.png')
  .then(buf => {
    fs.writeFileSync('public/icon.ico', buf);
    console.log('OK - icon.ico u krijua (' + buf.length + ' bytes)');
  })
  .catch(e => console.error('Error:', e));
