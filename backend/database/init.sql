-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- TENANTS TABLE
-- =========================
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  subdomain VARCHAR UNIQUE NOT NULL,
  status VARCHAR NOT NULL,
  subscription_plan VARCHAR NOT NULL,
  max_users INT,
  max_projects INT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE (tenant_id, email)
);

-- =========================
-- PROJECTS TABLE
-- =========================
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- =========================
-- SEED DATA
-- =========================
WITH tenant_data AS (
  INSERT INTO tenants (
    id, name, subdomain, status, subscription_plan, max_users, max_projects
  )
  VALUES (
    gen_random_uuid(),
    'Demo Company',
    'demo',
    'active',
    'pro',
    25,
    15
  )
  RETURNING id
),
admin_user AS (
  INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role
  )
  SELECT
    gen_random_uuid(),
    tenant_data.id,
    'admin@demo.com',
    '$2b$10$UhGvCiN7zPXTkzUyBe1R3.TIEDIql3vGjGog5NinsCGuAe8qCnbpq',
    'Demo Admin',
    'tenant_admin'
  FROM tenant_data
  RETURNING id, tenant_id
)
INSERT INTO projects (
  id, tenant_id, name, description, status, created_by
)
SELECT
  gen_random_uuid(),
  admin_user.tenant_id,
  'Website Redesign',
  'UI revamp project',
  'active',
  admin_user.id
FROM admin_user;
