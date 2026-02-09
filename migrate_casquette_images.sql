-- Migration to move technical images to technical_views column for Casquette (ID 15)

-- 1. Construct the technical_views JSON
-- We use the hashes we verified:
-- Front: 0.0017...
-- Back: 0.9920...
-- Side: 0.9882... (The verified side view)
-- Left: 0.9882... (Reusing side view for now)

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

-- 2. Optional: We could remove these images from the main 'images' array to clean up the gallery,
-- but strictly speaking, the user just wants them separated.
-- For now, let's just populate the new column. The frontend will choose to ignore them in the gallery if it uses technical_views.
