const fs = require('fs');
const c = fs.readFileSync('src/prophone_v3.jsx', 'utf8');

// Find ALL garbled sequences
const lines = c.split('\n');
const issues = [];

lines.forEach((line, i) => {
  // Check for Ã, Â patterns (garbled UTF-8)
  if (/Ã[^"'\s]|Â[«»¦§¨©]/.test(line)) {
    issues.push({ line: i+1, text: line.substring(0, 80) });
  }
  // Check for replacement char
  if (line.includes('\ufffd')) {
    issues.push({ line: i+1, text: 'REPLACEMENT CHAR: ' + line.substring(0, 80) });
  }
});

if (issues.length === 0) {
  console.log('✅ No encoding issues found!');
} else {
  console.log(`Found ${issues.length} issues:`);
  issues.slice(0, 20).forEach(({line, text}) => {
    console.log(`Line ${line}: ${text}`);
  });
}
