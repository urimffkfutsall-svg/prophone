const fs = require('fs');
let c = fs.readFileSync('src/prophone_v3.jsx', 'utf8');

// 8. Manage Account - rregullo faqet
c = c.replace(
                    {["Profili", "Perdoruesit", "Parametrat e printimit", "Parametrat e statusav"].map(item => (
                      <div key={item} style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", color: T.textMuted }} onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{item}</div>
                    ))},
                    {[["Profili", "profili"], ["Perdoruesit", "perdoruesit"], ["Parametrat e printimit", "param_print"], ["Parametrat e statusave", "param_status"]].map(([label, key]) => (
                      <div key={key} onClick={() => { navigate("settings", key); setMenuOpen(false); }} style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", color: T.textMuted }} onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{label}</div>
                    ))}
);

// 9. Shto badge per statusin i_marre ne THEME
c = c.replace(
    badge: { new: { bg: "#FEE2E2", color: "#EF4444" }, ne_proces: { bg: "#FEF3C7", color: "#D97706" }, gati: { bg: "#DBEAFE", color: "#2563EB" }, perfunduar: { bg: "#D1FAE5", color: "#059669" }, nuk_merret: { bg: "#F1F5F9", color: "#475569" } },,
    badge: { new: { bg: "#FEE2E2", color: "#EF4444" }, ne_proces: { bg: "#FEF3C7", color: "#D97706" }, gati: { bg: "#DBEAFE", color: "#2563EB" }, perfunduar: { bg: "#D1FAE5", color: "#059669" }, i_marre: { bg: "#EDE9FE", color: "#7C3AED" }, nuk_merret: { bg: "#F1F5F9", color: "#475569" } },
);

c = c.replace(
    badge: { new: { bg: "#7f1d1d55", color: "#FCA5A5" }, ne_proces: { bg: "#78350f55", color: "#FCD34D" }, gati: { bg: "#1e3a8a55", color: "#93C5FD" }, perfunduar: { bg: "#065f4655", color: "#6EE7B7" }, nuk_merret: { bg: "#1e293b", color: "#94A3B8" } },,
    badge: { new: { bg: "#7f1d1d55", color: "#FCA5A5" }, ne_proces: { bg: "#78350f55", color: "#FCD34D" }, gati: { bg: "#1e3a8a55", color: "#93C5FD" }, perfunduar: { bg: "#065f4655", color: "#6EE7B7" }, i_marre: { bg: "#4c1d9555", color: "#C4B5FD" }, nuk_merret: { bg: "#1e293b", color: "#94A3B8" } },
);

fs.writeFileSync('src/prophone_v3.jsx', c, 'utf8');
console.log('STEP 3 DONE');
