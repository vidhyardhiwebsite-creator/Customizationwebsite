-- ============================================================
-- VIDHYRATHI GIFTS — COMPLETE DATABASE SETUP
-- Run this entire file once in Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TABLES
-- ────────────────────────────────────────────────────────────

create table if not exists products (
  id          uuid    primary key default gen_random_uuid(),
  custom_id   text    unique,
  name        text    not null,
  price       numeric not null,
  category    text    not null,
  description text,
  images      text[]  default '{}',
  tags        text[]  default '{}',
  stock       integer default 0,
  size        text,
  series_id   text    default 'VR0',
  allow_custom_name  boolean default false,
  allow_custom_photo boolean default false,
  custom_name_label  text    default 'Personalization Text',
  custom_photo_label text    default 'Upload Your Photo',
  created_at  timestamptz default now()
);

create index if not exists idx_products_custom_id on products(custom_id);

create table if not exists cart (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    references auth.users(id) on delete cascade not null,
  product_id uuid    references products(id)   on delete cascade not null,
  quantity   integer default 1,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

create table if not exists wishlist (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    references auth.users(id) on delete cascade not null,
  product_id uuid    references products(id)   on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

create table if not exists orders (
  id                     uuid    primary key default gen_random_uuid(),
  user_id                uuid    references auth.users(id) on delete cascade not null,
  total_amount           numeric not null,
  payment_status         text    default 'pending',
  order_status           text    default 'confirmed',
  address                jsonb,
  display_order_id       text,
  order_series           text    default 'VR0',
  series_number          integer,
  payment_method         text    default 'upi',
  payment_screenshot_url text,
  upi_ref                text,
  payment_verified       boolean default false,
  razorpay_payment_id    text,
  razorpay_order_id      text,
  tracking_id            text,
  tracking_image_url     text,
  tracking_updated_at    timestamptz,
  city                   text,
  state                  text,
  pincode                text,
  created_at             timestamptz default now()
);

create index if not exists idx_orders_display_id on orders(display_order_id);

create table if not exists order_items (
  id              uuid    primary key default gen_random_uuid(),
  order_id        uuid    references orders(id)   on delete cascade not null,
  product_id      uuid    references products(id) on delete set null,
  quantity        integer not null,
  price           numeric not null,
  custom_name     text,
  custom_photo_url text
);

create table if not exists addresses (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    references auth.users(id) on delete cascade not null,
  label      text    default 'Home',
  full_name  text    not null,
  phone      text    not null,
  address1   text    not null,
  address2   text,
  city       text    not null,
  state      text    not null,
  pincode    text    not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id          uuid    primary key default gen_random_uuid(),
  user_id     uuid    references auth.users(id) on delete cascade,
  user_name   text,
  user_avatar text,
  rating      integer not null check (rating between 1 and 5),
  comment     text    not null,
  created_at  timestamptz default now()
);

create table if not exists site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

create table if not exists order_series_counter (
  series      text    primary key,
  last_number integer default 0
);

insert into order_series_counter (series, last_number)
values ('VR0', 0), ('VR1', 0)
on conflict (series) do nothing;

-- ────────────────────────────────────────────────────────────
-- 2. DEFAULT SITE SETTINGS
-- ────────────────────────────────────────────────────────────

insert into site_settings (key, value) values
  ('hero_video_url',    ''),
  ('offer_banner',      ''),
  ('promo_banners',     ''),
  ('products_per_page', '12'),
  ('features_bar', '[{"id":1,"title":"Handcrafted Quality","desc":"Artisan made gifts"},{"id":2,"title":"Easy Personalization","desc":"Custom orders welcome"},{"id":3,"title":"Secure Checkout","desc":"100% safe payments"},{"id":4,"title":"Fast Shipping","desc":"Across India"}]')
on conflict (key) do nothing;

-- ────────────────────────────────────────────────────────────
-- 3. ENABLE ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

alter table products          enable row level security;
alter table cart               enable row level security;
alter table wishlist           enable row level security;
alter table orders             enable row level security;
alter table order_items        enable row level security;
alter table addresses          enable row level security;
alter table reviews            enable row level security;
alter table site_settings      enable row level security;
alter table order_series_counter enable row level security;

-- ────────────────────────────────────────────────────────────
-- 4. DROP ALL OLD POLICIES (clean slate)
-- ────────────────────────────────────────────────────────────

do $$ declare r record; begin
  for r in
    select policyname, tablename from pg_policies
    where tablename in (
      'products','cart','wishlist','orders','order_items',
      'addresses','reviews','site_settings','order_series_counter'
    )
  loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────
-- 5. PRODUCTS POLICIES
-- ────────────────────────────────────────────────────────────

create policy "Anyone can read products"
  on products for select using (true);

create policy "Authenticated can insert products"
  on products for insert with check (auth.role() = 'authenticated');

create policy "Authenticated can update products"
  on products for update using (auth.role() = 'authenticated');

create policy "Authenticated can delete products"
  on products for delete using (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────
-- 6. CART POLICIES
-- ────────────────────────────────────────────────────────────

create policy "Users manage own cart select"
  on cart for select using (auth.uid() = user_id);

create policy "Users manage own cart insert"
  on cart for insert with check (auth.uid() = user_id);

create policy "Users manage own cart update"
  on cart for update using (auth.uid() = user_id);

create policy "Users manage own cart delete"
  on cart for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 7. WISHLIST POLICIES
-- ────────────────────────────────────────────────────────────

create policy "Users manage own wishlist select"
  on wishlist for select using (auth.uid() = user_id);

create policy "Users manage own wishlist insert"
  on wishlist for insert with check (auth.uid() = user_id);

create policy "Users manage own wishlist delete"
  on wishlist for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 8. ORDERS POLICIES  (users see own; admin via security-definer functions)
-- ────────────────────────────────────────────────────────────

create policy "Users can view own orders"
  on orders for select using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on orders for insert with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on orders for update using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 9. ORDER ITEMS POLICIES
-- ────────────────────────────────────────────────────────────

create policy "Users view own order items"
  on order_items for select using (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

create policy "Users insert own order items"
  on order_items for insert with check (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────
-- 10. ADDRESSES POLICIES
-- ────────────────────────────────────────────────────────────

create policy "Users manage own addresses select"
  on addresses for select using (auth.uid() = user_id);

create policy "Users manage own addresses insert"
  on addresses for insert with check (auth.uid() = user_id);

create policy "Users manage own addresses update"
  on addresses for update using (auth.uid() = user_id);

create policy "Users manage own addresses delete"
  on addresses for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 11. REVIEWS POLICIES
-- ────────────────────────────────────────────────────────────

create policy "Reviews are public"
  on reviews for select using (true);

create policy "Users can insert own review"
  on reviews for insert with check (auth.uid() = user_id);

create policy "Users can update own review"
  on reviews for update using (auth.uid() = user_id);

create policy "Users can delete own review"
  on reviews for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 12. SITE SETTINGS POLICIES
-- ────────────────────────────────────────────────────────────

create policy "Anyone can read site settings"
  on site_settings for select using (true);

create policy "Authenticated can upsert site settings"
  on site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────
-- 13. ORDER SERIES COUNTER POLICIES
-- ────────────────────────────────────────────────────────────

create policy "Anyone can read series counter"
  on order_series_counter for select using (true);

create policy "Authenticated can update series counter"
  on order_series_counter for update using (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────
-- 14. STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/quicktime','video/webm']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 52428800;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-screenshots', 'payment-screenshots', false, 10485760,
  array['image/jpeg','image/png','image/webp','image/heic']
)
on conflict (id) do update set file_size_limit = 10485760;

-- Drop old storage policies
do $$ declare r record; begin
  for r in select policyname from pg_policies
    where tablename = 'objects' and schemaname = 'storage'
    and (policyname ilike '%product%' or policyname ilike '%payment%')
  loop
    execute format('drop policy if exists %I on storage.objects', r.policyname);
  end loop;
end $$;

-- Product images storage policies
create policy "Public read product images"
  on storage.objects for select using (bucket_id = 'product-images');

create policy "Auth upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Auth update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Auth delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- Payment screenshots storage policies
create policy "Auth upload payment screenshot"
  on storage.objects for insert
  with check (bucket_id = 'payment-screenshots' and auth.role() = 'authenticated');

create policy "Auth read payment screenshots"
  on storage.objects for select
  using (bucket_id = 'payment-screenshots' and auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────
-- 15. SECURITY-DEFINER FUNCTIONS (bypass RLS for admin)
-- ────────────────────────────────────────────────────────────

-- Get all orders (admin)
create or replace function get_all_orders()
returns setof orders
language sql security definer set search_path = public
as $$ select * from orders order by created_at desc; $$;

-- Get all order items (admin)
create or replace function get_all_order_items()
returns setof order_items
language sql security definer set search_path = public
as $$ select * from order_items; $$;

-- Update order status (admin)
create or replace function admin_update_order_status(p_order_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public
as $$
begin
  update orders set order_status = p_status where id = p_order_id;
end; $$;

-- Verify payment (admin)
create or replace function admin_verify_payment(p_order_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  update orders
  set payment_status = 'paid', payment_verified = true, order_status = 'confirmed'
  where id = p_order_id;
end; $$;

-- Reject payment (admin)
create or replace function admin_reject_payment(p_order_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  update orders
  set payment_status = 'failed', order_status = 'cancelled'
  where id = p_order_id;
end; $$;

-- Update order payment (admin)
create or replace function update_order_payment(
  p_order_id uuid, p_payment_status text,
  p_payment_verified boolean, p_order_status text
)
returns void language sql security definer set search_path = public
as $$
  update orders
  set payment_status    = p_payment_status,
      payment_verified  = p_payment_verified,
      order_status      = p_order_status
  where id = p_order_id;
$$;

-- Get all cart items (admin)
create or replace function get_all_carts()
returns table (
  id uuid, user_id uuid, product_id uuid, quantity integer, created_at timestamptz,
  product_name text, product_price numeric, product_images text[],
  product_category text, product_custom_id text
)
language sql security definer set search_path = public
as $$
  select c.id, c.user_id, c.product_id, c.quantity, c.created_at,
    p.name, p.price, p.images, p.category, p.custom_id
  from cart c left join products p on p.id = c.product_id;
$$;

-- Get all wishlist items (admin)
create or replace function get_all_wishlists()
returns table (
  id uuid, user_id uuid, product_id uuid, created_at timestamptz,
  product_name text, product_price numeric, product_images text[],
  product_category text, product_custom_id text
)
language sql security definer set search_path = public
as $$
  select w.id, w.user_id, w.product_id, w.created_at,
    p.name, p.price, p.images, p.category, p.custom_id
  from wishlist w left join products p on p.id = w.product_id;
$$;

-- Get next order series number (atomic)
create or replace function get_next_series_number(p_series text)
returns integer language plpgsql security definer
as $$
declare next_num integer;
begin
  update order_series_counter
  set last_number = last_number + 1
  where series = p_series
  returning last_number into next_num;
  return next_num;
end; $$;

-- ────────────────────────────────────────────────────────────
-- 16. GRANT EXECUTE PERMISSIONS
-- ────────────────────────────────────────────────────────────

grant execute on function get_all_orders()                                         to authenticated;
grant execute on function get_all_order_items()                                    to authenticated;
grant execute on function admin_update_order_status(uuid, text)                    to authenticated;
grant execute on function admin_verify_payment(uuid)                               to authenticated;
grant execute on function admin_reject_payment(uuid)                               to authenticated;
grant execute on function update_order_payment(uuid, text, boolean, text)          to authenticated;
grant execute on function get_all_carts()                                          to authenticated;
grant execute on function get_all_wishlists()                                      to authenticated;
grant execute on function get_next_series_number(text)                             to authenticated;

-- ────────────────────────────────────────────────────────────
-- DONE — All tables, policies, functions and storage in one file
-- ────────────────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────
-- MIGRATION: Run these if you already have an existing DB
-- (safe to run multiple times — uses IF NOT EXISTS / IF NOT EXISTS)
-- ────────────────────────────────────────────────────────────
alter table products add column if not exists allow_custom_name  boolean default false;
alter table products add column if not exists allow_custom_photo boolean default false;
alter table products add column if not exists custom_name_label  text    default 'Personalization Text';
alter table products add column if not exists custom_photo_label text    default 'Upload Your Photo';
alter table order_items add column if not exists custom_name      text;
alter table order_items add column if not exists custom_photo_url text;
