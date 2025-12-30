-- Add weight column to products table
alter table products add column if not exists weight numeric default 0;

-- Notify to reload schema cache
NOTIFY pgrst, 'reload config';
