# Plano de Migração — Gestão+ independente do Base44

**Destino:** Supabase Cloud (base de dados, login, ficheiros, funções) + frontend estático no Cloudflare Pages.

## 0. Decisões finais (fechadas)

| Tema | Decisão |
|---|---|
| Login | Email/palavra-passe + **Google via Supabase Auth** (OAuth Google configurado no Supabase). |
| Email transacional | **Hostinger SMTP** configurado no Supabase Auth: `smtp.hostinger.com`, porta **465** (SSL), caixa dedicada `nao-responder@<domínio>`. **SPF, DKIM e DMARC** configurados no DNS do domínio. |
| Emails de redefinição no corte | Enviados **por lotes**, respeitando o limite diário da caixa Hostinger (ver Fase 6). |
| IA (OCR + assistente) | **Google Gemini Flash**, chamado **apenas** a partir de Supabase Edge Functions; a chave nunca vai para o frontend. |
| Hosting do frontend | **Cloudflare Pages** (substitui o hosting partilhado). |

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
| IA/OCR | `InvokeLLM`, `ExtractDataFromUploadedFile` | Edge Functions a chamar **Google Gemini Flash** com `GEMINI_API_KEY` em Supabase Secrets | Médio |
| Funções (10) | `base44/functions/*` (Deno) | Supabase Edge Functions (também Deno, migração quase direta) | Médio |
| Tarefas agendadas | Workflow `PollProxypayPayments` (5 min) | `pg_cron` + `pg_net` a chamar a Edge Function | Baixo |
| Webhooks | `proxypayWebhook`, `whatsappWebhook`, `partnerApi` | Edge Functions com URL pública `…supabase.co/functions/v1/<nome>` | Baixo |
| Email | `SendEmail`, templates `base44/emails` | Emails de Auth (confirmação, redefinição, convite) via **SMTP Hostinger no Supabase Auth** com templates em português; emails de aplicação, se necessários, por Edge Function com o mesmo SMTP | Médio |
| Segredos | Secrets Base44 | Supabase Secrets (`supabase secrets set`) | Baixo |
| Publicação | `gestao-mais-angola.base44.app` | `vite build` → deploy no **Cloudflare Pages** | Baixo |
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

- Criar credenciais OAuth no Google Cloud Console (tipo Web) com o redirect `https://<projeto>.supabase.co/auth/v1/callback`; ativar o provider Google no Supabase Auth.
- Criar a caixa dedicada `nao-responder@<domínio>` na Hostinger e anotar o limite diário de envio do plano.
- Obter a chave da API Google Gemini (Google AI Studio) e guardá-la como `GEMINI_API_KEY` nos Supabase Secrets.
- Criar conta Cloudflare e projeto Pages (ligado ao repositório ou por upload direto).

**Conclusão:** projeto `dev` criado, backup nº 1 guardado e verificado (contagens por entidade); Google OAuth, caixa SMTP e chave Gemini obtidos.

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

- Google: `signInWithOAuth({ provider: 'google' })` com redirect para `/app`. Utilizadores que já entravam com Google são associados pelo mesmo email (o Supabase liga identidades com email verificado igual).
- Email de Auth: configurar em Supabase → Auth → SMTP: host `smtp.hostinger.com`, porta `465`, utilizador/palavra-passe da caixa `nao-responder@<domínio>`, remetente "Gestão+". Ajustar os templates (confirmação, redefinição, convite) para português de Angola, com a identidade visual da app.

**Risco crítico — palavras-passe:** os hashes do Base44 não são exportáveis. **Todos os utilizadores com palavra-passe terão de definir uma nova.** Plano: importar utilizadores (email, nome, perfil) com a API Admin do Supabase; no primeiro acesso mostrar "Definir nova palavra-passe" e enviar emails de redefinição **por lotes** no corte (ver Fase 6). Contas Google reautenticam sem fricção.

**Conclusão:** app corre localmente contra o projeto `dev` sem nenhuma importação de Base44 (`grep -r base44 src` vazio); CRUD, sessão, reset e upload verificados.

### Fase 3 — Funções, automações e integrações (5–7 dias)
**Supabase Edge Functions** (cada uma em `supabase/functions/<nome>/index.ts`):

| Função | Notas de migração | Idempotência |
|---|---|---|
| `ocrExtractInvoice` | Chamar **Gemini Flash** (entrada multimodal com a imagem/PDF e saída JSON estruturada); `GEMINI_API_KEY` em Secrets; validar JWT do utilizador e limitar tamanho/frequência por utilizador | Sem efeitos externos |
| `assistantChat` | Idem com Gemini Flash; contexto financeiro lido com o JWT do utilizador (respeita RLS); manter regra "voz → resposta falada" no frontend | — |
| `createSubscription` + `shared/proxypay` | Mover `PROXYPAY_API_KEY`; criar referência MCX | Chave única por utilizador+plano ativo |
| `proxypayWebhook` | URL nova a registar no Proxypay; validar origem/segredo | Ignorar `proxypay_payment_id` já processado |
| `pollProxypayPayments` | `pg_cron` de 5 em 5 min → `pg_net.http_post` | Mesma regra do webhook; reconhecer (acknowledge) só após gravar |
| `whatsappWebhook` + `shared/zapi` | Secrets `ZAPI_*`; reconfigurar webhook no Z-API | Guardar id de mensagem processada |
| `partnerApi` | Autenticação por chave (hash SHA-256), isolamento por `partner_owner_id` | `Idempotency-Key` na emissão |
| `agtFeed`, `detectDivergences` | Migração direta; mantém funcionamento sem feed AGT | — |

- Remover `supabaseSchema` (deixa de fazer sentido).
- **Regra de IA:** o frontend nunca chama o Gemini nem conhece a chave; só invoca `ocrExtractInvoice` e `assistantChat` (Edge Functions autenticadas). Registar consumo por utilizador para controlar custo.
- **Email:** os emails de Auth saem pelo SMTP Hostinger configurado no Supabase (Fase 2). Os templates de `base44/emails` (Welcome, Newsletter, Promotion) só são migrados se forem mesmo usados; marketing em massa **não** deve sair pela caixa `nao-responder` (limite diário e risco de reputação).
- **DNS de email (SPF, DKIM, DMARC)** no domínio:
  - SPF: registo TXT `v=spf1 include:_spf.mail.hostinger.com ~all` (confirmar o valor exato no painel Hostinger).
  - DKIM: registos CNAME/TXT fornecidos pela Hostinger para o domínio.
  - DMARC: TXT em `_dmarc` começando com `p=none` e relatórios (`rua=`), subindo para `quarantine` e depois `reject` após 2 semanas sem falhas.
  - Validar com envio de teste a Gmail e Outlook (cabeçalhos SPF/DKIM/DMARC = pass) antes do corte.
- Corrigir pendências já conhecidas durante a migração: rate limiting nos endpoints públicos, `MCX_WEBHOOK_SECRET`, cabeçalhos de segurança e ficheiros sempre privados (resolve os uploads públicos).
- **Janela de cuidado:** nunca ter dois pollers/webhooks do Proxypay ativos ao mesmo tempo contra a mesma base. O Base44 só é desligado do Proxypay no momento do corte.

**Conclusão:** cada função testada com payload real de sandbox; pagamento de teste MCX confirma fatura e subscrição uma única vez; cron corre e regista.

### Fase 4 — Build estático e Cloudflare Pages (2–3 dias)
**Aplicação**
- `vite build` com variáveis públicas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (a anon key é pública por desenho; a segurança está na RLS). Nunca incluir `service_role`.
- Manter PWA (`manifest.json`, `sw.js`): atualizar `start_url`/escopo para o novo domínio; incrementar versão do service worker para forçar atualização.

**Cloudflare Pages**
- Build: comando `npm run build`, pasta de saída `dist`. Variáveis de ambiente de produção e de pré-visualização: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (apenas públicas).
- Fallback SPA: ficheiro `public/_redirects` com `/* /index.html 200`.
- Cabeçalhos: ficheiro `public/_headers` com `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (câmara permitida para o scanner) e `Content-Security-Policy` limitada ao domínio Supabase; `Cache-Control: no-cache` para `/index.html`, `/sw.js` e `/manifest.json`; cache longa e `immutable` para `/assets/*`.
- Domínio: adicionar o domínio personalizado no Pages; se o DNS já está na Cloudflare a ligação é automática, senão criar CNAME (TTL 300 s, 48 h antes do corte). HTTPS é automático.
- Pré-visualizações por ramo servem de staging (`staging` → URL de preview).
- Supabase Auth: configurar `Site URL` e `Redirect URLs` com o domínio final e o de staging; autorizar também os mesmos URLs no cliente OAuth do Google.
- Apps móveis (IPA/AAB): se o shell aponta para o URL Base44, regenerar com o novo URL.

**Conclusão:** staging no Cloudflare Pages com refresh em rotas profundas, instalação PWA, modo offline e login Google a funcionar.

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
5. Publicar DNS para o Cloudflare Pages.
6. Verificação rápida: login (email e Google), pagamento de teste, OCR, webhook.
7. **Emails de redefinição por lotes** (ver abaixo).

**Envio por lotes dos emails de redefinição**
- Antes do corte: ler na Hostinger o limite diário da caixa e fixar o tamanho do lote em ~70 % desse limite (margem para os emails normais de Auth: confirmações e recuperações).
- Script de administração (service role) que, por execução, dispara `resetPasswordForEmail` para N utilizadores ainda sem palavra-passe nova, marca `reset_sent_at` em `profiles` e pára. Corre uma vez por dia (ou em `pg_cron` diário) até esgotar a lista.
- Ordem de prioridade: admins e parceiros → empresas → utilizadores com atividade recente → restantes.
- Utilizadores só com Google não recebem email. Quem tentar entrar antes de receber o seu lote usa "Esqueci a palavra-passe" (o pedido individual sai de imediato).
- Monitorizar devoluções (bounces) e queixas; pausar o envio se a taxa de rejeição subir. Se o limite da caixa for demasiado baixo para o volume, mudar o SMTP do Supabase para um serviço transacional (decisão a tomar na Fase 0, sem alterar mais nada no plano).
- Comunicar antes: aviso na app e WhatsApp a dizer que o email pode demorar até X dias e que se pode pedir já o link manualmente.

**Corte gradual:** primeiro um grupo piloto (equipa + parceiros-chave, 1–2 dias) em staging com dados reais; depois todos os utilizadores. Mensagem clara de suporte para quem não consegue entrar.

**Observabilidade:** logs das Edge Functions, alertas de erros 5xx e de falhas de cron/webhook, painel de contagem de pagamentos pendentes vs confirmados, monitor de disponibilidade externo (UptimeRobot) para o domínio e para um endpoint de saúde.

**Estabilização:** 14 dias com Base44 mantido em leitura. Só depois: apagar segredos Base44, desativar a app, arquivar o último export e remover `base44/` do repositório.

---

## 3. Critérios de corte (todos obrigatórios)
- Reconciliação com zero diferenças na importação final.
- Isolamento RLS provado (testes verdes).
- Pagamento MCX de ponta a ponta sem duplicados.
- Login, recuperação de palavra-passe e Google a funcionar no domínio final.
- SPF, DKIM e DMARC válidos (pass) em Gmail e Outlook; email de redefinição chega à caixa de entrada.
- Gemini acessível só por Edge Functions (nenhuma chave no build do frontend).
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
| Limite diário de envio da caixa Hostinger | Envio por lotes (Fase 6); reservar margem para emails normais de Auth; plano B: SMTP transacional dedicado. |
| Emails a cair em spam | SPF, DKIM, DMARC progressivo, remetente fixo, testes em Gmail/Outlook antes do corte. |
| Qualidade do OCR com Gemini Flash em faturas angolanas | Testar com amostras reais na Fase 3; utilizador confirma sempre os campos antes de guardar; fallback para modelo Gemini superior só se a taxa de erro for alta. |
| Custo/abuso da API Gemini | Chamadas só em Edge Functions autenticadas, limite por utilizador, registo de consumo, alerta de orçamento no Google Cloud. |
| Cabeçalhos/CSP a bloquear algo (câmara, Google login) | Testar CSP e `Permissions-Policy` em staging antes do corte. |
| Custo Supabase (Edge, Storage, Auth) | Estimar na Fase 0; começar no plano gratuito/Pro conforme volume. |

## 6. Pontos de decisão
Fechados: Google login (mantido), email (Hostinger SMTP), IA (Gemini Flash só em Edge Functions), hosting (Cloudflare Pages).
Ainda em aberto:
1. Data e janela do corte.
2. Limite diário real da caixa Hostinger (define o tamanho do lote e o prazo total dos emails de redefinição).
3. Se os templates Welcome/Newsletter/Promotion são mesmo usados (se não, não se migram).

## 7. Cronograma estimado
Fases 0–6 em cerca de 4–6 semanas, com uma pessoa a tempo inteiro. Ações manuais do proprietário: criar projeto Supabase, credenciais Google OAuth, caixa Hostinger e DNS (SPF/DKIM/DMARC), chave Gemini, conta Cloudflare Pages, e registar webhooks nos provedores.