begin;
-- Execute no banco existente antes de publicar. Preserva os produtos e vendas.
alter table public.products add column if not exists sku text;
do $$
begin
 if not exists (select 1 from pg_constraint where conrelid='public.products'::regclass and conname='products_sku_valid') then
  alter table public.products add constraint products_sku_valid check(sku is null or (length(sku) between 1 and 64 and sku=btrim(sku) and sku !~ '[[:cntrl:]]'));
 end if;
end $$;
create unique index if not exists products_owner_sku_idx on public.products(owner,lower(sku)) where sku is not null;
grant insert(sku),update(sku) on public.products to authenticated;
notify pgrst, 'reload schema';
commit;
