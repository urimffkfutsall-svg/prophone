# ProPhone Posta Module

Sistem i plotë për menaxhimin e dërgesave (courier/logistics) si modul nativ i ProPhone.

## Struktura e skedarëve

```
posta-module/
├── src/
│   └── pages/
│       └── PostaModule.jsx     ← MODULI KRYESOR (vendose te src/pages/)
├── sql/
│   └── posta-schema.sql       ← Skema e Supabase (ekzekuto një herë)
└── src/
    └── integration-snippet.jsx ← Udhëzime integrimi
```

## Instalimi

### 1. Kopjo PostaModule.jsx
```powershell
Copy-Item .\PostaModule.jsx "C:\Users\urim5\Desktop\prophone-clean\src\pages\PostaModule.jsx"
```

### 2. Ekzekuto SQL në Supabase
- Hap [Supabase Dashboard](https://supabase.com/dashboard)
- Shko te projekti → SQL Editor
- Paste posta-schema.sql dhe kliko Run

### 3. Integro në prophone_v3.jsx
Shih `integration-snippet.jsx` për udhëzime.

### 4. Push në GitHub
```powershell
git add .
git commit -m "feat: Posta module v2 - full logistics system"
git push origin main
```

Vercel do të deploy automatikisht!

## Features
- ✅ Dashboard me KPI stats
- ✅ Shipment list + create wizard (6 hapa)
- ✅ Tracking timeline
- ✅ Barcode scanner
- ✅ Courier management + mobile app
- ✅ Route planning
- ✅ COD management
- ✅ Warehouse module
- ✅ Customer portal
- ✅ Reports & analytics
- ✅ Settings
- ✅ Dark/Light mode
- ✅ Real-time updates (Supabase)

## Tracking URL publik
`/track` - pa autentikim
