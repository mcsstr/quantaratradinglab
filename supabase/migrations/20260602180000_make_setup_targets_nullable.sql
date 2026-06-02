-- Migration to make date and account_id nullable in setup_targets table
-- This allows config rows (with date: null) and placeholders to be saved successfully.

ALTER TABLE public.setup_targets ALTER COLUMN date DROP NOT NULL;
ALTER TABLE public.setup_targets ALTER COLUMN account_id DROP NOT NULL;
