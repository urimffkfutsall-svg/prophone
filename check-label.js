const fs = require('fs');
const buf = fs.readFileSync('src/prophone_v3.jsx');
const text = buf.toString('latin1');

// Search for the label near price/cmimi input
const searches = ['none (', 'Cmimi (', 'mimi (', 'rice', 'price', 'label.*mimi', 'mimi.*label'];
searches.forEach(word => {
  const idx = text.indexOf(word);
  if (idx >= 0) {
    const slice = buf.slice(idx-10, idx+30);
    console.log(word+':');
    console.log('  hex:', slice.toString('hex'));
    console.log('  utf8:', slice.toString('utf8'));
  }
});
