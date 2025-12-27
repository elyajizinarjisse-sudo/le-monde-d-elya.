-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow ALL operations for public (for development/admin simplicity)
DROP POLICY IF EXISTS "Allow All Menu" ON menu_items;
CREATE POLICY "Allow All Menu" ON menu_items FOR ALL USING (true) WITH CHECK (true);
