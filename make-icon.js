const pngToIco = require('png-to-ico');
const fs = require('fs');

pngToIco('public/icon.png')
  .then(buf => {
    fs.writeFileSync('public/icon.ico', buf);
    fs.writeFileSync('public/favicon.ico', buf);
    console.log('OK - icon.ico and favicon.ico created (' + buf.length + ' bytes)');
  })
  .catch(err => {
    console.error('Error:', err);
  });
