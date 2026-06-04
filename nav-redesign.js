const fs = require("fs");
const path = "src/prophone_v3.jsx";
let src = fs.readFileSync(path, "utf8");
fs.writeFileSync(path + ".bak6", src);
const report = [];
function apply(name, a, b) {
  if (src.indexOf(a) === -1) { report.push(name + ": NUK U GJET"); return; }
  src = src.replace(a, () => b);
  report.push(name + ": OK");
}

// 1) Rikthe menyne ne telefon
apply("show-mobile-nav",
  ".mobile-bottom-nav { display: none !important; }",
  ".mobile-bottom-nav { display: flex !important; }"
);

// 2) Dizajni i ri (floating pill) - mbishkruan rregullat e meparshme
const anchor = ".mobile-bottom-nav button.active .nav-label { color: ${T.accent}; }";
const redesign = anchor + "\n" +
"    /* ===== BOTTOM NAV REDESIGN (floating pill) ===== */\n" +
"    .mobile-bottom-nav {\n" +
"      bottom: calc(14px + env(safe-area-inset-bottom));\n" +
"      left: 14px; right: 14px;\n" +
"      height: 62px;\n" +
"      border-top: none;\n" +
"      border: 1px solid ${T.border};\n" +
"      border-radius: 22px;\n" +
"      padding: 0 8px; gap: 4px;\n" +
"      box-shadow: 0 10px 30px rgba(0,0,0,.18);\n" +
"      justify-content: space-around;\n" +
"    }\n" +
"    .mobile-bottom-nav button {\n" +
"      flex: 0 1 auto;\n" +
"      flex-direction: row;\n" +
"      gap: 8px;\n" +
"      min-height: 44px;\n" +
"      padding: 9px 12px;\n" +
"      border-radius: 16px;\n" +
"      transition: background .2s ease, transform .12s ease;\n" +
"    }\n" +
"    .mobile-bottom-nav button:active { transform: scale(.94); opacity: 1; }\n" +
"    .mobile-bottom-nav button.active { background: rgba(14,165,233,.14); padding: 9px 16px; }\n" +
"    .mobile-bottom-nav .nav-label { display: none; font-size: 13px; font-weight: 700; }\n" +
"    .mobile-bottom-nav button.active .nav-label { display: inline; color: ${T.accent}; }\n" +
"    .mobile-bottom-nav .nav-icon { font-size: 21px; }";
apply("redesign-nav", anchor, redesign);

fs.writeFileSync(path, src);
console.log(report.join("\n"));
