const fs = require("fs");
const c = fs.readFileSync("src/prophone_v3.jsx", "utf8");

// Check if saveJobToSupabase is called
console.log("saveJobToSupabase defined:", c.includes("async function saveJobToSupabase"));
console.log("saveJobToSupabase called:", c.includes("saveJobToSupabase(job"));
console.log("supabase imported:", c.includes("supabase"));

// Check QR URL format
const qrIdx = c.indexOf("QRCodeSVG data=");
if (qrIdx >= 0) console.log("QR data:", c.substring(qrIdx, qrIdx+80));
else {
  const qrIdx2 = c.indexOf("QRCodeSVG");
  if (qrIdx2 >= 0) console.log("QR usage:", c.substring(qrIdx2, qrIdx2+120));
}

// Check URL param handler
console.log("URL handler exists:", c.includes("params.get") && c.includes("job"));

// Check localStorage key
const lsIdx = c.indexOf("localStorage.setItem");
if (lsIdx >= 0) console.log("localStorage key:", c.substring(lsIdx, lsIdx+80));
