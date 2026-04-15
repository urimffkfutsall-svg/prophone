const fs = require("fs");
const c = fs.readFileSync("src/prophone_v3.jsx", "utf8");
const idx = c.indexOf("SAVING TO SUPABASE");
console.log("Debug log exists:", idx >= 0);
const idx2 = c.indexOf("saveJobToSupabase(job");
if (idx2 >= 0) console.log("Call:", c.substring(idx2-20, idx2+40));
const idx3 = c.indexOf("async function saveJobToSupabase");
if (idx3 >= 0) console.log("Function:", c.substring(idx3, idx3+150));
