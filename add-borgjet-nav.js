const fs = require("fs");
const p = "src/prophone_v3.jsx";
let s = fs.readFileSync(p, "utf8");
fs.writeFileSync(p + ".bak_borgjet_nav", s);
let ch = [];
if (!s.includes("key: \"borgjet\"")) {
  s = s.split("n.push(NAV_BASE[3]);").join("n.push({ key: \"borgjet\", label: \"Borgjet\" }); n.push(NAV_BASE[3]);");
  ch.push("meny");
}
if (s.includes("const icons = { dashboard:") && !s.includes("borgjet:")) {
  s = s.replace("const icons = { dashboard:", "const icons = { borgjet: \"$\", dashboard:");
  ch.push("ikona");
}
fs.writeFileSync(p, s);
console.log("Nav:", ch.join(", ") || "asgje (ndoshta te bera)");
