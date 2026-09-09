import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

const BORGJI_PUBLIC_BASE = "https://prophone-alpha.vercel.app/";

export function printBorgjiKupon(d, business) {
  const qrUrl = `${BORGJI_PUBLIC_BASE}?borgji=${d.id}`;
  const biz = business || {};
  const dataFmt = (d.data_borgjit || "").split("-").reverse().join("/");
  const w = window.open("", "_blank", "width=400,height=620");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Borgji</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
  <style>
    @page { size: 80mm 210mm; margin: 0; }
    html, body { width: 80mm; margin: 0; padding: 0; font-family: "Segoe UI", Arial, sans-serif; }
    .wrap { padding: 10px 12px; }
    .center { text-align: center; }
    .biz { font-size: 15px; font-weight: 800; }
    .title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0; }
    .lbl { color: #555; } .val { font-weight: 700; text-align: right; }
    .amount { font-size: 22px; font-weight: 800; text-align: center; margin: 10px 0; }
    .hr { border-top: 1px dashed #000; margin: 8px 0; }
    .muted { font-size: 10px; color: #666; text-align: center; }
    #qr { display: flex; justify-content: center; margin: 8px 0; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style></head><body><div class="wrap">
    <div class="center biz">${biz.name || "Biznesi"}</div>
    ${biz.phone ? `<div class="center muted">Tel: ${biz.phone}</div>` : ""}
    <div class="hr"></div>
    <div class="title center">Kupon Borgji</div>
    <div class="row"><span class="lbl">Klienti:</span><span class="val">${(d.emri||"")} ${(d.mbiemri||"")}</span></div>
    <div class="row"><span class="lbl">Data:</span><span class="val">${dataFmt}</span></div>
    ${d.arsyeja ? `<div class="row"><span class="lbl">Arsyeja:</span><span class="val">${d.arsyeja}</span></div>` : ""}
    <div class="hr"></div>
    <div class="amount">${Number(d.shuma||0).toFixed(2)} EUR</div>
    <div class="muted">Skano QR-in per detajet e borgjit</div>
    <div id="qr"></div>
    <div class="hr"></div>
    <div class="muted">Faleminderit!</div>
  </div>
  <script>
    new QRCode(document.getElementById("qr"), { text: "${qrUrl}", width: 120, height: 120, correctLevel: QRCode.CorrectLevel.M });
    setTimeout(function(){ window.print(); }, 500);
  <\/script>
  </body></html>`);
  w.document.close();
}

export function Borgjet({ business, T, showToast }) {
  const accountId = business && business.id;
  const today = new Date().toISOString().slice(0, 10);
  const empty = { emri: "", mbiemri: "", arsyeja: "", shuma: "", data_borgjit: today };
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const border = (T && T.border) || "#e2e8f0";
  const surface = (T && T.surface) || "#fff";

  const load = async () => {
    if (!accountId) return;
    const res = await supabase.from("borgjet").select("*").eq("account_id", accountId).order("created_at", { ascending: false });
    if (!res.error && res.data) setList(res.data);
  };
  useEffect(() => { load(); }, [accountId]);

  const add = async () => {
    if (!form.emri.trim()) { showToast && showToast("Shkruani emrin"); return; }
    const payload = {
      account_id: accountId,
      emri: form.emri.trim(),
      mbiemri: form.mbiemri.trim(),
      arsyeja: form.arsyeja.trim(),
      shuma: parseFloat(form.shuma) || 0,
      data_borgjit: form.data_borgjit || today,
      biznesi_emri: (business && business.name) || "",
      biznesi_tel: (business && business.phone) || "",
    };
    const res = await supabase.from("borgjet").insert(payload).select().single();
    if (res.error) { showToast && showToast("Gabim: " + res.error.message); return; }
    setList(l => [res.data, ...l]);
    setForm(empty);
    showToast && showToast("Borgji u shtua!");
  };

  const togglePaid = async (d) => {
    const res = await supabase.from("borgjet").update({ paguar: !d.paguar }).eq("id", d.id);
    if (!res.error) setList(l => l.map(x => x.id === d.id ? { ...x, paguar: !d.paguar } : x));
  };
  const remove = async (d) => {
    if (!window.confirm("Fshij kete borgj?")) return;
    const res = await supabase.from("borgjet").delete().eq("id", d.id);
    if (!res.error) setList(l => l.filter(x => x.id !== d.id));
  };

  const totalPapaguar = list.filter(x => !x.paguar).reduce((s, x) => s + Number(x.shuma || 0), 0);

  const stInp = { padding: "10px 12px", borderRadius: 10, border: "1px solid " + border, fontSize: 14, width: "100%", boxSizing: "border-box" };
  const stInpFull = { padding: "10px 12px", borderRadius: 10, border: "1px solid " + border, fontSize: 14, width: "100%", boxSizing: "border-box", marginBottom: 10 };
  const stWrap = { padding: "8px 4px 80px" };
  const stH2 = { fontSize: 22, fontWeight: 800, margin: "0 0 4px" };
  const stSub = { color: "#64748b", fontSize: 14, marginBottom: 16 };
  const stTotal = { color: "#dc2626" };
  const stCard = { background: surface, border: "1px solid " + border, borderRadius: 16, padding: 16, marginBottom: 20 };
  const stH3 = { margin: "0 0 12px", fontSize: 16, fontWeight: 700 };
  const stGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 };
  const stAddBtn = { background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" };
  const stListWrap = { display: "flex", flexDirection: "column", gap: 10 };
  const stEmpty = { color: "#94a3b8", textAlign: "center", padding: 20 };
  const stInfo = { minWidth: 0 };
  const stName = { fontWeight: 700, fontSize: 14 };
  const stBadge = { color: "#16a34a", fontSize: 12, marginLeft: 6 };
  const stMeta = { color: "#64748b", fontSize: 12, marginTop: 2 };
  const stRight = { display: "flex", alignItems: "center", gap: 8 };
  const stAmount = { fontWeight: 800, fontSize: 15 };
  const stBtn = { border: "1px solid " + border, background: "transparent", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 };
  const stDel = { border: "1px solid #fecaca", background: "#fff5f5", color: "#dc2626", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 };
  const rowCard = (paid) => ({ background: surface, border: "1px solid " + border, borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, opacity: paid ? 0.55 : 1 });

  return (
    <div style={stWrap}>
      <h2 style={stH2}>Borgjet</h2>
      <p style={stSub}>Totali i papaguar: <b style={stTotal}>{totalPapaguar.toFixed(2)} EUR</b></p>
      <div style={stCard}>
        <h3 style={stH3}>Shto borgj te ri</h3>
        <div style={stGrid}>
          <input style={stInp} placeholder="Emri" value={form.emri} onChange={e => setForm(f => ({ ...f, emri: e.target.value }))} />
          <input style={stInp} placeholder="Mbiemri" value={form.mbiemri} onChange={e => setForm(f => ({ ...f, mbiemri: e.target.value }))} />
          <input style={stInp} type="number" step="0.01" placeholder="Shuma (EUR)" value={form.shuma} onChange={e => setForm(f => ({ ...f, shuma: e.target.value }))} />
          <input style={stInp} type="date" value={form.data_borgjit} onChange={e => setForm(f => ({ ...f, data_borgjit: e.target.value }))} />
        </div>
        <input style={stInpFull} placeholder="Arsyeja e borgjit" value={form.arsyeja} onChange={e => setForm(f => ({ ...f, arsyeja: e.target.value }))} />
        <button style={stAddBtn} onClick={add}>+ Shto borgjin</button>
      </div>
      <div style={stListWrap}>
        {list.length === 0 && <p style={stEmpty}>Snuk ka borgje ende.</p>}
        {list.map(d => (
          <div key={d.id} style={rowCard(d.paguar)}>
            <div style={stInfo}>
              <div style={stName}>{d.emri} {d.mbiemri} {d.paguar && <span style={stBadge}>Paguar</span>}</div>
              <div style={stMeta}>{d.arsyeja || "-"} - {(d.data_borgjit || "").split("-").reverse().join("/")}</div>
            </div>
            <div style={stRight}>
              <span style={stAmount}>{Number(d.shuma || 0).toFixed(2)} EUR</span>
              <button style={stBtn} onClick={() => printBorgjiKupon(d, business)}>Printo</button>
              <button style={stBtn} onClick={() => togglePaid(d)}>{d.paguar ? "Anulo" : "Paguaj"}</button>
              <button style={stDel} onClick={() => remove(d)}>Fshij</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ l, v }) {
  const stRow = { display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 0", borderTop: "1px solid #f1f5f9" };
  const stL = { color: "#64748b", fontSize: 13 };
  const stV = { fontWeight: 700, fontSize: 13, textAlign: "right" };
  return (<div style={stRow}><span style={stL}>{l}</span><span style={stV}>{v}</span></div>);
}

export function BorgjiPublicPage({ debtId }) {
  const [d, setD] = useState(null);
  const [state, setState] = useState("loading");
  useEffect(() => {
    (async () => {
      const res = await supabase.from("borgjet").select("*").eq("id", debtId).single();
      if (res.error || !res.data) { setState("notfound"); return; }
      setD(res.data); setState("ok");
    })();
  }, [debtId]);

  const wrap = { minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Segoe UI, Arial, sans-serif" };
  if (state === "loading") return <div style={wrap}>Duke u ngarkuar...</div>;
  if (state === "notfound") return <div style={wrap}>Borgji nuk u gjet.</div>;

  const card = { background: "#fff", borderRadius: 18, boxShadow: "0 10px 40px rgba(0,0,0,.12)", padding: 24, width: "100%", maxWidth: 360 };
  const bizName = { fontSize: 18, fontWeight: 800, textAlign: "center" };
  const bizTel = { fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 2 };
  const hr = { borderTop: "1px solid #e2e8f0", margin: "14px 0" };
  const title = { fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", textAlign: "center" };
  const amount = { fontSize: 30, fontWeight: 800, textAlign: "center", margin: "6px 0", color: "#dc2626" };
  const statusWrap = { textAlign: "center", marginBottom: 10 };
  const statusBadge = { display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: d.paguar ? "#dcfce7" : "#fee2e2", color: d.paguar ? "#16a34a" : "#dc2626" };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={bizName}>{d.biznesi_emri || "Biznesi"}</div>
        {d.biznesi_tel && <div style={bizTel}>Tel: {d.biznesi_tel}</div>}
        <div style={hr} />
        <div style={title}>Detajet e Borgjit</div>
        <div style={amount}>{Number(d.shuma || 0).toFixed(2)} EUR</div>
        <div style={statusWrap}><span style={statusBadge}>{d.paguar ? "I paguar" : "I papaguar"}</span></div>
        <Row l="Klienti" v={(d.emri || "") + " " + (d.mbiemri || "")} />
        <Row l="Arsyeja" v={d.arsyeja || "-"} />
        <Row l="Data" v={(d.data_borgjit || "").split("-").reverse().join("/")} />
      </div>
    </div>
  );
}
