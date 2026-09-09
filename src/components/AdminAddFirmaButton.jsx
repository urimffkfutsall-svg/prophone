import React, { useState } from "react";
import { supabase } from "../supabase";
import "./AdminAddFirmaButton.css";

export default function AdminAddFirmaButton({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", city: "", country: "Kosova"
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", phone: "", city: "", country: "Kosova" });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Emri, email dhe fjalekalimi jane te detyrueshme.");
      return;
    }
    if (form.password.length < 6) {
      setError("Fjalekalimi duhet te kete te pakten 6 karaktere.");
      return;
    }
    setLoading(true);
    try {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 14);

      const { error: insertErr } = await supabase
        .from("accounts")
        .insert([{
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          city: form.city,
          country: form.country,
          status: "trial",
          registered_at: now.toISOString(),
          trial_start: now.toISOString(),
          expiry_date: trialEnd.toISOString(),
          is_verified: false
        }]);
      if (insertErr) throw insertErr;

      const { error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin + "/#/verify",
          data: { firm_name: form.name }
        }
      });
      if (authErr) console.warn("Auth signup warning:", authErr);

      setSuccessEmail(form.email);
      setShowSuccess(true);
      setOpen(false);
      resetForm();
      if (typeof onAdded === "function") onAdded();
    } catch (err) {
      console.error(err);
      setError(err.message || "Ndodhi nje gabim. Provoni perseri.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="aaf-trigger" onClick={() => setOpen(true)}>
        + Shto firme
      </button>

      {open && (
        <div className="aaf-overlay" onClick={() => !loading && setOpen(false)}>
          <div className="aaf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aaf-head">
              <h3 className="aaf-title">Shto nje firme te re</h3>
              <button className="aaf-close" onClick={() => setOpen(false)} disabled={loading}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="aaf-label">Emri i firmes *</label>
              <input className="aaf-input" type="text" value={form.name} onChange={handleChange("name")} required />
              <div className="aaf-row">
                <div>
                  <label className="aaf-label">Email *</label>
                  <input className="aaf-input" type="email" value={form.email} onChange={handleChange("email")} required />
                </div>
                <div>
                  <label className="aaf-label">Fjalekalimi *</label>
                  <input className="aaf-input" type="text" value={form.password} onChange={handleChange("password")} required />
                </div>
              </div>
              <div className="aaf-row">
                <div>
                  <label className="aaf-label">Telefoni</label>
                  <input className="aaf-input" type="text" value={form.phone} onChange={handleChange("phone")} />
                </div>
                <div>
                  <label className="aaf-label">Qyteti</label>
                  <input className="aaf-input" type="text" value={form.city} onChange={handleChange("city")} />
                </div>
              </div>
              <label className="aaf-label">Shteti</label>
              <input className="aaf-input" type="text" value={form.country} onChange={handleChange("country")} />
              {error && <div className="aaf-error">{error}</div>}
              <div className="aaf-actions">
                <button type="button" className="aaf-btn-cancel" onClick={() => setOpen(false)} disabled={loading}>Anulo</button>
                <button type="submit" className="aaf-btn-submit" disabled={loading}>
                  {loading ? "Duke shtuar..." : "Shto firmen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="aaf-overlay" onClick={() => setShowSuccess(false)}>
          <div className="aaf-modal aaf-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aaf-success-icon">📧</div>
            <h3 className="aaf-success-title">Firma u shtua me sukses!</h3>
            <p className="aaf-success-message">Nje email per verifikim u dergua ne adresen:</p>
            <div className="aaf-success-email">{successEmail}</div>
            <p className="aaf-success-hint">
              Pasi klienti te kliknoje linkun ne email, llogaria do te aktivizohet dhe ai/ajo do te mund te kyçet.
            </p>
            <button className="aaf-btn-submit aaf-success-btn" onClick={() => setShowSuccess(false)}>
              Ne rregull
            </button>
          </div>
        </div>
      )}
    </>
  );
}