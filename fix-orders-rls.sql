-- Run this in your Supabase SQL editor
-- Fixes orders not showing in admin panel and user orders page

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
-- STEP 2: Recreate clean policies
-- ============================================

-- Orders: users see their own, admins see all
create policy "Users can view own orders"
  on orders for select
  using (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
  );

create policy "Users can insert own orders"
  on orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can update orders"
  on orders for update
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
  );

-- Order items: users see their own order items, admins see all
create policy "Users can view own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and (
        orders.user_id = auth.uid()
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
      )
    )
  );

create policy "Users can insert order items"
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );
