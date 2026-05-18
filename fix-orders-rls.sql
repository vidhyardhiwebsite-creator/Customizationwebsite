-- Run this in your Supabase SQL editor
-- Fixes: admin can't see all orders, users can't see their own orders

-- ============================================
-- STEP 1: Drop all existing order policies
-- ============================================
drop policy if exists "Users can view own orders" on orders;
drop policy if exists "Users can insert own orders" on orders;
drop policy if exists "Admins can view all orders" on orders;
drop policy if exists "Admins can update orders" on orders;
drop policy if exists "Users can view own order items" on order_items;
drop policy if exists "Users can insert order items" on order_items;
drop policy if exists "Admins can view all order items" on order_items;

-- ============================================
-- STEP 2: Simple user policies (own rows only)
-- ============================================
create policy "Users can view own orders"
  on orders for select using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on orders for insert with check (auth.uid() = user_id);

create policy "Users can view own order items"
  on order_items for select
  using (exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  ));

create policy "Users can insert order items"
  on order_items for insert
  with check (exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  ));

-- ============================================
-- STEP 3: Security definer functions for admin
-- (bypasses RLS entirely — no JWT role check needed)
-- ============================================

create or replace function get_all_orders()
returns setof orders
language sql
security definer
set search_path = public
as $$
  select * from orders order by created_at desc;
$$;

create or replace function get_all_order_items()
returns setof order_items
language sql
security definer
set search_path = public
as $$
  select * from order_items;
$$;

create or replace function update_order_status(p_order_id uuid, p_status text)
returns void
language sql
security definer
set search_path = public
as $$
  update orders set order_status = p_status where id = p_order_id;
$$;

create or replace function update_order_payment(p_order_id uuid, p_payment_status text, p_payment_verified boolean, p_order_status text)
returns void
language sql
security definer
set search_path = public
as $$
  update orders
  set payment_status = p_payment_status,
      payment_verified = p_payment_verified,
      order_status = p_order_status
  where id = p_order_id;
$$;

-- Grant to authenticated users (admin check done in app)
grant execute on function get_all_orders() to authenticated;
grant execute on function get_all_order_items() to authenticated;
grant execute on function update_order_status(uuid, text) to authenticated;
grant execute on function update_order_payment(uuid, text, boolean, text) to authenticated;
