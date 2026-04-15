-- ============================================================
-- ProPhone — Arka (POS) Migration
-- Ekzekutoje këtë file në Supabase SQL Editor.
-- ============================================================

-- 1) Shto kolonat e Arkës + fushat e tjera që mungonin te accounts
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS has_arka BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS arka_pin TEXT,
  ADD COLUMN IF NOT EXISTS logo TEXT,
  ADD COLUMN IF NOT EXISTS nui TEXT,
  ADD COLUMN IF NOT EXISTS nf TEXT,
  ADD COLUMN IF NOT EXISTS vat_number TEXT,
  ADD COLUMN IF NOT EXISTS bank TEXT,
  ADD COLUMN IF NOT EXISTS bank_account TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- 2) Tabela products — katalogu i produkteve për çdo biznes
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  barcode TEXT,
  category TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost NUMERIC(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'cope',
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS products_account_idx ON products(account_id);
-- Nëse tabela ekziston dhe kolona image mungon:
ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT;

-- 5) Tabela debts — borxhet e klientëve
CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  original_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(10,2) DEFAULT 0,
  remaining_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_id TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  is_settled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS debts_account_idx ON debts(account_id);
CREATE INDEX IF NOT EXISTS debts_settled_idx ON debts(is_settled);

-- 3) Tabela sales — çdo shitje e kryer në Arkë
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  receipt_no TEXT,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid NUMERIC(10,2) DEFAULT 0,
  change_amount NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  client_name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sales_account_idx ON sales(account_id);
CREATE INDEX IF NOT EXISTS sales_created_idx ON sales(created_at);

-- 4) Tabela warranties — certifikata të garancionit
CREATE TABLE IF NOT EXISTS warranties (
  id TEXT PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  cert_no TEXT,
  client_name TEXT,
  client_phone TEXT,
  client_address TEXT,
  product_name TEXT,
  brand TEXT,
  model TEXT,
  serial_no TEXT,
  imei TEXT,
  condition TEXT DEFAULT 'new',
  period_months INTEGER DEFAULT 12,
  start_date DATE,
  end_date DATE,
  accessories TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS warranties_account_idx ON warranties(account_id);
