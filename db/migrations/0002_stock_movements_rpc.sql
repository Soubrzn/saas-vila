create or replace function public.register_stock_movement(
  p_product_id uuid,
  p_movement_kind text,
  p_quantity integer,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop_id uuid := public.current_shop_id();
  v_user_id uuid := auth.uid();
  v_product public.products%rowtype;
  v_quantity_change integer;
  v_movement_type text;
  v_movement_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if v_shop_id is null then
    raise exception 'user has no shop';
  end if;

  if p_movement_kind not in ('purchase', 'adjustment_in', 'adjustment_out') then
    raise exception 'invalid stock movement kind';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be positive';
  end if;

  select *
  into v_product
  from public.products
  where id = p_product_id
    and shop_id = v_shop_id
    and active = true
  for update;

  if not found then
    raise exception 'product not found in current shop';
  end if;

  v_quantity_change := case
    when p_movement_kind in ('purchase', 'adjustment_in') then p_quantity
    else -p_quantity
  end;

  if v_product.current_stock + v_quantity_change < 0 then
    raise exception 'stock cannot become negative';
  end if;

  v_movement_type := case
    when p_movement_kind = 'purchase' then 'purchase'
    else 'adjustment'
  end;

  update public.products
  set current_stock = current_stock + v_quantity_change
  where id = v_product.id
    and shop_id = v_shop_id
  returning current_stock into v_product.current_stock;

  insert into public.stock_movements (
    shop_id,
    product_id,
    movement_type,
    quantity_change,
    stock_after,
    created_by,
    notes
  )
  values (
    v_shop_id,
    v_product.id,
    v_movement_type,
    v_quantity_change,
    v_product.current_stock,
    v_user_id,
    nullif(trim(p_notes), '')
  )
  returning id into v_movement_id;

  return v_movement_id;
end;
$$;

grant execute on function public.register_stock_movement(uuid, text, integer, text) to authenticated;
