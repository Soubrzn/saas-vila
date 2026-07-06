create extension if not exists pg_trgm;

create index if not exists products_shop_active_name_idx
on public.products(shop_id, active, name);

create index if not exists products_name_trgm_idx
on public.products using gin (name gin_trgm_ops)
where active = true;

create index if not exists customers_shop_name_idx
on public.customers(shop_id, name);

create index if not exists customer_debts_shop_customer_status_idx
on public.customer_debts(shop_id, customer_id, status);

create index if not exists sale_items_shop_product_idx
on public.sale_items(shop_id, product_id);

create index if not exists stock_movements_shop_created_at_idx
on public.stock_movements(shop_id, created_at desc);
