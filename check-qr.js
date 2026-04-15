const fs = require('fs');
const c = fs.readFileSync('src/prophone_v3.jsx', 'utf8');

// Check QR data
const qrIdx = c.indexOf('QRCodeSVG');
console.log('QR usage:', c.substring(qrIdx, qrIdx+100));

// Check jobStatus handling
const jobIdx = c.indexOf('jobStatus');
console.log('jobStatus:', c.substring(jobIdx-20, jobIdx+200));

// Check useEffect for URL params
const effectIdx = c.indexOf("params.get('job')") !== -1 ? c.indexOf("params.get('job')") : c.indexOf('params.get("job")');
console.log('URL param handler:', effectIdx >= 0 ? c.substring(effectIdx-100, effectIdx+100) : 'NOT FOUND');
