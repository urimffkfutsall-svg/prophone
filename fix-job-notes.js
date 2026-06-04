const fs = require("fs");
let s = fs.readFileSync("src/prophone_v3.jsx", "utf8");
const m = '          <DetailedReport job={job} client={client} worker={worker} business={data.business} T={T} accountId={data.business?.id} />';
if (s.includes(m)) {
  const add = '          <div style={{ marginTop: 20 }}>\n            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.text }}>Sh\u00ebnime shtes\u00eb</h3>\n            <textarea value={job.notes || ""} onChange={e => setData(d => ({ ...d, jobs: d.jobs.map(j => j.id === jobId ? { ...j, notes: e.target.value } : j) }))} rows={3} placeholder="Sh\u00ebno di\u00e7ka shtes\u00eb..." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid " + T.border, fontSize: 13, background: T.inputBg, color: T.text, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />\n            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>\n              <Btn variant="primary" size="sm" onClick={() => showToast("U ruajt!")} t={T}>Ruaj</Btn>\n              <Btn variant="success" size="sm" onClick={() => { setData(d => ({ ...d, jobs: d.jobs.map(j => j.id === jobId ? { ...j, showNotesOnCoupon: true } : j) })); showToast("Do te shfaqen ne kupon!"); }} t={T}>Ruaj dhe shfaq ne kupon</Btn>\n            </div>\n          </div>\n' + m;
  s = s.replace(m, add);
  fs.writeFileSync("src/prophone_v3.jsx", s);
  console.log("OK");
} else { console.log("NOT FOUND"); }
