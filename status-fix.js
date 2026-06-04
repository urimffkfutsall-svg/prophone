const fs = require("fs");
const path = "src/prophone_v3.jsx";
let src = fs.readFileSync(path, "utf8");
fs.writeFileSync(path + ".bak10", src);
const report = [];
const OB = "{" + "{";
const CB = "}" + "}";
function applyUnique(name, a, b) {
  const i = src.indexOf(a);
  if (i === -1) { report.push(name + ": NUK U GJET"); return; }
  if (src.indexOf(a, i + 1) !== -1) { report.push(name + ": SHUME NDESHJE - u anulua"); return; }
  src = src.replace(a, () => b);
  report.push(name + ": OK");
}

const a = '<div style=' + OB + ' display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" ' + CB + '>';
const b = '<div className="status-cards" style=' + OB + ' display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" ' + CB + '>';
applyUnique("status-container-class", a, b);

fs.writeFileSync(path, src);
console.log(report.join("\n"));
