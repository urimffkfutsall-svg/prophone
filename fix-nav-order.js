const fs = require('fs');
const path = 'src/prophone_v3.jsx';
let s = fs.readFileSync(path, 'utf8');
let changes = 0;

// 1) Hiq NAV dhe staleCount nga pozicioni aktual
const oldBlock = "  const currentWorker = data.workers[0];\n  const NAV = [{ key: \"dashboard\", label: \"Ballina\" }, { key: \"workers\", label: \"Puntoret\" }, { key: \"clients\", label: \"Klientat\" }, { key: \"business\", label: \"Biznesi\" }];\n  const staleCount = data.jobs.filter(j => ![\"perfunduar\",\"nuk_merret\"].includes(j.status) && daysOld(j.createdAt) >= 3).length;";

const remainBlock = "  const currentWorker = data.workers[0];";

if (s.includes(oldBlock)) {
  s = s.replace(oldBlock, remainBlock);
  changes++;
  console.log('✅ 1) NAV dhe staleCount u hoqën nga pozicioni i vjetër');
} else {
  console.error('❌ 1) Nuk u gjet blloku i vjetër');
}

// 2) Shto NAV dhe staleCount menjëherë pas "const T = darkMode ? THEME.dark : THEME.light;"
// Kjo ndodh brenda DataPhone - gjejmë instancën e saktë
const marker = '  const T = darkMode ? THEME.dark : THEME.light;\n';

// Kontrollojmë që nuk e kemi shtuar tashmë
if (!s.includes('const NAV = [{ key: "dashboard"')) {
  console.error('❌ NAV u fshi komplet, probleme');
} else if (s.indexOf('const NAV') < s.indexOf('const T = darkMode')) {
  console.log('⚠️ NAV tashmë është para T, kaloj');
} else {
  // Gjej instancën e fundit të marker (ajo brenda DataPhone)
  const lastT = s.lastIndexOf(marker);
  if (lastT >= 0) {
    const insertPos = lastT + marker.length;
    const navLine = '  const NAV = [{ key: "dashboard", label: "Ballina" }, { key: "workers", label: "Puntoret" }, { key: "clients", label: "Klientat" }, { key: "business", label: "Biznesi" }];\n  const staleCount = data.jobs.filter(j => !["perfunduar","nuk_merret"].includes(j.status) && daysOld(j.createdAt) >= 3).length;\n';
    s = s.substring(0, insertPos) + navLine + s.substring(insertPos);
    changes++;
    console.log('✅ 2) NAV dhe staleCount u zhvendosën pas const T');
  } else {
    console.error('❌ 2) Nuk u gjet const T marker');
  }
}

fs.writeFileSync(path, s, 'utf8');
console.log('\n✅ U krye ' + changes + ' ndryshime.');
