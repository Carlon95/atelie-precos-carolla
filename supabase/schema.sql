-- Execute uma vez no SQL Editor de um projeto Supabase NOVO e exclusivo.
begin;
create table public.products (
 id uuid primary key default gen_random_uuid(),
 owner uuid not null references auth.users(id),
 name text not null check(length(name) between 1 and 120),
 category text not null,
 data jsonb not null,
 photo text,
 updated_at timestamptz not null default now(),
 stock integer not null default 0 check(stock>=0),
 stock_min integer not null default 3 check(stock_min between 0 and 1000000)
);
create index products_owner_idx on public.products(owner,updated_at desc);
create table public.sales (
 id text primary key,
 owner uuid not null references auth.users(id),
 product_id uuid not null references public.products(id) on delete restrict,
 product_name text not null,
 category text not null,
 quantity integer not null check(quantity between 1 and 1000000),
 unit_price bigint not null check(unit_price between 1 and 100000000),
 total bigint not null check(total>=0),
 cost_total bigint not null check(cost_total>=0),
 fee_total bigint not null check(fee_total>=0),
 sold_on date not null,
 cancelled integer not null default 0 check(cancelled in (0,1)),
 created_at timestamptz not null default now()
);
create index sales_owner_date_idx on public.sales(owner,sold_on desc);
alter table public.products enable row level security;
alter table public.sales enable row level security;
create policy products_owner on public.products for all to authenticated using(owner=(select auth.uid())) with check(owner=(select auth.uid()));
create policy sales_owner on public.sales for select to authenticated using(owner=(select auth.uid()));
-- O navegador não pode alterar vendas nem saldo diretamente.
revoke all on public.products,public.sales from anon,authenticated;
grant select,delete on public.products to authenticated;
grant insert(id,owner,name,category,data,photo,updated_at) on public.products to authenticated;
grant update(name,category,data,photo,updated_at) on public.products to authenticated;
grant select on public.sales to authenticated;

create function public.adjust_stock(p_id uuid,p_stock integer,p_min integer,p_expected integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare affected integer;
begin
 if auth.uid() is null then raise exception 'AUTH'; end if;
 if p_stock is null or p_min is null or p_expected is null or p_stock not between 0 and 1000000 or p_min not between 0 and 1000000 or p_expected not between 0 and 1000000 then raise exception 'INVALID_STOCK'; end if;
 update public.products set stock=p_stock,stock_min=p_min where id=p_id and owner=auth.uid() and stock=p_expected;
 get diagnostics affected=row_count;
 return affected=1;
end $$;

create function public.record_sale(p_id text,p_product uuid,p_quantity integer,p_cents bigint,p_date date)
returns public.sales language plpgsql security definer set search_path='' as $$
declare p public.products; s public.sales; unit_cost numeric; rates numeric;
begin
 if auth.uid() is null then raise exception 'AUTH'; end if;
 if p_id is null or p_id !~ '^[-a-zA-Z0-9]{16,80}$' or p_product is null or p_quantity is null or p_quantity not between 1 and 1000000 or p_cents is null or p_cents not between 1 and 100000000 or p_date is null or p_date < date '2000-01-01' or p_date > (now() at time zone 'America/Sao_Paulo')::date then raise exception 'INVALID_SALE'; end if;
 -- Serializa reenvios do mesmo id, inclusive se alterarem o produto.
 perform pg_advisory_xact_lock(hashtextextended(p_id,0));
 select * into s from public.sales where id=p_id;
 if found then
  if s.owner<>auth.uid() or s.product_id<>p_product or s.quantity<>p_quantity or s.unit_price<>p_cents or s.sold_on<>p_date then raise exception 'ID_CONFLICT'; end if;
  return s;
 end if;
 select * into p from public.products where id=p_product and owner=auth.uid() for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 if p.stock<p_quantity then raise exception 'INSUFFICIENT_STOCK'; end if;
 unit_cost=(p.data->>'purchase')::numeric+(p.data->>'freight')::numeric/(p.data->>'quantity')::numeric+(p.data->>'packaging')::numeric+(p.data->>'overhead')::numeric+(p.data->>'fixedFee')::numeric;
 rates=((p.data->>'fee')::numeric+(p.data->>'tax')::numeric)/100;
 if unit_cost is null or rates is null or unit_cost<0 or rates<0 or rates>=1 then raise exception 'INVALID_SALE'; end if;
 insert into public.sales(id,owner,product_id,product_name,category,quantity,unit_price,total,cost_total,fee_total,sold_on)
 values(p_id,auth.uid(),p.id,p.name,p.category,p_quantity,p_cents,p_cents*p_quantity,round(unit_cost*100)*p_quantity,round(p_cents*p_quantity*rates),p_date) returning * into s;
 update public.products set stock=stock-p_quantity where id=p.id and owner=auth.uid();
 return s;
end $$;

create function public.cancel_sale(p_id text)
returns void language plpgsql security definer set search_path='' as $$
declare s public.sales;
begin
 if auth.uid() is null then raise exception 'AUTH'; end if;
 select * into s from public.sales where id=p_id and owner=auth.uid() for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 if s.cancelled=1 then return; end if;
 update public.products set stock=stock+s.quantity where id=s.product_id and owner=auth.uid();
 update public.sales set cancelled=1 where id=s.id and owner=auth.uid();
end $$;
revoke all on function public.adjust_stock(uuid,integer,integer,integer),public.record_sale(text,uuid,integer,bigint,date),public.cancel_sale(text) from public,anon;
grant execute on function public.adjust_stock(uuid,integer,integer,integer),public.record_sale(text,uuid,integer,bigint,date),public.cancel_sale(text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-photos','product-photos',false,3145728,array['image/jpeg','image/png','image/webp']);
create policy carolla_photo_read on storage.objects for select to authenticated using(bucket_id='product-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy carolla_photo_insert on storage.objects for insert to authenticated with check(bucket_id='product-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy carolla_photo_delete on storage.objects for delete to authenticated using(bucket_id='product-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
