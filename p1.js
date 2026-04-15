const fs = require("fs");
let c = fs.readFileSync("src/prophone_v3.jsx", "utf8");
const B = String.fromCharCode(123);
const E = String.fromCharCode(125);

// Fix QR data URL to include all job info
const oldQR = /const qrData = .*?;/g;
const newQR = "const qrData = window.location.origin + '?v=1' + '&jid=' + encodeURIComponent(job.id) + '&cn=' + encodeURIComponent(client?.name||'') + '&cp=' + encodeURIComponent(client?.phone||'') + '&pm=' + encodeURIComponent(job.phoneModel||'') + '&im=' + encodeURIComponent(job.imei||'') + '&ds=' + encodeURIComponent((job.description||'').substring(0,50)) + '&pr=' + encodeURIComponent(job.price||'') + '&st=' + encodeURIComponent(job.status||'new') + '&wn=' + encodeURIComponent(worker?.name||'') + '&bn=' + encodeURIComponent(business?.name||'') + '&dt=' + encodeURIComponent(job.createdAt||'');";
c = c.replace(oldQR, newQR);
fs.writeFileSync("src/prophone_v3.jsx", c, "utf8");
console.log("QR data fixed! Count:", (c.match(/v=1/g)||[]).length);
