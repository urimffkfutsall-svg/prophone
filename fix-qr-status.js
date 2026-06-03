const fs = require("fs");
let s = fs.readFileSync("src/prophone_v3.jsx", "utf8");
let c = 0;

// 1) Fix QR URL for Electron
const oldQR = "const qrData = window.location.origin + '?v=1&jid=' + encodeURIComponent(job.id);";
const newQR = "const qrData = (window.location.protocol === 'file:' ? 'https://telefoni.datapos.pro' : window.location.origin) + '?v=1&jid=' + encodeURIComponent(job.id);";
if (s.includes(oldQR)) { s = s.replace(oldQR, newQR); c++; console.log("OK 1 - QR URL fixed"); }

// 2) Largo statusin mbi QR code ne kupon
const oldStatus = '              <div style={{ textAlign: "center", padding: "6px 0", marginBottom: 10, background: statusObj.bg, borderRadius: 6 }}>\n                <span style={{ fontSize: 12, fontWeight: 800, color: statusObj.color, textTransform: "uppercase" }}>Statusi: {statusObj.label}</span>\n              </div>';
if (s.includes(oldStatus)) { s = s.replace(oldStatus, ""); c++; console.log("OK 2 - Status mbi QR u largua"); }

fs.writeFileSync("src/prophone_v3.jsx", s);
console.log("Total: " + c);
