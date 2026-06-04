const fs = require("fs");
const path = "src/prophone_v3.jsx";
let src = fs.readFileSync(path, "utf8");
fs.writeFileSync(path + ".bak11", src);
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

const ca = '<div style=' + OB + ' display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 ' + CB + '>';
const cb = '<div className="summary-cards" style=' + OB + ' display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 ' + CB + '>';
applyUnique("summary-container-class", ca, cb);

const anchor = '.status-cards > div > div:last-child { font-size: 22px !important; margin-top: 0 !important; flex: 0 0 auto; padding-left: 12px; }';
const css = anchor + "\n" +
"      .summary-cards { display: block !important; }\n" +
"      .summary-cards > div { display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; padding: 12px 16px !important; margin-bottom: 8px !important; border-radius: 12px !important; }\n" +
"      .summary-cards > div > div:first-child { font-size: 13px !important; margin: 0 !important; }\n" +
"      .summary-cards > div > div:last-child { font-size: 22px !important; margin-top: 0 !important; flex: 0 0 auto; padding-left: 12px; }";
applyUnique("summary-mobile-css", anchor, css);

fs.writeFileSync(path, src);
console.log(report.join("\n"));
