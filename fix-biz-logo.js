const fs = require('fs');
let s = fs.readFileSync('src/prophone_v3.jsx', 'utf8');
let changes = 0;

// 1) Shto Logo upload section para "Perditso te dhenat e biznesit" form
const oldFormTitle = `<h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: T.text }}>Perditso te dhenat e biznesit <span style={{ background: T.accent, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, display: "inline-flex", alignItems: "center" }}>{Ic.edit(11)}</span></h3>`;

const newFormTitle = `<div style={{ marginBottom: 24 }}>
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
        </div>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: T.text }}>Perditso te dhenat e biznesit <span style={{ background: T.accent, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, display: "inline-flex", alignItems: "center" }}>{Ic.edit(11)}</span></h3>`;

if (s.includes(oldFormTitle)) {
  s = s.replace(oldFormTitle, newFormTitle);
  changes++;
  console.log('✅ 1) Logo upload section u shtua');
}

// 2) Fix Skadimi - trego datën e skadimit
const oldSkadimi = `<span style={{ color: T.textMuted, fontWeight: 600 }}>Skadimi:</span><span style={{ color: T.accent, fontWeight: 600 }}>{b.expiresIn}</span>`;
const newSkadimi = `<span style={{ color: T.textMuted, fontWeight: 600 }}>Skadimi:</span><span style={{ color: T.accent, fontWeight: 600 }}>{b.expiryDate ? fmtDate(b.expiryDate) : (b.expiresIn || "Pa abonim")}</span>`;

if (s.includes(oldSkadimi)) {
  s = s.replace(oldSkadimi, newSkadimi);
  changes++;
  console.log('✅ 2) Skadimi tani tregon datën');
}

// 3) Fix Pagesat - shto mesazh nëse ska pagesa
const oldPayments = `{(b.payments || []).map((p, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 16px", fontSize: 13, borderBottom: \`1px solid \${T.border}\`, color: T.text }}><span>{p.amount}</span><span>{fmtDate(p.date)}</span><span style={{ color: T.accent, fontWeight: 600 }}>{p.validFor}</span></div>)}`;
const newPayments = `{(!b.payments || b.payments.length === 0) ? <div style={{ textAlign: "center", padding: "16px 0", color: T.textFaint, fontSize: 13 }}>Trial 30 ditë — Ska pagesa të regjistruara</div> : b.payments.map((p, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 16px", fontSize: 13, borderBottom: \`1px solid \${T.border}\`, color: T.text }}><span>{p.amount}</span><span>{fmtDate(p.date)}</span><span style={{ color: T.accent, fontWeight: 600 }}>{p.validFor}</span></div>)}`;

if (s.includes(oldPayments)) {
  s = s.replace(oldPayments, newPayments);
  changes++;
  console.log('✅ 3) Pagesat tani tregojnë mesazh nëse ska');
}

// 4) Fix Perditso button to also save logo
const oldSave = `<Btn variant="success" size="lg" onClick={save} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T}>Perditso</Btn>`;
// save already does ...form so logo is included - no change needed
console.log('✅ 4) Logo ruhet automatikisht me save (form state)');

fs.writeFileSync('src/prophone_v3.jsx', s);
console.log('\n✅ U krye ' + changes + ' ndryshime.');
