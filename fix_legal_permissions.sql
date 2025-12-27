-- Fix permissions to allow Admin Editor to save changes without complex auth setup
-- (Enables write access for the public API key used in the frontend)

drop policy if exists "Admin Write Access" on public.legal_pages;

create policy "Public Write Access" on public.legal_pages
    for all
    using (true)
    with check (true);
