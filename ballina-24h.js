const fs = require("fs");
const path = "src/prophone_v3.jsx";
let src = fs.readFileSync(path, "utf8");
fs.writeFileSync(path + ".bak12", src);
const report = [];
const eur = "\u20AC";
function apply(name, a, b) {
  const i = src.indexOf(a);
  if (i === -1) { report.push(name + ": NUK U GJET"); return; }
  src = src.replace(a, () => b);
  report.push(name + ": OK");
}

const oldRev = 'const totalRevenue = data.jobs.filter(j => j.status === "perfunduar" && j.price).reduce((sum, j) => sum + parseFloat(j.price || 0), 0);';
const newRev =
  'const __revResetKey = "prophone_revreset_" + (data.business?.id || "x");' +
  ' const __revResetAt = (function(){ try { const v = localStorage.getItem(__revResetKey); return v ? new Date(v).getTime() : 0; } catch(e){ return 0; } })();' +
  ' const __revWindowStart = Math.max(__revResetAt, Date.now() - 86400000);' +
  ' const totalRevenue = data.jobs.filter(j => j.status === "perfunduar" && j.price && new Date(j.createdAt).getTime() >= __revWindowStart).reduce((sum, j) => sum + parseFloat(j.price || 0), 0);';
apply("ballina-24h-revenue", oldRev, newRev);
apply("ballina-24h-label", 'label: "Te ardhura (' + eur + ')"', 'label: "Te ardhura 24h"');

fs.writeFileSync(path, src);
console.log(report.join("\n"));
