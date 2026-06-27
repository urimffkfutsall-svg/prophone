const fs = require("fs");
const p = "src/prophone_v3.jsx";
let s = fs.readFileSync(p, "utf8");
fs.writeFileSync(p + ".bak_borgjet", s);
let ch = [];

if (!s.includes("from \"./Borgjet\"")) {
  s = s.replace(
    "import { QRCodeSVG } from \"qrcode.react\";",
    "import { QRCodeSVG } from \"qrcode.react\";\nimport { Borgjet, BorgjiPublicPage } from \"./Borgjet\";"
  );
  ch.push("import");
}
if (!s.includes("params.get('borgji')")) {
  s = s.replace(
    "const savedAdmin = localStorage.getItem('prophone_is_admin');",
    "const borgjiId = params.get('borgji');\n    if (borgjiId) { setPage('borgjiPublic'); setPageParam(borgjiId); return; }\n    const savedAdmin = localStorage.getItem('prophone_is_admin');"
  );
  ch.push("routing");
}
if (!s.includes("page === \"borgjiPublic\"")) {
  s = s.replace(
    "if (page === \"app-upload\")",
    "if (page === \"borgjiPublic\" && pageParam) return (<BorgjiPublicPage debtId={pageParam} onBack={() => setPage(\"auth\")} />);\n  if (page === \"app-upload\")"
  );
  ch.push("faqja-publike");
}
const biz = "{page === \"business\" && <BusinessSettings data={data} setData={wrappedSetData} T={T} />}";
if (s.includes(biz) && !s.includes("page === \"borgjet\" &&")) {
  s = s.replace(biz, biz + "\n          {page === \"borgjet\" && <Borgjet business={data.business} T={T} showToast={showToast} />}");
  ch.push("render-biznesi");
}
fs.writeFileSync(p, s);
console.log("Perfunduar:", ch.join(", ") || "asgje (ndoshta te bera me pare)");
