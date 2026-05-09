-- Backfill display_order_id for existing orders that don't have one
-- This assigns sequential IDs based on created_at order

-- First ensure counter table exists with correct starting values
insert into order_series_counter (series, last_number) values ('NS0', 0), ('NS1', 0)
on conflict (series) do nothing;

-- Backfill NS0 orders (order_series = 'NS0' or NULL/other)
do $$
declare
  rec record;
  counter integer := 0;
begin
  for rec in
    select id from orders
    where (display_order_id is null or display_order_id = '')
      and (order_series = 'NS0' or order_series is null)
    order by created_at asc
  loop
    counter := counter + 1;
    update orders
    set display_order_id = 'NS0-' || lpad(counter::text, 3, '0'),
        order_series = 'NS0'
    where id = rec.id;
  end loop;

  -- Update counter to reflect backfilled count
  update order_series_counter set last_number = counter where series = 'NS0';
end $$;

-- Backfill NS1 orders
do $$
declare
  rec record;
  counter integer := 0;
begin
  for rec in
    select id from orders
    where (display_order_id is null or display_order_id = '')
      and order_series = 'NS1'
    order by created_at asc
  loop
    counter := counter + 1;
    update orders
    set display_order_id = 'NS1-' || lpad(counter::text, 3, '0')
    where id = rec.id;
  end loop;

  update order_series_counter set last_number = counter where series = 'NS1';
end $$;
