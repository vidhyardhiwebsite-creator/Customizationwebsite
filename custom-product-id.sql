-- Add custom_id field to products (admin sets this manually)
alter table products add column if not exists custom_id text unique;

-- Index for fast lookup
create index if not exists idx_products_custom_id on products(custom_id);

-- Add display_order_id to orders (built from product custom_id)
alter table orders add column if not exists display_order_id text;
create index if not exists idx_orders_display_id on orders(display_order_id);
