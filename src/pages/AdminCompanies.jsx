import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  listCompanies, createCompany, createInvite, setCompanyStatus,
} from "../lib/companies"
import "./AdminCompanies.css"

export default function AdminCompanies() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: "", nipt: "", email: "", phone: "", address: "" })
  const [search, setSearch] = useState("")
  const [lastInvite, setLastInvite] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setCompanies(await listCompanies()) }
    catch (e) { alert("Gabim: " + e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      const company = await createCompany(form)
      const invite = await createInvite(company.id, "owner")
      setLastInvite({ company, invite })
      setForm({ name: "", nipt: "", email: "", phone: "", address: "" })
      setShowModal(false)
      await load()
    } catch (err) { alert("Gabim: " + err.message) }
  }

  const toggleStatus = async (c) => {
    await setCompanyStatus(c.id, c.status === "active" ? "suspended" : "active")
    await load()
  }

  const generateNewInvite = async (companyId) => {
    const invite = await createInvite(companyId, "employee")
    if (navigator.clipboard) navigator.clipboard.writeText(invite.code)
    alert("Kodi i ri u kopjua: " + invite.code)
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.nipt || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-companies">
      <header className="ac-header">
        <div>
          <button className="ac-back" onClick={() => navigate("/")}>← Kthehu</button>
          <h1>Firmat</h1>
          <p className="ac-sub">Menaxho firmat dhe gjenero kode regjistrimi</p>
        </div>
        <div className="ac-actions">
          <input
            className="ac-search"
            placeholder="🔍 Kërko firmë ose NIPT…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="ac-btn-primary" onClick={() => setShowModal(true)}>+ Shto firmë</button>
        </div>
      </header>

      {lastInvite && (
        <div className="ac-invite-banner">
          <div>
            <strong>{lastInvite.company.name}</strong> u krijua. Kodi:
            <code className="ac-code">{lastInvite.invite.code}</code>
          </div>
          <button onClick={() => navigator.clipboard && navigator.clipboard.writeText(lastInvite.invite.code)}>Kopjo</button>
          <button className="ac-close" onClick={() => setLastInvite(null)}>×</button>
        </div>
      )}

      {loading ? (
        <div className="ac-skeleton" />
      ) : filtered.length === 0 ? (
        <div className="ac-empty">
          <div className="ac-empty-icon">🏢</div>
          <h3>Asnjë firmë akoma</h3>
          <p>Kliko "+ Shto firmë" për të filluar.</p>
        </div>
      ) : (
        <div className="ac-grid">
          {filtered.map(c => (
            <article key={c.id} className={"ac-card " + c.status}>
              <div className="ac-card-top">
                <div className="ac-avatar">{c.name.slice(0, 2).toUpperCase()}</div>
                <span className={"ac-badge " + c.status}>
                  {c.status === "active" ? "● Aktive" : "○ E pezulluar"}
                </span>
              </div>
              <h3>{c.name}</h3>
              <p className="ac-meta">NIPT: {c.nipt || "—"}</p>
              <p className="ac-meta">{c.email || c.phone || c.address || "—"}</p>
              <div className="ac-card-actions">
                <button onClick={() => generateNewInvite(c.id)}>🔑 Kod i ri</button>
                <button onClick={() => toggleStatus(c)}>
                  {c.status === "active" ? "Pezullo" : "Aktivizo"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="ac-modal-overlay" onClick={() => setShowModal(false)}>
          <form className="ac-modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
            <h2>Shto firmë të re</h2>
            <label>Emri i firmës *
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>NIPT
              <input value={form.nipt} onChange={e => setForm({ ...form, nipt: e.target.value })} />
            </label>
            <div className="ac-row">
              <label>Email
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </label>
              <label>Telefon
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </label>
            </div>
            <label>Adresa
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </label>
            <div className="ac-modal-actions">
              <button type="button" onClick={() => setShowModal(false)}>Anulo</button>
              <button type="submit" className="ac-btn-primary">Ruaj & gjenero kod</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
