-- Remove duplicate 'Root' categories that were accidentally created
-- These IDs were identified from the debug dump as the "secondary" duplicates

-- Verify first if they have children? 
-- The ON DELETE CASCADE in the schema should handle children, 
-- BUT we want to keep the "good" ones (IDs 1, 18, 30, 41, etc) which have the real content.

-- Deleting the duplicates (High IDs):
DELETE FROM menu_items WHERE id IN (67, 68, 69) AND type = 'root';

-- If there are others like "Impressions" duplicated, add them here.
-- Based on logs:
-- 'Livres' (ID 1 acts as main). Delete 67.
-- 'Jouets' (ID 18 acts as main). Delete 68.
-- 'Déco' (ID 41 acts as main). Delete 69.

-- Also checking for any other pure exact duplicates created recently
-- This query deletes items that seem to be duplicates of older items (same label, same path, same type, higher ID)
DELETE FROM menu_items a USING menu_items b
WHERE a.id > b.id 
AND a.label = b.label 
AND a.type = b.type 
AND (a.path = b.path OR (a.path IS NULL AND b.path IS NULL))
AND a.parent_id IS NULL AND b.parent_id IS NULL; -- Only safely auto-delete Roots
