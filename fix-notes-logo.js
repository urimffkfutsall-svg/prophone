const fs = require('fs');
let s = fs.readFileSync('src/prophone_v3.jsx', 'utf8');
let changes = 0;

// 1) Fshij 2 kopjet e tepërta të Logo e Biznesit
// Pattern i njëjtë 3 herë - mbaj vetëm të parën
const logoBlock = `        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: T.text }}>Logo e Biznesit</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 100, height: 100, borderRadius: 16, border: "2px dashed " + T.border, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: T.surfaceAlt }}>
              {form.logo ? <img src={form.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ color: T.textFaint, fontSize: 12, textAlign: "center" }}>Nuk ka logo</span>}
            </div>
            <div>
              <label style={{ display: "inline-block", padding: "10px 20px", background: T.accentGrad, color: "#fff", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Ngarko Logo
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => update("logo", ev.target.result); r.readAsDataURL(f); }} style={{ display: "none" }} />
              </label>
              {form.logo && <button onClick={() => update("logo", null)} style={{ marginLeft: 10, background: "none", border: "1.5px solid " + T.border, borderRadius: 10, padding: "10px 16px", cursor: "pointer", color: T.textMuted, fontSize: 13 }}>Largo logon</button>}
              <p style={{ margin: "8px 0 0", fontSize: 12, color: T.textFaint }}>PNG, JPG deri 2MB. Logo shfaqet ne kupon.</p>
            </div>
          </div>
        </div>`;

// Numëro sa herë shfaqet
const count = s.split(logoBlock).length - 1;
console.log('Logo blocks found:', count);

if (count === 3) {
  // Fshij dy instancat e fundit duke i zëvendësuar me empty string
  // Gjej pozicionin e parë
  const firstIdx = s.indexOf(logoBlock);
  const secondIdx = s.indexOf(logoBlock, firstIdx + logoBlock.length);
  const thirdIdx = s.indexOf(logoBlock, secondIdx + logoBlock.length);
  
  // Fshij nga fundi drejt fillimit (për të mos prishur indekset)
  s = s.substring(0, thirdIdx) + s.substring(thirdIdx + logoBlock.length);
  s = s.substring(0, secondIdx) + s.substring(secondIdx + logoBlock.length);
  
  changes++;
  console.log('✅ 1) 2 logo duplikate u fshinë (mbeti 1)');
} else if (count > 1) {
  // Fshij të gjitha përveç të parës
  const firstIdx = s.indexOf(logoBlock);
  let pos = firstIdx + logoBlock.length;
  while (s.indexOf(logoBlock, pos) >= 0) {
    const idx = s.indexOf(logoBlock, pos);
    s = s.substring(0, idx) + s.substring(idx + logoBlock.length);
  }
  changes++;
  console.log('✅ 1) Logo duplikate u fshinë');
}

// 2) Shto "Shënime shtesë" te JobDetail - pas Pershkrimi section
// Gjej fundin e Pershkrimi section
const oldDescEnd = `            {"description" === editField ? <div><textarea value={editValue} onChange={e => setEditValue(e.target.value)}`;

// Approach: gjej bllokun e Pershkrimi dhe shto pas tij
// Gjej "Pershkrimi" heading + description block + DetailedReport
const descMarker = `<div style={{ background: T.surfaceAlt, borderRadius: 12, padding: 16, fontSize: 14, color: T.textMuted, lineHeight: 1.6, border: \`1px solid \${T.border}\`, minHeight: 60 }}>{C.description}</div>`;

const notesSection = `<div style={{ background: T.surfaceAlt, borderRadius: 12, padding: 16, fontSize: 14, color: T.textMuted, lineHeight: 1.6, border: \`1px solid \${T.border}\`, minHeight: 60 }}>{C.description}</div>
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.text }}>Shënime shtesë</h3>
              <textarea value={C.notes || ""} onChange={e => setData(d => ({ ...d, jobs: d.jobs.map(j => j.id === l ? { ...j, notes: e.target.value } : j) }))} rows={3} placeholder="Shëno diçka shtesë për këtë punë..." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: \`1.5px solid \${T.border}\`, fontSize: 13, background: T.inputBg, color: T.text, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Btn variant="primary" size="sm" onClick={() => showToast("Shënimet u ruajtën!")} t={T}>Ruaj</Btn>
                <Btn variant="success" size="sm" onClick={() => { setData(d => ({ ...d, jobs: d.jobs.map(j => j.id === l ? { ...j, showNotesOnCoupon: true } : j) })); showToast("Shënimet do të shfaqen në kupon!"); }} t={T}>Ruaj dhe shfaq në kupon</Btn>
              </div>
            </div>`;

if (s.includes(descMarker)) {
  s = s.replace(descMarker, notesSection);
  changes++;
  console.log('✅ 2) Shënime shtesë section shtuar te JobDetail');
} else {
  console.log('❌ 2) Nuk u gjet description marker');
  // Try to find a simpler marker
  const simpleMarker = 'minHeight: 60 }}>{C.description}</div>';
  if (s.includes(simpleMarker)) {
    console.log('   Found simple marker at', s.indexOf(simpleMarker));
  }
}

// 3) Shto shënimet në kupon (pas description, para status)
const oldCouponDesc = `              <div style={{ marginTop: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 10, color: "#64748b", marginBottom: 3 }}>Pershkrimi:</div>
                <div style={{ fontSize: 10, lineHeight: 1.4, padding: "4px 6px", background: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0" }}>{job.description}</div>`;

const newCouponDesc = `              <div style={{ marginTop: 8, marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 10, color: "#64748b", marginBottom: 3 }}>Pershkrimi:</div>
                <div style={{ fontSize: 10, lineHeight: 1.4, padding: "4px 6px", background: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0" }}>{job.description}</div>
              </div>
              {job.showNotesOnCoupon && job.notes && <div style={{ marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 10, color: "#64748b", marginBottom: 3 }}>Shënime shtesë:</div>
                <div style={{ fontSize: 10, lineHeight: 1.4, padding: "4px 6px", background: "#f0f9ff", borderRadius: 4, border: "1px solid #bae6fd" }}>{job.notes}</div>
              </div>`;

// The old pattern has a closing div missing - let me check
if (s.includes(oldCouponDesc)) {
  s = s.replace(oldCouponDesc, newCouponDesc);
  changes++;
  console.log('✅ 3) Shënime shtesë shfaqen në kupon');
} else {
  console.log('❌ 3) Coupon desc pattern not found');
}

// 4) Add "notes" and "showNotesOnCoupon" to job mapping functions
// In mapJobFromDB (fo function), add notes
const oldFoReturn = `createdAt: e.created_at }`;
// This is tricky - the DB may not have notes column yet
// For now, notes will be stored locally in state

// 5) Show notes in service copy of coupon too
const oldServiceDesc = `<div style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}><strong>Defekti:</strong> {job.description}</div>`;
const newServiceDesc = `<div style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}><strong>Defekti:</strong> {job.description}</div>
              {job.showNotesOnCoupon && job.notes && <div style={{ fontSize: 8, color: "#1e40af", marginTop: 2 }}><strong>Shënim:</strong> {job.notes}</div>}`;

if (s.includes(oldServiceDesc)) {
  s = s.replace(oldServiceDesc, newServiceDesc);
  changes++;
  console.log('✅ 4) Shënime shtesë në kopjen e servisit');
}

fs.writeFileSync('src/prophone_v3.jsx', s);
console.log('\n✅ Total: ' + changes + ' ndryshime.');
