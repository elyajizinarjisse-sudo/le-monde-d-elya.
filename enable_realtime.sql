-- Enable replication for 'menu_items' table so Realtime works
alter table menu_items replica identity full;

-- Ensure the publication 'supabase_realtime' exists and add the table to it
begin;
  -- remove if already exists to avoid duplication errors (optional, clean start)
  drop publication if exists supabase_realtime;
  
  -- Create publication for all tables (simplest for dev)
  create publication supabase_realtime for all tables;
commit;
