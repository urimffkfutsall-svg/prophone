const fs = require('fs');
let s = fs.readFileSync('src/prophone_v3.jsx', 'utf8');
let changes = 0;

// 1) Te ClientStatusView, shto "Koha e pranimit" pas "Data pranimit"
// Gjej listen e fields
const oldFields = `[["Nr. Punes", \`#\${w.id.slice(-6)}\`], ["Klienti", x?.name || "—"], ["Modeli", w.phoneModel], ["IMEI", w.imei || "—"], ["Data pranimit", fmtDate(w.createdAt)], ["Tekniku", k?.name || "—"]]`;
const newFields = `[["Nr. Punes", \`#\${w.id.slice(-6)}\`], ["Klienti", x?.name || "—"], ["Telefoni", x?.phone || "—"], ["Modeli", w.phoneModel], ["IMEI", w.imei || "—"], ["Kodi", w.code || "—"], ["Cmimi", w.price ? w.price + "€" : "—"], ["Data pranimit", fmtDate(w.createdAt)], ["Tekniku", k?.name || "—"]]`;

if (s.includes(oldFields)) {
  s = s.replace(oldFields, newFields);
  changes++;
  console.log('✅ 1) ClientStatusView: shtuar Telefoni, Kodi, Cmimi');
}

// 2) Enter key te Login form - wrap login button onClick into onKeyDown handler
// Find the login email input and add onKeyDown to password field
// Find: type:"password",required:!0,t:E  in AuthPage login section
// We need to add onKeyDown to the password Input for login
// Better approach: wrap the login section in a form-like onKeyDown handler

// Find the login section container - add onKeyDown on the Fragment wrapper
const oldLoginBtn = `<Btn onClick={() => {if (!email.trim() || !password.trim()) return setErr("Shkruani emailin dhe fjalekalimin");`;

// Different approach - add Enter key handler to AuthPage
// Find the AuthPage component and add a keyDown handler
const oldAuthReturn = `if (!confirmed) {
    return (`;

// Simplest approach: add onKeyDown to password inputs
// Login password input
const oldLoginPass = `<Input label="Fjalekalimi" value={password} onChange={setPassword} placeholder="Shkruaj fjalekalimin" type="password" required t={E} />`;

// Check if this exact pattern exists
if (s.includes(oldLoginPass)) {
  // Can't easily add onKeyDown to our custom Input component
  // Instead, let's wrap the auth sections with onKeyDown div
  console.log('  Found login password input');
}

// Better approach: Add onKeyDown to the outer div of AuthPage
// Find AuthPage return
const oldAuthDiv = `<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 50%, #f0f4f8 100%)", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>`;
const newAuthDiv = `<div onKeyDown={e => { if (e.key === "Enter") { const btn = e.currentTarget.querySelector("button[data-enter]"); if (btn) btn.click(); }}} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 50%, #f0f4f8 100%)", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>`;

if (s.includes(oldAuthDiv)) {
  s = s.replace(oldAuthDiv, newAuthDiv);
  changes++;
  console.log('✅ 2) AuthPage: onKeyDown Enter handler shtuar');
}

// Add data-enter attribute to KYQU and REGJISTRO buttons
// KYQU button
const oldKyquBtn = `>KYQU</Btn>`;
const newKyquBtn = ` data-enter="1">KYQU</Btn>`;
if (s.includes(oldKyquBtn)) {
  s = s.replace(oldKyquBtn, newKyquBtn);
  changes++;
  console.log('✅ 3) KYQU button: data-enter shtuar');
}

// REGJISTRO button
const oldRegBtn = `>REGJISTRO BIZNESIN</Btn>`;
const newRegBtn = ` data-enter="1">REGJISTRO BIZNESIN</Btn>`;
if (s.includes(oldRegBtn)) {
  s = s.replace(oldRegBtn, newRegBtn);
  changes++;
  console.log('✅ 4) REGJISTRO button: data-enter shtuar');
}

fs.writeFileSync('src/prophone_v3.jsx', s);
console.log('\n✅ U krye ' + changes + ' ndryshime.');
