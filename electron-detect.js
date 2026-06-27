const fs = require("fs");
const path = "src/prophone_v3.jsx";
let src = fs.readFileSync(path, "utf8");
fs.writeFileSync(path + ".bak17", src);
const report = [];
function applyUnique(name, a, b) {
  const i = src.indexOf(a);
  if (i === -1) { report.push(name + ": NUK U GJET"); return; }
  if (src.indexOf(a, i + a.length) !== -1) { report.push(name + ": SHUME NDESHJE - u anulua"); return; }
  src = src.replace(a, () => b);
  report.push(name + ": OK");
}

applyUnique("initial-page-electron",
  'const [page, setPage] = useState("landing");',
  'const [page, setPage] = useState(() => { try { return (navigator.userAgent || "").indexOf("Electron") !== -1 ? "auth" : "landing"; } catch(e){ return "landing"; } });'
);

applyUnique("redirect-auth-also",
  'if (data.business && page === "landing") setPage("dashboard");',
  'if (data.business && (page === "landing" || page === "auth")) setPage("dashboard");'
);

fs.writeFileSync(path, src);
console.log(report.join("\n"));
