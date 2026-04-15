const fs = require('fs');
const path = 'src/prophone_v3.jsx';
let s = fs.readFileSync(path, 'utf8');

const marker = '  const currentWorker = data.workers[0];';
const addition = `  const currentWorker = data.workers[0];
  const NAV = [{ key: "dashboard", label: "Ballina" }, { key: "workers", label: "Puntoret" }, { key: "clients", label: "Klientat" }, { key: "business", label: "Biznesi" }];
  const staleCount = data.jobs.filter(j => !["perfunduar","nuk_merret"].includes(j.status) && daysOld(j.createdAt) >= 3).length;`;

if (s.includes(marker) && !s.includes('const NAV = [')) {
  s = s.replace(marker, addition);
  fs.writeFileSync(path, s, 'utf8');
  console.log('OK - NAV dhe staleCount u shtuan');
} else if (s.includes('const NAV = [')) {
  console.log('NAV ekziston tashmë, nuk bëj ndryshime');
} else {
  console.error('Nuk u gjet marker-i');
}
