-- Paida D1 schema
-- Одна SQL-БД, четыре таблицы. Все временные метки — UNIX ms.

CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,      -- device UUID = openid
  role              TEXT DEFAULT 'client',
  is_admin          INTEGER DEFAULT 0,
  -- KYC
  kyc_type          TEXT,   -- physical | legal
  kyc_country       TEXT,   -- cn | kz
  kyc_name          TEXT,
  kyc_id_number     TEXT,
  kyc_id_key        TEXT,   -- '<country>.<type>:<idNumber>' для антифрода
  kyc_doc_file_id   TEXT,
  kyc_status        TEXT,   -- submitted | approved | rejected
  kyc_submitted_at  INTEGER,
  kyc_reviewed_at   INTEGER,
  kyc_reviewed_by   TEXT,
  kyc_reject_reason TEXT DEFAULT '',
  created_at        INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_kyc_id_key ON users(kyc_id_key) WHERE kyc_id_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS drivers (
  openid           TEXT PRIMARY KEY,
  fullname         TEXT NOT NULL,
  phone            TEXT NOT NULL,
  wechat           TEXT,
  truck            TEXT NOT NULL,
  plate            TEXT NOT NULL,
  plate_norm       TEXT NOT NULL,
  license          TEXT,
  route            TEXT,
  doc_techpassport TEXT,
  doc_driverlicense TEXT,
  doc_carphoto     TEXT,
  checks_json      TEXT,
  status           TEXT DEFAULT 'pending',   -- pending | approved | rejected
  rating           REAL,
  reject_reason    TEXT DEFAULT '',
  registered_at    INTEGER NOT NULL,
  reviewed_at      INTEGER,
  reviewed_by      TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_drivers_plate ON drivers(plate_norm);
CREATE UNIQUE INDEX IF NOT EXISTS ux_drivers_phone ON drivers(phone);
CREATE INDEX IF NOT EXISTS ix_drivers_status ON drivers(status);

CREATE TABLE IF NOT EXISTS orders (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  openid             TEXT NOT NULL,           -- клиент
  number             TEXT UNIQUE NOT NULL,
  from_city          TEXT,
  country_code       TEXT NOT NULL,
  country_name       TEXT,
  border_code        TEXT,
  border_name        TEXT,
  to_city            TEXT,
  goods_type         TEXT,
  weight             TEXT,
  volume             TEXT,
  name               TEXT NOT NULL,
  phone              TEXT NOT NULL,
  wechat             TEXT,
  note               TEXT,
  price_json         TEXT,
  status             TEXT DEFAULT 'new',
  driver_id          TEXT,                    -- openid выбранного водителя
  apps_count         INTEGER DEFAULT 0,
  client_accepted_at INTEGER DEFAULT 0,
  driver_accepted_at INTEGER DEFAULT 0,
  signatures_json    TEXT DEFAULT '[]',
  history_json       TEXT DEFAULT '[]',
  created_at         INTEGER NOT NULL,
  taken_at           INTEGER
);
CREATE INDEX IF NOT EXISTS ix_orders_openid ON orders(openid);
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS ix_orders_driver ON orders(driver_id);

CREATE TABLE IF NOT EXISTS applications (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id        INTEGER NOT NULL,
  driver_openid   TEXT NOT NULL,
  driver_snap     TEXT,                       -- JSON snapshot of driver info at apply time
  message         TEXT,
  status          TEXT DEFAULT 'pending',     -- pending | chosen | rejected
  created_at      INTEGER NOT NULL,
  UNIQUE(order_id, driver_openid)
);
CREATE INDEX IF NOT EXISTS ix_apps_order  ON applications(order_id);
CREATE INDEX IF NOT EXISTS ix_apps_driver ON applications(driver_openid);
