import { useState } from "react"
import { supabase } from "../supabase"
import "./AdminAddFirmaButton.css"

const COUNTRIES = [
  { name: "Kosovë", cities: ["Prishtinë","Gjilan","Prizren","Pejë","Ferizaj","Mitrovicë","Gjakovë","Podujevë","Vushtrri","Suharekë","Rahovec","Drenas","Lipjan","Malishevë","Kamenicë","Viti","Deçan","Istog","Klinë","Skenderaj","Dragash","Fushë Kosovë","Kaçanik","Shtime","Obiliq","Novobërdë","Shtërpcë","Graçanicë","Mamushë","Junik","Hani i Elezit"] },
  { name: "Shqipëri", cities: ["Tiranë","Durrës","Vlorë","Shkodër","Elbasan","Korçë","Fier","Berat","Lushnjë","Pogradec","Kavajë","Kukës","Sarandë","Lezhë","Gjirokastër","Peshkopi","Burrel","Laç","Krujë","Librazhd"] },
  { name: "Maqedoni e Veriut", cities: ["Shkup","Tetovë","Gostivar","Kumanovë","Strumicë","Ohër","Manastir","Prilep","Veles","Shtip","Kërçovë"] },
]

export default function AdminAddFirmaButton(props) {
  const onAdded = props.onAdded
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("Kosovë")
  const [city, setCity] = useState("")
  const [trialDays, setTrialDays] = useState(30)

  const cities = COUNTRIES.find(c => c.name === country)?.cities || []

  const reset = () => {
    setName(""); setEmail(""); setPassword(""); setPhone("")
    setCountry("Kosovë"); setCity(""); setTrialDays(30)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Plotësoni emrin, email-in dhe fjalëkalimin")
      return
    }
    setSaving(true)
    try {
      const checkRes = await supabase.from("accounts").select("id").eq("email", email.trim()).maybeSingle()
      if (checkRes.data) {
        alert("Ky email është i regjistruar tashmë")
        setSaving(false)
        return
      }
      const now = new Date()
      const ms = Number(trialDays || 30) * 86400000
      const expiry = new Date(now.getTime() + ms)
      const row = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        phone: phone || null,
        city: city || null,
        country: country || null,
        status: "active",
        registered_at: now.toISOString(),
        trial_start: now.toISOString(),
        expiry_date: expiry.toISOString(),
      }
      const insertRes = await supabase.from("accounts").insert(row)
      if (insertRes.error) throw insertRes.error
      setOpen(false)
      reset()
      if (onAdded) await onAdded()
    } catch (err) {
      alert("Gabim: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button type="button" className="aaf-trigger" onClick={() => setOpen(true)}>
        + Shto firmë
      </button>
      {open ? (
        <div className="aaf-overlay" onClick={() => { if (!saving) setOpen(false) }}>
          <form className="aaf-modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
            <div className="aaf-head">
              <h2 className="aaf-title">🏢 Shto firmë të re</h2>
              <button type="button" className="aaf-close" onClick={() => { if (!saving) setOpen(false) }}>×</button>
            </div>
            <label className="aaf-label">Emri i firmës *
              <input className="aaf-input" required value={name} onChange={e => setName(e.target.value)} placeholder="P.sh. Mobile Center" />
            </label>
            <div className="aaf-row">
              <label className="aaf-label">Email *
                <input type="email" className="aaf-input" required value={email} onChange={e => setEmail(e.target.value)} placeholder="info@firma.com" />
              </label>
              <label className="aaf-label">Fjalëkalimi *
                <input type="text" className="aaf-input" required value={password} onChange={e => setPassword(e.target.value)} placeholder="min 6 karaktere" />
              </label>
            </div>
            <div className="aaf-row">
              <label className="aaf-label">Telefoni
                <input className="aaf-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+383 ..." />
              </label>
              <label className="aaf-label">Ditë abonimi
                <input type="number" min="1" className="aaf-input" value={trialDays} onChange={e => setTrialDays(e.target.value)} />
              </label>
            </div>
            <div className="aaf-row">
              <label className="aaf-label">Shteti
                <select className="aaf-input" value={country} onChange={e => { setCountry(e.target.value); setCity("") }}>
                  {COUNTRIES.map(c => <option key={c.name}>{c.name}</option>)}
                </select>
              </label>
              <label className="aaf-label">Qyteti
                <select className="aaf-input" value={city} onChange={e => setCity(e.target.value)}>
                  <option value="">— Zgjidh —</option>
                  {cities.map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <div className="aaf-actions">
              <button type="button" className="aaf-btn-cancel" onClick={() => setOpen(false)} disabled={saving}>Anulo</button>
              <button type="submit" className="aaf-btn-submit" disabled={saving}>
                {saving ? "Po ruhet..." : "Ruaj firmën"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  )
}