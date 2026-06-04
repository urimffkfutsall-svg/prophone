const fs = require('fs');
let s = fs.readFileSync('src/prophone_v3.jsx', 'utf8');

const old = `[["Nr. Punes", \`#\${job.id.slice(-6)}\`], ["Klienti", client?.name || "\u2014"], ["Modeli", job.phoneModel], ["IMEI", job.imei || "\u2014"], ["Data pranimit", fmtDate(job.createdAt)], ["Tekniku", worker?.name || "\u2014"]]`;

const fix = `[["Nr. Punes", \`#\${job.id.slice(-6)}\`], ["Klienti", client?.name || "\u2014"], ["Telefoni", client?.phone || "\u2014"], ["Modeli", job.phoneModel], ["IMEI", job.imei || "\u2014"], ["Kodi", job.code || "\u2014"], ["Cmimi", job.price ? job.price + "\u20ac" : "\u2014"], ["Data pranimit", fmtDate(job.createdAt)], ["Tekniku", worker?.name || "\u2014"]]`;

if (s.includes(old)) {
  s = s.replace(old, fix);
  fs.writeFileSync('src/prophone_v3.jsx', s);
  console.log('OK - ClientStatusView fields updated');
} else {
  console.log('NOT FOUND - checking...');
  const idx = s.indexOf('Data pranimit');
  if (idx > 0) {
    console.log('Found at:', idx, s.substring(idx - 50, idx + 80));
  }
}
