-- Run this in your Supabase SQL editor
-- Drop old policies first (in case they exist)
drop policy if exists "Admins can view all carts" on cart;
drop policy if exists "Admins can view all wishlists" on wishlist;
drop policy if exists "Users can view own cart" on cart;
drop policy if exists "Users can view own wishlist" on wishlist;

-- Recreate cart select policy: own rows OR admin
create policy "Users can view own cart"
  on cart for select
  using (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
  );

-- Recreate wishlist select policy: own rows OR admin
create policy "Users can view own wishlist"
  on wishlist for select
  using (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
  );
