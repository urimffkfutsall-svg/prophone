const fs = require("fs");
const path = "src/prophone_v3.jsx";
let src = fs.readFileSync(path, "utf8");
fs.writeFileSync(path + ".bak5", src);
let n = 0;
const a = ".mobile-bottom-nav { display: flex !important; }";
const b = ".mobile-bottom-nav { display: none !important; }";
if (src.indexOf(a) !== -1) { src = src.split(a).join(b); n++; }
fs.writeFileSync(path, src);
console.log(n > 0 ? "OK - menyja e poshtme u fshe" : "NUK U GJET");
