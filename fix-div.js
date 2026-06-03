const fs = require("fs");
let s = fs.readFileSync("src/prophone_v3.jsx", "utf8");
s = s.replace(
  "              </div>\n              </div>\n              <div style={{ textAlign: \"center\", padding: \"6px 0\"",
  "              </div>}\n              <div style={{ textAlign: \"center\", padding: \"6px 0\""
);
fs.writeFileSync("src/prophone_v3.jsx", s);
console.log("OK");
