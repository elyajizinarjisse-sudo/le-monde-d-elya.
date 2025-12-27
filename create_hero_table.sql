-- Create a table for singleton content (Hero Banner)
create table if not exists public.hero_content (
  id integer primary key generated always as identity,
  title text not null,
  subtitle text,
  button_text text,
  button_link text,
  image_url text,
  is_active boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.hero_content enable row level security;

-- Allow public read access
create policy "Allow public read access"
  on public.hero_content
  for select
  using (true);

-- Allow authenticated (admin) insert/update
create policy "Allow admin insert/update"
  on public.hero_content
  for all
  using (true)
  with check (true);

-- Insert default row if empty
insert into public.hero_content (title, subtitle, button_text, button_link, image_url)
select 
  'Bienvenue !',
  'Plongez dans le monde magique d''Elya.',
  'EXPLORER 🦄',
  '/category/jouets',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&h=900&fit=crop'
where not exists (select 1 from public.hero_content);
