-- Add technical_views column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS technical_views JSONB DEFAULT '{}'::jsonb;
