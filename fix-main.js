const fs = require("fs");
const p = "electron/main.js";
let src = fs.readFileSync(p, "utf8");
fs.writeFileSync(p + ".bak", src);
const report = [];
function appU(name, a, b) {
  const i = src.indexOf(a);
  if (i === -1) { report.push(name + ": NUK U GJET"); return; }
  if (src.indexOf(a, i + a.length) !== -1) { report.push(name + ": SHUME NDESHJE"); return; }
  src = src.replace(a, () => b);
  report.push(name + ": OK");
}
appU("title", "title: 'ProPhone',", "title: 'DataPos',");
appU("appUserModelId", "app.setAppUserModelId('com.prophone.app');", "app.setAppUserModelId('pro.datapos.app');");
fs.writeFileSync(p, src);
console.log(report.join("\n"));
