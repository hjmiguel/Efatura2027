-- ============================================================================
-- Gestão+ — Esquema para Supabase Auth + RLS (substitui o modelo com tabela users própria).
-- Aplicar no SQL Editor do Supabase (projeto novo, sem ter corrido 20260730000001_init.sql).
-- Modelo: uma tabela `records` genérica (entity + data jsonb) com RLS por entidade,
-- espelhando as regras das entidades Base44. Tabelas tipadas podem vir depois sem mudar a app.
-- ============================================================================

create extension if not exists "pgcrypto";

-- Perfis (1 por utilizador do Supabase Auth)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text default '',
  role         text not null default 'user',          -- 'admin' | 'user'
  data         jsonb not null default '{}'::jsonb,    -- nif, app_role, company_id, phone, ...
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers (security definer para evitar recursão de RLS)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
create or replace function public.my_data(k text) returns text
language sql stable security definer set search_path = public as $$
  select data->>k from public.profiles where id = auth.uid();
$$;

alter table public.profiles enable row level security;
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update on public.profiles;
create policy profiles_select on public.profiles for select using (id = auth.uid() or public.is_admin());
-- o utilizador edita o seu perfil; `role` só é alterável por admin (ver trigger abaixo)
create policy profiles_update on public.profiles for update using (id = auth.uid() or public.is_admin());

create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then new.role := old.role; end if;
  if new.data ? 'app_role' and (new.data->>'app_role') is distinct from (old.data->>'app_role') and not public.is_admin() then
    new.data := jsonb_set(new.data, '{app_role}', coalesce(old.data->'app_role','null'::jsonb));
  end if;
  new.updated_date := now();
  return new;
end $$;
drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_role();

-- Registos de todas as entidades
create table if not exists public.records (
  id            uuid primary key default gen_random_uuid(),
  entity        text not null,
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data          jsonb not null default '{}'::jsonb,
  created_date  timestamptz not null default now(),
  updated_date  timestamptz not null default now()
);
create index if not exists idx_records_entity on public.records(entity);
create index if not exists idx_records_owner on public.records(entity, owner_id);
create index if not exists idx_records_data on public.records using gin (data);

alter table public.records enable row level security;

-- Leitura
drop policy if exists records_select on public.records;
create policy records_select on public.records for select using (
  public.is_admin()
  or (entity in ('Category','UtilityCompany'))                                     -- catálogos públicos
  or (entity in ('CostCenter','Approval','Supplier')
        and data->>'company_id' = public.my_data('company_id'))                    -- empresa
  or (entity in ('PartnerApiKey','PartnerFee') and (data->>'owner_user_id') = auth.uid()::text)
  or (entity = 'PartnerConsent' and ((data->>'partner_nif') = public.my_data('partner_nif')
        or (data->>'user_nif') = public.my_data('nif')))
  or (entity = 'Invoice' and ((data->>'partner_owner_id') = auth.uid()::text
        or ((data->>'user_nif') is not null and (data->>'user_nif') = public.my_data('nif'))))
  or (entity = 'Subscription' and (data->>'user_id') = auth.uid()::text)
  or (entity not in ('Category','UtilityCompany','AuditLog') and owner_id = auth.uid())
);

-- Criação
drop policy if exists records_insert on public.records;
create policy records_insert on public.records for insert with check (
  owner_id = auth.uid()
  and (
    public.is_admin()
    or entity not in ('Category','UtilityCompany','Company','PartnerFee','AuditLog')
  )
  and (
    entity not in ('CostCenter','Approval','Supplier')
    or public.is_admin()
    or data->>'company_id' = public.my_data('company_id')
  )
);
-- Registos de auditoria: qualquer utilizador autenticado pode escrever os seus; só admin lê (ver select acima)
drop policy if exists records_insert_audit on public.records;
create policy records_insert_audit on public.records for insert with check (entity = 'AuditLog' and owner_id = auth.uid());

-- Atualização
drop policy if exists records_update on public.records;
create policy records_update on public.records for update using (
  public.is_admin()
  or (entity in ('CostCenter','Approval','Supplier') and data->>'company_id' = public.my_data('company_id'))
  or (entity in ('PartnerApiKey') and (data->>'owner_user_id') = auth.uid()::text)
  or (entity = 'Subscription' and (data->>'user_id') = auth.uid()::text)
  or (entity = 'Invoice' and (data->>'user_nif') = public.my_data('nif'))
  or (entity = 'PartnerConsent' and (data->>'user_nif') = public.my_data('nif'))
  or (entity not in ('Category','UtilityCompany','Company','PartnerFee','AuditLog') and owner_id = auth.uid())
);

-- Eliminação
drop policy if exists records_delete on public.records;
create policy records_delete on public.records for delete using (
  public.is_admin()
  or (entity in ('CostCenter','Approval','Supplier') and data->>'company_id' = public.my_data('company_id'))
  or (entity in ('Account','Invoice','Transaction','Budget','Dependent','DataRequest') and owner_id = auth.uid())
);

create or replace function public.touch_record() returns trigger language plpgsql as $$
begin new.updated_date := now(); return new; end $$;
drop trigger if exists records_touch on public.records;
create trigger records_touch before update on public.records for each row execute function public.touch_record();

-- Ficheiros (comprovativos, faturas fotografadas): bucket privado, pasta = id do utilizador
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', false) on conflict (id) do nothing;
drop policy if exists uploads_rw on storage.objects;
create policy uploads_rw on storage.objects for all
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

-- Promover o primeiro administrador (executar manualmente depois do 1.º registo):
-- update public.profiles set role = 'admin' where email = 'teu-email@dominio';