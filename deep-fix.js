const fs = require('fs');
let buf = fs.readFileSync('src/prophone_v3.jsx');
let hex = buf.toString('hex');

// Fix all known bad byte sequences
const fixes = [
  // Triple encoded chars
  ['c386c292c382c2ab', 'c3ab'], // ë
  ['c386c292c382c2a7', 'c3a7'], // ç  
  ['c386c292c382c28b', 'c38b'], // Ë
  ['c386c292c382c287', 'c387'], // Ç
  // Double encoded chars
  ['c3c2ab', 'c3ab'], // ë
  ['c3c2a7', 'c3a7'], // ç
  ['c3c28b', 'c38b'], // Ë
  ['c3c287', 'c387'], // Ç
  // Euro sign
  ['c382c383c3a2c282c385c2a1c382', 'e282ac'],
  ['c382c383c3a2c282c385c2a1', 'e282ac'],
  // Em dash
  ['c382c2a2c383c3a2c282c3aa', 'e28094'],
  // BOM
  ['efbbbf', ''],
  // Windows-1252 artifacts  
  ['c382c2a2', ''],
  ['efbfbd', ''],
];

fixes.forEach(([from, to]) => {
  while (hex.includes(from)) hex = hex.split(from).join(to);
});

buf = Buffer.from(hex, 'hex');
let c = buf.toString('utf8');

// Fix double chars
c = c.split('ëë').join('ë');
c = c.split('çç').join('ç');
c = c.split('ËË').join('Ë');

// Fix specific city/country names
const textFixes = [
  ['KosovÃ«', 'Kosovë'], ['KosovÆÂ«', 'Kosovë'], ['Kosov\u00c3\u00ab', 'Kosovë'],
  ['ShqipÃ«ri', 'Shqipëri'], ['ShqipÆÂ«ri', 'Shqipëri'],
  ['PrishtinÃ«', 'Prishtinë'], ['PrishtinÆÂ«', 'Prishtinë'],
  ['PejÃ«', 'Pejë'], ['GjakovÃ«', 'Gjakovë'],
  ['MitrovicÃ«', 'Mitrovicë'], ['PodujevÃ«', 'Podujevë'],
  ['SuharekÃ«', 'Suharekë'], ['FerizÃ«', 'Ferizë'],
  ['MalishevÃ«', 'Malishevë'], ['KamenicÃ«', 'Kamenicë'],
  ['DeÃ§an', 'Deçan'], ['KlinÃ«', 'Klinë'],
  ['FushÃ«', 'Fushë'], ['KaÃ§anik', 'Kaçanik'],
  ['NovobÃ«rdÃ«', 'Novobërdë'], ['ShtÃ«rpcÃ«', 'Shtërpcë'],
  ['GraÃ§anicÃ«', 'Graçanicë'], ['MamushÃ«', 'Mamushë'],
  ['TiranÃ«', 'Tiranë'], ['DurrÃ«s', 'Durrës'],
  ['VlorÃ«', 'Vlorë'], ['ShkodÃ«r', 'Shkodër'],
  ['ElbasÃ«n', 'Elbasan'], ['KorÃ§Ã«', 'Korçë'],
  ['LushnjÃ«', 'Lushnjë'], ['PogradÃ«c', 'Pogradec'],
  ['KavajÃ«', 'Kavajë'], ['KukÃ«s', 'Kukës'],
  ['SarandÃ«', 'Sarandë'], ['LezhÃ«', 'Lezhë'],
  ['GjirokastÃ«r', 'Gjirokastër'], ['PeshkopiÃ«', 'Peshkopi'],
  ['BurrÃ«l', 'Burrël'], ['KrujÃ«', 'Krujë'],
  ['LibrazhÃ«', 'Librazhd'], ['TetoVÃ«', 'Tetovë'],
  ['GostivarÃ«', 'Gostivar'], ['KumanovÃ«', 'Kumanovë'],
  ['StrumicÃ«', 'Strumicë'], ['OhÃ«r', 'Ohër'],
  ['ManastirÃ«', 'Manastir'], ['PrilepÃ«', 'Prilep'],
  ['VelesÃ«', 'Veles'], ['ShtipÃ«', 'Shtip'],
  ['KÃ«rÃ§ovÃ«', 'Kërçovë'], ['TetovÃ«', 'Tetovë'],
  ['ShkupÃ«', 'Shkup'],
  // UI strings
  ['Ã«', 'ë'], ['Ã§', 'ç'], ['Ã‹', 'Ë'], ['Ã‡', 'Ç'],
];

textFixes.forEach(([from, to]) => {
  c = c.split(from).join(to);
});

fs.writeFileSync('src/prophone_v3.jsx', c, 'utf8');

// Report remaining issues
const badChars = c.match(/[^\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF\u2000-\u206F\u20AC\s]/g);
if (badChars) {
  const unique = [...new Set(badChars)].slice(0,10);
  console.log('Remaining bad chars:', unique);
} else {
  console.log('No bad chars found!');
}
console.log('Done! Size:', c.length);
