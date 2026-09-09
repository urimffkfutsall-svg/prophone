-- ============================================================
-- PROPHONE POSTA MODULE - Supabase SQL Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS posta_customers (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT UNIQUE,
  email       TEXT,
  city        TEXT,
  address     TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posta_customers_phone ON posta_customers(phone);
CREATE INDEX IF NOT EXISTS idx_posta_customers_name  ON posta_customers(name);

-- ============================================================
-- COURIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS posta_couriers (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                  TEXT NOT NULL,
  phone                 TEXT,
  email                 TEXT,
  vehicle               TEXT DEFAULT 'Motocikletë',
  status                TEXT DEFAULT 'AVAILABLE'
                          CHECK (status IN ('AVAILABLE','ON_ROUTE','BUSY','OFFLINE')),
  current_latitude      FLOAT,
  current_longitude     FLOAT,
  last_location_update  TIMESTAMPTZ,
  notes                 TEXT,
  active                BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posta_couriers_status ON posta_couriers(status);

-- ============================================================
-- SHIPMENTS (main table)
-- ============================================================
CREATE TABLE IF NOT EXISTS posta_shipments (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tracking_number      TEXT UNIQUE NOT NULL,
  barcode              TEXT UNIQUE,

  -- Sender
  sender_name          TEXT NOT NULL,
  sender_phone         TEXT NOT NULL,
  sender_email         TEXT,
  sender_city          TEXT,
  sender_address       TEXT,

  -- Recipient
  recipient_name       TEXT NOT NULL,
  recipient_phone      TEXT NOT NULL,
  recipient_email      TEXT,
  recipient_city       TEXT NOT NULL,
  recipient_address    TEXT,
  recipient_notes      TEXT,

  -- Package
  package_type         TEXT DEFAULT 'Kuti',
  weight               FLOAT DEFAULT 1,
  dimensions           TEXT,
  quantity             INT DEFAULT 1,
  fragile              BOOLEAN DEFAULT false,
  description          TEXT,

  -- Service & Payment
  service_type         TEXT DEFAULT 'standard'
                         CHECK (service_type IN ('standard','express','same_day','international')),
  payment_method       TEXT DEFAULT 'prepaid'
                         CHECK (payment_method IN ('prepaid','cod','account','cash')),
  cod_amount           NUMERIC(10,2) DEFAULT 0,
  shipping_fee         NUMERIC(10,2) DEFAULT 0,
  insurance_amount     NUMERIC(10,2) DEFAULT 0,

  -- Assignment
  courier_id           UUID REFERENCES posta_couriers(id) ON DELETE SET NULL,
  created_by           TEXT,

  -- Status
  status               TEXT DEFAULT 'CREATED'
                         CHECK (status IN ('CREATED','PICKUP_REQUESTED','ASSIGNED','PICKED_UP',
                           'AT_WAREHOUSE','IN_TRANSIT','ARRIVED_AT_DESTINATION',
                           'OUT_FOR_DELIVERY','DELIVERED','FAILED_DELIVERY',
                           'RETURN_REQUESTED','RETURNED','CANCELLED')),
  current_location     TEXT,
  current_latitude     FLOAT,
  current_longitude    FLOAT,

  -- Dates
  estimated_delivery   TIMESTAMPTZ,
  picked_up_at         TIMESTAMPTZ,
  delivered_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posta_ship_tracking    ON posta_shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_posta_ship_barcode     ON posta_shipments(barcode);
CREATE INDEX IF NOT EXISTS idx_posta_ship_status      ON posta_shipments(status);
CREATE INDEX IF NOT EXISTS idx_posta_ship_courier     ON posta_shipments(courier_id);
CREATE INDEX IF NOT EXISTS idx_posta_ship_city        ON posta_shipments(recipient_city);
CREATE INDEX IF NOT EXISTS idx_posta_ship_phone       ON posta_shipments(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_posta_ship_created     ON posta_shipments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posta_ship_sender_name ON posta_shipments(sender_name);
CREATE INDEX IF NOT EXISTS idx_posta_ship_recip_name  ON posta_shipments(recipient_name);

-- ============================================================
-- TRACKING EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS posta_tracking_events (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shipment_id  UUID NOT NULL REFERENCES posta_shipments(id) ON DELETE CASCADE,
  status       TEXT,
  description  TEXT,
  location     TEXT,
  latitude     FLOAT,
  longitude    FLOAT,
  created_by   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posta_events_shipment ON posta_tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_posta_events_created  ON posta_tracking_events(created_at DESC);

-- ============================================================
-- ROUTES
-- ============================================================
CREATE TABLE IF NOT EXISTS posta_routes (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  courier_id  UUID REFERENCES posta_couriers(id) ON DELETE SET NULL,
  date        DATE NOT NULL,
  city        TEXT,
  status      TEXT DEFAULT 'PLANNED'
                CHECK (status IN ('PLANNED','ACTIVE','COMPLETED','CANCELLED')),
  notes       TEXT,
  start_time  TIMESTAMPTZ,
  end_time    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posta_routes_courier ON posta_routes(courier_id);
CREATE INDEX IF NOT EXISTS idx_posta_routes_date    ON posta_routes(date DESC);

-- ============================================================
-- ROUTE STOPS
-- ============================================================
CREATE TABLE IF NOT EXISTS posta_route_stops (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  route_id       UUID NOT NULL REFERENCES posta_routes(id) ON DELETE CASCADE,
  shipment_id    UUID REFERENCES posta_shipments(id) ON DELETE SET NULL,
  sequence       INT NOT NULL DEFAULT 0,
  status         TEXT DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','ARRIVED','COMPLETED','SKIPPED')),
  arrival_time   TIMESTAMPTZ,
  complete_time  TIMESTAMPTZ,
  notes          TEXT
);

CREATE INDEX IF NOT EXISTS idx_posta_stops_route ON posta_route_stops(route_id);

-- ============================================================
-- DELIVERY ATTEMPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS posta_delivery_attempts (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shipment_id     UUID NOT NULL REFERENCES posta_shipments(id) ON DELETE CASCADE,
  courier_id      UUID REFERENCES posta_couriers(id),
  attempt_number  INT DEFAULT 1,
  status          TEXT, -- DELIVERED, FAILED
  fail_reason     TEXT,
  recipient_name  TEXT,
  notes           TEXT,
  photo_url       TEXT,
  latitude        FLOAT,
  longitude       FLOAT,
  attempted_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posta_attempts_shipment ON posta_delivery_attempts(shipment_id);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS posta_settings (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Default settings
INSERT INTO posta_settings (key, value) VALUES
  ('config', '{"company_name":"ProPhone Post","base_price_standard":3.5,"base_price_express":6.0,"base_price_same_day":10.0,"base_price_international":15.0,"weight_fee_per_kg":0.5,"cod_fee_pct":2,"default_city":"Prishtinë"}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS posta_audit_log (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     TEXT,
  action      TEXT NOT NULL,
  entity      TEXT,
  entity_id   TEXT,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posta_audit_entity ON posta_audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_posta_audit_created ON posta_audit_log(created_at DESC);

-- ============================================================
-- ENABLE REAL-TIME (Supabase)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE posta_shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE posta_tracking_events;
ALTER PUBLICATION supabase_realtime ADD TABLE posta_couriers;
ALTER PUBLICATION supabase_realtime ADD TABLE posta_routes;

-- ============================================================
-- ROW LEVEL SECURITY (basic - customize per role)
-- ============================================================
ALTER TABLE posta_shipments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE posta_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE posta_couriers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE posta_customers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE posta_routes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE posta_settings        ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read/write (adjust per your auth setup)
CREATE POLICY "posta_shipments_all" ON posta_shipments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "posta_events_all"    ON posta_tracking_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "posta_couriers_all"  ON posta_couriers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "posta_customers_all" ON posta_customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "posta_routes_all"    ON posta_routes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "posta_settings_all"  ON posta_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also allow anon for tracking (public tracking page)
CREATE POLICY "posta_tracking_anon" ON posta_tracking_events FOR SELECT TO anon USING (true);
CREATE POLICY "posta_shipments_anon_track" ON posta_shipments FOR SELECT TO anon
  USING (true); -- restrict columns in your app layer

-- ============================================================
-- SAMPLE DATA (optional - delete before production)
-- ============================================================
-- INSERT INTO posta_couriers (name, phone, vehicle, status) VALUES
--   ('Ardit Krasniqi', '+38344111222', 'Motocikletë', 'AVAILABLE'),
--   ('Blerta Ahmeti',  '+38345333444', 'Veturë',      'AVAILABLE'),
--   ('Driton Berisha', '+38349555666', 'Kamionetë',   'OFFLINE');

SELECT 'ProPhone Posta Schema installed successfully! 🚀' AS status;
