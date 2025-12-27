-- Create a table for legal pages
create table if not exists public.legal_pages (
    slug text primary key, -- 'privacy', 'terms', 'refund', 'accessibility'
    title text not null,
    content text,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.legal_pages enable row level security;

-- Policy: Everyone can read
create policy "Public Read Access" on public.legal_pages
    for select using (true);

-- Policy: Admin can insert/update (authenticated users for now, or restrictive)
create policy "Admin Write Access" on public.legal_pages
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Insert minimal default data if empty
insert into public.legal_pages (slug, title, content)
values
    ('privacy', 'Politique de Confidentialité', '<h2>Collecte de l''information</h2><p>Nous recueillons des informations...</p>'),
    ('terms', 'Conditions Générales de Vente', '<h2>Conditions</h2><p>En accédant à ce site...</p>'),
    ('refund', 'Politique de Retour', '<h2>Retours</h2><p>Notre politique dure 30 jours...</p>'),
    ('accessibility', 'Accessibilité', '<h2>Accessibilité</h2><p>Nous nous efforçons...</p>')
on conflict (slug) do nothing;
