const fs = require("fs");
const c = fs.readFileSync("src/prophone_v3.jsx", "utf8");

// Find where saveJobToSupabase is called
const idx = c.indexOf("saveJobToSupabase(job");
if (idx >= 0) {
  console.log("Call context:", c.substring(idx-100, idx+100));
} else {
  console.log("saveJobToSupabase NOT called in code!");
}

// Check if the function has the right table name
const idx2 = c.indexOf("public_jobs");
console.log("public_jobs references:", (c.match(/public_jobs/g) || []).length);
