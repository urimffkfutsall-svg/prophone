const fs = require('fs');
let c = fs.readFileSync('src/prophone_v3.jsx', 'utf8');

// 1. Ndrysho STATUSES
c = c.replace(
const STATUSES = [
  { key: "new", label: "New", color: "#EF4444", bg: "#FEE2E2" },
  { key: "ne_proces", label: "Në Proces", color: "#D97706", bg: "#FEF3C7" },
  { key: "gati", label: "Gati", color: "#2563EB", bg: "#DBEAFE" },
  { key: "perfunduar", label: "Përfunduar", color: "#059669", bg: "#D1FAE5" },
  { key: "nuk_merret", label: "Nuk Merret", color: "#475569", bg: "#F1F5F9" },
];,
const STATUSES = [
  { key: "new", label: "I Pranuar në Servis", color: "#EF4444", bg: "#FEE2E2" },
  { key: "ne_proces", label: "Në Proces", color: "#D97706", bg: "#FEF3C7" },
  { key: "gati", label: "Gati", color: "#2563EB", bg: "#DBEAFE" },
  { key: "perfunduar", label: "Përfunduar", color: "#059669", bg: "#D1FAE5" },
  { key: "i_marre", label: "I Marrë nga Servisi", color: "#7C3AED", bg: "#EDE9FE" },
  { key: "nuk_merret", label: "Nuk Rregullohet", color: "#475569", bg: "#F1F5F9" },
];
);

// 2. Pas regjistrimit - shfaq njoftim dhe butoni kyqu (mos hap dashboard)
c = c.replace(
  const handleRegister = (biz) => {
      // New business gets a 30-day trial by default
      const withTrial = addSubscriptionDays(biz, 30);
      setAccounts(a => [...a, withTrial]);
      setPage("dashboard");
    };,
  const handleRegister = (biz) => {
      const withTrial = addSubscriptionDays(biz, 30);
      setAccounts(a => [...a, withTrial]);
      setRegSuccess(true);
    };
);

// 3. Shto useState per regSuccess
c = c.replace(
  const navigate = (pg, param = null) => { setPage(pg); setPageParam(param); window.scrollTo(0, 0); };,
  const [regSuccess, setRegSuccess] = useState(false);
  const navigate = (pg, param = null) => { setPage(pg); setPageParam(param); window.scrollTo(0, 0); };
);

// 4. AuthPage - shfaq njoftim sukses dhe butoni kyqu
c = c.replace(
    if (page === "auth") return (
      <><style>{styles}</style>
      <AuthPage onRegister={handleRegister} onLogin={handleLogin} accounts={accounts} />
      <Toast message={toast.msg} visible={toast.show} /></>
    );,
    if (page === "auth") return (
      <><style>{styles}</style>
      <AuthPage onRegister={handleRegister} onLogin={handleLogin} accounts={accounts} regSuccess={regSuccess} onGoLogin={() => setRegSuccess(false)} />
      <Toast message={toast.msg} visible={toast.show} /></>
    );
);

fs.writeFileSync('src/prophone_v3.jsx', c, 'utf8');
console.log('STEP 1 DONE');
