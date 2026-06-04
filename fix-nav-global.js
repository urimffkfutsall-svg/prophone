const fs = require('fs');
const path = 'src/prophone_v3.jsx';
let s = fs.readFileSync(path, 'utf8');
let changes = 0;

// 1) Hiq NAV nga brenda DataPhone (nëse ekziston)
const navInside = '  const NAV = [{ key: "dashboard", label: "Ballina" }, { key: "workers", label: "Puntoret" }, { key: "clients", label: "Klientat" }, { key: "business", label: "Biznesi" }];\n';
if (s.includes(navInside)) {
  s = s.replace(navInside, '');
  changes++;
  console.log('✅ 1) NAV u hoq nga brenda DataPhone');
}

// 2) Shto NAV si konstante globale - pas STATUSES ose pas DEFAULT_DATA
// Gjejmë DEFAULT_DATA si anchor
const anchor = 'const DEFAULT_DATA = { business: null, workers: [], clients: [], jobs: [], messages: [], history: [] };';
if (s.includes(anchor) && !s.includes('\nconst NAV = [')) {
  const navGlobal = anchor + '\nconst NAV = [{ key: "dashboard", label: "Ballina" }, { key: "workers", label: "Puntoret" }, { key: "clients", label: "Klientat" }, { key: "business", label: "Biznesi" }];';
  s = s.replace(anchor, navGlobal);
  changes++;
  console.log('✅ 2) NAV u shtua si konstante globale pas DEFAULT_DATA');
} else if (s.includes('\nconst NAV = [')) {
  console.log('⚠️  NAV globale ekziston tashmë');
} else {
  console.error('❌ Nuk u gjet DEFAULT_DATA anchor');
}

fs.writeFileSync(path, s, 'utf8');
console.log('\n✅ U krye ' + changes + ' ndryshime.');
