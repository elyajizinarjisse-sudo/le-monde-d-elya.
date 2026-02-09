-- Combined Script: Setup Technical Views
-- 1. Add the column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS technical_views JSONB DEFAULT '{}'::jsonb;

-- 2. Populate it for Casquette (Product ID 15)
-- Using verified images:
-- Front: 0.0017...
-- Back: 0.9920...
-- Side: 0.9882... (The verified side view)

UPDATE products
SET technical_views = jsonb_build_object(
    'front', (
        SELECT url FROM (
            SELECT jsonb_array_elements(images)->>'url' as url FROM products WHERE id = 15
        ) as imgs WHERE url LIKE '%0.001767523287284023.avif%' LIMIT 1
    ),
    'back', (
        SELECT url FROM (
            SELECT jsonb_array_elements(images)->>'url' as url FROM products WHERE id = 15
        ) as imgs WHERE url LIKE '%0.9920138127518984.avif%' LIMIT 1
    ),
    'right', (
        SELECT url FROM (
            SELECT jsonb_array_elements(images)->>'url' as url FROM products WHERE id = 15
        ) as imgs WHERE url LIKE '%0.9882617325508585.avif%' LIMIT 1
    ),
    'left', (
        SELECT url FROM (
            SELECT jsonb_array_elements(images)->>'url' as url FROM products WHERE id = 15
        ) as imgs WHERE url LIKE '%0.9882617325508585.avif%' LIMIT 1
    )
)
WHERE id = 15;
