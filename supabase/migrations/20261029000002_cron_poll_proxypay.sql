-- Agenda pollProxypayPayments de 5 em 5 minutos, com a chave de serviço lida do Vault.
-- Executar no SQL Editor do Supabase.

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists supabase_vault;

-- 1) Guardar a chave de serviço no Vault (substitui <SERVICE_ROLE_KEY> pela chave em
--    Project Settings -> API). Corre este passo UMA vez; não deixes a chave no histórico do editor.
select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key', 'Chave de serviço para pg_cron');

-- 2) Remover agendamento anterior (se existir) e criar o novo.
select cron.unschedule('poll-proxypay') where exists (select 1 from cron.job where jobname = 'poll-proxypay');

select cron.schedule(
  'poll-proxypay',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://wxsmijwygdbzcwhkxiyr.supabase.co/functions/v1/pollProxypayPayments',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

-- Verificação: últimas execuções
-- select * from cron.job_run_details order by start_time desc limit 10;