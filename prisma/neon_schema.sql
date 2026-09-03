-- =========================================================
-- PULSE8 — SCRIPT DE CRIAÇÃO DO BANCO POSTGRESQL (NEON.TECH)
-- Execute este script no SQL Editor do painel da Neon.tech
-- =========================================================

-- 1. Organizações
CREATE TABLE IF NOT EXISTS "organizations" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cnpj" TEXT UNIQUE,
    "address" TEXT,
    "logoUrl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Usuários
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "avatar_url" TEXT,
    "two_factor" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Membros
CREATE TABLE IF NOT EXISTS "memberships" (
    "id" TEXT PRIMARY KEY,
    "organization_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role" TEXT NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "memberships_organization_id_user_id_key" UNIQUE ("organization_id", "user_id")
);

-- 4. Eventos
CREATE TABLE IF NOT EXISTS "events" (
    "id" TEXT PRIMARY KEY,
    "org_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "theme" TEXT,
    "description" TEXT,
    "venue" TEXT,
    "city" TEXT,
    "state" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "cover_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "events_org_id_status_idx" ON "events"("org_id", "status");

-- 5. Áreas & Ingressos
CREATE TABLE IF NOT EXISTS "areas" (
    "id" TEXT PRIMARY KEY,
    "event_id" TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "access_level" TEXT NOT NULL DEFAULT 'geral'
);

CREATE TABLE IF NOT EXISTS "tickets" (
    "id" TEXT PRIMARY KEY,
    "event_id" TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "area_id" TEXT NOT NULL REFERENCES "areas"("id") ON DELETE CASCADE,
    "lot" TEXT NOT NULL DEFAULT '1º Lote',
    "price" DOUBLE PRECISION NOT NULL,
    "qty_total" INTEGER NOT NULL DEFAULT 0,
    "qty_sold" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Financeiro & Custos
CREATE TABLE IF NOT EXISTS "cost_accounts" (
    "id" TEXT PRIMARY KEY,
    "org_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "parent_id" TEXT REFERENCES "cost_accounts"("id")
);

CREATE TABLE IF NOT EXISTS "suppliers" (
    "id" TEXT PRIMARY KEY,
    "org_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "cnpj_cpf" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "pix" TEXT,
    "category" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 5.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "cost_items" (
    "id" TEXT PRIMARY KEY,
    "event_id" TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "account_id" TEXT REFERENCES "cost_accounts"("id"),
    "supplier_id" TEXT REFERENCES "suppliers"("id"),
    "title" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'planned',
    "attachment_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "cost_items_event_id_status_idx" ON "cost_items"("event_id", "status");

CREATE TABLE IF NOT EXISTS "revenues" (
    "id" TEXT PRIMARY KEY,
    "event_id" TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "source" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "received_at" TIMESTAMP(3),
    "reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Pessoas, Funções & Escalas
CREATE TABLE IF NOT EXISTS "people" (
    "id" TEXT PRIMARY KEY,
    "org_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "full_name" TEXT NOT NULL,
    "doc" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "pix" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "roles" (
    "id" TEXT PRIMARY KEY,
    "org_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "color" TEXT DEFAULT 'bg-brand-500',
    "access_level" TEXT NOT NULL DEFAULT 'staff'
);

CREATE TABLE IF NOT EXISTS "assignments" (
    "id" TEXT PRIMARY KEY,
    "event_id" TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "person_id" TEXT NOT NULL REFERENCES "people"("id") ON DELETE CASCADE,
    "role_id" TEXT NOT NULL REFERENCES "roles"("id"),
    "shift_start" TIMESTAMP(3),
    "shift_end" TIMESTAMP(3),
    "pay_rate" DOUBLE PRECISION,
    "pay_type" TEXT DEFAULT 'daily',
    "status" TEXT NOT NULL DEFAULT 'scheduled'
);

-- 8. Promoters & Campanhas
CREATE TABLE IF NOT EXISTS "promoters" (
    "id" TEXT PRIMARY KEY,
    "org_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "person_id" TEXT NOT NULL REFERENCES "people"("id") ON DELETE CASCADE,
    "team" TEXT,
    "level" TEXT DEFAULT 'junior',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "promo_campaigns" (
    "id" TEXT PRIMARY KEY,
    "event_id" TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "commission_type" TEXT NOT NULL DEFAULT 'percent',
    "commission_value" DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS "promo_links" (
    "id" TEXT PRIMARY KEY,
    "campaign_id" TEXT NOT NULL REFERENCES "promo_campaigns"("id") ON DELETE CASCADE,
    "promoter_id" TEXT NOT NULL REFERENCES "promoters"("id") ON DELETE CASCADE,
    "code" TEXT UNIQUE NOT NULL,
    "url" TEXT NOT NULL,
    "utm_source" TEXT DEFAULT 'promoter',
    "utm_medium" TEXT
);
CREATE INDEX IF NOT EXISTS "promo_links_code_idx" ON "promo_links"("code");

CREATE TABLE IF NOT EXISTS "promo_sales" (
    "id" TEXT PRIMARY KEY,
    "campaign_id" TEXT NOT NULL REFERENCES "promo_campaigns"("id") ON DELETE CASCADE,
    "promoter_id" TEXT NOT NULL REFERENCES "promoters"("id") ON DELETE CASCADE,
    "code" TEXT NOT NULL,
    "buyer_name" TEXT,
    "buyer_email" TEXT,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "amount" DOUBLE PRECISION NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'sympla',
    "sold_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketing_tx_id" TEXT
);
CREATE INDEX IF NOT EXISTS "promo_sales_code_promoter_id_idx" ON "promo_sales"("code", "promoter_id");

-- 9. Convidados & Portaria
CREATE TABLE IF NOT EXISTS "guestlists" (
    "id" TEXT PRIMARY KEY,
    "event_id" TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "type" TEXT
);

CREATE TABLE IF NOT EXISTS "guests" (
    "id" TEXT PRIMARY KEY,
    "guestlist_id" TEXT NOT NULL REFERENCES "guestlists"("id") ON DELETE CASCADE,
    "full_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT DEFAULT 'manual',
    "promoter_id" TEXT,
    "qr_code" TEXT UNIQUE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'issued',
    "checked_in_at" TIMESTAMP(3),
    "notes" TEXT
);
CREATE INDEX IF NOT EXISTS "guests_qr_code_status_idx" ON "guests"("qr_code", "status");

-- 10. Operacional & Logs
CREATE TABLE IF NOT EXISTS "schedules" (
    "id" TEXT PRIMARY KEY,
    "event_id" TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL DEFAULT 'run',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "owner_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS "post_queue" (
    "id" TEXT PRIMARY KEY,
    "event_id" TEXT NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "platform" TEXT NOT NULL DEFAULT 'instagram',
    "title" TEXT NOT NULL,
    "copy" TEXT,
    "asset_url" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "post_url" TEXT
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT PRIMARY KEY,
    "org_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "actor_id" TEXT REFERENCES "users"("id"),
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "payload" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "audit_logs_org_id_created_at_idx" ON "audit_logs"("org_id", "created_at");

-- =========================================================
-- SEED DE DADOS INICIAIS (Usuário Administrador & Organização)
-- =========================================================

-- Criar Organização Padrão
INSERT INTO "organizations" ("id", "name", "cnpj", "address")
VALUES ('org-pulse8-main', 'Pulse8 Entretenimento & Festivais', '12.345.678/0001-90', 'Av. Brigadeiro Faria Lima, 3477 - São Paulo, SP')
ON CONFLICT ("id") DO NOTHING;

-- Criar Usuário Administrador (admin@pulse8.com.br / Senha: Pulse8@2026!)
INSERT INTO "users" ("id", "name", "email", "password_hash", "status", "avatar_url")
VALUES ('usr-admin-p8', 'Victor Alves', 'admin@pulse8.com.br', '$2a$12$Rvy8.rPsk/c3g/h9v3p2q.h3yJ79z83c.W7U9f81C4Q4oYh2w6a/O', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop')
ON CONFLICT ("email") DO UPDATE SET "password_hash" = EXCLUDED."password_hash";

-- Vincular Membro Administrador
INSERT INTO "memberships" ("id", "organization_id", "user_id", "role")
VALUES ('mem-admin-p8', 'org-pulse8-main', 'usr-admin-p8', 'owner')
ON CONFLICT ("organization_id", "user_id") DO NOTHING;

-- Criar Eventos de Demonstração
INSERT INTO "events" ("id", "org_id", "name", "theme", "venue", "city", "state", "capacity", "start_at", "end_at", "status", "cover_url")
VALUES 
('evt-1', 'org-pulse8-main', 'Festival Pulsar 2026', 'Música Eletrônica & Arte Visual', 'Arena Anhembi', 'São Paulo', 'SP', 15000, '2026-11-14 20:00:00', '2026-11-15 08:00:00', 'in_sales', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop'),
('evt-2', 'org-pulse8-main', 'Sunset Club Sunset Edition', 'Deep House & Beach Vibes', 'Beach Club Guaruja', 'Guarujá', 'SP', 3500, '2026-10-03 16:00:00', '2026-10-04 02:00:00', 'planning', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop'),
('evt-3', 'org-pulse8-main', 'Baile da Favorita - Edição Especial', 'Funk & Hip-Hop Premium', 'Espaço das Américas', 'São Paulo', 'SP', 8000, '2026-12-05 22:00:00', '2026-12-06 06:00:00', 'draft', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop')
ON CONFLICT ("id") DO NOTHING;
