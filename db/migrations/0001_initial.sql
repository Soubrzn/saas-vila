create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated;

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shop_members (
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'operator')),
  created_at timestamptz not null default now(),
  primary key (shop_id, user_id),
  unique (user_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  sale_price numeric(12,2) not null default 0 check (sale_price >= 0),
  current_stock integer not null default 0 check (current_stock >= 0),
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, id)
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  customer_id uuid,
  payment_type text not null check (payment_type in ('cash', 'pix', 'card', 'credit')),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  discount_total numeric(12,2) not null default 0 check (discount_total >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  notes text,
  sold_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (shop_id, id),
  foreign key (shop_id, customer_id) references public.customers(shop_id, id)
);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null,
  sale_id uuid not null,
  product_id uuid not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now(),
  foreign key (shop_id, sale_id) references public.sales(shop_id, id) on delete cascade,
  foreign key (shop_id, product_id) references public.products(shop_id, id)
);

create table public.customer_debts (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null,
  sale_id uuid not null,
  amount numeric(12,2) not null check (amount >= 0),
  paid_amount numeric(12,2) not null default 0 check (paid_amount >= 0),
  status text not null default 'open' check (status in ('open', 'paid', 'canceled')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sale_id),
  unique (shop_id, id),
  check (paid_amount <= amount),
  foreign key (shop_id, customer_id) references public.customers(shop_id, id),
  foreign key (shop_id, sale_id) references public.sales(shop_id, id)
);

create table public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  debt_id uuid not null,
  amount numeric(12,2) not null check (amount > 0),
  payment_type text not null default 'cash' check (payment_type in ('cash', 'pix', 'card')),
  paid_at timestamptz not null default now(),
  notes text,
  foreign key (shop_id, debt_id) references public.customer_debts(shop_id, id) on delete cascade
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null,
  sale_id uuid,
  movement_type text not null check (movement_type in ('sale', 'adjustment', 'purchase')),
  quantity_change integer not null,
  stock_after integer not null,
  created_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),
  foreign key (shop_id, product_id) references public.products(shop_id, id),
  foreign key (shop_id, sale_id) references public.sales(shop_id, id)
);

create index products_shop_id_idx on public.products(shop_id);
create index products_low_stock_idx on public.products(shop_id, active, current_stock, minimum_stock);
create index customers_shop_id_idx on public.customers(shop_id);
create index sales_shop_sold_at_idx on public.sales(shop_id, sold_at desc);
create index sale_items_shop_sale_idx on public.sale_items(shop_id, sale_id);
create index debts_shop_status_idx on public.customer_debts(shop_id, status, created_at);
create index stock_movements_shop_product_idx on public.stock_movements(shop_id, product_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_shops_updated_at before update on public.shops
for each row execute function public.set_updated_at();

create trigger set_products_updated_at before update on public.products
for each row execute function public.set_updated_at();

create trigger set_customers_updated_at before update on public.customers
for each row execute function public.set_updated_at();

create trigger set_customer_debts_updated_at before update on public.customer_debts
for each row execute function public.set_updated_at();

create or replace function public.is_shop_member(p_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shop_members sm
    where sm.shop_id = p_shop_id
      and sm.user_id = auth.uid()
  );
$$;

create or replace function public.current_shop_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select sm.shop_id
  from public.shop_members sm
  where sm.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.create_shop_for_current_user(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_shop_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'shop name is required';
  end if;

  if exists (select 1 from public.shop_members where user_id = v_user_id) then
    raise exception 'user already belongs to a shop';
  end if;

  insert into public.shops (name, owner_id)
  values (trim(p_name), v_user_id)
  returning id into v_shop_id;

  insert into public.shop_members (shop_id, user_id, role)
  values (v_shop_id, v_user_id, 'owner');

  return v_shop_id;
end;
$$;

create or replace function public.register_sale(
  p_customer_id uuid,
  p_payment_type text,
  p_discount_total numeric,
  p_notes text,
  p_items jsonb
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
  v_subtotal numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_unit_price numeric(12,2);
  v_line_total numeric(12,2);
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if v_shop_id is null then
    raise exception 'user has no shop';
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
    id, shop_id, user_id, customer_id, payment_type, subtotal, discount_total, total, notes
  )
  values (
    v_sale_id, v_shop_id, v_user_id, p_customer_id, p_payment_type, 0, coalesce(p_discount_total, 0), 0, p_notes
  );

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

create or replace function public.register_debt_payment(
  p_debt_id uuid,
  p_amount numeric,
  p_payment_type text,
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
  v_debt public.customer_debts%rowtype;
  v_payment_id uuid;
  v_new_paid_amount numeric(12,2);
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if v_shop_id is null then
    raise exception 'user has no shop';
  end if;

  if p_payment_type not in ('cash', 'pix', 'card') then
    raise exception 'invalid payment type';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'payment amount must be positive';
  end if;

  select *
  into v_debt
  from public.customer_debts
  where id = p_debt_id
    and shop_id = v_shop_id
    and status = 'open'
  for update;

  if not found then
    raise exception 'open debt not found in current shop';
  end if;

  v_new_paid_amount := v_debt.paid_amount + p_amount;

  if v_new_paid_amount > v_debt.amount then
    raise exception 'payment exceeds open debt amount';
  end if;

  insert into public.debt_payments (shop_id, debt_id, amount, payment_type, notes)
  values (v_shop_id, p_debt_id, p_amount, p_payment_type, p_notes)
  returning id into v_payment_id;

  update public.customer_debts
  set paid_amount = v_new_paid_amount,
      status = case when v_new_paid_amount = amount then 'paid' else 'open' end
  where id = p_debt_id
    and shop_id = v_shop_id;

  return v_payment_id;
end;
$$;

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

alter table public.shops enable row level security;
alter table public.shop_members enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.customer_debts enable row level security;
alter table public.debt_payments enable row level security;
alter table public.stock_movements enable row level security;

create policy "members can read own shop"
on public.shops for select
using (public.is_shop_member(id));

create policy "owners can update own shop"
on public.shops for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "members can read memberships from own shop"
on public.shop_members for select
using (public.is_shop_member(shop_id));

create policy "members can read products"
on public.products for select
using (public.is_shop_member(shop_id));

create policy "members can insert products"
on public.products for insert
with check (public.is_shop_member(shop_id));

create policy "members can update products"
on public.products for update
using (public.is_shop_member(shop_id))
with check (public.is_shop_member(shop_id));

create policy "members can delete products"
on public.products for delete
using (public.is_shop_member(shop_id));

create policy "members can read customers"
on public.customers for select
using (public.is_shop_member(shop_id));

create policy "members can insert customers"
on public.customers for insert
with check (public.is_shop_member(shop_id));

create policy "members can update customers"
on public.customers for update
using (public.is_shop_member(shop_id))
with check (public.is_shop_member(shop_id));

create policy "members can delete customers"
on public.customers for delete
using (public.is_shop_member(shop_id));

create policy "members can read sales"
on public.sales for select
using (public.is_shop_member(shop_id));

create policy "members can read sale items"
on public.sale_items for select
using (public.is_shop_member(shop_id));

create policy "members can read debts"
on public.customer_debts for select
using (public.is_shop_member(shop_id));

create policy "members can read debt payments"
on public.debt_payments for select
using (public.is_shop_member(shop_id));

create policy "members can read stock movements"
on public.stock_movements for select
using (public.is_shop_member(shop_id));

grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.create_shop_for_current_user(text) to authenticated;
grant execute on function public.register_sale(uuid, text, numeric, text, jsonb) to authenticated;
grant execute on function public.register_debt_payment(uuid, numeric, text, text) to authenticated;
grant execute on function public.register_stock_movement(uuid, text, integer, text) to authenticated;
