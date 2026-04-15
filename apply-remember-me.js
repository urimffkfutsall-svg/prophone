const fs = require('fs');
const path = 'src/prophone_v3.jsx';
let s = fs.readFileSync(path, 'utf8');
let changes = 0;

// ============================================================
// 1) Shto state rememberMe te AuthPage
// ============================================================
const oldState = '  const [error, setError] = useState("");\n  const T = THEME.light;';
const newState = '  const [error, setError] = useState("");\n  const [rememberMe, setRememberMe] = useState(true);\n  const T = THEME.light;';

if (s.includes(oldState)) {
  s = s.replace(oldState, newState);
  changes++;
  console.log('✅ 1) State rememberMe u shtua');
} else {
  console.error('❌ 1) Nuk u gjet state marker');
}

// ============================================================
// 2) Kaloj rememberMe te onLogin
// ============================================================
const oldOnLogin = '    setError(""); onLogin(account);';
const newOnLogin = '    setError(""); onLogin(account, rememberMe);';

if (s.includes(oldOnLogin)) {
  // Ka dy instanca: admin login dhe normal login
  // Admin login nuk ka nevojë për rememberMe, por normal login po
  // Zëvendësojmë vetëm instancën e fundit (normal login)
  const lastIdx = s.lastIndexOf(oldOnLogin);
  s = s.substring(0, lastIdx) + newOnLogin + s.substring(lastIdx + oldOnLogin.length);
  changes++;
  console.log('✅ 2) onLogin tani kalon rememberMe');
} else {
  console.error('❌ 2) Nuk u gjet onLogin');
}

// ============================================================
// 3) Shto checkbox "Më mbaj mend" para butonit KYQU
// ============================================================
const oldLoginBtn = '            <Btn onClick={handleLogin} variant="primary" size="lg" disabled={!email.trim() || !password.trim()} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T}>KYQU</Btn>';

const newLoginBtn = `            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 4px" }}>
              <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#0EA5E9" }} />
              <label htmlFor="rememberMe" style={{ fontSize: 13, color: "#64748b", cursor: "pointer", userSelect: "none" }}>Më mbaj mend</label>
            </div>
            <Btn onClick={handleLogin} variant="primary" size="lg" disabled={!email.trim() || !password.trim()} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} t={T}>KYQU</Btn>`;

if (s.includes(oldLoginBtn)) {
  s = s.replace(oldLoginBtn, newLoginBtn);
  changes++;
  console.log('✅ 3) Checkbox "Më mbaj mend" u shtua te Login form');
} else {
  console.error('❌ 3) Nuk u gjet Login button');
}

// ============================================================
// 4) Te DataPhone handleLogin, përdor localStorage/sessionStorage
// bazuar në rememberMe parameter
// ============================================================
const oldHandleLogin = '  const handleLogin = async (account) => {';
const newHandleLogin = '  const handleLogin = async (account, rememberMe = true) => {';

if (s.includes(oldHandleLogin)) {
  s = s.replace(oldHandleLogin, newHandleLogin);
  changes++;
  console.log('✅ 4) handleLogin tani pranon rememberMe parameter');
} else {
  console.error('❌ 4) Nuk u gjet handleLogin');
}

// ============================================================
// 5) Ndrysho localStorage.setItem te handleLogin
// për të përdorur storage-in e duhur
// ============================================================
const oldSetItem = "      localStorage.setItem('prophone_account_id', fresh.id);";
const newSetItem = `      if (rememberMe) {
        localStorage.setItem('prophone_account_id', fresh.id);
      } else {
        sessionStorage.setItem('prophone_account_id', fresh.id);
        localStorage.removeItem('prophone_account_id');
      }`;

if (s.includes(oldSetItem)) {
  s = s.replace(oldSetItem, newSetItem);
  changes++;
  console.log('✅ 5) Storage tani përdor localStorage ose sessionStorage');
} else {
  console.error('❌ 5) Nuk u gjet localStorage.setItem');
}

// ============================================================
// 6) Te session restore useEffect, kontrollo edhe sessionStorage
// ============================================================
const oldSessionRestore = "    const savedId = localStorage.getItem('prophone_account_id');";
const newSessionRestore = "    const savedId = localStorage.getItem('prophone_account_id') || sessionStorage.getItem('prophone_account_id');";

if (s.includes(oldSessionRestore)) {
  s = s.replace(oldSessionRestore, newSessionRestore);
  changes++;
  console.log('✅ 6) Session restore kontrollon edhe sessionStorage');
} else {
  console.error('❌ 6) Nuk u gjet session restore');
}

// ============================================================
// 7) Te logout, pastro edhe sessionStorage
// ============================================================
const oldLogout = "localStorage.removeItem('prophone_account_id'); setData(DEFAULT_DATA);";
const newLogout = "localStorage.removeItem('prophone_account_id'); sessionStorage.removeItem('prophone_account_id'); setData(DEFAULT_DATA);";

if (s.includes(oldLogout)) {
  s = s.replace(oldLogout, newLogout);
  changes++;
  console.log('✅ 7) Logout pastron edhe sessionStorage');
} else {
  console.error('❌ 7) Nuk u gjet logout');
}

fs.writeFileSync(path, s, 'utf8');
console.log('\n✅ U krye ' + changes + '/7 ndryshime.');
