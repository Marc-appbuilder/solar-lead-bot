-- Sunny Jim (solar-lead-bot) — Chatacus provisioning support
-- Mirrors Vaughan's and Bloom's own chatacus-migration-001.sql exactly.
--
-- Purely additive: 5 new nullable columns on the existing `clients` table.
-- No existing row is modified. No existing column is touched. The
-- existing rows ('solar-demo' in lib/clients.ts, plus any DB rows such as
-- the existing 'solar-demo' Supabase row) will simply have NULL in all 5
-- new columns after this runs, which is exactly what resolveClient() and
-- app/api/chat/route.ts are designed to treat as "not a Chatacus client,
-- behave exactly as today."
--
-- Run this in the Supabase SQL Editor (Database → SQL Editor → New query)
-- against Sunny Jim's own Supabase project.

alter table clients add column if not exists system_prompt text;
alter table clients add column if not exists provisioned_via text;
alter table clients add column if not exists assistant_display_name text;
alter table clients add column if not exists chatacus_customer_id text;
alter table clients add column if not exists provisioning_meta jsonb;
