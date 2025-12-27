
-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_address TEXT NOT NULL, -- or JSONB
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    items_count INTEGER DEFAULT 0
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id), -- Assuming products.id is BIGINT based on previous usage
    title TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC NOT NULL
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies for orders
-- Allow anyone to create an order (public checkout)
CREATE POLICY "Enable insert for everyone" ON public.orders FOR INSERT WITH CHECK (true);

-- Allow admins to see all orders (Assuming admin is authenticated or we just enable read for now)
-- detailed auth setup is unknown so for now allowing public read to let the Admin Dashboard work easily
-- In production, this should be "auth.role() = 'authenticated'" or similar.
CREATE POLICY "Enable read for everyone" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable update for everyone" ON public.orders FOR UPDATE USING (true); -- To update status

-- Policies for order_items
CREATE POLICY "Enable insert for everyone" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for everyone" ON public.order_items FOR SELECT USING (true);
