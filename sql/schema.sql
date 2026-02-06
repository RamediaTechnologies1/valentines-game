-- LoveScroll schema for Azure PostgreSQL
-- Run this in Azure Data Studio, pgAdmin, or psql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  token TEXT UNIQUE NOT NULL,
  woo_order_id TEXT UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('lite', 'classic', 'forever')),
  email TEXT NOT NULL,
  from_name TEXT,
  to_name TEXT,
  final_letter TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '{}'::jsonb,
  delivery_status TEXT DEFAULT 'waiting' CHECK (delivery_status IN ('waiting', 'pending', 'sent', 'failed')),
  delivery_time TIMESTAMPTZ,
  express_delivery BOOLEAN DEFAULT FALSE,
  link_url TEXT,
  views INTEGER DEFAULT 0,
  affiliate_code TEXT,
  affiliate_commission NUMERIC(10,2) DEFAULT 0,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'awaiting_creation' CHECK (status IN ('awaiting_creation', 'created', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experiences_slug ON experiences(slug);
CREATE INDEX IF NOT EXISTS idx_experiences_token ON experiences(token);
CREATE INDEX IF NOT EXISTS idx_experiences_delivery ON experiences(delivery_status, delivery_time);
CREATE INDEX IF NOT EXISTS idx_experiences_woo_order ON experiences(woo_order_id);
CREATE INDEX IF NOT EXISTS idx_experiences_expires ON experiences(expires_at);
CREATE INDEX IF NOT EXISTS idx_experiences_affiliate ON experiences(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status);
