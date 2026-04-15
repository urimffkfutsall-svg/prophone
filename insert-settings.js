const fs = require('fs');
const lines = fs.readFileSync('src/prophone_v3.jsx', 'utf8').split('\n');

const insertAt = 933; // line 934 (0-indexed = 933)

const newCode = `
// ============================================================
// SETTINGS PAGE
// ============================================================
function SettingsPage({ tab, data, setData, onNavigate, T }) {
  const [activeTab, setActiveTab] = React.useState(tab || "profili");
  const tabs = [
    { key: "profili", label: "Profili" },
    { key: "perdoruesit", label: "Perdoruesit" },
    { key: "param_print", label: "Parametrat e printimit" },
    { key: "param_status", label: "Parametrat e statusave" },
  ];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => onNavigate("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>← Kthehu</button>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>Manage Account</h2>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: activeTab === t.key ? T.accentGrad : T.surfaceAlt, color: activeTab === t.key ? "#fff" : T.textMuted, transition: "all .2s" }}>{t.label}</button>
        ))}
      </div>
      {activeTab === "profili" && <SettingsProfili data={data} setData={setData} T={T} />}
      {activeTab === "perdoruesit" && <SettingsPerdoruesit data={data} setData={setData} T={T} />}
      {activeTab === "param_print" && <SettingsPrint data={data} setData={setData} T={T} />}
      {activeTab === "param_status" && <SettingsStatuses data={data} setData={setData} T={T} />}
    </div>
  );
}

function SettingsProfili({ data, setData, T }) {
  const b = data.business || {};
  const [form, setForm] = React.useState({ name: b.name||"", email: b.email||"", phone: b.phone||"", address: b.address||"", country: b.country||"", city: b.city||"", facebook: b.facebook||"", instagram: b.instagram||"", website: b.website||"" });
  const [logo, setLogo] = React.useState(b.logo || null);
  const [saved, setSaved] = React.useState(false);
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };
  const save = () => {
    setData(d => ({ ...d, business: { ...d.business, ...form, logo } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const cities = COUNTRIES.find(c => c.name === form.country)?.cities || [];
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Logo e Biznesit</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 100, height: 100, borderRadius: 16, border: "2px dashed " + T.border, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: T.surfaceAlt }}>
            {logo ? <img src={logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ color: T.textFaint, fontSize: 12, textAlign: "center" }}>Nuk ka logo</span>}
          </div>
          <div>
            <label style={{ display: "inline-block", padding: "10px 20px", background: T.accentGrad, color: "#fff", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              Ngarko Logo nga PC
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
            </label>
            {logo && <button onClick={() => setLogo(null)} style={{ marginLeft: 10, background: "none", border: "1.5px solid " + T.border, borderRadius: 10, padding: "10px 16px", cursor: "pointer", color: T.textMuted, fontSize: 13 }}>Largo logon</button>}
            <p style={{ margin: "8px 0 0", fontSize: 12, color: T.textFaint }}>PNG, JPG deri 2MB. Logo shfaqet ne kupon.</p>
          </div>
        </div>
      </div>
      <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Informacioni i Biznesit</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Emri Biznesit" value={form.name} onChange={v => setForm(f=>({...f,name:v}))} t={T} />
          <Input label="Numri Tel." value={form.phone} onChange={v => setForm(f=>({...f,phone:v}))} t={T} />
        </div>
        <Input label="Email" value={form.email} onChange={v => setForm(f=>({...f,email:v}))} t={T} />
        <Input label="Adresa" value={form.address} onChange={v => setForm(f=>({...f,address:v}))} t={T} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Input label="Facebook" value={form.facebook} onChange={v => setForm(f=>({...f,facebook:v}))} t={T} />
          <Input label="Instagram" value={form.instagram} onChange={v => setForm(f=>({...f,instagram:v}))} t={T} />
          <Input label="Website" value={form.website} onChange={v => setForm(f=>({...f,website:v}))} t={T} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Select label="Shteti" value={form.country} onChange={v => setForm(f=>({...f,country:v,city:""}))} options={COUNTRIES.map(c=>c.name)} t={T} />
          <Select label="Qyteti" value={form.city} onChange={v => setForm(f=>({...f,city:v}))} options={cities} t={T} />
        </div>
        <Btn variant={saved ? "success" : "primary"} size="lg" onClick={save} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T}>{saved ? "U ruajt!" : "Ruaj ndryshimet"}</Btn>
      </div>
    </div>
  );
}

function SettingsPerdoruesit({ data, setData, T }) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const addWorker = () => {
    if (!name.trim()) return;
    setData(d => ({ ...d, workers: [...d.workers, { id: Date.now().toString(), name: name.trim(), phone: phone.trim(), createdAt: new Date().toISOString() }] }));
    setName(""); setPhone("");
  };
  const removeWorker = (id) => setData(d => ({ ...d, workers: d.workers.filter(w => w.id !== id) }));
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Shto Perdorues te Ri</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Emri" value={name} onChange={setName} placeholder="Emri i punëtorit" t={T} />
          <Input label="Numri Tel." value={phone} onChange={setPhone} placeholder="044 123 456" t={T} />
        </div>
        <Btn variant="primary" onClick={addWorker} disabled={!name.trim()} t={T}>+ Shto Perdoruesin</Btn>
      </div>
      <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Perdoruesit Aktual ({data.workers.length})</h3>
        {data.workers.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.textFaint }}>Nuk ka perdorues</div>}
        {data.workers.map(w => (
          <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid " + T.border }}>
            <div>
              <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>{w.name}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{w.phone || "Pa numer"}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: T.textFaint }}>{data.jobs.filter(j => j.workerId === w.id).length} pune</span>
              <button onClick={() => removeWorker(w.id)} style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Largo</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPrint({ data, setData, T }) {
  const b = data.business || {};
  const [form, setForm] = React.useState({
    printHeader: b.printHeader || "",
    printFooter: b.printFooter || "",
    printShowLogo: b.printShowLogo !== false,
    printShowQR: b.printShowQR !== false,
    printShowPrice: b.printShowPrice !== false,
    printShowIMEI: b.printShowIMEI !== false,
    printPaperSize: b.printPaperSize || "80mm",
  });
  const [saved, setSaved] = React.useState(false);
  const save = () => {
    setData(d => ({ ...d, business: { ...d.business, ...form } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const Toggle = ({ label, field }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid " + T.border }}>
      <span style={{ fontSize: 14, color: T.text }}>{label}</span>
      <button onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))} style={{ width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer", background: form[field] ? T.accent : T.border, position: "relative", transition: "background .2s" }}>
        <span style={{ position: "absolute", top: 3, left: form[field] ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", display: "block" }} />
      </button>
    </div>
  );
  return (
    <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Parametrat e Kuponit</h3>
      <Toggle label="Shfaq logon ne kupon" field="printShowLogo" />
      <Toggle label="Shfaq QR kodin" field="printShowQR" />
      <Toggle label="Shfaq cmimin" field="printShowPrice" />
      <Toggle label="Shfaq IMEI-n" field="printShowIMEI" />
      <div style={{ marginTop: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, display: "block", marginBottom: 8 }}>Madhesia e letres</label>
        <select value={form.printPaperSize} onChange={e => setForm(f=>({...f,printPaperSize:e.target.value}))} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid " + T.border, fontSize: 14, background: T.inputBg, color: T.text, width: "100%", outline: "none" }}>
          <option value="80mm">80mm (Printer termik)</option>
          <option value="A4">A4</option>
          <option value="A5">A5</option>
        </select>
      </div>
      <div style={{ marginTop: 16 }}>
        <Input label="Teksti i kokes se kuponit" value={form.printHeader} onChange={v => setForm(f=>({...f,printHeader:v}))} placeholder="p.sh. Faleminderit per besimin!" t={T} />
        <Input label="Teksti i fundit te kuponit" value={form.printFooter} onChange={v => setForm(f=>({...f,printFooter:v}))} placeholder="p.sh. Garanci 30 dite" t={T} />
      </div>
      <Btn variant={saved ? "success" : "primary"} size="lg" onClick={save} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T}>{saved ? "U ruajt!" : "Ruaj ndryshimet"}</Btn>
    </div>
  );
}

function SettingsStatuses({ data, setData, T }) {
  const [statuses, setStatuses] = React.useState(() => STATUSES.map(s => ({...s})));
  const [saved, setSaved] = React.useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div style={{ background: T.surface, borderRadius: 20, padding: 28, border: "1.5px solid " + T.border }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: T.text }}>Parametrat e Statusave</h3>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: T.textMuted }}>Shiko dhe menaxho statuset aktuale te puneve.</p>
      {statuses.map((s, i) => (
        <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid " + T.border }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <input value={s.label} onChange={e => { const ns = [...statuses]; ns[i] = {...ns[i], label: e.target.value}; setStatuses(ns); }} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid " + T.border, fontSize: 14, background: T.inputBg, color: T.text, outline: "none" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="color" value={s.color} onChange={e => { const ns = [...statuses]; ns[i] = {...ns[i], color: e.target.value}; setStatuses(ns); }} style={{ width: 36, height: 36, border: "none", cursor: "pointer", borderRadius: 8 }} />
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>
          </div>
        </div>
      ))}
      <Btn variant={saved ? "success" : "primary"} size="lg" onClick={save} style={{ width: "100%", justifyContent: "center", marginTop: 20 }} t={T}>{saved ? "U ruajt!" : "Ruaj ndryshimet"}</Btn>
    </div>
  );
}

`;

lines.splice(insertAt, 0, newCode);
fs.writeFileSync('src/prophone_v3.jsx', lines.join('\n'), 'utf8');
console.log('Settings components inserted at line 934. DONE!');
