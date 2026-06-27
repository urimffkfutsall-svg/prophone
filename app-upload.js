const fs = require("fs");
const p = "src/prophone_v3.jsx";
let src = fs.readFileSync(p, "utf8");
fs.writeFileSync(p + ".bak18", src);
const report = [];

function applyUnique(name, a, b) {
  const i = src.indexOf(a);
  if (i === -1) { report.push(name + ": NUK U GJET"); return; }
  if (src.indexOf(a, i + a.length) !== -1) { report.push(name + ": SHUME NDESHJE - u anulua"); return; }
  src = src.replace(a, () => b);
  report.push(name + ": OK");
}

const floatingIIFE = `
(function() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  function mount() {
    try {
      var existing = document.getElementById("__datapos_admin_app_btn");
      var v = window.localStorage.getItem("prophone_is_admin");
      var isAdmin = v === "1" || v === "true";
      var hide = window.location.hash === "#app-upload";
      if (!isAdmin || hide) { if (existing) existing.remove(); return; }
      if (existing) return;
      var btn = document.createElement("button");
      btn.id = "__datapos_admin_app_btn";
      btn.textContent = "Aplikacioni";
      btn.title = "Ngarko aplikacionin Windows";
      btn.style.cssText = "position:fixed;right:20px;bottom:90px;z-index:99999;padding:12px 20px;background:linear-gradient(135deg,#0EA5E9,#0284C7);color:#fff;border:none;border-radius:999px;cursor:pointer;font-weight:600;font-size:14px;box-shadow:0 6px 18px rgba(14,165,233,0.45);font-family:inherit;";
      btn.onclick = function() {
        window.location.hash = "#app-upload";
        setTimeout(function() { window.location.reload(); }, 50);
      };
      document.body.appendChild(btn);
    } catch (e) { }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
  setInterval(mount, 3000);
})();

`;

const appUploadCode = `
function AppUploadSection(props) {
  const T = props.T;
  const [file, setFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [cur, setCur] = React.useState(null);
  const [msg, setMsg] = React.useState("");
  const inputRef = React.useRef(null);

  const loadCurrent = async () => {
    try {
      const r = await supabase.storage.from("app-downloads").list("");
      if (r.error) { setMsg("Gabim: " + r.error.message); return; }
      const f = (r.data || []).find(x => x.name === "datapos-app.zip");
      if (f) {
        const pub = supabase.storage.from("app-downloads").getPublicUrl("datapos-app.zip");
        setCur({ name: f.name, size: (f.metadata && f.metadata.size) || 0, updated: f.updated_at || f.created_at, url: pub.data.publicUrl });
      } else {
        setCur(null);
      }
    } catch (e) { setMsg("Gabim: " + (e.message || e)); }
  };

  React.useEffect(() => { loadCurrent(); }, []);

  const handleUpload = async () => {
    if (!file) { setMsg("Zgjidh nje file ZIP me pare"); return; }
    setUploading(true);
    setMsg("Duke ngarkuar...");
    try {
      const r = await supabase.storage.from("app-downloads").upload("datapos-app.zip", file, { upsert: true, contentType: "application/zip" });
      if (r.error) throw r.error;
      setMsg("U ngarkua me sukses!");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await loadCurrent();
    } catch (e) { setMsg("Gabim: " + (e.message || e)); }
    finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Te fshihet aplikacioni i ngarkuar? Vizitoret nuk do ta shohin me butonin e shkarkimit.")) return;
    try {
      const r = await supabase.storage.from("app-downloads").remove(["datapos-app.zip"]);
      if (r.error) throw r.error;
      await loadCurrent();
      setMsg("U fshi.");
    } catch (e) { setMsg("Gabim: " + (e.message || e)); }
  };

  const goBack = () => {
    window.location.hash = "";
    if (props.setPage) props.setPage("dashboard");
  };

  const S = {
    wrap: { padding: 24, maxWidth: 820, margin: "0 auto" },
    back: { padding: "8px 14px", background: "transparent", color: T.text, border: "1px solid " + T.border, borderRadius: 8, cursor: "pointer", fontSize: 14, marginBottom: 16 },
    h2: { margin: "0 0 8px 0", color: T.text, fontSize: 28, fontWeight: 700 },
    intro: { color: T.textMuted, marginBottom: 24, fontSize: 15, lineHeight: 1.6 },
    card: { background: T.surface, border: "1px solid " + T.border, borderRadius: 12, padding: 20, marginBottom: 20 },
    cardTitle: { margin: "0 0 14px 0", color: T.text, fontSize: 18, fontWeight: 600 },
    meta: { color: T.textMuted, fontSize: 14, marginBottom: 4 },
    fileName: { color: T.text, fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
    badge: { display: "inline-block", padding: "3px 10px", background: T.accent, color: "#fff", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 },
    btnRow: { marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" },
    btnPrim: { padding: "10px 18px", background: T.accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, textDecoration: "none", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 },
    btnDng: { padding: "10px 18px", background: T.danger, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
    btnDis: { padding: "10px 18px", background: T.border, color: T.textMuted, border: "none", borderRadius: 8, cursor: "not-allowed", fontWeight: 600, fontSize: 14 },
    input: { display: "block", marginBottom: 12, color: T.text, padding: 12, background: T.bg, border: "1px dashed " + T.border, borderRadius: 8, width: "100%", boxSizing: "border-box", cursor: "pointer" },
    msg: { marginTop: 14, padding: 12, background: T.bg, borderRadius: 8, color: T.text, fontSize: 14, border: "1px solid " + T.border }
  };

  const fmt = (b) => { if (!b) return "?"; if (b < 1024) return b + " B"; if (b < 1048576) return (b/1024).toFixed(1) + " KB"; return (b/1048576).toFixed(2) + " MB"; };

  return React.createElement("div", { style: S.wrap },
    React.createElement("button", { style: S.back, onClick: goBack }, "< Mbrapa"),
    React.createElement("h2", { style: S.h2 }, "Aplikacioni"),
    React.createElement("p", { style: S.intro }, "Ngarko skedarin ZIP te aplikacionit DataPos per Windows. Pas ngarkimit, vizitoret e ballines do te shohin butonin 'Shkarko Aplikacionin' dhe do te mund ta shkarkojne."),
    React.createElement("div", { style: S.card },
      React.createElement("h3", { style: S.cardTitle }, "Versioni aktual"),
      cur
        ? React.createElement("div", null,
            React.createElement("div", { style: S.fileName }, cur.name, React.createElement("span", { style: S.badge }, "AKTIV")),
            React.createElement("div", { style: S.meta }, "Madhesia: ", fmt(cur.size)),
            React.createElement("div", { style: S.meta }, "Ngarkuar: ", cur.updated ? new Date(cur.updated).toLocaleString() : "?"),
            React.createElement("div", { style: S.btnRow },
              React.createElement("a", { href: cur.url, target: "_blank", rel: "noreferrer", style: S.btnPrim }, "Shkarko ZIP"),
              React.createElement("button", { style: S.btnDng, onClick: handleDelete }, "Fshij")
            )
          )
        : React.createElement("div", { style: S.meta }, "Asnje aplikacion i ngarkuar. Ngarko nje ZIP me poshte.")
    ),
    React.createElement("div", { style: S.card },
      React.createElement("h3", { style: S.cardTitle }, "Ngarko version te ri"),
      React.createElement("input", { ref: inputRef, type: "file", accept: ".zip,application/zip,application/x-zip-compressed", onChange: (e) => setFile(e.target.files && e.target.files[0]), style: S.input }),
      file && React.createElement("div", { style: S.meta }, "Zgjedhur: ", file.name, " (", fmt(file.size), ")"),
      React.createElement("div", { style: S.btnRow },
        React.createElement("button", { style: (!file || uploading) ? S.btnDis : S.btnPrim, onClick: handleUpload, disabled: !file || uploading }, uploading ? "Duke ngarkuar..." : "Ngarko")
      ),
      msg && React.createElement("div", { style: S.msg }, msg)
    )
  );
}

`;

applyUnique("insert-floating-and-upload",
  "\nfunction RevenueResetSection({ data, T }) {",
  "\n" + floatingIIFE + "\n" + appUploadCode + "\nfunction RevenueResetSection({ data, T }) {"
);

applyUnique("route-app-upload",
  'if (page === "landing") return <Landing T={T} onLogin={() => setPage("auth")} onRegister={() => setPage("auth")} />;',
  'if (page === "app-upload") return <AppUploadSection T={T} setPage={setPage} />;\n  if (page === "landing") return <Landing T={T} onLogin={() => setPage("auth")} onRegister={() => setPage("auth")} />;'
);

applyUnique("initial-page-hash",
  'const [page, setPage] = useState(() => { try { return (navigator.userAgent || "").indexOf("Electron") !== -1 ? "auth" : "landing"; } catch(e){ return "landing"; } });',
  'const [page, setPage] = useState(() => { try { if (window.location.hash === "#app-upload") return "app-upload"; return (navigator.userAgent || "").indexOf("Electron") !== -1 ? "auth" : "landing"; } catch(e){ return "landing"; } });'
);

fs.writeFileSync(p, src);
console.log(report.join("\n"));
