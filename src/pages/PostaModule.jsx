import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "";
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================
// DESIGN TOKENS - same identity as ProPhone
// ============================================================
const mkT = (dark) => dark ? {
  bg:"#0f172a",card:"#1e293b",border:"#334155",
  text:"#f1f5f9",muted:"#94a3b8",faint:"#475569",
  accent:"#3b82f6",accentHover:"#60a5fa",accentBg:"#1e3a5f",
  success:"#22c55e",successBg:"#052e16",
  warn:"#f59e0b",warnBg:"#451a03",
  danger:"#ef4444",dangerBg:"#450a0a",
  info:"#22d3ee",infoBg:"#164e63",
  sidebar:"#0f172a",shadow:"0 1px 4px rgba(0,0,0,.4)",
  input:"#1e293b",inputBorder:"#334155",
} : {
  bg:"#f8fafc",card:"#ffffff",border:"#e2e8f0",
  text:"#1e293b",muted:"#64748b",faint:"#94a3b8",
  accent:"#2563eb",accentHover:"#1d4ed8",accentBg:"#eff6ff",
  success:"#16a34a",successBg:"#f0fdf4",
  warn:"#d97706",warnBg:"#fffbeb",
  danger:"#dc2626",dangerBg:"#fef2f2",
  info:"#0891b2",infoBg:"#ecfeff",
  sidebar:"#1e293b",shadow:"0 1px 3px rgba(0,0,0,.08)",
  input:"#ffffff",inputBorder:"#e2e8f0",
};

// ============================================================
// SHIPMENT STATE MACHINE
// ============================================================
const TRANSITIONS = {
  CREATED:["PICKUP_REQUESTED","ASSIGNED","CANCELLED"],
  PICKUP_REQUESTED:["ASSIGNED","CANCELLED"],
  ASSIGNED:["PICKED_UP","CANCELLED"],
  PICKED_UP:["AT_WAREHOUSE","IN_TRANSIT"],
  AT_WAREHOUSE:["IN_TRANSIT","RETURN_REQUESTED"],
  IN_TRANSIT:["ARRIVED_AT_DESTINATION","AT_WAREHOUSE"],
  ARRIVED_AT_DESTINATION:["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY:["DELIVERED","FAILED_DELIVERY"],
  DELIVERED:[],
  FAILED_DELIVERY:["OUT_FOR_DELIVERY","RETURN_REQUESTED"],
  RETURN_REQUESTED:["RETURNED","OUT_FOR_DELIVERY"],
  RETURNED:[],
  CANCELLED:[],
};

const STATUS_META = {
  CREATED:               {l:"Krijuar",            c:"#64748b",bg:"#f1f5f9",e:"📦"},
  PICKUP_REQUESTED:      {l:"Pickup Kërkuar",     c:"#d97706",bg:"#fffbeb",e:"🔔"},
  ASSIGNED:              {l:"Caktuar",            c:"#7c3aed",bg:"#f5f3ff",e:"👤"},
  PICKED_UP:             {l:"Marrë",              c:"#0891b2",bg:"#ecfeff",e:"🚚"},
  AT_WAREHOUSE:          {l:"Në Depo",            c:"#0284c7",bg:"#e0f2fe",e:"🏭"},
  IN_TRANSIT:            {l:"Në Transit",         c:"#2563eb",bg:"#eff6ff",e:"✈️"},
  ARRIVED_AT_DESTINATION:{l:"Arritur",            c:"#059669",bg:"#ecfdf5",e:"📍"},
  OUT_FOR_DELIVERY:      {l:"Për Dorëzim",        c:"#f59e0b",bg:"#fffbeb",e:"🏃"},
  DELIVERED:             {l:"Dorëzuar",           c:"#16a34a",bg:"#f0fdf4",e:"✅"},
  FAILED_DELIVERY:       {l:"Dështuar",           c:"#dc2626",bg:"#fef2f2",e:"❌"},
  RETURN_REQUESTED:      {l:"Kthim Kërkuar",      c:"#ea580c",bg:"#fff7ed",e:"↩️"},
  RETURNED:              {l:"Kthyer",             c:"#9333ea",bg:"#faf5ff",e:"🔄"},
  CANCELLED:             {l:"Anuluar",            c:"#6b7280",bg:"#f9fafb",e:"🚫"},
};

const SERVICES = [
  {k:"standard",    l:"Standard",       d:"2-3 ditë",   p:3.50},
  {k:"express",     l:"Express",        d:"1 ditë",     p:6.00},
  {k:"same_day",    l:"Same Day",       d:"Sot",        p:10.00},
  {k:"international",l:"Ndërkombëtar", d:"5-10 ditë",  p:15.00},
];

const PACKAGE_TYPES = ["Kuti","Zarf","Pako","Dokument","Elektronikë","Veshje","Ushqim","Tjetër"];
const CITIES = ["Prishtinë","Prizren","Pejë","Gjakovë","Mitrovicë","Gjilan","Ferizaj","Vushtrri","Podujevo","Lipjan","Rahovec","Malishevë","Klinë","Drenas","Obiliq","Kaçanik","Istog","Skenderaj"];
const PAYMENT_METHODS = {prepaid:"Parapaguar",cod:"Para në dorë (COD)",account:"Llogari",cash:"Cash"};
const FAIL_REASONS = ["Klienti mungonte","Adresë e gabuar","Klienti refuzoi","Telefon i parealizueshëm","Adresë e paarritshme","Tjetër"];
const COURIER_STATUS = {
  AVAILABLE:{l:"Disponibël",c:"#16a34a",bg:"#f0fdf4"},
  ON_ROUTE: {l:"Në Rrugë",  c:"#2563eb",bg:"#eff6ff"},
  BUSY:     {l:"I Zënë",    c:"#d97706",bg:"#fffbeb"},
  OFFLINE:  {l:"Offline",   c:"#6b7280",bg:"#f9fafb"},
};

// ============================================================
// UTILITIES
// ============================================================
const genTracking = () => {
  const yr = new Date().getFullYear();
  const seq = String(Date.now()).slice(-6);
  return `PPX-${yr}-${seq}`;
};

const fmtDate = d => d ? new Date(d).toLocaleDateString("sq-AL",{day:"2-digit",month:"2-digit",year:"numeric"}) : "—";
const fmtDT   = d => d ? new Date(d).toLocaleString("sq-AL",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
const calcFee = (svc, weight, cod=0) => {
  const base = (SERVICES.find(s=>s.k===svc)||SERVICES[0]).p;
  const wFee = weight > 1 ? (weight - 1) * 0.5 : 0;
  const cFee = cod > 0 ? cod * 0.02 : 0;
  return +(base + wFee + cFee).toFixed(2);
};

const showToast = (msg, type="info") => {
  const d = document.createElement("div");
  d.innerText = msg;
  const colors = {info:"#2563eb",success:"#16a34a",error:"#dc2626",warn:"#d97706"};
  Object.assign(d.style, {
    position:"fixed",bottom:"24px",right:"24px",zIndex:9999,
    padding:"12px 20px",borderRadius:"8px",fontWeight:600,fontSize:"14px",
    boxShadow:"0 4px 16px rgba(0,0,0,.2)",background:colors[type]||colors.info,
    color:"#fff",maxWidth:"340px",lineHeight:1.4,
  });
  document.body.appendChild(d);
  setTimeout(()=>d.remove(), 3500);
};

// ============================================================
// UI PRIMITIVES
// ============================================================
const Btn = ({children,onClick,variant="primary",size="md",disabled=false,style={},T}) => {
  const palettes = {
    primary:{bg:T.accent,color:"#fff"},
    danger: {bg:T.danger,color:"#fff"},
    success:{bg:T.success,color:"#fff"},
    warn:   {bg:T.warn,color:"#fff"},
    outline:{bg:"transparent",color:T.text,border:`1px solid ${T.border}`},
    ghost:  {bg:"transparent",color:T.muted},
  };
  const p = palettes[variant]||palettes.primary;
  const pads = {sm:"5px 12px",md:"8px 18px",lg:"11px 26px"};
  const fss  = {sm:12,md:14,lg:15};
  return (
    <button disabled={disabled} onClick={onClick}
      style={{padding:pads[size]||pads.md,fontSize:fss[size]||14,fontWeight:600,
        background:p.bg,color:p.color,border:p.border||"none",
        borderRadius:7,cursor:disabled?"not-allowed":"pointer",
        opacity:disabled?.55:1,transition:"all .15s",whiteSpace:"nowrap",...style}}>
      {children}
    </button>
  );
};

const Badge = ({status, T}) => {
  const s = STATUS_META[status] || {l:status,c:"#64748b",bg:"#f1f5f9",e:"?"};
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,
      padding:"3px 10px",borderRadius:20,background:s.bg,
      color:s.c,fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>
      {s.e} {s.l}
    </span>
  );
};

const CourierBadge = ({status, T}) => {
  const s = COURIER_STATUS[status] || {l:status,c:"#64748b",bg:"#f1f5f9"};
  return <span style={{padding:"3px 10px",borderRadius:20,background:s.bg,color:s.c,fontSize:12,fontWeight:700}}>{s.l}</span>;
};

const Card = ({children,style={},T}) => (
  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:20,boxShadow:T.shadow,...style}}>
    {children}
  </div>
);

const Input = React.memo(({label,value,onChange,type="text",placeholder="",required=false,style={},T}) => (
  <div style={{marginBottom:14,...style}}>
    {label && <label style={{display:"block",fontSize:12,fontWeight:600,color:T.muted,marginBottom:5}}>
      {label}{required && <span style={{color:T.danger}}> *</span>}
    </label>}
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder}
      style={{width:"100%",padding:"9px 12px",border:`1px solid ${T.inputBorder}`,
        borderRadius:6,background:T.input,color:T.text,fontSize:14,
        outline:"none",boxSizing:"border-box"}}/>
  </div>
));

const Select = React.memo(({label,value,onChange,options=[],style={},T}) => (
  <div style={{marginBottom:14,...style}}>
    {label && <label style={{display:"block",fontSize:12,fontWeight:600,color:T.muted,marginBottom:5}}>{label}</label>}
    <select value={value||""} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",padding:"9px 12px",border:`1px solid ${T.inputBorder}`,
        borderRadius:6,background:T.input,color:T.text,fontSize:14,outline:"none"}}>
      <option value="">-- Zgjedh --</option>
      {options.map(o => typeof o==="string"
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
));

const Modal = ({open,onClose,title,children,T,width=520}) => {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",
      justifyContent:"center",background:"rgba(0,0,0,.5)"}} onClick={onClose}>
      <div style={{background:T.card,borderRadius:12,padding:28,
        width:`min(${width}px,95vw)`,maxHeight:"90vh",overflowY:"auto",
        boxShadow:"0 24px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <h3 style={{margin:0,fontSize:18,color:T.text}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.muted,lineHeight:1}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const StatCard = ({label,value,icon,color,T}) => (
  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 18px",boxShadow:T.shadow}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
      <span style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.6}}>{label}</span>
      <span style={{fontSize:18}}>{icon}</span>
    </div>
    <div style={{fontSize:26,fontWeight:800,color:color||T.text}}>{value??"0"}</div>
  </div>
);

const Empty = ({icon,title,desc,action,T}) => (
  <div style={{textAlign:"center",padding:"60px 24px"}}>
    <div style={{fontSize:52,marginBottom:14}}>{icon||"📦"}</div>
    <h3 style={{margin:"0 0 8px",color:T.text,fontSize:18}}>{title}</h3>
    <p style={{color:T.muted,margin:"0 0 22px",fontSize:14}}>{desc}</p>
    {action}
  </div>
);

const PageHeader = ({title,sub,actions,T}) => (
  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
    <div>
      <h1 style={{margin:0,fontSize:22,fontWeight:800,color:T.text}}>{title}</h1>
      {sub && <p style={{margin:"4px 0 0",color:T.muted,fontSize:13}}>{sub}</p>}
    </div>
    {actions && <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{actions}</div>}
  </div>
);

const Table = ({cols,rows,T,onRow}) => (
  <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead>
        <tr>
          {cols.map(c => (
            <th key={c.k} style={{padding:"10px 14px",textAlign:"left",fontSize:11,
              fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,
              borderBottom:`2px solid ${T.border}`,whiteSpace:"nowrap"}}>{c.l}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} style={{textAlign:"center",padding:"40px",color:T.faint}}>Nuk ka të dhëna</td></tr>
          : rows.map((row,i) => (
            <tr key={i} onClick={()=>onRow&&onRow(row)}
              style={{borderBottom:`1px solid ${T.border}`,cursor:onRow?"pointer":"default",transition:"background .1s"}}
              onMouseEnter={e=>{if(onRow)e.currentTarget.style.background=T.accentBg}}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {cols.map(c => (
                <td key={c.k} style={{padding:"10px 14px",fontSize:13,color:T.text}}>
                  {c.render ? c.render(row[c.k], row) : (row[c.k] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);

const TrackingTimeline = ({events, T}) => {
  if (!events || !events.length)
    return <div style={{color:T.muted,textAlign:"center",padding:24}}>Nuk ka ngjarje tracking.</div>;
  return (
    <div style={{position:"relative",paddingLeft:32}}>
      <div style={{position:"absolute",left:12,top:0,bottom:0,width:2,background:T.border,borderRadius:1}}/>
      {events.map((ev,i) => {
        const isLast = i === events.length - 1;
        const meta = STATUS_META[ev.status];
        return (
          <div key={i} style={{position:"relative",marginBottom:22}}>
            <div style={{position:"absolute",left:-24,top:2,width:18,height:18,borderRadius:"50%",
              background:isLast?T.accent:T.success,display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:9,color:"#fff",fontWeight:900}}>
              {isLast ? "●" : "✓"}
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:700,color:T.text}}>
                {meta ? `${meta.e} ${meta.l}` : ev.description || ev.status}
              </span>
              <span style={{fontSize:11,color:T.faint}}>{fmtDT(ev.created_at)}</span>
            </div>
            {ev.location && <div style={{fontSize:12,color:T.muted,marginTop:3}}>📍 {ev.location}</div>}
            {ev.description && meta && <div style={{fontSize:12,color:T.muted,marginTop:2}}>{ev.description}</div>}
          </div>
        );
      })}
    </div>
  );
};

// Barcode display (simplified visual)
const BarcodeDisplay = ({value, width=200, height=48, T}) => {
  if (!value) return null;
  const bars = [];
  let x = 4;
  for (let i = 0; i < value.length; i++) {
    const w = (value.charCodeAt(i) % 3) + 1;
    bars.push(<rect key={i} x={x} y={0} width={w} height={height-10} fill={T.text} rx={0.5}/>);
    x += w + 1;
  }
  return (
    <svg width={width} height={height} style={{display:"block",borderRadius:4,background:T.card}}>
      {bars}
      <text x={width/2} y={height-2} textAnchor="middle" fontSize={8} fill={T.faint}
        fontFamily="monospace">{value}</text>
    </svg>
  );
};

// ============================================================
// PRINT LABEL
// ============================================================
const printLabel = (ship) => {
  const w = window.open("","_blank","width=520,height=720");
  w.document.write(`<!DOCTYPE html><html><head><title>Label ${ship.tracking_number}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:0;padding:16px;background:#fff;}
    .label{border:2px solid #000;padding:16px;max-width:400px;margin:0 auto;}
    .header{text-align:center;font-size:20px;font-weight:900;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:12px;letter-spacing:1px;}
    .tracking{font-size:24px;font-weight:900;text-align:center;letter-spacing:3px;margin:10px 0;font-family:monospace;}
    .barcode{text-align:center;background:#000;color:#fff;padding:8px;font-family:monospace;font-size:13px;letter-spacing:5px;margin:6px 0;}
    .section{margin:10px 0;border-top:1px solid #ccc;padding-top:8px;}
    .section-label{font-size:9px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;}
    .big{font-size:15px;font-weight:700;margin:2px 0;}
    .row{display:flex;justify-content:space-between;font-size:11px;margin:3px 0;}
    .cod{background:#fef2f2;border:2px solid #dc2626;padding:8px;text-align:center;margin:8px 0;border-radius:4px;}
    .cod-amount{font-size:22px;font-weight:900;color:#dc2626;}
  </style></head><body>
  <div class="label">
    <div class="header">📮 PROPHONE POST</div>
    <div class="tracking">${ship.tracking_number}</div>
    <div class="barcode">${(ship.barcode||ship.tracking_number||'').replace(/-/g,'')}</div>
    ${ship.cod_amount>0?`<div class="cod"><div style="font-size:10px;font-weight:700;">PARA NË DORË (COD)</div><div class="cod-amount">${ship.cod_amount} EUR</div></div>`:''}
    <div class="section">
      <div class="section-label">Dërguesi</div>
      <div class="big">${ship.sender_name||''}</div>
      <div style="font-size:12px;">${ship.sender_phone||''} | ${ship.sender_city||''}</div>
    </div>
    <div class="section">
      <div class="section-label">Marrësi</div>
      <div class="big" style="font-size:17px;">${ship.recipient_name||''}</div>
      <div style="font-size:13px;font-weight:600;">${ship.recipient_phone||''}</div>
      <div style="font-size:12px;">${ship.recipient_address||''}</div>
      <div style="font-size:13px;font-weight:700;">${ship.recipient_city||''}</div>
    </div>
    <div class="section">
      <div class="row"><span>Shërbimi:</span><span style="font-weight:700;">${(ship.service_type||'').toUpperCase()}</span></div>
      <div class="row"><span>Peshë:</span><span>${ship.weight||1} kg</span></div>
      <div class="row"><span>Tarifa:</span><span style="font-weight:700;">${ship.shipping_fee||0} EUR</span></div>
    </div>
    <div style="text-align:center;font-size:9px;color:#999;margin-top:12px;border-top:1px solid #eee;padding-top:6px;">
      prophone.app | ${new Date().toLocaleString('sq-AL')}
    </div>
  </div>
  <script>window.onload=()=>setTimeout(()=>window.print(),400);<\/script>
  </body></html>`);
  w.document.close();
};

// ============================================================
// DASHBOARD
// ============================================================
function PostaDashboard({T}) {
  const [stats, setStats] = useState({total:0,transit:0,delivery:0,delivered:0,failed:0,returned:0,cod:0,codPending:0});
  const [recent, setRecent] = useState([]);
  const [byCity, setByCity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const {data:all} = await supabase.from("posta_shipments").select("status,cod_amount,recipient_city");
        if (all) {
          const s = {total:all.length,transit:0,delivery:0,delivered:0,failed:0,returned:0,cod:0,codPending:0};
          const cities = {};
          all.forEach(r => {
            if (["IN_TRANSIT","AT_WAREHOUSE","ARRIVED_AT_DESTINATION"].includes(r.status)) s.transit++;
            if (r.status==="OUT_FOR_DELIVERY") s.delivery++;
            if (r.status==="DELIVERED") { s.delivered++; if(r.cod_amount>0) s.cod+=parseFloat(r.cod_amount); }
            if (r.status==="FAILED_DELIVERY") s.failed++;
            if (r.status==="RETURNED") s.returned++;
            if (["CREATED","ASSIGNED","PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY"].includes(r.status)&&r.cod_amount>0) s.codPending+=parseFloat(r.cod_amount);
            cities[r.recipient_city] = (cities[r.recipient_city]||0)+1;
          });
          setStats(s);
          setByCity(Object.entries(cities).sort((a,b)=>b[1]-a[1]).slice(0,6));
        }
        const {data:rc} = await supabase.from("posta_shipments").select("*").order("created_at",{ascending:false}).limit(10);
        if (rc) setRecent(rc);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const sub = supabase.channel("dashboard_live")
      .on("postgres_changes",{event:"*",schema:"public",table:"posta_shipments"},() => {
        // Reload on any change
        setLoading(true);
        supabase.from("posta_shipments").select("status,cod_amount,recipient_city").then(({data}) => {
          if (data) {
            const s = {total:data.length,transit:0,delivery:0,delivered:0,failed:0,returned:0,cod:0,codPending:0};
            data.forEach(r => {
              if (["IN_TRANSIT","AT_WAREHOUSE","ARRIVED_AT_DESTINATION"].includes(r.status)) s.transit++;
              if (r.status==="OUT_FOR_DELIVERY") s.delivery++;
              if (r.status==="DELIVERED") { s.delivered++; if(r.cod_amount>0) s.cod+=parseFloat(r.cod_amount); }
              if (r.status==="FAILED_DELIVERY") s.failed++;
              if (r.status==="RETURNED") s.returned++;
            });
            setStats(s);
          }
          setLoading(false);
        });
      }).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const kpis = [
    {label:"Total Dërgesat",  value:stats.total,     icon:"📦", color:T.accent},
    {label:"Në Transit",      value:stats.transit,   icon:"✈️", color:T.info},
    {label:"Për Dorëzim",     value:stats.delivery,  icon:"🏃", color:T.warn},
    {label:"Dorëzuar",        value:stats.delivered, icon:"✅", color:T.success},
    {label:"Dështuar",        value:stats.failed,    icon:"❌", color:T.danger},
    {label:"Kthyer",          value:stats.returned,  icon:"🔄", color:"#9333ea"},
    {label:"COD Mbledhur",    value:stats.cod.toFixed(0)+"€",  icon:"💰", color:T.success},
    {label:"COD Prites",      value:stats.codPending.toFixed(0)+"€", icon:"⏳", color:T.warn},
  ];

  const successRate = stats.total > 0 ? ((stats.delivered/stats.total)*100).toFixed(1) : 0;

  return (
    <div style={{padding:28}}>
      <PageHeader T={T} title="📊 Dashboard Posta" sub="Pasqyra e plotë e operacioneve — live"/>
      {loading
        ? <div style={{textAlign:"center",padding:80,color:T.muted}}>Duke ngarkuar...</div>
        : <>
          {/* KPI Grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12,marginBottom:28}}>
            {kpis.map(k => <StatCard key={k.label} T={T} {...k}/>)}
          </div>
          {/* Success Rate Bar */}
          <Card T={T} style={{marginBottom:20,padding:"16px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:13,fontWeight:700,color:T.text}}>📈 Shkalla e Suksesit të Dorëzimit</span>
              <span style={{fontSize:20,fontWeight:900,color:T.success}}>{successRate}%</span>
            </div>
            <div style={{background:T.border,borderRadius:6,height:10}}>
              <div style={{background:`linear-gradient(90deg,${T.success},${T.info})`,borderRadius:6,height:10,width:successRate+"%",transition:"width .6s ease"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:T.faint}}>
              <span>0%</span><span>100%</span>
            </div>
          </Card>
          {/* By City */}
          {byCity.length > 0 && (
            <Card T={T} style={{marginBottom:20}}>
              <h3 style={{margin:"0 0 16px",fontSize:14,color:T.text}}>🏙️ Dërgesat sipas Qytetit</h3>
              {byCity.map(([city,count]) => {
                const pct = stats.total > 0 ? Math.round(count/stats.total*100) : 0;
                return (
                  <div key={city} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:13,color:T.text,fontWeight:500}}>{city}</span>
                      <span style={{fontSize:13,fontWeight:700,color:T.accent}}>{count} ({pct}%)</span>
                    </div>
                    <div style={{background:T.border,borderRadius:4,height:6}}>
                      <div style={{background:T.accent,borderRadius:4,height:6,width:pct+"%",transition:"width .4s"}}/>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
          {/* Recent Shipments */}
          <Card T={T} style={{padding:0}}>
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}>
              <h3 style={{margin:0,fontSize:14,color:T.text}}>📋 Dërgesat e Fundit</h3>
            </div>
            <Table T={T}
              cols={[
                {k:"tracking_number",l:"Tracking",render:v=><span style={{fontFamily:"monospace",fontWeight:700,color:T.accent,fontSize:12}}>{v}</span>},
                {k:"recipient_name",l:"Marrësi"},
                {k:"recipient_city",l:"Qyteti"},
                {k:"service_type",l:"Shërbimi",render:v=><span style={{textTransform:"capitalize",fontSize:12}}>{v}</span>},
                {k:"status",l:"Statusi",render:(v)=><Badge status={v} T={T}/>},
                {k:"cod_amount",l:"COD",render:v=>v>0?<span style={{color:T.warn,fontWeight:700}}>{parseFloat(v).toFixed(0)}€</span>:"—"},
                {k:"created_at",l:"Data",render:v=>fmtDate(v)},
              ]}
              rows={recent}
            />
          </Card>
        </>}
    </div>
  );
}

// ============================================================
// SHIPMENT LIST
// ============================================================
function ShipmentList({T, setSubPage, setSelectedShipment}) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterService, setFilterService] = useState("");
  const [page, setPage] = useState(0);
  const PER_PAGE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from("posta_shipments").select("*",{count:"exact"})
        .order("created_at",{ascending:false})
        .range(page*PER_PAGE, (page+1)*PER_PAGE-1);
      if (filterStatus)  q = q.eq("status", filterStatus);
      if (filterCity)    q = q.eq("recipient_city", filterCity);
      if (filterService) q = q.eq("service_type", filterService);
      if (search) q = q.or(`tracking_number.ilike.%${search}%,recipient_name.ilike.%${search}%,sender_name.ilike.%${search}%,recipient_phone.ilike.%${search}%,barcode.ilike.%${search}%`);
      const {data,error} = await q;
      if (error) throw error;
      setShipments(data||[]);
    } catch(e) { showToast("Gabim: "+e.message,"error"); }
    finally { setLoading(false); }
  }, [page, filterStatus, filterCity, filterService, search]);

  useEffect(() => { load(); }, [load]);

  // Real-time
  useEffect(() => {
    const sub = supabase.channel("shipments_rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"posta_shipments"},() => load())
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [load]);

  const clear = () => { setSearch(""); setFilterStatus(""); setFilterCity(""); setFilterService(""); setPage(0); };

  return (
    <div style={{padding:28}}>
      <PageHeader T={T}
        title="📦 Dërgesat"
        sub={`${shipments.length} dërgesa të ngarkuara`}
        actions={
          <>
            <Btn T={T} variant="outline" size="sm" onClick={() => {
              const rows = shipments;
              const h = ["Tracking","Dërguesi","Marrësi","Qyteti","Shërbimi","Statusi","COD","Tarifa","Data"];
              const csv = [h,...rows.map(r=>[r.tracking_number,r.sender_name,r.recipient_name,r.recipient_city,r.service_type,r.status,r.cod_amount,r.shipping_fee,fmtDate(r.created_at)])].map(r=>r.join(",")).join("\n");
              const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="dërgesa.csv"; a.click();
            }}>↓ CSV</Btn>
            <Btn T={T} onClick={() => setSubPage("create")}>+ Krijo Dërgesë</Btn>
          </>
        }
      />
      {/* Filters */}
      <Card T={T} style={{marginBottom:16,padding:"12px 16px"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}
            placeholder="🔍 Kërko tracking, emër, telefon, barcode..."
            style={{flex:"1 1 200px",padding:"8px 12px",border:`1px solid ${T.inputBorder}`,borderRadius:6,background:T.input,color:T.text,fontSize:13}}/>
          <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(0);}}
            style={{padding:"8px 10px",border:`1px solid ${T.inputBorder}`,borderRadius:6,background:T.input,color:T.text,fontSize:13}}>
            <option value="">Gjitha Statuset</option>
            {Object.entries(STATUS_META).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}
          </select>
          <select value={filterCity} onChange={e=>{setFilterCity(e.target.value);setPage(0);}}
            style={{padding:"8px 10px",border:`1px solid ${T.inputBorder}`,borderRadius:6,background:T.input,color:T.text,fontSize:13}}>
            <option value="">Gjitha Qytetet</option>
            {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterService} onChange={e=>{setFilterService(e.target.value);setPage(0);}}
            style={{padding:"8px 10px",border:`1px solid ${T.inputBorder}`,borderRadius:6,background:T.input,color:T.text,fontSize:13}}>
            <option value="">Gjitha Shërbimet</option>
            {SERVICES.map(s=><option key={s.k} value={s.k}>{s.l}</option>)}
          </select>
          <Btn T={T} size="sm" variant="ghost" onClick={clear}>✕ Pastro</Btn>
        </div>
      </Card>
      {loading
        ? <div style={{textAlign:"center",padding:80,color:T.muted}}>Duke ngarkuar...</div>
        : shipments.length === 0
          ? <Empty T={T} icon="📭" title="Nuk ka dërgesa" desc="Krijo dërgesën e parë"
              action={<Btn T={T} onClick={()=>setSubPage("create")}>+ Krijo Dërgesë</Btn>}/>
          : <Card T={T} style={{padding:0}}>
              <Table T={T}
                onRow={row=>{setSelectedShipment&&setSelectedShipment(row);setSubPage&&setSubPage("detail");}}
                cols={[
                  {k:"tracking_number",l:"Tracking",render:v=><span style={{fontFamily:"monospace",fontWeight:700,color:T.accent,fontSize:12}}>{v}</span>},
                  {k:"sender_name",l:"Dërguesi"},
                  {k:"recipient_name",l:"Marrësi"},
                  {k:"recipient_city",l:"Qyteti"},
                  {k:"service_type",l:"Shërbimi",render:v=><span style={{textTransform:"capitalize",fontSize:12,fontWeight:600}}>{v}</span>},
                  {k:"status",l:"Statusi",render:v=><Badge status={v} T={T}/>},
                  {k:"cod_amount",l:"COD",render:v=>v>0?<span style={{color:T.warn,fontWeight:700}}>{parseFloat(v).toFixed(0)}€</span>:"—"},
                  {k:"shipping_fee",l:"Tarifa",render:v=>v?parseFloat(v).toFixed(2)+"€":"—"},
                  {k:"created_at",l:"Data",render:v=>fmtDate(v)},
                ]}
                rows={shipments}
              />
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderTop:`1px solid ${T.border}`}}>
                <Btn T={T} size="sm" variant="outline" disabled={page===0} onClick={()=>setPage(p=>p-1)}>← Pas</Btn>
                <span style={{color:T.muted,fontSize:13}}>Faqja {page+1}</span>
                <Btn T={T} size="sm" variant="outline" disabled={shipments.length<PER_PAGE} onClick={()=>setPage(p=>p+1)}>Para →</Btn>
              </div>
            </Card>}
    </div>
  );
}

// ============================================================
// CREATE SHIPMENT WIZARD
// ============================================================
function CreateShipment({T, setSubPage, setSelectedShipment}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [form, setForm] = useState({
    sender_name:"", sender_phone:"", sender_email:"", sender_city:"Prishtinë", sender_address:"",
    recipient_name:"", recipient_phone:"", recipient_email:"", recipient_city:"",
    recipient_address:"", recipient_building:"", recipient_notes:"",
    package_type:"Kuti", weight:1, dim_l:"", dim_w:"", dim_h:"",
    quantity:1, fragile:false, description:"",
    service_type:"standard",
    payment_method:"prepaid", cod_amount:0,
  });

  const upd = useCallback((k,v) => setForm(f => ({...f, [k]:v})), []);
  const fee = calcFee(form.service_type, form.weight, form.cod_amount);
  const svc = SERVICES.find(s=>s.k===form.service_type)||SERVICES[0];

  useEffect(() => {
    supabase.from("posta_customers").select("name,phone,city,address").limit(50)
      .then(({data})=>setExistingCustomers(data||[]));
  }, []);

  const STEPS = ["Dërguesi","Marrësi","Pakoja","Shërbimi","Pagesa","Përmbledhje"];

  const submit = async () => {
    setLoading(true);
    try {
      const tracking = genTracking();
      const barcode = tracking.replace(/-/g,"");
      const delDate = new Date();
      delDate.setDate(delDate.getDate() + (svc.d==="Sot"?0:svc.d==="1 ditë"?1:svc.d.includes("2-3")?3:10));

      const {data, error} = await supabase.from("posta_shipments").insert([{
        tracking_number: tracking,
        barcode,
        sender_name:form.sender_name, sender_phone:form.sender_phone,
        sender_email:form.sender_email, sender_city:form.sender_city, sender_address:form.sender_address,
        recipient_name:form.recipient_name, recipient_phone:form.recipient_phone,
        recipient_email:form.recipient_email, recipient_city:form.recipient_city,
        recipient_address:(form.recipient_address+" "+form.recipient_building).trim(),
        recipient_notes:form.recipient_notes,
        package_type:form.package_type, weight:form.weight,
        dimensions:`${form.dim_l}x${form.dim_w}x${form.dim_h}`,
        quantity:form.quantity, fragile:form.fragile, description:form.description,
        service_type:form.service_type,
        payment_method:form.payment_method,
        cod_amount:form.payment_method==="cod"?parseFloat(form.cod_amount||0):0,
        shipping_fee:fee,
        status:"CREATED",
        estimated_delivery:delDate.toISOString(),
      }]).select().single();

      if (error) throw error;

      await supabase.from("posta_tracking_events").insert([{
        shipment_id:data.id,
        status:"CREATED",
        description:"Dërgesë e krijuar",
        location:form.sender_city,
      }]);

      // Save customer if not existing
      if (form.recipient_name && form.recipient_phone) {
        await supabase.from("posta_customers").upsert([{
          name:form.recipient_name, phone:form.recipient_phone,
          email:form.recipient_email, city:form.recipient_city, address:form.recipient_address,
        }], {onConflict:"phone", ignoreDuplicates:true});
      }

      showToast(`✅ Dërgesë u krijua! ${tracking}`,"success");
      setSelectedShipment && setSelectedShipment(data);
      setSubPage && setSubPage("detail");
    } catch(e) {
      showToast("Gabim: "+e.message,"error");
    } finally {
      setLoading(false);
    }
  };

  const stepValid = {
    1: form.sender_name && form.sender_phone,
    2: form.recipient_name && form.recipient_phone && form.recipient_city,
    3: form.weight > 0,
    4: !!form.service_type,
    5: !!form.payment_method,
    6: true,
  };

  return (
    <div style={{padding:28, maxWidth:700, margin:"0 auto"}}>
      <button onClick={()=>setSubPage("shipments")} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:13,marginBottom:16,display:"flex",alignItems:"center",gap:6}}>← Kthehu te Lista</button>
      <PageHeader T={T} title="+ Krijo Dërgesë" sub={`Hapi ${step} nga ${STEPS.length}`}/>
      {/* Progress */}
      <div style={{display:"flex",gap:3,marginBottom:8}}>
        {STEPS.map((_,i)=>(
          <div key={i} style={{flex:1,height:4,borderRadius:2,
            background:i<step?T.accent:T.border,transition:"background .2s"}}/>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {STEPS.map((s,i)=>(
          <span key={i} style={{fontSize:11,fontWeight:i+1===step?800:400,
            color:i+1===step?T.accent:i+1<step?T.success:T.faint}}>
            {i+1<step?"✓ ":""}{s}
          </span>
        ))}
      </div>

      <Card T={T}>
        {/* STEP 1 - Sender */}
        {step===1 && <>
          <h3 style={{margin:"0 0 18px",color:T.text}}>👤 Dërguesi</h3>
          {existingCustomers.length > 0 && (
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,color:T.muted,marginBottom:5}}>Klient ekzistues (opsionale)</label>
              <select onChange={e=>{
                const c = existingCustomers.find(x=>x.phone===e.target.value);
                if(c) { upd("sender_name",c.name); upd("sender_phone",c.phone); upd("sender_city",c.city||"Prishtinë"); upd("sender_address",c.address||""); }
              }} style={{width:"100%",padding:"9px 12px",border:`1px solid ${T.inputBorder}`,borderRadius:6,background:T.input,color:T.text,fontSize:14}}>
                <option value="">-- Zgjedh klient ekzistues --</option>
                {existingCustomers.map(c=><option key={c.phone} value={c.phone}>{c.name} ({c.phone})</option>)}
              </select>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input T={T} label="Emri" value={form.sender_name} onChange={v=>upd("sender_name",v)} required/>
            <Input T={T} label="Telefoni" value={form.sender_phone} onChange={v=>upd("sender_phone",v)} required/>
          </div>
          <Input T={T} label="Email" type="email" value={form.sender_email} onChange={v=>upd("sender_email",v)}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Select T={T} label="Qyteti" value={form.sender_city} onChange={v=>upd("sender_city",v)} options={CITIES}/>
            <Input T={T} label="Adresa" value={form.sender_address} onChange={v=>upd("sender_address",v)}/>
          </div>
        </>}

        {/* STEP 2 - Recipient */}
        {step===2 && <>
          <h3 style={{margin:"0 0 18px",color:T.text}}>📍 Marrësi</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input T={T} label="Emri" value={form.recipient_name} onChange={v=>upd("recipient_name",v)} required/>
            <Input T={T} label="Telefoni" value={form.recipient_phone} onChange={v=>upd("recipient_phone",v)} required/>
          </div>
          <Input T={T} label="Email" type="email" value={form.recipient_email} onChange={v=>upd("recipient_email",v)}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Select T={T} label="Qyteti *" value={form.recipient_city} onChange={v=>upd("recipient_city",v)} options={CITIES}/>
            <Input T={T} label="Rruga" value={form.recipient_address} onChange={v=>upd("recipient_address",v)}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input T={T} label="Ndërtesa / Nr." value={form.recipient_building} onChange={v=>upd("recipient_building",v)}/>
            <Input T={T} label="Shënëzime" value={form.recipient_notes} onChange={v=>upd("recipient_notes",v)}/>
          </div>
        </>}

        {/* STEP 3 - Package */}
        {step===3 && <>
          <h3 style={{margin:"0 0 18px",color:T.text}}>📦 Pakoja</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Select T={T} label="Lloji i Pakojës" value={form.package_type} onChange={v=>upd("package_type",v)} options={PACKAGE_TYPES}/>
            <Input T={T} label="Sasi" type="number" value={form.quantity} onChange={v=>upd("quantity",+v)}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
            <Input T={T} label="Pesha (kg)" type="number" value={form.weight} onChange={v=>upd("weight",+v)}/>
            <Input T={T} label="Gjatësia (cm)" type="number" value={form.dim_l} onChange={v=>upd("dim_l",v)}/>
            <Input T={T} label="Gjerësia (cm)" type="number" value={form.dim_w} onChange={v=>upd("dim_w",v)}/>
            <Input T={T} label="Lartësia (cm)" type="number" value={form.dim_h} onChange={v=>upd("dim_h",v)}/>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:14,fontSize:14,color:T.text}}>
            <input type="checkbox" checked={form.fragile} onChange={e=>upd("fragile",e.target.checked)}
              style={{width:16,height:16}}/>
            🍶 Fragile (thyhet lehtë)
          </label>
          <Input T={T} label="Përshkrim i Paketës" value={form.description} onChange={v=>upd("description",v)}/>
        </>}

        {/* STEP 4 - Service */}
        {step===4 && <>
          <h3 style={{margin:"0 0 18px",color:T.text}}>🚚 Shërbimi</h3>
          <div style={{display:"grid",gap:10}}>
            {SERVICES.map(s=>(
              <div key={s.k} onClick={()=>upd("service_type",s.k)}
                style={{padding:18,border:`2px solid ${form.service_type===s.k?T.accent:T.border}`,
                  borderRadius:8,cursor:"pointer",background:form.service_type===s.k?T.accentBg:T.card,
                  transition:"all .15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>{s.l}</div>
                    <div style={{fontSize:13,color:T.muted,marginTop:3}}>Kohëzgjatja: <strong>{s.d}</strong></div>
                  </div>
                  <div style={{fontSize:22,fontWeight:900,color:T.accent}}>{s.p}€</div>
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* STEP 5 - Payment */}
        {step===5 && <>
          <h3 style={{margin:"0 0 18px",color:T.text}}>💳 Pagesa</h3>
          <div style={{display:"grid",gap:10,marginBottom:16}}>
            {Object.entries(PAYMENT_METHODS).map(([k,v])=>(
              <div key={k} onClick={()=>upd("payment_method",k)}
                style={{padding:14,border:`2px solid ${form.payment_method===k?T.accent:T.border}`,
                  borderRadius:8,cursor:"pointer",background:form.payment_method===k?T.accentBg:T.card,
                  transition:"all .15s"}}>
                <div style={{fontWeight:700,color:T.text,fontSize:14}}>{v}</div>
              </div>
            ))}
          </div>
          {form.payment_method==="cod" && (
            <Input T={T} label="Shuma COD (EUR)" type="number" value={form.cod_amount}
              onChange={v=>upd("cod_amount",+v)}
              placeholder="Shuma që duhet mbledhur nga klienti"/>
          )}
        </>}

        {/* STEP 6 - Summary */}
        {step===6 && <>
          <h3 style={{margin:"0 0 18px",color:T.text}}>📋 Përmbledhja</h3>
          <div style={{display:"grid",gap:0}}>
            {[
              ["Dërguesi",`${form.sender_name} | ${form.sender_phone} | ${form.sender_city}`],
              ["Marrësi",`${form.recipient_name} | ${form.recipient_phone}`],
              ["Adresa Dorëzimit",`${form.recipient_address} ${form.recipient_building}, ${form.recipient_city}`],
              ["Pakoja",`${form.package_type}, ${form.weight}kg, Sasi: ${form.quantity}${form.fragile?" 🍶 Fragile":""}`],
              ["Shërbimi",`${svc.l} — ${svc.d}`],
              ["Pagesa",PAYMENT_METHODS[form.payment_method]],
              ["Tarifa Transportit",`${fee} EUR`],
              ["Shuma COD",form.payment_method==="cod"&&form.cod_amount>0?`${form.cod_amount} EUR`:"—"],
            ].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                <span style={{color:T.muted,fontSize:13,minWidth:160}}>{l}</span>
                <span style={{color:T.text,fontSize:13,fontWeight:600,textAlign:"right"}}>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",marginTop:4}}>
              <span style={{fontWeight:800,fontSize:15,color:T.text}}>TOTAL</span>
              <span style={{fontWeight:900,fontSize:18,color:T.accent}}>
                {(fee+(form.payment_method==="cod"?parseFloat(form.cod_amount||0):0)).toFixed(2)} EUR
              </span>
            </div>
          </div>
        </>}
      </Card>

      <div style={{display:"flex",justifyContent:"space-between",marginTop:18}}>
        <Btn T={T} variant="outline" disabled={step===1} onClick={()=>setStep(s=>s-1)}>← Pas</Btn>
        {step < 6
          ? <Btn T={T} disabled={!stepValid[step]} onClick={()=>setStep(s=>s+1)}>Para →</Btn>
          : <Btn T={T} disabled={loading} onClick={submit} size="lg">
              {loading ? "Duke krijuar..." : "✓ KRIJO DËRGESËN"}
            </Btn>
        }
      </div>
    </div>
  );
}

// ============================================================
// SHIPMENT DETAIL
// ============================================================
function ShipmentDetail({T, shipment:init, setSubPage, couriers=[], setSelectedShipment}) {
  const [ship, setShip] = useState(init);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [failModal, setFailModal] = useState(false);
  const [selCourier, setSelCourier] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [failReason, setFailReason] = useState("");
  const [failNote, setFailNote] = useState("");

  const loadEvents = useCallback(async () => {
    const {data} = await supabase.from("posta_tracking_events").select("*").eq("shipment_id", ship.id).order("created_at");
    if (data) setEvents(data);
  }, [ship.id]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const changeStatus = async (status, desc, location) => {
    setLoading(true);
    try {
      const {data} = await supabase.from("posta_shipments").update({status, updated_at:new Date().toISOString()}).eq("id",ship.id).select().single();
      await supabase.from("posta_tracking_events").insert([{shipment_id:ship.id, status, description:desc||(STATUS_META[status]?.l||status), location:location||ship.recipient_city}]);
      setShip(data);
      await loadEvents();
      showToast("✅ Statusi u ndryshua!","success");
    } catch(e) { showToast("Gabim: "+e.message,"error"); }
    finally { setLoading(false); setStatusModal(false); setFailModal(false); }
  };

  const assignCourier = async () => {
    if (!selCourier) { showToast("Zgjedh courier-in!","error"); return; }
    setLoading(true);
    try {
      const cour = couriers.find(c=>c.id===selCourier||c.id===+selCourier);
      const {data} = await supabase.from("posta_shipments").update({courier_id:selCourier,status:"ASSIGNED"}).eq("id",ship.id).select().single();
      await supabase.from("posta_tracking_events").insert([{shipment_id:ship.id,status:"ASSIGNED",description:`Courier i caktuar: ${cour?.name||""}`}]);
      await supabase.from("posta_couriers").update({status:"BUSY"}).eq("id",selCourier);
      setShip(data); setAssignModal(false);
      showToast("✅ Courier i caktuar!","success");
    } catch(e) { showToast("Gabim: "+e.message,"error"); }
    finally { setLoading(false); }
  };

  if (!ship) return null;
  const nextStatuses = (TRANSITIONS[ship.status]||[]).filter(s=>s!=="FAILED_DELIVERY"&&s!=="CANCELLED");
  const assignedCourier = couriers.find(c=>c.id===ship.courier_id||c.id===+ship.courier_id);

  return (
    <div style={{padding:28}}>
      <button onClick={()=>setSubPage("shipments")} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:13,marginBottom:16,display:"flex",alignItems:"center",gap:6}}>← Kthehu te Lista</button>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:24}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <h1 style={{margin:0,fontFamily:"monospace",fontSize:22,color:T.accent}}>{ship.tracking_number}</h1>
            <Badge status={ship.status} T={T}/>
          </div>
          <p style={{margin:"5px 0 0",color:T.muted,fontSize:13}}>
            Krijuar: {fmtDT(ship.created_at)} • Dorëzim i pritur: <strong style={{color:T.text}}>{fmtDate(ship.estimated_delivery)}</strong>
          </p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn T={T} size="sm" variant="outline" onClick={()=>printLabel(ship)}>🖨️ Print Label</Btn>
          {TRANSITIONS[ship.status]?.includes("ASSIGNED") && (
            <Btn T={T} size="sm" onClick={()=>setAssignModal(true)}>👤 Cakto Courier</Btn>
          )}
          {nextStatuses.length>0 && (
            <Btn T={T} size="sm" variant="success" onClick={()=>setStatusModal(true)}>✓ Ndrysho Statusin</Btn>
          )}
          {TRANSITIONS[ship.status]?.includes("FAILED_DELIVERY") && (
            <Btn T={T} size="sm" variant="danger" onClick={()=>setFailModal(true)}>❌ Dështim</Btn>
          )}
          {TRANSITIONS[ship.status]?.includes("CANCELLED") && (
            <Btn T={T} size="sm" variant="outline" onClick={()=>changeStatus("CANCELLED","Dërgesë e anuluar")}>🚫 Anulo</Btn>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,3fr) minmax(0,2fr)",gap:16,marginBottom:20}}>
        {/* LEFT */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card T={T}>
            <h4 style={{margin:"0 0 12px",fontSize:12,color:T.muted,textTransform:"uppercase",letterSpacing:.5}}>👤 Dërguesi</h4>
            <div style={{fontWeight:700,fontSize:15,color:T.text}}>{ship.sender_name}</div>
            <div style={{color:T.muted,fontSize:13}}>{ship.sender_phone}</div>
            {ship.sender_email && <div style={{color:T.muted,fontSize:13}}>{ship.sender_email}</div>}
            <div style={{color:T.muted,fontSize:13}}>{ship.sender_city}{ship.sender_address?" — "+ship.sender_address:""}</div>

            <h4 style={{margin:"16px 0 12px",fontSize:12,color:T.muted,textTransform:"uppercase",letterSpacing:.5}}>📍 Marrësi</h4>
            <div style={{fontWeight:700,fontSize:16,color:T.text}}>{ship.recipient_name}</div>
            <div style={{color:T.muted,fontSize:14,fontWeight:600}}>{ship.recipient_phone}</div>
            {ship.recipient_email && <div style={{color:T.muted,fontSize:13}}>{ship.recipient_email}</div>}
            <div style={{color:T.muted,fontSize:13}}>{ship.recipient_address}</div>
            <div style={{fontWeight:600,color:T.text,fontSize:14}}>{ship.recipient_city}</div>
            {ship.recipient_notes && <div style={{color:T.muted,fontSize:12,fontStyle:"italic",marginTop:4}}>📝 {ship.recipient_notes}</div>}
          </Card>

          <Card T={T}>
            <h4 style={{margin:"0 0 12px",fontSize:12,color:T.muted,textTransform:"uppercase",letterSpacing:.5}}>📦 Pakoja</h4>
            {[
              ["Lloji",ship.package_type],["Pesha",ship.weight+" kg"],["Dimensionet",ship.dimensions],
              ["Sasi",ship.quantity],["Fragile",ship.fragile?"🍶 Po":"Jo"],["Përshkrim",ship.description]
            ].filter(r=>r[1]).map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}>
                <span style={{color:T.muted}}>{l}</span>
                <span style={{color:T.text,fontWeight:600}}>{v}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card T={T}>
            <h4 style={{margin:"0 0 12px",fontSize:12,color:T.muted,textTransform:"uppercase",letterSpacing:.5}}>💳 Pagesa</h4>
            {[
              ["Metoda",PAYMENT_METHODS[ship.payment_method]],
              ["Shërbimi",(SERVICES.find(s=>s.k===ship.service_type)||{}).l],
              ["Tarifa",ship.shipping_fee+" EUR"],
              ["COD",ship.cod_amount>0?<span style={{color:T.warn,fontWeight:900}}>{ship.cod_amount} EUR</span>:"—"],
            ].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}>
                <span style={{color:T.muted}}>{l}</span>
                <span style={{color:T.text,fontWeight:600}}>{v}</span>
              </div>
            ))}
          </Card>

          <Card T={T}>
            <h4 style={{margin:"0 0 12px",fontSize:12,color:T.muted,textTransform:"uppercase",letterSpacing:.5}}>🚚 Courier</h4>
            {assignedCourier
              ? <>
                  <div style={{fontWeight:700,color:T.text}}>{assignedCourier.name}</div>
                  <div style={{color:T.muted,fontSize:13}}>{assignedCourier.phone}</div>
                  <CourierBadge status={assignedCourier.status} T={T}/>
                </>
              : <div style={{color:T.faint,fontSize:13}}>Nuk ka courier caktuar</div>
            }
          </Card>

          <Card T={T}>
            <h4 style={{margin:"0 0 10px",fontSize:12,color:T.muted,textTransform:"uppercase",letterSpacing:.5}}>📊 Barcode</h4>
            <BarcodeDisplay value={ship.barcode} T={T} width={180} height={44}/>
            <div style={{textAlign:"center",fontFamily:"monospace",fontSize:10,color:T.faint,marginTop:4}}>{ship.barcode}</div>
          </Card>
        </div>
      </div>

      {/* Tracking Timeline */}
      <Card T={T}>
        <h3 style={{margin:"0 0 20px",fontSize:15,color:T.text}}>🗺️ Tracking Timeline</h3>
        <TrackingTimeline events={events} T={T}/>
      </Card>

      {/* Modals */}
      <Modal T={T} open={assignModal} onClose={()=>setAssignModal(false)} title="👤 Cakto Courier">
        <Select T={T} label="Zgjedh Courier-in" value={selCourier} onChange={setSelCourier}
          options={couriers.map(c=>({value:c.id,label:`${c.name} — ${COURIER_STATUS[c.status]?.l||c.status} | ${c.vehicle||""}`}))}/>
        <Btn T={T} onClick={assignCourier} disabled={loading} style={{width:"100%",marginTop:8}}>
          {loading?"Duke caktuar...":"✓ Cakto Courier-in"}
        </Btn>
      </Modal>

      <Modal T={T} open={statusModal} onClose={()=>setStatusModal(false)} title="✓ Ndrysho Statusin">
        <Select T={T} label="Statusi i Ri" value={newStatus} onChange={setNewStatus}
          options={nextStatuses.map(s=>({value:s,label:`${STATUS_META[s]?.e||""} ${STATUS_META[s]?.l||s}`}))}/>
        <Btn T={T} onClick={()=>changeStatus(newStatus)} disabled={!newStatus||loading} style={{width:"100%",marginTop:8}}>
          {loading?"Duke ndryshuar...":"✓ Ndrysho"}
        </Btn>
      </Modal>

      <Modal T={T} open={failModal} onClose={()=>setFailModal(false)} title="❌ Dështim Dorëzimi">
        <Select T={T} label="Arsyeja" value={failReason} onChange={setFailReason} options={FAIL_REASONS}/>
        <Input T={T} label="Shënëzime shtesë" value={failNote} onChange={setFailNote}/>
        <Btn T={T} variant="danger" disabled={!failReason||loading}
          onClick={()=>changeStatus("FAILED_DELIVERY",`Dështim: ${failReason}. ${failNote}`,ship.recipient_city)}
          style={{width:"100%",marginTop:8}}>
          Konfirmo Dështimin
        </Btn>
      </Modal>
    </div>
  );
}

// ============================================================
// PUBLIC TRACKING
// ============================================================
function TrackingPage({T}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const track = async () => {
    if (!query.trim()) { setError("Vendos numrin e tracking!"); return; }
    setLoading(true); setError(""); setResult(null); setEvents([]);
    try {
      const {data} = await supabase.from("posta_shipments").select("id,tracking_number,status,sender_city,recipient_name,recipient_city,service_type,estimated_delivery,created_at")
        .or(`tracking_number.ilike.%${query.trim()}%,barcode.eq.${query.trim().replace(/-/g,"")},recipient_phone.eq.${query.trim()}`)
        .limit(1).single();
      if (data) {
        setResult(data);
        const {data:ev} = await supabase.from("posta_tracking_events").select("status,description,location,created_at").eq("shipment_id",data.id).order("created_at");
        setEvents(ev||[]);
      } else setError("Dërgesa nuk u gjet. Kontrolloni numrin.");
    } catch(e) { setError("Dërgesa nuk u gjet. Kontrolloni numrin."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{padding:28, maxWidth:620, margin:"0 auto"}}>
      <PageHeader T={T} title="🗺️ Tracking" sub="Gjurmo dërgesën tuaj"/>
      <Card T={T} style={{marginBottom:20}}>
        <div style={{display:"flex",gap:8}}>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&track()}
            placeholder="Vendos tracking number, barcode ose numrin e telefonit..."
            style={{flex:1,padding:"10px 14px",border:`1px solid ${T.inputBorder}`,borderRadius:6,
              background:T.input,color:T.text,fontSize:14,outline:"none"}}/>
          <Btn T={T} size="lg" onClick={track} disabled={loading}>{loading?"...":"🔍 Gjurmo"}</Btn>
        </div>
        {error && <div style={{color:T.danger,fontSize:13,marginTop:10,fontWeight:600}}>⚠️ {error}</div>}
      </Card>

      {result && <>
        <Card T={T} style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontFamily:"monospace",fontSize:20,fontWeight:900,color:T.accent}}>{result.tracking_number}</div>
              <div style={{color:T.muted,fontSize:13,marginTop:4}}>{result.sender_city} → {result.recipient_city}</div>
              <div style={{color:T.muted,fontSize:12}}>Dorëzim i pritur: <strong style={{color:T.text}}>{fmtDate(result.estimated_delivery)}</strong></div>
            </div>
            <Badge status={result.status} T={T}/>
          </div>
        </Card>
        <Card T={T}>
          <h3 style={{margin:"0 0 20px",fontSize:14,fontWeight:700,color:T.text}}>Tracking Timeline</h3>
          <TrackingTimeline events={events} T={T}/>
        </Card>
      </>}
    </div>
  );
}

// ============================================================
// COURIERS
// ============================================================
function CouriersModule({T, setCouriers:setParent}) {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({name:"",phone:"",vehicle:"Motocikletë",status:"AVAILABLE",notes:""});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const {data} = await supabase.from("posta_couriers").select("*").order("name");
    if (data) { setCouriers(data); setParent&&setParent(data); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openModal = (item=null) => {
    setEditItem(item);
    setForm(item ? {name:item.name,phone:item.phone,vehicle:item.vehicle||"Motocikletë",status:item.status||"AVAILABLE",notes:item.notes||""} : {name:"",phone:"",vehicle:"Motocikletë",status:"AVAILABLE",notes:""});
    setModal(true);
  };

  const save = async () => {
    if (!form.name || !form.phone) { showToast("Emri dhe telefoni janë të detyrueshëm!","error"); return; }
    setSaving(true);
    const {error} = editItem
      ? await supabase.from("posta_couriers").update(form).eq("id",editItem.id)
      : await supabase.from("posta_couriers").insert([form]);
    if (error) showToast("Gabim: "+error.message,"error");
    else { showToast(editItem?"Courier u përditësua!":"Courier u shtua!","success"); setModal(false); load(); }
    setSaving(false);
  };

  return (
    <div style={{padding:28}}>
      <PageHeader T={T} title="🚚 Courier / Drejtësit" sub={`${couriers.length} courier`}
        actions={<Btn T={T} onClick={()=>openModal()}>+ Shto Courier</Btn>}/>
      {loading
        ? <div style={{textAlign:"center",padding:60,color:T.muted}}>Duke ngarkuar...</div>
        : couriers.length===0
          ? <Empty T={T} icon="🚚" title="Nuk ka courier" desc="Shto courier-in e parë" action={<Btn T={T} onClick={()=>openModal()}>+ Shto Courier</Btn>}/>
          : <Card T={T} style={{padding:0}}>
              <Table T={T}
                cols={[
                  {k:"name",l:"Emri",render:v=><span style={{fontWeight:700}}>{v}</span>},
                  {k:"phone",l:"Telefoni"},
                  {k:"vehicle",l:"Mjeti"},
                  {k:"status",l:"Statusi",render:v=><CourierBadge status={v} T={T}/>},
                  {k:"notes",l:"Shënëzime"},
                  {k:"id",l:"Veprime",render:(_,row)=>(
                    <Btn T={T} size="sm" variant="outline" onClick={e=>{e.stopPropagation();openModal(row);}}>✏️ Edito</Btn>
                  )},
                ]}
                rows={couriers}
              />
            </Card>}
      <Modal T={T} open={modal} onClose={()=>setModal(false)} title={editItem?"✏️ Edito Courier":"+ Shto Courier"}>
        <Input T={T} label="Emri" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required/>
        <Input T={T} label="Telefoni" value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} required/>
        <Select T={T} label="Mjeti" value={form.vehicle} onChange={v=>setForm(f=>({...f,vehicle:v}))}
          options={["Motocikletë","Veturë","Kamionetë","Biçikletë","Këmbësor"]}/>
        <Select T={T} label="Statusi" value={form.status} onChange={v=>setForm(f=>({...f,status:v}))}
          options={Object.entries(COURIER_STATUS).map(([k,v])=>({value:k,label:v.l}))}/>
        <Input T={T} label="Shënëzime" value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))}/>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <Btn T={T} variant="outline" onClick={()=>setModal(false)} style={{flex:1}}>Anulo</Btn>
          <Btn T={T} onClick={save} disabled={saving} style={{flex:1}}>{saving?"Duke ruajtur...":"Ruaj"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================
// COURIER APP (Mobile-first)
// ============================================================
function CourierApp({T}) {
  const [courierId, setCourierId] = useState("");
  const [couriers, setCouriers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({total:0,done:0,cod:0});
  const [loading, setLoading] = useState(false);
  const [deliverModal, setDeliverModal] = useState(null);
  const [failModal, setFailModal] = useState(null);
  const [recipientConf, setRecipientConf] = useState("");
  const [failReason, setFailReason] = useState("");
  const [failNote, setFailNote] = useState("");

  useEffect(() => {
    supabase.from("posta_couriers").select("*").order("name").then(({data})=>setCouriers(data||[]));
  }, []);

  useEffect(() => {
    if (!courierId) return;
    setLoading(true);
    (async () => {
      const {data} = await supabase.from("posta_shipments").select("*").eq("courier_id",courierId)
        .in("status",["ASSIGNED","PICKED_UP","OUT_FOR_DELIVERY","FAILED_DELIVERY"]).order("created_at");
      if (data) {
        setDeliveries(data);
        const s = {total:data.length,done:data.filter(d=>d.status==="DELIVERED").length,
          cod:data.filter(d=>d.status==="DELIVERED"&&d.cod_amount>0).reduce((a,d)=>a+parseFloat(d.cod_amount||0),0)};
        setStats(s);
      }
      setLoading(false);
    })();
  }, [courierId]);

  const sel = couriers.find(c=>c.id===courierId||c.id===+courierId);

  const markDelivered = async () => {
    if (!deliverModal||!recipientConf) { showToast("Konfirmo emrin e marrësit!","error"); return; }
    await supabase.from("posta_shipments").update({status:"DELIVERED"}).eq("id",deliverModal.id);
    await supabase.from("posta_tracking_events").insert([{shipment_id:deliverModal.id,status:"DELIVERED",description:`U dorëzua te ${recipientConf}`,location:deliverModal.recipient_city}]);
    setDeliveries(prev=>prev.map(d=>d.id===deliverModal.id?{...d,status:"DELIVERED"}:d));
    setStats(s=>({...s,done:s.done+1,cod:s.cod+(deliverModal.cod_amount>0?parseFloat(deliverModal.cod_amount):0)}));
    showToast("✅ Dorëzimi u konfirmua!","success"); setDeliverModal(null); setRecipientConf("");
  };

  const markFailed = async () => {
    if (!failModal||!failReason) { showToast("Zgjedh arsyen!","error"); return; }
    await supabase.from("posta_shipments").update({status:"FAILED_DELIVERY"}).eq("id",failModal.id);
    await supabase.from("posta_tracking_events").insert([{shipment_id:failModal.id,status:"FAILED_DELIVERY",description:`Dështim: ${failReason}${failNote?". "+failNote:""}`,location:failModal.recipient_city}]);
    setDeliveries(prev=>prev.map(d=>d.id===failModal.id?{...d,status:"FAILED_DELIVERY"}:d));
    showToast("Dështimi u regjistrua.","warn"); setFailModal(null); setFailReason(""); setFailNote("");
  };

  return (
    <div style={{padding:16, maxWidth:500, margin:"0 auto"}}>
      <PageHeader T={T} title="📱 Courier App" sub="Paneli i Drejtësit"/>
      <Card T={T} style={{marginBottom:16}}>
        <Select T={T} label="Zgjedh Courier-in" value={courierId} onChange={setCourierId}
          options={couriers.map(c=>({value:c.id,label:`${c.name} — ${COURIER_STATUS[c.status]?.l||""}`}))}/>
      </Card>

      {courierId && <>
        {sel && <div style={{background:T.accentBg,border:`1px solid ${T.accent}`,borderRadius:10,padding:"12px 16px",marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:16,color:T.accent}}>Mirëmëngjesi, {sel.name}! 👋</div>
          <div style={{fontSize:13,color:T.muted,marginTop:2}}>{sel.vehicle} • {COURIER_STATUS[sel.status]?.l}</div>
        </div>}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          <StatCard T={T} label="Total" value={stats.total} icon="📦" color={T.accent}/>
          <StatCard T={T} label="Dorëzuar" value={stats.done} icon="✅" color={T.success}/>
          <StatCard T={T} label="COD" value={stats.cod.toFixed(0)+"€"} icon="💰" color={T.warn}/>
        </div>

        {loading ? <div style={{textAlign:"center",padding:40,color:T.muted}}>Duke ngarkuar...</div>
          : deliveries.length===0
            ? <Empty T={T} icon="🏃" title="Nuk ka dorëzime" desc="Asnjë paketë e caktuar sot"/>
            : <div style={{display:"grid",gap:10}}>
                {deliveries.map(s=>(
                  <Card T={T} key={s.id} style={{padding:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div>
                        <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:T.accent}}>{s.tracking_number}</div>
                        <div style={{fontSize:15,fontWeight:700,color:T.text,marginTop:3}}>{s.recipient_name}</div>
                        <div style={{fontSize:13,color:T.muted}}>{s.recipient_phone}</div>
                        <div style={{fontSize:12,color:T.muted,marginTop:2}}>{s.recipient_address}, <strong>{s.recipient_city}</strong></div>
                        {s.cod_amount>0 && <div style={{fontSize:14,fontWeight:800,color:T.warn,marginTop:6,padding:"4px 10px",background:T.warnBg,borderRadius:6,display:"inline-block"}}>COD: {s.cod_amount}€</div>}
                      </div>
                      <Badge status={s.status} T={T}/>
                    </div>
                    {["ASSIGNED","PICKED_UP","OUT_FOR_DELIVERY"].includes(s.status) && (
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <a href={`tel:${s.recipient_phone}`} style={{textDecoration:"none"}}>
                          <Btn T={T} size="sm" variant="outline">📞 Thirr</Btn>
                        </a>
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(s.recipient_address+", "+s.recipient_city)}`} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
                          <Btn T={T} size="sm" variant="outline">🗺️ Navigo</Btn>
                        </a>
                        <Btn T={T} size="sm" variant="success" onClick={()=>setDeliverModal(s)}>✅ Dorëzova</Btn>
                        <Btn T={T} size="sm" variant="danger" onClick={()=>setFailModal(s)}>❌ Dështoi</Btn>
                      </div>
                    )}
                  </Card>
                ))}
              </div>}
      </>}

      <Modal T={T} open={!!deliverModal} onClose={()=>setDeliverModal(null)} title="✅ Konfirmo Dorëzimin">
        {deliverModal && <>
          <div style={{marginBottom:14}}>
            <div style={{fontWeight:700,color:T.text,fontSize:15}}>{deliverModal.recipient_name}</div>
            <div style={{color:T.muted,fontSize:13}}>{deliverModal.recipient_address}, {deliverModal.recipient_city}</div>
          </div>
          {deliverModal.cod_amount>0 && (
            <div style={{background:T.warnBg,border:`2px solid ${T.warn}`,borderRadius:8,padding:"12px 16px",marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:11,fontWeight:700,color:T.warn,textTransform:"uppercase",letterSpacing:.5}}>Para në Dorë (COD)</div>
              <div style={{fontSize:28,fontWeight:900,color:T.warn}}>{deliverModal.cod_amount} EUR</div>
            </div>
          )}
          <Input T={T} label="Emri i Marrësit (konfirmo)" value={recipientConf} onChange={setRecipientConf} required
            placeholder={deliverModal.recipient_name}/>
          <Btn T={T} onClick={markDelivered} style={{width:"100%"}} size="lg">✅ Konfirmo Dorëzimin</Btn>
        </>}
      </Modal>

      <Modal T={T} open={!!failModal} onClose={()=>setFailModal(null)} title="❌ Dështim Dorëzimi">
        {failModal && <>
          <p style={{color:T.muted,marginTop:0}}>{failModal.recipient_name} — {failModal.recipient_city}</p>
          <Select T={T} label="Arsyeja" value={failReason} onChange={setFailReason} options={FAIL_REASONS}/>
          <Input T={T} label="Shënëzime shtesë" value={failNote} onChange={setFailNote}/>
          <Btn T={T} variant="danger" onClick={markFailed} style={{width:"100%",marginTop:8}}>Regjistro Dështimin</Btn>
        </>}
      </Modal>
    </div>
  );
}

// ============================================================
// COD MODULE
// ============================================================
function CODModule({T}) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({total:0,collected:0,pending:0});

  useEffect(() => {
    (async () => {
      const {data} = await supabase.from("posta_shipments").select("*").gt("cod_amount",0).order("created_at",{ascending:false});
      if (data) {
        const s = {total:0,collected:0,pending:0};
        data.forEach(r=>{
          const a=parseFloat(r.cod_amount||0); s.total+=a;
          if(r.status==="DELIVERED") s.collected+=a; else s.pending+=a;
        });
        setStats(s); setShipments(data);
      }
      setLoading(false);
    })();
  }, []);

  const exportCSV = () => {
    const csv=["Tracking,Marrësi,Qyteti,COD,Statusi,Data",...shipments.map(r=>[r.tracking_number,r.recipient_name,r.recipient_city,r.cod_amount,r.status,fmtDate(r.created_at)].join(","))].join("\n");
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="cod-report.csv"; a.click();
  };

  return (
    <div style={{padding:28}}>
      <PageHeader T={T} title="💰 COD / Pagesat" sub="Menaxhimi i parave në dorë"
        actions={<Btn T={T} size="sm" variant="outline" onClick={exportCSV}>↓ CSV</Btn>}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:24}}>
        <StatCard T={T} label="Total COD" value={stats.total.toFixed(0)+"€"} icon="💵" color={T.accent}/>
        <StatCard T={T} label="Mbledhur" value={stats.collected.toFixed(0)+"€"} icon="✅" color={T.success}/>
        <StatCard T={T} label="Pritës" value={stats.pending.toFixed(0)+"€"} icon="⏳" color={T.warn}/>
      </div>
      {loading ? <div style={{textAlign:"center",padding:40,color:T.muted}}>Duke ngarkuar...</div>
        : <Card T={T} style={{padding:0}}>
            <Table T={T}
              cols={[
                {k:"tracking_number",l:"Tracking",render:v=><span style={{fontFamily:"monospace",fontWeight:700,color:T.accent,fontSize:12}}>{v}</span>},
                {k:"recipient_name",l:"Marrësi"},
                {k:"recipient_city",l:"Qyteti"},
                {k:"cod_amount",l:"Shuma COD",render:v=><span style={{fontWeight:900,color:T.warn,fontSize:15}}>{parseFloat(v).toFixed(0)}€</span>},
                {k:"status",l:"Statusi",render:v=><Badge status={v} T={T}/>},
                {k:"created_at",l:"Data",render:v=>fmtDate(v)},
              ]}
              rows={shipments}
            />
          </Card>}
    </div>
  );
}

// ============================================================
// BARCODE SCANNER
// ============================================================
function BarcodeScanner({T, setSelectedShipment, setSubPage}) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanLog, setScanLog] = useState([]);
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const scan = async (val) => {
    const q = (val||code).trim(); if (!q) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const {data} = await supabase.from("posta_shipments").select("*")
        .or(`barcode.eq.${q},tracking_number.eq.${q},barcode.eq.${q.replace(/-/g,"")}`)
        .limit(1).single();
      if (data) {
        setResult(data);
        // Log scan event
        await supabase.from("posta_tracking_events").insert([{shipment_id:data.id,status:data.status,description:`Skanim barcode: ${q}`,location:"Depo"}]);
        setScanLog(prev=>[{time:new Date(),tracking:data.tracking_number,status:data.status,name:data.recipient_name},...prev.slice(0,9)]);
      } else {
        setError("Pakoja nuk u gjet: "+q);
      }
    } catch(e) { setError("Nuk u gjet!"); }
    finally { setLoading(false); setCode(""); inputRef.current?.focus(); }
  };

  return (
    <div style={{padding:28, maxWidth:620, margin:"0 auto"}}>
      <PageHeader T={T} title="🔍 Barcode Scanner" sub="Skanoni barcode ose vendosni tracking number"/>
      <Card T={T} style={{marginBottom:20,textAlign:"center",padding:32}}>
        <div style={{fontSize:56,marginBottom:12}}>📷</div>
        <p style={{color:T.muted,marginBottom:16,fontSize:14}}>Skanoni barcodin e pakos ose vendosni manualisht:</p>
        <div style={{display:"flex",gap:8}}>
          <input ref={inputRef} value={code} onChange={e=>setCode(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&scan()}
            placeholder="Skanoni ose vendosni barcodin / tracking number..."
            style={{flex:1,padding:"12px 16px",border:`2px solid ${T.accent}`,borderRadius:8,
              background:T.input,color:T.text,fontSize:16,fontFamily:"monospace",outline:"none"}}/>
          <Btn T={T} size="lg" onClick={()=>scan()}>{loading?"...":"🔍"}</Btn>
        </div>
        {error && <div style={{color:T.danger,marginTop:12,fontWeight:600}}>⚠️ {error}</div>}
      </Card>

      {result && (
        <Card T={T} style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:16}}>
            <div>
              <div style={{fontFamily:"monospace",fontSize:17,fontWeight:800,color:T.accent}}>{result.tracking_number}</div>
              <Badge status={result.status} T={T}/>
            </div>
            <Btn T={T} size="sm" onClick={()=>{setSelectedShipment&&setSelectedShipment(result);setSubPage&&setSubPage("detail");}}>
              Shiko Dërgesën →
            </Btn>
          </div>
          <div style={{display:"grid",gap:6}}>
            {[["Marrësi",result.recipient_name],["Telefoni",result.recipient_phone],["Adresa",result.recipient_address],["Qyteti",result.recipient_city],["COD",result.cod_amount>0?result.cod_amount+" EUR":null]].filter(r=>r[1]).map(([l,v])=>(
              <div key={l} style={{display:"flex",gap:10,fontSize:13}}>
                <span style={{color:T.muted,minWidth:80}}>{l}</span>
                <span style={{color:T.text,fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {scanLog.length > 0 && (
        <Card T={T}>
          <h4 style={{margin:"0 0 12px",fontSize:13,color:T.muted}}>📜 Log Skanimi ({scanLog.length})</h4>
          {scanLog.map((log,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`,fontSize:12}}>
              <span style={{fontFamily:"monospace",color:T.accent}}>{log.tracking}</span>
              <span style={{color:T.muted}}>{log.name}</span>
              <Badge status={log.status} T={T}/>
              <span style={{color:T.faint}}>{log.time.toLocaleTimeString("sq-AL")}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ============================================================
// CUSTOMERS
// ============================================================
function CustomersModule({T}) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({name:"",phone:"",email:"",city:"",address:""});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    let q = supabase.from("posta_customers").select("*").order("name");
    if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    const {data} = await q; if (data) setCustomers(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [search]);

  const save = async () => {
    if (!form.name||!form.phone) { showToast("Emri dhe telefoni janë të detyrueshëm!","error"); return; }
    setSaving(true);
    const {error} = await supabase.from("posta_customers").insert([form]);
    if (error) showToast("Gabim: "+error.message,"error");
    else { showToast("Klienti u shtua!","success"); setModal(false); setForm({name:"",phone:"",email:"",city:"",address:""}); load(); }
    setSaving(false);
  };

  return (
    <div style={{padding:28}}>
      <PageHeader T={T} title="👥 Klientët" sub={`${customers.length} klientë të regjistruar`}
        actions={<Btn T={T} onClick={()=>setModal(true)}>+ Shto Klient</Btn>}/>
      <div style={{marginBottom:14}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Kërko sipas emrit, telefonit, email..."
          style={{width:"100%",maxWidth:380,padding:"8px 12px",border:`1px solid ${T.inputBorder}`,borderRadius:6,background:T.input,color:T.text,fontSize:13,boxSizing:"border-box"}}/>
      </div>
      {loading ? <div style={{textAlign:"center",padding:40,color:T.muted}}>Duke ngarkuar...</div>
        : customers.length===0
          ? <Empty T={T} icon="👥" title="Nuk ka klientë" desc="Shto klientin e parë" action={<Btn T={T} onClick={()=>setModal(true)}>+ Shto</Btn>}/>
          : <Card T={T} style={{padding:0}}>
              <Table T={T}
                cols={[
                  {k:"name",l:"Emri",render:v=><span style={{fontWeight:700}}>{v}</span>},
                  {k:"phone",l:"Telefoni"},
                  {k:"email",l:"Email"},
                  {k:"city",l:"Qyteti"},
                  {k:"address",l:"Adresa"},
                  {k:"created_at",l:"Regjistruar",render:v=>fmtDate(v)},
                ]}
                rows={customers}
              />
            </Card>}
      <Modal T={T} open={modal} onClose={()=>setModal(false)} title="+ Shto Klient">
        <Input T={T} label="Emri" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required/>
        <Input T={T} label="Telefoni" value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} required/>
        <Input T={T} label="Email" type="email" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))}/>
        <Select T={T} label="Qyteti" value={form.city} onChange={v=>setForm(f=>({...f,city:v}))} options={CITIES}/>
        <Input T={T} label="Adresa" value={form.address} onChange={v=>setForm(f=>({...f,address:v}))}/>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <Btn T={T} variant="outline" onClick={()=>setModal(false)} style={{flex:1}}>Anulo</Btn>
          <Btn T={T} onClick={save} disabled={saving} style={{flex:1}}>{saving?"Duke ruajtur...":"Ruaj"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================
// PICKUP MODULE
// ============================================================
function PickupModule({T, setSelectedShipment, setSubPage}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {data} = await supabase.from("posta_shipments").select("*").in("status",["CREATED","PICKUP_REQUESTED"]).order("created_at",{ascending:false});
      if (data) setItems(data);
      setLoading(false);
    })();
  }, []);

  const requestPickup = async (id) => {
    await supabase.from("posta_shipments").update({status:"PICKUP_REQUESTED"}).eq("id",id);
    await supabase.from("posta_tracking_events").insert([{shipment_id:id,status:"PICKUP_REQUESTED",description:"Pickup u kërkua"}]);
    showToast("Pickup u kërkua!","success");
    setItems(prev=>prev.map(s=>s.id===id?{...s,status:"PICKUP_REQUESTED"}:s));
  };

  return (
    <div style={{padding:28}}>
      <PageHeader T={T} title="🚴 Pickup" sub={`${items.length} dërgesa presin pickup`}/>
      {loading ? <div style={{textAlign:"center",padding:60,color:T.muted}}>Duke ngarkuar...</div>
        : items.length===0
          ? <Empty T={T} icon="🚴" title="Nuk ka pickup" desc="Të gjitha dërgesat janë caktuar"/>
          : <div style={{display:"grid",gap:12}}>
              {items.map(s=>(
                <Card T={T} key={s.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                    <div>
                      <div style={{fontFamily:"monospace",fontWeight:800,color:T.accent,marginBottom:4,fontSize:13}}>{s.tracking_number}</div>
                      <div style={{fontSize:14,fontWeight:700,color:T.text}}>{s.sender_name}</div>
                      <div style={{fontSize:13,color:T.muted}}>{s.sender_phone} • {s.sender_city}</div>
                      {s.sender_address && <div style={{fontSize:12,color:T.muted,marginTop:2}}>📍 {s.sender_address}</div>}
                      <div style={{marginTop:6}}><Badge status={s.status} T={T}/></div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      {s.status==="CREATED" && <Btn T={T} size="sm" onClick={()=>requestPickup(s.id)}>Kërko Pickup</Btn>}
                      <Btn T={T} size="sm" variant="outline" onClick={()=>{setSelectedShipment&&setSelectedShipment(s);setSubPage&&setSubPage("detail");}}>Shiko</Btn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>}
    </div>
  );
}

// ============================================================
// WAREHOUSE
// ============================================================
function WarehouseModule({T}) {
  const [code, setCode] = useState("");
  const [found, setFound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inbound, setInbound] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("posta_shipments").select("tracking_number,recipient_name,recipient_city,status,id").eq("status","AT_WAREHOUSE")
      .order("updated_at",{ascending:false}).then(({data})=>setInbound(data||[]));
  }, []);

  const scan = async () => {
    if (!code.trim()) { setError("Vendos barcodin!"); return; }
    setLoading(true); setError(""); setFound(null);
    const {data} = await supabase.from("posta_shipments").select("*")
      .or(`barcode.eq.${code},tracking_number.eq.${code},barcode.eq.${code.replace(/-/g,"")}`).limit(1).single();
    if (data) setFound(data); else setError("Pakoja nuk u gjet: "+code);
    setLoading(false);
  };

  const receive = async () => {
    await supabase.from("posta_shipments").update({status:"AT_WAREHOUSE"}).eq("id",found.id);
    await supabase.from("posta_tracking_events").insert([{shipment_id:found.id,status:"AT_WAREHOUSE",description:"Arriti në depo",location:"Depo"}]);
    showToast("✅ Pakoja u pranua në depo!","success");
    setFound({...found,status:"AT_WAREHOUSE"});
    setInbound(prev=>[{id:found.id,tracking_number:found.tracking_number,recipient_name:found.recipient_name,recipient_city:found.recipient_city,status:"AT_WAREHOUSE"},...prev]);
    setCode("");
  };

  return (
    <div style={{padding:28}}>
      <PageHeader T={T} title="🏭 Depo / Warehouse" sub="Skanim dhe menaxhim i pakove"/>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:20,marginBottom:20}}>
        <Card T={T}>
          <h3 style={{margin:"0 0 14px",fontSize:14,color:T.text}}>📥 Pranim Pakoje</h3>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <input value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scan()}
              placeholder="Skanoni barcodin..."
              style={{flex:1,padding:"10px",border:`2px solid ${T.accent}`,borderRadius:6,background:T.input,color:T.text,fontSize:14,fontFamily:"monospace",outline:"none"}}/>
            <Btn T={T} onClick={scan}>{loading?"...":"Skanoje"}</Btn>
          </div>
          {error && <div style={{color:T.danger,fontSize:13,marginBottom:8}}>⚠️ {error}</div>}
          {found && (
            <div style={{background:T.accentBg,borderRadius:8,padding:14}}>
              <div style={{fontFamily:"monospace",fontWeight:800,color:T.accent,fontSize:14}}>{found.tracking_number}</div>
              <div style={{fontSize:13,color:T.text,margin:"4px 0"}}>{found.recipient_name} → {found.recipient_city}</div>
              <div style={{marginBottom:10}}><Badge status={found.status} T={T}/></div>
              {found.status!=="AT_WAREHOUSE" && (
                <Btn T={T} onClick={receive}>✓ Prano në Depo</Btn>
              )}
            </div>
          )}
        </Card>
        <Card T={T}>
          <h3 style={{margin:"0 0 14px",fontSize:14,color:T.text}}>📦 Në Depo ({inbound.length})</h3>
          <div style={{maxHeight:350,overflowY:"auto"}}>
            {inbound.length===0 ? <div style={{color:T.faint,textAlign:"center",padding:20}}>Depo bosh</div>
              : inbound.map(s=>(
                <div key={s.id} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:T.accent}}>{s.tracking_number}</div>
                  <div style={{fontSize:12,color:T.muted}}>{s.recipient_name} • {s.recipient_city}</div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// ROUTES
// ============================================================
function RoutesModule({T, couriers}) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({courier_id:"",date:"",city:"",notes:""});
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const [shipForRoute, setShipForRoute] = useState([]);

  const load = async () => {
    setLoading(true);
    const {data} = await supabase.from("posta_routes").select("*,posta_couriers(name,vehicle)").order("date",{ascending:false}).limit(30);
    if (data) setRoutes(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.courier_id||!form.date) { showToast("Cakto courier-in dhe datën!","error"); return; }
    setSaving(true);
    const {data,error} = await supabase.from("posta_routes").insert([{...form,status:"PLANNED"}]).select().single();
    if (error) showToast("Gabim: "+error.message,"error");
    else { showToast("Route u krijua!","success"); setModal(false); load(); }
    setSaving(false);
  };

  const RS = {PLANNED:{l:"Planifikuar",c:"#7c3aed",bg:"#f5f3ff"},ACTIVE:{l:"Aktiv",c:"#2563eb",bg:"#eff6ff"},COMPLETED:{l:"Përfunduar",c:"#16a34a",bg:"#f0fdf4"},CANCELLED:{l:"Anuluar",c:"#6b7280",bg:"#f9fafb"}};

  const activate = async (id) => {
    await supabase.from("posta_routes").update({status:"ACTIVE",start_time:new Date().toISOString()}).eq("id",id);
    showToast("Route u aktivizua!","success"); load();
  };
  const complete = async (id) => {
    await supabase.from("posta_routes").update({status:"COMPLETED",end_time:new Date().toISOString()}).eq("id",id);
    showToast("Route u përfundua!","success"); load();
  };

  return (
    <div style={{padding:28}}>
      <PageHeader T={T} title="🗺️ Routes" sub={`${routes.length} route`}
        actions={<Btn T={T} onClick={()=>setModal(true)}>+ Krijo Route</Btn>}/>
      {loading ? <div style={{textAlign:"center",padding:60,color:T.muted}}>Duke ngarkuar...</div>
        : routes.length===0
          ? <Empty T={T} icon="🗺️" title="Nuk ka route" desc="Krijo route-in e parë" action={<Btn T={T} onClick={()=>setModal(true)}>+ Krijo</Btn>}/>
          : <Card T={T} style={{padding:0}}>
              <Table T={T}
                cols={[
                  {k:"date",l:"Data",render:v=>fmtDate(v)},
                  {k:"posta_couriers",l:"Courier",render:v=>v?`${v.name} (${v.vehicle||""})`:"—"},
                  {k:"city",l:"Qyteti"},
                  {k:"status",l:"Statusi",render:v=>{const s=RS[v]||{l:v,c:"#64748b",bg:"#f1f5f9"};return<span style={{padding:"3px 10px",borderRadius:20,background:s.bg,color:s.c,fontSize:12,fontWeight:700}}>{s.l}</span>;}},
                  {k:"id",l:"Veprime",render:(_,row)=>(
                    <div style={{display:"flex",gap:6"}}>
                      {row.status==="PLANNED"&&<Btn T={T} size="sm" variant="success" onClick={e=>{e.stopPropagation();activate(row.id);}}>▶ Start</Btn>}
                      {row.status==="ACTIVE"&&<Btn T={T} size="sm" variant="outline" onClick={e=>{e.stopPropagation();complete(row.id);}}>✓ Përfundo</Btn>}
                    </div>)},
                ]}
                rows={routes}
              />
            </Card>}
      <Modal T={T} open={modal} onClose={()=>setModal(false)} title="+ Krijo Route">
        <Select T={T} label="Courier" value={form.courier_id} onChange={v=>setForm(f=>({...f,courier_id:v}))}
          options={(couriers||[]).map(c=>({value:c.id,label:`${c.name} — ${c.vehicle||""}`}))}/>
        <Input T={T} label="Data" type="date" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))}/>
        <Select T={T} label="Qyteti" value={form.city} onChange={v=>setForm(f=>({...f,city:v}))} options={CITIES}/>
        <Input T={T} label="Shënëzime" value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))}/>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <Btn T={T} variant="outline" onClick={()=>setModal(false)} style={{flex:1}}>Anulo</Btn>
          <Btn T={T} onClick={save} disabled={saving} style={{flex:1}}>{saving?"Duke ruajtur...":"Krijo Route"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================
// REPORTS
// ============================================================
function ReportsModule({T}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");
  const [stats, setStats] = useState({total:0,delivered:0,failed:0,cod:0,fee:0,byCity:[]});

  useEffect(() => {
    (async () => {
      setLoading(true);
      const from = new Date(); from.setDate(from.getDate()-parseInt(range));
      const {data:sh} = await supabase.from("posta_shipments").select("*").gte("created_at",from.toISOString());
      if (sh) {
        const s = {total:sh.length,delivered:0,failed:0,returned:0,cod:0,fee:0};
        const byCity={}, byCourier={}, byService={};
        sh.forEach(r=>{
          if(r.status==="DELIVERED"){s.delivered++;if(r.cod_amount>0)s.cod+=parseFloat(r.cod_amount);}
          if(r.status==="FAILED_DELIVERY")s.failed++;
          if(r.status==="RETURNED")s.returned++;
          s.fee+=parseFloat(r.shipping_fee||0);
          byCity[r.recipient_city]=(byCity[r.recipient_city]||0)+1;
          byService[r.service_type]=(byService[r.service_type]||0)+1;
        });
        s.successRate=sh.length>0?((s.delivered/sh.length)*100).toFixed(1):0;
        s.byCity=Object.entries(byCity).sort((a,b)=>b[1]-a[1]).slice(0,8);
        s.byService=Object.entries(byService).sort((a,b)=>b[1]-a[1]);
        setStats(s); setData(sh);
      }
      setLoading(false);
    })();
  }, [range]);

  const exportCSV = () => {
    const csv=["Tracking,Derguesi,Marresi,Qyteti,Sherbimi,Statusi,COD,Tarifa,Data",...data.map(r=>[
      r.tracking_number,r.sender_name,r.recipient_name,r.recipient_city,
      r.service_type,r.status,r.cod_amount,r.shipping_fee,fmtDate(r.created_at)
    ].join(","))].join("\n");
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="raport.csv"; a.click();
  };

  return (
    <div style={{padding:28}}>
      <PageHeader T={T} title="📊 Raportet" sub="Analiza dhe statistikat"
        actions={
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <select value={range} onChange={e=>setRange(e.target.value)}
              style={{padding:"7px 10px",border:`1px solid ${T.border}`,borderRadius:6,background:T.input,color:T.text,fontSize:13}}>
              <option value="7">7 ditë</option>
              <option value="30">30 ditë</option>
              <option value="90">3 muaj</option>
              <option value="365">1 vit</option>
            </select>
            <Btn T={T} size="sm" variant="outline" onClick={exportCSV}>↓ CSV</Btn>
          </div>
        }/>

      {loading ? <div style={{textAlign:"center",padding:80,color:T.muted}}>Duke ngarkuar...</div> : <>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:12,marginBottom:24}}>
          <StatCard T={T} label="Total Dërgesat" value={stats.total} icon="📦" color={T.accent}/>
          <StatCard T={T} label="Dorëzuar" value={stats.delivered} icon="✅" color={T.success}/>
          <StatCard T={T} label="Dështuar" value={stats.failed} icon="❌" color={T.danger}/>
          <StatCard T={T} label="Sukses" value={stats.successRate+"%"} icon="📈" color={T.success}/>
          <StatCard T={T} label="COD Mbledhur" value={(stats.cod||0).toFixed(0)+"€"} icon="💰" color={T.warn}/>
          <StatCard T={T} label="Tarifa Totale" value={(stats.fee||0).toFixed(0)+"€"} icon="💳" color={T.info}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          {stats.byCity && stats.byCity.length>0 && (
            <Card T={T}>
              <h3 style={{margin:"0 0 16px",fontSize:14,color:T.text}}>🏙️ Sipas Qytetit</h3>
              {stats.byCity.map(([city,count])=>{
                const pct=stats.total>0?Math.round(count/stats.total*100):0;
                return (
                  <div key={city} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:13,color:T.text}}>{city}</span>
                      <span style={{fontSize:13,fontWeight:700,color:T.accent}}>{count} ({pct}%)</span>
                    </div>
                    <div style={{background:T.border,borderRadius:4,height:6}}>
                      <div style={{background:T.accent,borderRadius:4,height:6,width:pct+"%"}}/>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
          {stats.byService && stats.byService.length>0 && (
            <Card T={T}>
              <h3 style={{margin:"0 0 16px",fontSize:14,color:T.text}}>🚚 Sipas Shërbimit</h3>
              {stats.byService.map(([svc,count])=>{
                const pct=stats.total>0?Math.round(count/stats.total*100):0;
                const s=SERVICES.find(x=>x.k===svc);
                return (
                  <div key={svc} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:13,color:T.text}}>{s?.l||svc}</span>
                      <span style={{fontSize:13,fontWeight:700,color:T.success}}>{count} ({pct}%)</span>
                    </div>
                    <div style={{background:T.border,borderRadius:4,height:6}}>
                      <div style={{background:T.success,borderRadius:4,height:6,width:pct+"%"}}/>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </>}
    </div>
  );
}

// ============================================================
// SETTINGS
// ============================================================
function PostaSettings({T}) {
  const [cfg, setCfg] = useState({
    company_name:"ProPhone Post",
    company_phone:"",
    company_email:"",
    base_price_standard:3.5,
    base_price_express:6.0,
    base_price_same_day:10.0,
    base_price_international:15.0,
    weight_fee_per_kg:0.5,
    cod_fee_pct:2,
    default_city:"Prishtinë",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("posta_settings").select("value").eq("key","config").single()
      .then(({data})=>{ if(data?.value) try{ setCfg({...cfg,...JSON.parse(data.value)}); }catch(e){} setLoading(false); });
  }, []);

  const save = async () => {
    try {
      await supabase.from("posta_settings").upsert([{key:"config",value:JSON.stringify(cfg),updated_at:new Date().toISOString()}]);
      setSaved(true); showToast("✅ Konfigurimet u ruajtën!","success");
      setTimeout(()=>setSaved(false),2500);
    } catch(e) { showToast("Gabim: "+e.message,"error"); }
  };

  return (
    <div style={{padding:28, maxWidth:640}}>
      <PageHeader T={T} title="⚙️ Konfigurimet" sub="Cilësimet e modulit Posta"/>
      {loading ? <div style={{color:T.muted}}>Duke ngarkuar...</div> : <>
        <Card T={T} style={{marginBottom:16}}>
          <h3 style={{margin:"0 0 16px",fontSize:14,color:T.text}}>🏢 Informacioni i Kompanisë</h3>
          <Input T={T} label="Emri i Kompanisë" value={cfg.company_name} onChange={v=>setCfg(c=>({...c,company_name:v}))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input T={T} label="Telefoni" value={cfg.company_phone} onChange={v=>setCfg(c=>({...c,company_phone:v}))}/>
            <Input T={T} label="Email" type="email" value={cfg.company_email} onChange={v=>setCfg(c=>({...c,company_email:v}))}/>
          </div>
          <Select T={T} label="Qyteti Default" value={cfg.default_city} onChange={v=>setCfg(c=>({...c,default_city:v}))} options={CITIES}/>
        </Card>
        <Card T={T} style={{marginBottom:16}}>
          <h3 style={{margin:"0 0 16px",fontSize:14,color:T.text}}>💰 Çmimet e Shërbimeve (EUR)</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input T={T} label="Standard" type="number" value={cfg.base_price_standard} onChange={v=>setCfg(c=>({...c,base_price_standard:+v}))}/>
            <Input T={T} label="Express" type="number" value={cfg.base_price_express} onChange={v=>setCfg(c=>({...c,base_price_express:+v}))}/>
            <Input T={T} label="Same Day" type="number" value={cfg.base_price_same_day} onChange={v=>setCfg(c=>({...c,base_price_same_day:+v}))}/>
            <Input T={T} label="Ndërkombëtar" type="number" value={cfg.base_price_international} onChange={v=>setCfg(c=>({...c,base_price_international:+v}))}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input T={T} label="Tarifa për kg shtesë" type="number" value={cfg.weight_fee_per_kg} onChange={v=>setCfg(c=>({...c,weight_fee_per_kg:+v}))}/>
            <Input T={T} label="Tarifa COD (%)" type="number" value={cfg.cod_fee_pct} onChange={v=>setCfg(c=>({...c,cod_fee_pct:+v}))}/>
          </div>
        </Card>
        <Btn T={T} onClick={save} size="lg" style={{width:"100%"}}>
          {saved ? "✓ U Ruajtën!" : "Ruaj Konfigurimet"}
        </Btn>
      </>}
    </div>
  );
}

// ============================================================
// SIDEBAR NAV
// ============================================================
const NAV = [
  {id:"dashboard",  icon:"📊", label:"Dashboard"},
  {id:"shipments",  icon:"📦", label:"Dërgesat"},
  {id:"create",     icon:"➕", label:"Krijo Dërgesë"},
  {id:"pickup",     icon:"🚴", label:"Pickup"},
  {id:"tracking",   icon:"🗺️", label:"Tracking"},
  {id:"barcode",    icon:"🔍", label:"Barcode Scanner"},
  {id:"couriers",   icon:"🚚", label:"Courier / Drivers"},
  {id:"courier_app",icon:"📱", label:"Courier App"},
  {id:"routes",     icon:"🗺️", label:"Routes"},
  {id:"warehouse",  icon:"🏭", label:"Depo"},
  {id:"customers",  icon:"👥", label:"Klientët"},
  {id:"cod",        icon:"💰", label:"COD / Pagesat"},
  {id:"reports",    icon:"📊", label:"Raportet"},
  {id:"settings",   icon:"⚙️", label:"Konfigurimet"},
];

function PostaSidebar({T, subPage, setSubPage, collapsed, onBack}) {
  return (
    <div style={{width:collapsed?58:228,background:T.sidebar,display:"flex",flexDirection:"column",
      height:"100%",overflowY:"auto",flexShrink:0,transition:"width .2s",overflowX:"hidden"}}>
      <div style={{padding:"16px 12px",borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
        {!collapsed && <div style={{fontSize:14,fontWeight:900,color:"#fff",letterSpacing:1}}>📮 POSTA</div>}
        {onBack && <button onClick={onBack}
          style={{background:"none",border:"none",cursor:"pointer",color:"#64748b",fontSize:11,marginTop:4,padding:0,display:"block"}}>
          ← ProPhone
        </button>}
      </div>
      <nav style={{flex:1,padding:"8px 6px"}}>
        {NAV.map(item => {
          const active = subPage === item.id;
          return (
            <button key={item.id} onClick={()=>setSubPage(item.id)}
              title={collapsed?item.label:""}
              style={{display:"flex",alignItems:"center",gap:9,width:"100%",
                padding:"8px 10px",borderRadius:6,border:"none",cursor:"pointer",
                marginBottom:1,background:active?"#2563eb":"transparent",
                color:active?"#fff":"#94a3b8",fontSize:13,fontWeight:active?700:400,
                textAlign:"left",transition:"all .15s",whiteSpace:"nowrap"}}>
              <span style={{fontSize:15,minWidth:20,textAlign:"center",flexShrink:0}}>{item.icon}</span>
              {!collapsed && <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ============================================================
// MAIN PostaModule COMPONENT
// ============================================================
function PostaModule({darkMode=false, onBack}) {
  const T = useMemo(() => mkT(darkMode), [darkMode]);
  const [subPage, setSubPage] = useState("dashboard");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    supabase.from("posta_couriers").select("*").then(({data})=>setCouriers(data||[]));
  }, []);

  const content = useMemo(() => {
    switch(subPage) {
      case "dashboard":    return <PostaDashboard T={T}/>;
      case "shipments":    return <ShipmentList T={T} setSubPage={setSubPage} setSelectedShipment={setSelectedShipment}/>;
      case "create":       return <CreateShipment T={T} setSubPage={setSubPage} setSelectedShipment={setSelectedShipment}/>;
      case "detail":       return selectedShipment ? <ShipmentDetail T={T} shipment={selectedShipment} setSubPage={setSubPage} couriers={couriers} setSelectedShipment={setSelectedShipment}/> : <PostaDashboard T={T}/>;
      case "tracking":     return <TrackingPage T={T}/>;
      case "barcode":      return <BarcodeScanner T={T} setSelectedShipment={setSelectedShipment} setSubPage={setSubPage}/>;
      case "couriers":     return <CouriersModule T={T} setCouriers={setCouriers}/>;
      case "courier_app":  return <CourierApp T={T}/>;
      case "routes":       return <RoutesModule T={T} couriers={couriers}/>;
      case "warehouse":    return <WarehouseModule T={T}/>;
      case "customers":    return <CustomersModule T={T}/>;
      case "cod":          return <CODModule T={T}/>;
      case "pickup":       return <PickupModule T={T} setSelectedShipment={setSelectedShipment} setSubPage={setSubPage}/>;
      case "reports":      return <ReportsModule T={T}/>;
      case "settings":     return <PostaSettings T={T}/>;
      default:             return <PostaDashboard T={T}/>;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subPage, selectedShipment, couriers, T]);

  const currentNav = NAV.find(n=>n.id===subPage);

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:T.bg,
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
      {/* Sidebar */}
      <PostaSidebar T={T} subPage={subPage} setSubPage={setSubPage} collapsed={collapsed} onBack={onBack}/>

      {/* Main */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Top Nav */}
        <div style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"10px 20px",
          display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,
          boxShadow:T.shadow,flexShrink:0}}>
          <button onClick={()=>setCollapsed(c=>!c)}
            style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:20,
              padding:"2px 6px",borderRadius:4,lineHeight:1}}>☰</button>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontWeight:900,color:T.accent,fontSize:14}}>📮 ProPhone</span>
            <span style={{color:T.faint,fontSize:13}}>›</span>
            <span style={{fontSize:13,color:T.muted}}>Posta</span>
            {currentNav && <>
              <span style={{color:T.faint,fontSize:13}}>›</span>
              <span style={{fontSize:13,color:T.text,fontWeight:600}}>{currentNav.icon} {currentNav.label}</span>
            </>}
          </div>
          {/* Live indicator */}
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:T.success,
              boxShadow:`0 0 0 2px ${T.successBg}`,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,color:T.muted,fontWeight:600}}>LIVE</span>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1}}>{content}</div>
      </div>
    </div>
  );
}

export default PostaModule;
export { PostaModule };
