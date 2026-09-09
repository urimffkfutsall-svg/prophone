# DataPOS - Sistemi i Menaxhimit të Biznesit

Ap React + Supabase për menaxhimin e riparimeve dhe biznesit.

## 🚀 Setup Lokal

### 1. Klono repo-n
```bash
git clone https://github.com/USERNAME/prophone.git
cd prophone
```

### 2. Instalo varësitët
```bash
npm install --legacy-peer-deps
```

### 3. Konfiguro variablat e mjedisit
```bash
cp .env.example .env
# Hap .env dhe plotëso me çelësat e Supabase-it
```

### 4. Nis app-in
```bash
npm start
```

## 🌐 Deploy në Vercel

Shih seksionin e komandave më poshtë.

## ⚙️ Variablat e Mjedisit

Krijoji në Vercel Dashboard > Settings > Environment Variables:

| Variabla | Pershkrimi |
|----------|------------|
| `REACT_APP_SUPABASE_URL` | URL e projektit Supabase |
| `REACT_APP_SUPABASE_ANON_KEY` | Anon key e Supabase |

## 🛠️ Teknologjit

- **React 19** - UI framework
- **Supabase** - Backend + Database
- **React Router** - Navigim
- **QRCode.react** - Gjenerimi i QR kodeve
