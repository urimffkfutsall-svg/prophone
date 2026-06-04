-- Migration: Shto sistemin e verifikimit te firmat
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- Verifiko automatikisht firmat ekzistuese (hiqe nese nuk e do)
UPDATE companies SET verified = TRUE WHERE verified IS NULL OR verified = FALSE;

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(verified);
