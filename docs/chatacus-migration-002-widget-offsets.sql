-- Widget positioning offsets — additive follow-up to
-- chatacus-migration-001.sql
--
-- Purely additive: 2 new nullable integer columns on the existing
-- `clients` table. No existing row is modified. Every existing row will
-- have NULL in both new columns after this runs, which
-- app/api/client-config/[agentId]/route.ts treats as "0, no offset" —
-- i.e. exactly today's behaviour, unchanged.
--
-- These are set manually (via the Supabase table editor) only when a
-- specific customer reports a positioning conflict on their site. There
-- is no customer-facing UI for this.
--
-- Run this in the Supabase SQL Editor (Database → SQL Editor → New query).

alter table clients add column if not exists widget_offset_x integer;
alter table clients add column if not exists widget_offset_y integer;
