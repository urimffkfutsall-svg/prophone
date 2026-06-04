const fs = require("fs");
const path = "src/prophone_v3.jsx";
let src = fs.readFileSync(path, "utf8");
fs.writeFileSync(path + ".bak14", src);
const oldL = '  const RESET_KEY = "prophone_revreset_" + (data.business?.id || "x");';
const newL = oldL + '\n  const showToast = (msg) => { try { window.alert(msg); } catch(e){ } };';
const i = src.indexOf(oldL);
if (i === -1) { console.log("NUK U GJET"); process.exit(1); }
if (src.indexOf(oldL, i + oldL.length) !== -1) { console.log("SHUME NDESHJE"); process.exit(1); }
src = src.replace(oldL, () => newL);
fs.writeFileSync(path, src);
console.log("OK");
