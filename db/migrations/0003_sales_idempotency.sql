alter table public.sales
add column if not exists idempotency_key text;

create unique index if not exists sales_shop_idempotency_key_idx
on public.sales(shop_id, idempotency_key)
where idempotency_key is not null;

create or replace function public.register_sale(
  p_customer_id uuid,
  p_payment_type text,
  p_discount_total numeric,
  p_notes text,
  p_items jsonb,
  p_idempotency_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop_id uuid := public.current_shop_id();
  v_user_id uuid := auth.uid();
  v_sale_id uuid := gen_random_uuid();
  v_existing_sale_id uuid;
  v_subtotal numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_unit_price numeric(12,2);
  v_line_total numeric(12,2);
  v_idempotency_key text := nullif(trim(p_idempotency_key), '');
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if v_shop_id is null then
    raise exception 'user has no shop';
  end if;

  if v_idempotency_key is not null then
    select id
    into v_existing_sale_id
    from public.sales
    where shop_id = v_shop_id
      and idempotency_key = v_idempotency_key
    limit 1;

    if v_existing_sale_id is not null then
      return v_existing_sale_id;
    end if;
  end if;

  if p_payment_type not in ('cash', 'pix', 'card', 'credit') then
    raise exception 'invalid payment type';
  end if;

  if coalesce(p_discount_total, 0) < 0 then
    raise exception 'discount cannot be negative';
  end if;

  if p_payment_type = 'credit' and p_customer_id is null then
    raise exception 'credit sale requires customer';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'sale requires at least one item';
  end if;

  if p_customer_id is not null and not exists (
    select 1 from public.customers where id = p_customer_id and shop_id = v_shop_id
  ) then
    raise exception 'customer not found in current shop';
  end if;

  insert into public.sales (
    id, shop_id, user_id, customer_id, payment_type, subtotal, discount_total, total, notes, idempotency_key
  )
  values (
    v_sale_id, v_shop_id, v_user_id, p_customer_id, p_payment_type, 0, coalesce(p_discount_total, 0), 0, p_notes, v_idempotency_key
  )
  on conflict (shop_id, idempotency_key) where idempotency_key is not null
  do nothing
  returning id into v_existing_sale_id;

  if v_existing_sale_id is null then
    select id
    into v_existing_sale_id
    from public.sales
    where shop_id = v_shop_id
      and idempotency_key = v_idempotency_key
    limit 1;

    if v_existing_sale_id is not null then
      return v_existing_sale_id;
    end if;

    raise exception 'could not create sale';
  end if;

  v_sale_id := v_existing_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item ->> 'quantity')::integer;

    if v_qty is null or v_qty <= 0 then
      raise exception 'invalid item quantity';
    end if;

    select *
    into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
      and shop_id = v_shop_id
      and active = true
    for update;

    if not found then
      raise exception 'product not found in current shop';
    end if;

    if v_product.current_stock < v_qty then
      raise exception 'insufficient stock for product %', v_product.name;
    end if;

    v_unit_price := coalesce((v_item ->> 'unit_price')::numeric, v_product.sale_price);

    if v_unit_price < 0 then
      raise exception 'unit price cannot be negative';
    end if;

    v_line_total := v_qty * v_unit_price;

    insert into public.sale_items (shop_id, sale_id, product_id, quantity, unit_price)
    values (v_shop_id, v_sale_id, v_product.id, v_qty, v_unit_price);

    update public.products
    set current_stock = current_stock - v_qty
    where id = v_product.id and shop_id = v_shop_id
    returning current_stock into v_product.current_stock;

    insert into public.stock_movements (
      shop_id, product_id, sale_id, movement_type, quantity_change, stock_after, created_by
    )
    values (
      v_shop_id, v_product.id, v_sale_id, 'sale', -v_qty, v_product.current_stock, v_user_id
    );

    v_subtotal := v_subtotal + v_line_total;
  end loop;

  v_total := greatest(v_subtotal - coalesce(p_discount_total, 0), 0);

  update public.sales
  set subtotal = v_subtotal,
      discount_total = coalesce(p_discount_total, 0),
      total = v_total
  where id = v_sale_id;

  if p_payment_type = 'credit' then
    insert into public.customer_debts (shop_id, customer_id, sale_id, amount, paid_amount, status)
    values (v_shop_id, p_customer_id, v_sale_id, v_total, 0, 'open');
  end if;

  return v_sale_id;
end;
$$;

grant execute on function public.register_sale(uuid, text, numeric, text, jsonb, text) to authenticated;
