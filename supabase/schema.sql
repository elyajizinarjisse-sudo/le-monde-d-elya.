-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text default 'customer', -- 'admin' or 'customer'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS
create table products (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price decimal(10,2) not null,
  image text,
  category text,
  subcategory text,
  stock integer default 0,
  is_new boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users, -- can be null for guest checkout
  customer_email text,
  customer_name text,
  status text default 'pending', -- pending, paid, shipped, delivered, cancelled
  total decimal(10,2) not null,
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDER ITEMS
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id),
  quantity integer default 1,
  price_at_purchase decimal(10,2) not null
);

-- RLS POLICIES (Security)
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public Read Access for Products
create policy "Public products are viewable by everyone"
  on products for select
  using ( true );

-- Admin Write Access (Example policy - needs authenticated admin role)
-- For now, allow authenticated users to insert (we will restrict this later)
create policy "Authenticated users can insert products"
  on products for insert
  with check ( auth.role() = 'authenticated' );
