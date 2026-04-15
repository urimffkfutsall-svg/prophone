const fs = require("fs");
const c = fs.readFileSync("src/prophone_v3.jsx", "utf8");

// Find qrData definition
const idx = c.indexOf("qrData");
if (idx >= 0) console.log("qrData:", c.substring(idx, idx+80));

// Find all qrData definitions
const matches = c.match(/qrData.*=.*/g);
if (matches) matches.forEach(m => console.log("Match:", m.substring(0, 80)));
