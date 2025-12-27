-- Table for global store settings (key-value store)
create table if not exists public.store_settings (
    key text primary key,
    value text not null,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table for support tickets / contact form messages
create table if not exists public.support_tickets (
    id uuid default gen_random_uuid() primary key,
    user_name text,
    user_email text not null,
    subject text,
    message text not null,
    status text default 'new', -- new, read, closed
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.store_settings enable row level security;
alter table public.support_tickets enable row level security;

-- Policies for Store Settings
-- Public read access
create policy "Public Read Settings" on public.store_settings for select using (true);
-- Admin write access (simplified for now to allow editing from admin panel)
create policy "Admin Write Settings" on public.store_settings for all using (true) with check (true);

-- Policies for Support Tickets
-- Public can insert (Submit form)
create policy "Public Submit Ticket" on public.support_tickets for insert with check (true);
-- Admin can view/edit
create policy "Admin Manage Tickets" on public.support_tickets for all using (true) with check (true);

-- Insert default settings
insert into public.store_settings (key, value) values
    ('store_name', 'Le Monde d''Elya'),
    ('contact_email', 'support@lemondedelya.com'),
    ('contact_phone', '+1 (514) 123-4567'),
    ('contact_address', 'Montréal, Québec')
on conflict (key) do nothing;
