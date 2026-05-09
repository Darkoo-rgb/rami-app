-- =============================================
-- رامي باربر شوب — قاعدة البيانات
-- =============================================

CREATE TABLE IF NOT EXISTS customers (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(20)  NOT NULL UNIQUE,
  fcm_token  TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id           SERIAL PRIMARY KEY,
  name_ar      VARCHAR(100) NOT NULL,
  name_en      VARCHAR(100) NOT NULL,
  duration_min INTEGER NOT NULL,
  price_egp    INTEGER NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bookings (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  service_id  INTEGER REFERENCES services(id),
  slot_date   DATE NOT NULL,
  slot_time   TIME NOT NULL,
  status      VARCHAR(20) DEFAULT 'pending'
                CHECK (status IN ('pending','confirmed','done','cancelled')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocked_slots (
  id           SERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  reason       VARCHAR(200),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Seed services
INSERT INTO services (name_ar, name_en, duration_min, price_egp) VALUES
  ('حلاقة شعر',  'Hair cut',      30, 80),
  ('حلاقة دقن',  'Beard trim',    20, 50),
  ('شعر + دقن',  'Full grooming', 45, 120),
  ('استشوار',    'Blow dry',      30, 60),
  ('ماسكات',     'Face mask',     30, 50)
ON CONFLICT DO NOTHING;
