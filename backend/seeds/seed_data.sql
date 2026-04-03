-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- TENANT
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

-- =========================
-- TENANT ADMIN
-- =========================
admin_user AS (
  INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role
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

-- =========================
-- PROJECT
-- =========================
INSERT INTO projects (
  id,
  tenant_id,
  name,
  description,
  status,
  created_by
)
SELECT
  gen_random_uuid(),
  admin_user.tenant_id,
  'Website Redesign',
  'UI revamp project',
  'active',
  admin_user.id
FROM admin_user;
