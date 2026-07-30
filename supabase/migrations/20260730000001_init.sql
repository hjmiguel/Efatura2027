# ============================================================================
# Gestão+ — Esquema PostgreSQL inicial (migração JSON → Supabase)
# Aplicar via: supabase db push  (após supabase link --project-ref xxxdsmyqrfritvhppnos)
# Convenções: UUID PK, timestamptz, numeric(18,2) para kwanza, owner_id p/ isolamento.
# ============================================================================

create extension if not exists "pgcrypto";

-- users (gestão própria de sessão pelo backend REST + JWT)
create table if not exists users (
  id               uuid primary key default gen_random_uuid(),
  email            text not null unique,
  full_name        text default '',
  phone            text,
  nif              text,
  role             text not null default 'user' check (role in ('admin','user','operator','support','auditor','partner','corporate_admin','corporate_finance','corporate_approver','corporate_read')),
  password_hash    text not null,
  agt_consent      boolean default false,
  agt_consent_date timestamptz,
  created_date     timestamptz not null default now(),
  updated_date     timestamptz not null default now()
);

create table if not exists categories (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references users(id) on delete cascade,
  name            text not null,
  type            text not null check (type in ('income','expense')),
  icon            text,
  color           text,
  is_deductible   boolean default false,
  deductible_type text default 'none' check (deductible_type in ('none','saude','educacao','habitacao','pensao_alimentos','previdencia')),
  created_date    timestamptz not null default now(),
  updated_date    timestamptz not null default now()
);
create index if not exists idx_categories_owner on categories(owner_id);

create table if not exists accounts (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references users(id) on delete cascade,
  name         text not null,
  bank_name    text not null,
  iban         text,
  balance      numeric(18,2) not null default 0,
  type         text not null default 'checking' check (type in ('checking','savings','cash')),
  color        text,
  is_active    boolean default true,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create index if not exists idx_accounts_owner on accounts(owner_id);

create table if not exists invoices (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references users(id) on delete cascade,
  issuer_name     text not null,
  issuer_nif      text,
  document_number text,
  amount          numeric(18,2) not null,
  issue_date      date,
  due_date        date not null,
  payment_method  text check (payment_method in ('mcx_reference','iban','rupe','manual')),
  entity          text,
  reference       text,
  iban            text,
  status          text not null default 'pending' check (status in ('pending','paid','overdue')),
  paid_date       date,
  category_id     uuid references categories(id) on delete set null,
  has_nif         boolean default true,
  deductible_type text default 'none' check (deductible_type in ('none','saude','educacao','habitacao','pensao_alimentos','previdencia')),
  source          text default 'manual' check (source in ('manual','photo_ocr','partner','agt')),
  agt_status      text default 'none' check (agt_status in ('none','emitted','paid')),
  user_nif        text,
  created_date    timestamptz not null default now(),
  updated_date    timestamptz not null default now()
);
create index if not exists idx_invoices_owner on invoices(owner_id);
create index if not exists idx_invoices_status on invoices(status);
create index if not exists idx_invoices_due on invoices(due_date);

create table if not exists transactions (
  id           uuid primary key default gen_random_uuid(),
  owner_id      uuid references users(id) on delete cascade,
  description   text not null,
  amount        numeric(18,2) not null,
  date          date not null,
  type          text not null check (type in ('income','expense','transfer')),
  account_id    uuid references accounts(id) on delete cascade,
  category_id   uuid references categories(id) on delete set null,
  invoice_id    uuid references invoices(id) on delete set null,
  notes         text,
  created_date  timestamptz not null default now(),
  updated_date  timestamptz not null default now()
);
create index if not exists idx_transactions_owner on transactions(owner_id);
create index if not exists idx_transactions_account on transactions(account_id);
create index if not exists idx_transactions_date on transactions(date);

create table if not exists budgets (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references users(id) on delete cascade,
  category_id   uuid references categories(id) on delete cascade,
  category_name text,
  month         text not null,
  limit         numeric(18,2) not null,
  spent         numeric(18,2) default 0,
  created_date  timestamptz not null default now(),
  updated_date  timestamptz not null default now(),
  unique (owner_id, category_id, month)
);
create index if not exists idx_budgets_owner on budgets(owner_id);

create table if not exists dependents (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references users(id) on delete cascade,
  name        text not null,
  relationship text not null check (relationship in ('conjuge','filho','pai','mae','outro')),
  nif         text,
  birth_date  date,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create index if not exists idx_dependents_owner on dependents(owner_id);

create table if not exists subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references users(id) on delete cascade,
  plan                text not null check (plan in ('monthly','yearly')),
  amount              numeric(18,2) not null,
  status              text not null default 'pending' check (status in ('pending','active','expired','cancelled')),
  start_date          date,
  end_date            date,
  proxypay_reference  text,
  proxypay_entity     text,
  proxypay_payment_id text,
  created_date        timestamptz not null default now(),
  updated_date        timestamptz not null default now()
);
create index if not exists idx_subscriptions_user on subscriptions(user_id);

create table if not exists partner_consents (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references users(id) on delete cascade,
  partner_name    text not null,
  partner_nif     text not null,
  api_key_hash    text not null,
  api_key_preview text,
  consent_status  text not null default 'active' check (consent_status in ('active','revoked')),
  consent_date    timestamptz,
  revoked_date    timestamptz,
  scopes          text[] not null default '{}',
  user_nif        text,
  created_date    timestamptz not null default now(),
  updated_date    timestamptz not null default now()
);
create index if not exists idx_partner_consents_owner on partner_consents(owner_id);

create table if not exists approvals (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid references users(id) on delete cascade,
  entity_type        text not null check (entity_type in ('payment','invoice','transfer')),
  entity_id          text,
  entity_description text not null,
  amount             numeric(18,2) not null,
  supplier_name      text,
  cost_center_id     text,
  status             text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_by_id    text,
  requested_by_name  text,
  approved_by_id     text,
  approved_by_name   text,
  decision_date      timestamptz,
  decision_note      text,
  requires_reason    boolean default false,
  created_date       timestamptz not null default now(),
  updated_date       timestamptz not null default now()
);
create index if not exists idx_approvals_owner on approvals(owner_id);
create index if not exists idx_approvals_status on approvals(status);

create table if not exists audit_logs (
  id            uuid primary key default gen_random_uuid(),
  action        text not null,
  actor_id      text not null,
  actor_name    text not null,
  actor_role    text,
  target_entity text,
  target_id     text,
  reason        text,
  details       text,
  ip_address    text,
  module        text not null check (module in ('admin','partner','corporate','app')),
  created_date  timestamptz not null default now(),
  updated_date  timestamptz not null default now()
);
create index if not exists idx_audit_logs_actor on audit_logs(actor_id);
create index if not exists idx_audit_logs_module on audit_logs(module);

create table if not exists suppliers (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid references users(id) on delete cascade,
  name                text not null,
  nif                 text not null,
  iban                text,
  category            text,
  payment_terms_days  integer default 30,
  withholding_rate    numeric(5,2) default 6.5,
  applies_withholding boolean default true,
  contact_name        text,
  contact_phone       text,
  contact_email       text,
  is_active           boolean default true,
  created_date        timestamptz not null default now(),
  updated_date        timestamptz not null default now()
);
create index if not exists idx_suppliers_owner on suppliers(owner_id);

create table if not exists cost_centers (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid references users(id) on delete cascade,
  code             text not null,
  name             text not null,
  budget_monthly   numeric(18,2),
  budget_yearly    numeric(18,2),
  responsible_name text,
  is_active        boolean default true,
  created_date     timestamptz not null default now(),
  updated_date     timestamptz not null default now()
);
create index if not exists idx_cost_centers_owner on cost_centers(owner_id);

create table if not exists data_requests (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references users(id) on delete cascade,
  user_name      text not null,
  user_email     text,
  request_type   text not null check (request_type in ('export','delete','rectification')),
  description    text,
  requested_date date,
  deadline_date  date,
  status         text not null default 'pending' check (status in ('pending','completed')),
  completed_date date,
  handled_by     text,
  created_date   timestamptz not null default now(),
  updated_date   timestamptz not null default now()
);
create index if not exists idx_data_requests_owner on data_requests(owner_id);

create table if not exists password_resets (
  token   text primary key,
  user_id uuid references users(id) on delete cascade,
  expires timestamptz not null
);

create or replace function set_updated_date()
returns trigger language plpgsql as $$
begin
  new.updated_date = now();
  return new;
end; $$;

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'users','categories','accounts','invoices','transactions','budgets',
      'dependents','subscriptions','partner_consents','approvals','audit_logs',
      'suppliers','cost_centers','data_requests'
    ])
  loop
    execute format('drop trigger if exists trg_set_updated_date on %I; create trigger trg_set_updated_date before update on %I for each row execute function set_updated_date();', t, t);
  end loop;
end $$;