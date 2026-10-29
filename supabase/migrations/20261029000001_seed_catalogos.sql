-- ============================================================================
-- Gestão+ — Dados iniciais: categorias e empresas (UtilityCompany).
-- Executar no SQL Editor do Supabase DEPOIS de promover o teu utilizador a admin.
-- É seguro correr mais de uma vez (não duplica registos com o mesmo nome).
-- Os registos ficam atribuídos ao primeiro administrador.
-- Os NIFs das empresas ficam vazios: preenche-os com os valores oficiais
--   (update public.records set data = jsonb_set(data, '{nif}', '"5417012345"') where entity = 'UtilityCompany' and data->>'name' = 'ENDE';)
-- ============================================================================

do $$
declare
  admin_id uuid;
begin
  select p.id into admin_id from public.profiles p where p.role = 'admin' order by p.created_date limit 1;
  if admin_id is null then
    raise exception 'Não existe nenhum administrador. Promove o teu utilizador primeiro: update public.profiles set role = ''admin'' where email = ''o-teu-email'';';
  end if;

  -- Categorias
  insert into public.records (entity, owner_id, data)
  select 'Category', admin_id, c.data
  from (values
    -- Despesas
    ('Alimentação',        '{"name":"Alimentação","type":"expense","icon":"ShoppingCart","color":"#E8A33D","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Restaurantes',       '{"name":"Restaurantes","type":"expense","icon":"Utensils","color":"#D9643A","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Habitação',          '{"name":"Habitação","type":"expense","icon":"Home","color":"#0E5D4B","is_deductible":true,"deductible_type":"habitacao"}'::jsonb),
    ('Energia',            '{"name":"Energia","type":"expense","icon":"Zap","color":"#F2C14E","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Água',               '{"name":"Água","type":"expense","icon":"Droplet","color":"#3B8EA5","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Telecomunicações',   '{"name":"Telecomunicações","type":"expense","icon":"Smartphone","color":"#6C5CE7","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Televisão e Internet','{"name":"Televisão e Internet","type":"expense","icon":"Tv","color":"#8E6BBF","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Transportes',        '{"name":"Transportes","type":"expense","icon":"Bus","color":"#4A7C59","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Combustível',        '{"name":"Combustível","type":"expense","icon":"Fuel","color":"#B5483A","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Automóvel',          '{"name":"Automóvel","type":"expense","icon":"Car","color":"#5C6B73","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Saúde',              '{"name":"Saúde","type":"expense","icon":"HeartPulse","color":"#D64550","is_deductible":true,"deductible_type":"saude"}'::jsonb),
    ('Farmácia',           '{"name":"Farmácia","type":"expense","icon":"Pill","color":"#E0707A","is_deductible":true,"deductible_type":"saude"}'::jsonb),
    ('Educação',           '{"name":"Educação","type":"expense","icon":"GraduationCap","color":"#2F6DB5","is_deductible":true,"deductible_type":"educacao"}'::jsonb),
    ('Pensão de alimentos','{"name":"Pensão de alimentos","type":"expense","icon":"Users","color":"#A0522D","is_deductible":true,"deductible_type":"pensao_alimentos"}'::jsonb),
    ('Previdência',        '{"name":"Previdência","type":"expense","icon":"Landmark","color":"#3F5E8C","is_deductible":true,"deductible_type":"previdencia"}'::jsonb),
    ('Compras',            '{"name":"Compras","type":"expense","icon":"ShoppingBag","color":"#C2578F","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Vestuário',          '{"name":"Vestuário","type":"expense","icon":"Shirt","color":"#B07AA1","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Lazer',              '{"name":"Lazer","type":"expense","icon":"Film","color":"#E17F4E","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Viagens',            '{"name":"Viagens","type":"expense","icon":"Plane","color":"#2C9CB3","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Família e filhos',   '{"name":"Família e filhos","type":"expense","icon":"Baby","color":"#E8A0BF","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Animais',            '{"name":"Animais","type":"expense","icon":"PawPrint","color":"#8C6E4A","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Serviços e reparações','{"name":"Serviços e reparações","type":"expense","icon":"Wrench","color":"#6B7A8F","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Impostos e taxas',   '{"name":"Impostos e taxas","type":"expense","icon":"Receipt","color":"#7A5C3E","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Presentes e doações','{"name":"Presentes e doações","type":"expense","icon":"Gift","color":"#D4789C","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Outras despesas',    '{"name":"Outras despesas","type":"expense","icon":"CreditCard","color":"#7F8C8D","is_deductible":false,"deductible_type":"none"}'::jsonb),
    -- Receitas
    ('Salário',            '{"name":"Salário","type":"income","icon":"Briefcase","color":"#0E5D4B","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Trabalho independente','{"name":"Trabalho independente","type":"income","icon":"HandCoins","color":"#2E8B6E","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Negócio',            '{"name":"Negócio","type":"income","icon":"TrendingUp","color":"#3C9D6A","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Rendas',             '{"name":"Rendas","type":"income","icon":"Building2","color":"#5BAA8A","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Investimentos',      '{"name":"Investimentos","type":"income","icon":"PiggyBank","color":"#C9A227","is_deductible":false,"deductible_type":"none"}'::jsonb),
    ('Outras receitas',    '{"name":"Outras receitas","type":"income","icon":"Banknote","color":"#6FAE8F","is_deductible":false,"deductible_type":"none"}'::jsonb)
  ) as c(name, data)
  where not exists (
    select 1 from public.records r
    where r.entity = 'Category' and r.data->>'name' = c.name
  );

  -- Empresas que podem ser ligadas para enviar faturas
  insert into public.records (entity, owner_id, data)
  select 'UtilityCompany', admin_id, u.data
  from (values
    ('ENDE',          '{"name":"ENDE","nif":"","icon":"Zap","is_active":true}'::jsonb),
    ('EPAL',          '{"name":"EPAL","nif":"","icon":"Droplet","is_active":true}'::jsonb),
    ('Unitel',        '{"name":"Unitel","nif":"","icon":"Smartphone","is_active":true}'::jsonb),
    ('Africell',      '{"name":"Africell","nif":"","icon":"Smartphone","is_active":true}'::jsonb),
    ('Movicel',       '{"name":"Movicel","nif":"","icon":"Smartphone","is_active":true}'::jsonb),
    ('ZAP',           '{"name":"ZAP","nif":"","icon":"Tv","is_active":true}'::jsonb),
    ('DStv (Multichoice)','{"name":"DStv (Multichoice)","nif":"","icon":"Tv","is_active":true}'::jsonb),
    ('Angola Telecom','{"name":"Angola Telecom","nif":"","icon":"Building2","is_active":true}'::jsonb)
  ) as u(name, data)
  where not exists (
    select 1 from public.records r
    where r.entity = 'UtilityCompany' and r.data->>'name' = u.name
  );
end $$;

-- Verificação
select entity, count(*) as total from public.records where entity in ('Category','UtilityCompany') group by entity;