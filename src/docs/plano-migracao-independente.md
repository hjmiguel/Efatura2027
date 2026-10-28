# Plano de Migração — Gestão+ independente do Base44

**Destino:** Supabase Cloud (base de dados, login, ficheiros, funções) + frontend estático no hosting partilhado.
**Substitui:** `plano-migracao-supabase.md` (assumia um backend Node próprio, já descartado).
**Princípio:** a interface e os fluxos não mudam. Cada fase tem entregável, critério de conclusão e reversão.

---

## 1. Inventário de dependências Base44 e equivalência

| Área | Hoje (Base44) | Destino | Esforço |
|---|---|---|---|
| Dados | 17 entidades (`base44/entities/*.jsonc`) via `base44.entities.X` | Tabelas Postgres no Supabase (`supabase/migrations`) | Alto |
| Permissões | RLS Base44 (`created_by_id`, `data.user_nif`, `data.company_id`, `data.partner_owner_id`, role admin) | Políticas RLS Postgres (`auth.uid()`) + tabela `profiles` | Alto |
| Login | `base44.auth` (email/senha, Google, OTP, reset) | Supabase Auth | Médio |
| Ficheiros | `UploadPrivateFile` / `UploadPublicFile` | Supabase Storage (bucket privado + URLs assinadas) | Médio |
| IA/OCR | `InvokeLLM`, `ExtractDataFromUploadedFile` | Edge Function a chamar fornecedor de IA com chave própria | Médio |
| Funções (10) | `base44/functions/*` (Deno) | Supabase Edge Functions (também Deno, migração quase direta) | Médio |
| Tarefas agendadas | Workflow `PollProxypayPayments` (5 min) | `pg_cron` + `pg_net` a chamar a Edge Function | Baixo |
| Webhooks | `proxypayWebhook`, `whatsappWebhook`, `partnerApi` | Edge Functions com URL pública `…supabase.co/functions/v1/<nome>` | Baixo |
| Email | `SendEmail`, templates `base44/emails` | Resend (ou SMTP do hosting) a partir de Edge Function; Auth usa SMTP do Supabase | Médio |
| Segredos | Secrets Base44 | Supabase Secrets (`supabase secrets set`) | Baixo |
| Publicação | `gestao-mais-angola.base44.app` | `vite build` → pasta `dist` no hosting partilhado | Baixo |
| Imagens | componente `Image` com CDN Base44 | `<img>` normal + ficheiros em `public/` ou Storage | Baixo |

**Ficheiros do frontend que tocam no SDK** (a migrar): `src/api/appClient.ts`, `src/api/base44Client.js`, `src/lib/AuthContext.jsx`, `src/lib/app-params.js`, `Login`, `Register`, `OAuthConsent`, layouts Admin/Corporate/App, `RightRail`, `NotificationsBell`, abas de acesso do Admin, `ProfileSecurity`, `ui/image.jsx`. Todas as páginas usam `appApi.entities.*` / `appApi.auth.*`, por isso o ponto de corte é um só (ver Fase 2).

---

## 2. Fases

### Fase 0 — Preparação (1–2 dias)
**Trabalho de configuração Supabase**
- Criar projeto Supabase Cloud (região mais próxima, ex. Europa). Guardar `SUPABASE_URL`, `anon key` (pública) e `service_role key` (nunca no frontend).
- Ativar backups diários; definir ambientes: `dev` (projeto separado) e `prod`.

**Trabalho de aplicação**
- Congelar o inventário acima como checklist no repositório.
- Exportar todos os dados Base44 (por entidade, JSON) como cópia de segurança nº 1, guardada fora do Base44.

**Decisão:** confirmar que Google login continua necessário (exige configurar OAuth no Supabase).
**Conclusão:** projeto `dev` criado, backup nº 1 guardado e verificado (contagens por entidade).

### Fase 1 — Esquema, RLS e Storage (3–5 dias)
**Supabase**
- Migrações SQL versionadas (`supabase/migrations/NNN_*.sql`), uma por tema. Partir de `20260730000001_init.sql`, corrigindo para as 17 entidades atuais, incluindo `Invoice` (agt_status, partner_emitted, partner_owner_id), `PartnerApiKey`, `PartnerFee`, `PartnerConsent`, `Company`, `CostCenter`, `Approval`, `Supplier`, `UtilityCompany`, `AuditLog`.
- Colunas comuns: `id uuid`, `created_date`, `updated_date`, `created_by_id uuid → auth.users`. Mapear `id` antigo Base44 numa coluna `legacy_id text unique` para reconciliar e para remapear relações (`account_id`, `invoice_id`, `category_id`…).
- Tabela `profiles` (1:1 com `auth.users`): `full_name`, `role` (admin/user), `app_role` (partner/corporate/…), `nif`, `company_id`, `partner_nif`. Estes campos **só** alteráveis por admin ou service role (trigger que bloqueia escrita pelo próprio utilizador), porque as políticas confiam neles.
- RLS por tabela, traduzindo as regras atuais:
  - dados pessoais (Account, Transaction, Budget, Dependent, DataRequest): `created_by_id = auth.uid()` ou admin;
  - `Invoice`: dono, `user_nif = profiles.nif`, `partner_owner_id = auth.uid()` ou admin;
  - `PartnerConsent`, `PartnerApiKey`, `PartnerFee`: por `partner_nif` / `owner_user_id` / `user_nif`;
  - `Company`-scoped (CostCenter, Approval, Supplier): `company_id = profiles.company_id` ou admin;
  - `Category`, `UtilityCompany`: leitura aberta, escrita admin;
  - `AuditLog`: só inserção por funções; leitura admin.
- Storage: bucket privado `invoices` (path `{user_id}/…`) com política por pasta. Ficheiros nunca públicos; acesso por URL assinada.
- Testes de isolamento em SQL/pgTAP: utilizador A não lê, edita nem apaga dados de B; parceiro A não vê parceiro B; empresa A não vê empresa B.

**Conclusão:** `supabase db reset` aplica tudo do zero; todos os testes de isolamento passam.

### Fase 2 — Camada de dados e login independentes (5–8 dias)
**Aplicação**
- Instalar `@supabase/supabase-js`. Criar `src/api/supabaseClient.js`.
- Reescrever `src/api/appClient.ts` para expor **a mesma interface** que as páginas já usam: `entities.X.{list, filter, get, create, update, delete, bulkCreate, subscribe}`, `auth.{me, updateMe, logout, isAuthenticated, redirectToLogin}`, `integrations.Core.*`, `functions.invoke`. Com isto as ~50 páginas não mudam.
  - Tradutor de filtros (`$in`, `$ne`, `$gt/$gte/$lt/$lte`, `$or`, sort `-campo`, `limit`) para a API PostgREST; `subscribe` → Supabase Realtime.
  - `me()` junta `auth.users` + `profiles`.
- Auth: substituir `Login`, `Register`, `ForgotPassword`, `ResetPassword` por chamadas `signInWithPassword`, `signUp` (+ OTP/confirmação por email), `resetPasswordForEmail`, `updateUser`, `signInWithOAuth('google')`. Manter o fluxo de `returnTo` e o redirecionamento direto para `/app`.
- `ProtectedRoute`, `AuthContext`, layouts: trocar por sessão Supabase (`onAuthStateChange`).
- Uploads: `UploadPrivateFile` → `storage.from('invoices').upload`, guardar caminho; ler com URL assinada.
- Remover `@base44/sdk`, `@base44/vite-plugin` e `app-params.js` no fim da fase; substituir `ui/image.jsx` por `<img>`.

**Risco crítico — palavras-passe:** os hashes do Base44 não são exportáveis. **Todos os utilizadores terão de definir nova palavra-passe.** Plano: importar utilizadores (email, nome, perfil) com a API Admin do Supabase; no primeiro acesso mostrar "Definir nova palavra-passe" e enviar email de recuperação em massa no dia do corte. Contas Google reautenticam sem fricção.

**Conclusão:** app corre localmente contra o projeto `dev` sem nenhuma importação de Base44 (`grep -r base44 src` vazio); CRUD, sessão, reset e upload verificados.

### Fase 3 — Funções, automações e integrações (5–7 dias)
**Supabase Edge Functions** (cada uma em `supabase/functions/<nome>/index.ts`):

| Função | Notas de migração | Idempotência |
|---|---|---|
| `ocrExtractInvoice` | Chamar API de IA diretamente; chave em Secrets | Sem efeitos externos |
| `assistantChat` | Idem; manter regra "voz → resposta falada" no frontend | — |
| `createSubscription` + `shared/proxypay` | Mover `PROXYPAY_API_KEY`; criar referência MCX | Chave única por utilizador+plano ativo |
| `proxypayWebhook` | URL nova a registar no Proxypay; validar origem/segredo | Ignorar `proxypay_payment_id` já processado |
| `pollProxypayPayments` | `pg_cron` de 5 em 5 min → `pg_net.http_post` | Mesma regra do webhook; reconhecer (acknowledge) só após gravar |
| `whatsappWebhook` + `shared/zapi` | Secrets `ZAPI_*`; reconfigurar webhook no Z-API | Guardar id de mensagem processada |
| `partnerApi` | Autenticação por chave (hash SHA-256), isolamento por `partner_owner_id` | `Idempotency-Key` na emissão |
| `agtFeed`, `detectDivergences` | Migração direta; mantém funcionamento sem feed AGT | — |

- Remover `supabaseSchema` (deixa de fazer sentido).
- Email: Edge Function `sendEmail` (Resend) com os templates de `base44/emails` convertidos para HTML; Auth do Supabase com SMTP próprio e templates em português.
- Corrigir pendências já conhecidas durante a migração: rate limiting nos endpoints públicos, `MCX_WEBHOOK_SECRET`, cabeçalhos de segurança e ficheiros sempre privados (resolve os uploads públicos).
- **Janela de cuidado:** nunca ter dois pollers/webhooks do Proxypay ativos ao mesmo tempo contra a mesma base. O Base44 só é desligado do Proxypay no momento do corte.

**Conclusão:** cada função testada com payload real de sandbox; pagamento de teste MCX confirma fatura e subscrição uma única vez; cron corre e regista.

### Fase 4 — Build estático e hosting partilhado (2–3 dias)
**Aplicação**
- `vite build` com variáveis públicas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (a anon key é pública por desenho; a segurança está na RLS). Nunca incluir `service_role`.
- Manter PWA (`manifest.json`, `sw.js`): atualizar `start_url`/escopo para o novo domínio; incrementar versão do service worker para forçar atualização.

**Hosting partilhado (cPanel/Apache)**
- Enviar `dist/` para `public_html`.
- `.htaccess` com fallback SPA (`RewriteRule ^ index.html`), HTTPS forçado, cache longa para `/assets/*` (hash no nome) e **sem cache** para `index.html` e `sw.js`.
- Cabeçalhos: `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy` limitada ao domínio Supabase.
- Domínio: apontar DNS (TTL baixo, 300 s, 48 h antes do corte); certificado SSL (AutoSSL/Let's Encrypt).
- Supabase Auth: configurar `Site URL` e `Redirect URLs` com o novo domínio.
- Apps móveis (IPA/AAB): se o shell aponta para o URL Base44, regenerar com o novo URL.

**Conclusão:** staging no hosting (ex. `staging.<domínio>`) com refresh em rotas profundas, instalação PWA e modo offline a funcionar.

### Fase 5 — Migração de dados e ensaio geral (3–4 dias)
1. **Script de importação** (Node, service role, corre localmente): lê o export JSON, cria utilizadores Auth, preenche `profiles`, insere entidades por ordem de dependência (Category/UtilityCompany → Account → Invoice → Transaction → restantes), remapeando ids através de `legacy_id`; ficheiros copiados para o Storage.
2. **Reconciliação automática:** contagem por tabela, soma de saldos de `Account`, soma de `amount` em `Invoice` e `Transaction`, nº de faturas por estado. Diferença tolerada: zero.
3. **Ensaio completo** em `dev` com cópia real: repetir 2 vezes e cronometrar.
4. **Teste de aceitação manual** por perfil (utilizador, parceiro, empresa, admin): registar, digitalizar fatura, pagar via MCX/IBAN/RUPE (com talão), orçamento, fiscal/IRPS, exportação de dados (Lei 22/11), pedidos de eliminação, assistente por voz.
5. Testes automatizados: reaproveitar `src/lib/tests/*` (aritmética, duplicados, NIF/dedutíveis, independência) e acrescentar testes de isolamento RLS.

**Conclusão:** reconciliação a zero diferenças em duas execuções seguidas; checklist de aceitação 100 % verde.

### Fase 6 — Corte, observabilidade e desligar o Base44 (1 semana)
**Sequência do dia do corte** (madrugada, tráfego baixo):
1. Aviso na app 48 h antes (manutenção e nova palavra-passe).
2. Colocar Base44 em modo só leitura (ou aviso de manutenção) e fazer **exportação final**.
3. Correr a importação final (sincronização incremental por `updated_date` desde a cópia inicial) e a reconciliação.
4. Trocar webhooks Proxypay e Z-API para as novas Edge Functions; ativar o `pg_cron`.
5. Publicar DNS para o hosting; enviar emails de "definir palavra-passe".
6. Verificação rápida: login, pagamento de teste, OCR, webhook.

**Corte gradual:** primeiro um grupo piloto (equipa + parceiros-chave, 1–2 dias) em staging com dados reais; depois todos os utilizadores. Mensagem clara de suporte para quem não consegue entrar.

**Observabilidade:** logs das Edge Functions, alertas de erros 5xx e de falhas de cron/webhook, painel de contagem de pagamentos pendentes vs confirmados, monitor de disponibilidade externo (UptimeRobot) para o domínio e para um endpoint de saúde.

**Estabilização:** 14 dias com Base44 mantido em leitura. Só depois: apagar segredos Base44, desativar a app, arquivar o último export e remover `base44/` do repositório.

---

## 3. Critérios de corte (todos obrigatórios)
- Reconciliação com zero diferenças na importação final.
- Isolamento RLS provado (testes verdes).
- Pagamento MCX de ponta a ponta sem duplicados.
- Login, recuperação de palavra-passe e Google a funcionar no domínio final.
- PWA instalável e funcional offline; rotas profundas abrem por link direto.
- Backup restaurável testado.

## 4. Reversão
| Momento | Como reverter |
|---|---|
| Fases 0–4 | Nada em produção mudou; Base44 continua a servir. |
| Corte (até 14 dias) | Repor DNS para Base44 (TTL baixo), repor webhooks Proxypay/Z-API para as URLs Base44. Dados criados no Supabase durante a janela exportados e reimportados manualmente (script inverso previsto). |
| Após 14 dias | Reversão deixa de ser prevista; fica o export final + backups Supabase. |

## 5. Riscos principais
| Risco | Mitigação |
|---|---|
| Palavras-passe não migráveis | Reset em massa + aviso prévio; Google sem impacto. |
| RLS demasiado aberta/fechada | Testes de isolamento antes de qualquer tráfego. |
| Duplicação de pagamentos | Idempotência por `proxypay_payment_id`; um único consumidor ativo. |
| Mudança de URL de webhooks | Lista de verificação com registo de cada provedor (Proxypay, Z-API). |
| Hosting partilhado sem controlo de cabeçalhos | `.htaccess`; se não permitido, mover só o estático para Cloudflare Pages/Netlify (decisão na Fase 4). |
| Perda de funcionalidades `InvokeLLM` | Ligar diretamente a um fornecedor de IA; testar OCR com amostras reais de faturas angolanas. |
| Custo Supabase (Edge, Storage, Auth) | Estimar na Fase 0; começar no plano gratuito/Pro conforme volume. |

## 6. Pontos de decisão
1. Fornecedor de IA para OCR/assistente (chave própria).
2. Fornecedor de email transacional (Resend ou SMTP do hosting).
3. Manter Google login (sim/não).
4. Hosting partilhado suporta `.htaccess` e cabeçalhos? Caso contrário, CDN estático.
5. Data e janela do corte.

## 7. Cronograma estimado
Fases 0–6 em cerca de 4–6 semanas, com uma pessoa a tempo inteiro. Ações manuais do proprietário: criar projeto Supabase, fornecer chaves, configurar DNS/hosting e registar webhooks nos provedores.