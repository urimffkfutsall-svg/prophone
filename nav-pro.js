const fs = require("fs");
const path = "src/prophone_v3.jsx";
let src = fs.readFileSync(path, "utf8");
fs.writeFileSync(path + ".bak7", src);
const report = [];
function apply(name, a, b) {
  if (src.indexOf(a) === -1) { report.push(name + ": NUK U GJET"); return; }
  src = src.replace(a, () => b);
  report.push(name + ": OK");
}
const anchor = ".mobile-bottom-nav .nav-icon { font-size: 21px; }";
const add = anchor + "\n" +
"    /* ===== NAV PRO (vetem tekst) ===== */\n" +
"    .mobile-bottom-nav .nav-icon { display: none !important; }\n" +
"    .mobile-bottom-nav .nav-label { display: inline !important; font-size: 12px !important; font-weight: 700 !important; letter-spacing: .2px; }\n" +
"    .mobile-bottom-nav button { padding: 9px 12px !important; }\n" +
"    .mobile-bottom-nav button:not(.active) .nav-label { color: ${T.textMuted} !important; }\n" +
"    .mobile-bottom-nav button.active { background: ${T.accent} !important; padding: 9px 16px !important; box-shadow: 0 4px 12px rgba(14,165,233,.35); }\n" +
"    .mobile-bottom-nav button.active .nav-label { color: #fff !important; }";
apply("nav-pro", anchor, add);
fs.writeFileSync(path, src);
console.log(report.join("\n"));
