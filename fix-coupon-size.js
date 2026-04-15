const fs = require('fs');
let s = fs.readFileSync('src/prophone_v3.jsx', 'utf8');

// Fix @page size
const old1 = 'size:80mm 210mm';
const new1 = 'size:80mm 290mm';
console.log('210mm found:', s.includes(old1));
s = s.replace(old1, new1);

// Fix minHeight
const old2 = 'minHeight: "793px"';
const new2 = 'minHeight: "1096px"';
console.log('793px found:', s.includes(old2));
s = s.replace(old2, new2);

fs.writeFileSync('src/prophone_v3.jsx', s);
console.log('OK - coupon dimensions updated');
