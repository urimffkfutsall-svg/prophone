const fs = require("fs");
const path = "src/prophone_v3.jsx";
let src = fs.readFileSync(path, "utf8");
fs.writeFileSync(path + ".bak9", src);
const report = [];
function applyUnique(name, a, b) {
  const i = src.indexOf(a);
  if (i === -1) { report.push(name + ": NUK U GJET"); return; }
  if (src.indexOf(a, i + 1) !== -1) { report.push(name + ": SHUME NDESHJE - u anulua"); return; }
  src = src.replace(a, () => b);
  report.push(name + ": OK");
}

applyUnique("status-container-class",
  '<div style= display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" >',
  '<div className="status-cards" style= display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" >'
);

const anchor = '.mobile-bottom-nav button.active .nav-label { color: #fff !important; }';
const css = anchor + "\n" +
"    @media (max-width: 640px) {\n" +
"      .status-cards { display: block !important; }\n" +
"      .status-cards > div { display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; text-align: left !important; min-width: 0 !important; padding: 12px 16px !important; margin-bottom: 8px !important; border-radius: 12px !important; }\n" +
"      .status-cards > div > div:first-child { font-size: 13px !important; margin: 0 !important; line-height: 1.3 !important; }\n" +
"      .status-cards > div > div:last-child { font-size: 22px !important; margin-top: 0 !important; flex: 0 0 auto; padding-left: 12px; }\n" +
"    }";
applyUnique("status-mobile-css", anchor, css);

fs.writeFileSync(path, src);
console.log(report.join("\n"));
