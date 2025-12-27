-- Add overlay customization columns to hero_content
alter table public.hero_content 
add column if not exists overlay_position text default 'left',
add column if not exists show_overlay boolean default true;

-- Update existing row to defaults
update public.hero_content 
set overlay_position = 'left', show_overlay = true 
where overlay_position is null;
