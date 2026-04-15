const fs = require('fs');
const path = 'src/prophone_v3.jsx';
let s = fs.readFileSync(path, 'utf8');
let changes = 0;

// 1) Hiq nga pozicioni aktual (rreshti 2381-2382)
const oldPos = '  const currentWorker = data.workers[0];\n  const staleCount = data.jobs.filter(j => !["perfunduar","nuk_merret"].includes(j.status) && daysOld(j.createdAt) >= 3).length;';

if (s.includes(oldPos)) {
  s = s.replace(oldPos, '');
  changes++;
  console.log('✅ 1) currentWorker + staleCount u hoqën nga pozicioni i vjetër');
}

// 2) Shto pas "const T = darkMode ? THEME.dark : THEME.light;" brenda DataPhone
// DataPhone ka const T te rreshti ~2198 (instanca e fundit)
const allT = '  const T = darkMode ? THEME.dark : THEME.light;\n';
const lastTIdx = s.lastIndexOf(allT);

if (lastTIdx >= 0) {
  const insertPos = lastTIdx + allT.length;
  const newLines = '  const currentWorker = data.workers[0];\n  const staleCount = data.jobs.filter(j => !["perfunduar","nuk_merret"].includes(j.status) && daysOld(j.createdAt) >= 3).length;\n';
  s = s.substring(0, insertPos) + newLines + s.substring(insertPos);
  changes++;
  console.log('✅ 2) currentWorker + staleCount u zhvendosën pas const T (DataPhone)');
}

fs.writeFileSync(path, s, 'utf8');
console.log('\n✅ U krye ' + changes + '/2 ndryshime.');

// Verifikim
const cwIdx = s.indexOf('const currentWorker');
const scIdx = s.indexOf('const staleCount');
const bnIdx = s.indexOf('mobile-bottom-nav');
console.log('currentWorker at char:', cwIdx);
console.log('staleCount at char:', scIdx);
console.log('mobile-bottom-nav at char:', bnIdx);
console.log('Order OK:', cwIdx < bnIdx && scIdx < bnIdx ? 'YES ✅' : 'NO ❌');
