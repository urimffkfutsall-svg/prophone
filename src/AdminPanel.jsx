import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function AdminPanel() {
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [verifiedCompanies, setVerifiedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  const fetchData = async () => {
    setLoading(true);
    const { data: pending } = await supabase
      .from("companies")
      .select("*")
      .eq("verified", false)
      .order("created_at", { ascending: false });

    const { data: verified } = await supabase
      .from("companies")
      .select("*")
      .eq("verified", true)
      .order("verified_at", { ascending: false })
      .limit(50);

    setPendingCompanies(pending || []);
    setVerifiedCompanies(verified || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerify = async (id) => {
    if (!window.confirm("A jeni i sigurt qe doni ta verifikoni kete firme?")) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("companies")
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
        verified_by: user?.email || "admin"
      })
      .eq("id", id);
    if (error) { alert("Gabim: " + error.message); return; }
    alert("✅ Firma u verifikua!");
    fetchData();
  };

  const handleUnverify = async (id) => {
    if (!window.confirm("Hiq verifikimin e kesaj firme?")) return;
    await supabase.from("companies").update({ verified: false, verified_at: null }).eq("id", id);
    fetchData();
  };

  const handleReject = async (id) => {
    if (!window.confirm("FSHIJE kete firme perfundimisht?")) return;
    await supabase.from("companies").delete().eq("id", id);
    fetchData();
  };

  const list = tab === "pending" ? pendingCompanies : verifiedCompanies;

  return (
    <div style= padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 1100, margin: "0 auto" >
      <h1 style= marginBottom: 8 >🛡️ Panel Administratori</h1>
      <p style= color: "#666", marginTop: 0 >Menaxho verifikimin e firmave</p>

      <div style= display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #e5e7eb" >
        <button onClick={() => setTab("pending")} style=
          padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer",
          borderBottom: tab === "pending" ? "2px solid #2563eb" : "2px solid transparent",
          fontWeight: tab === "pending" ? 600 : 400, color: tab === "pending" ? "#2563eb" : "#444"
        >⏳ Ne pritje ({pendingCompanies.length})</button>
        <button onClick={() => setTab("verified")} style=
          padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer",
          borderBottom: tab === "verified" ? "2px solid #16a34a" : "2px solid transparent",
          fontWeight: tab === "verified" ? 600 : 400, color: tab === "verified" ? "#16a34a" : "#444"
        >✅ Te verifikuara ({verifiedCompanies.length})</button>
      </div>

      {loading ? <div>Duke ngarkuar...</div> : list.length === 0 ? (
        <div style= padding: 40, background: "#f9fafb", borderRadius: 8, textAlign: "center", color: "#666" >
          {tab === "pending" ? "✨ Nuk ka firma ne pritje." : "Asnje firme e verifikuar."}
        </div>
      ) : (
        <table style= width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" >
          <thead>
            <tr style= background: "#f3f4f6", textAlign: "left" >
              <th style= padding: 12 >Emri</th>
              <th style= padding: 12 >Email</th>
              <th style= padding: 12 >Data</th>
              <th style= padding: 12, textAlign: "right" >Veprimi</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id} style= borderTop: "1px solid #e5e7eb" >
                <td style= padding: 12, fontWeight: 500 >{c.name || c.company_name || c.business_name || "—"}</td>
                <td style= padding: 12, color: "#555" >{c.email || "—"}</td>
                <td style= padding: 12, color: "#777", fontSize: 13 >
                  {c.created_at ? new Date(c.created_at).toLocaleDateString("sq-AL") : "—"}
                </td>
                <td style= padding: 12, textAlign: "right" >
                  {tab === "pending" ? (
                    <>
                      <button onClick={() => handleVerify(c.id)} style=
                        background: "#16a34a", color: "#fff", border: "none", padding: "8px 14px",
                        borderRadius: 6, cursor: "pointer", marginRight: 6, fontWeight: 500
                      >✓ Verifiko</button>
                      <button onClick={() => handleReject(c.id)} style=
                        background: "#dc2626", color: "#fff", border: "none", padding: "8px 14px",
                        borderRadius: 6, cursor: "pointer", fontWeight: 500
                      >✗ Refuzo</button>
                    </>
                  ) : (
                    <button onClick={() => handleUnverify(c.id)} style=
                      background: "#f59e0b", color: "#fff", border: "none", padding: "8px 14px",
                      borderRadius: 6, cursor: "pointer", fontWeight: 500
                    >↺ Hiq verifikimin</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
