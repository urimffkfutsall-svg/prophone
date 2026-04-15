const fs = require('fs');
let c = fs.readFileSync('src/prophone_v3.jsx', 'utf8');

// 5. AuthPage - shto regSuccess prop dhe njoftim
c = c.replace(
  function AuthPage({ onRegister, onLogin, accounts }) {,
  function AuthPage({ onRegister, onLogin, accounts, regSuccess, onGoLogin }) {
);

// 6. Shto njoftim sukses para return ne AuthPage
c = c.replace(
    if (email.trim() === ADMIN_CREDENTIALS.email) { setError("Ky email nuk mund te regjistrohet"); return; }
      setError("");
      onRegister({,
    if (email.trim() === ADMIN_CREDENTIALS.email) { setError("Ky email nuk mund te regjistrohet"); return; }
      setError("");
      onRegister({
);

// 7. Shto pamjen e suksesit - zëvendëso butonin REGJISTRO
c = c.replace(
              <Btn onClick={handleRegister} variant="primary" size="lg" disabled={!name.trim() || !email.trim() || !password.trim()} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T}>REGJISTRO BIZNESIN</Btn>
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>Jeni regjistruar? </span>
                <span onClick={() => { setMode("login"); setError(""); }} style={{ color: T.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Kyqu ketu</span>,
              {regSuccess ? (
                <div style={{ background: "#D1FAE5", border: "1.5px solid #059669", borderRadius: 12, padding: "20px 16px", textAlign: "center", marginTop: 8 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ fontWeight: 800, color: "#059669", fontSize: 16, marginBottom: 4 }}>U regjistruat me sukses!</div>
                  <div style={{ color: "#065f46", fontSize: 13, marginBottom: 16 }}>Tani mund të kyqeni me llogarinë tuaj.</div>
                  <Btn onClick={() => { onGoLogin(); setMode("login"); setError(""); }} variant="success" size="lg" style={{ width: "100%", justifyContent: "center" }} t={T}>KYQU TANI</Btn>
                </div>
              ) : (
                <Btn onClick={handleRegister} variant="primary" size="lg" disabled={!name.trim() || !email.trim() || !password.trim()} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T}>REGJISTRO BIZNESIN</Btn>
              )}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>Jeni regjistruar? </span>
                <span onClick={() => { setMode("login"); setError(""); }} style={{ color: T.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Kyqu ketu</span>
);

fs.writeFileSync('src/prophone_v3.jsx', c, 'utf8');
console.log('STEP 2 DONE');
