# Plano de Migração — Persistência JSON → Supabase (PostgreSQL)

**Estado:** Esquema SQL pronto · Aguarda criação do projeto Supabase
**Última atualização:** 2026-07-30

---

## 1. Objetivo

Migrar a camada de persistência do backend REST (`src/server/server.mjs`) de ficheiro JSON (`.data/gestao.json`) para PostgreSQL hospedado no Supabase, mantendo a arquitetura desacoplada (frontend REST + JWT Bearer) e a interface intacta.

**O que não muda:** repositórios (`RestRepository`), `httpClient`, contratos TypeScript, UI, fluxos de auth do frontend.

## 2. Estado atual

| Camada | Tecnologia | Ficheiro |
|---|---|---|
| Frontend | React + REST client | `src/services/httpClient.ts`, `src/repositories/` |
| Backend | Node.js HTTP, JWT HS256 próprio | `src/server/server.mjs` |
| Persistência | JSON único, `loadDb`/`saveDb` | `.data/gestao.json` |
| Uploads | Ficheiros em `.data/uploads/` | `UPLOAD_DIR` |
| Isolamento | `owner_id` + role admin no código | `server.mjs` linhas 45-51 |

**Recursos (14):** accounts, transactions, categories, invoices, budgets, dependents, subscriptions, partner-consents, approvals, audit-logs, suppliers, cost-centers, data-requests, users.

## 3. Estado-alvo

| Camada | Tecnologia |
|---|---|
| Backend | Node.js (mantém), JWT próprio (mantém) |
| Persistência | PostgreSQL (Supabase) via `pg` |
| Uploads | Supabase Storage (fase posterior — opcional) |
| Isolamento | `owner_id` no backend (mantém) + trigger/FK na BD |

Decisão: **usar `pg` diretamente** no backend REST (não Supabase JS client nem RLS), para mínima alteração e controlo total das queries.

## 4. Fases

### Fase 0 — Setup Supabase *(bloqueada, ação manual)*
- [ ] Criar projeto em supabase.com
- [ ] Aplicar `src/supabase/migrations/20260730000001_init.sql` no SQL Editor
- [ ] Obter connection string (Database → Connection string → URI)
- [ ] Definir segredo `DATABASE_URL` (via `set_secrets` ou `.env` do servidor)
- [ ] Reautorizar conector Supabase com `database:write` se necessário p/ DDL por API (opcional)

### Fase 1 — Camada de dados no backend
- [ ] Criar `src/server/db.mjs` — pool `pg`, helpers `query()`, transações
- [ ] Instalar `pg` no package.json (separado do runtime frontend)
- [ ] Mapear cada recurso → tabela (snake_case já alinhado no SQL)
- [ ] Substituir `loadDb`/`saveDb` por queries parametrizadas
- [ ] Manter exatamente a mesma API REST (paths, payloads, respostas)

### Fase 2 — Refatorar handlers do `server.mjs`
- [ ] `/auth/register` → INSERT users + verificar email único (BD já tem unique)
- [ ] `/auth/login` → SELECT por email + `checkPassword`
- [ ] `/auth/me` GET/PATCH → SELECT/UPDATE
- [ ] `/auth/password/request` + `/reset` → tabela `password_resets`
- [ ] `/resources/:resource` CRUD → queries por tabela com filtro `owner_id`
- [ ] `matches()` JSON → cláusula WHERE dinâmica
- [ ] sort/limit/filter → SQL (`ORDER BY`, `LIMIT`, `WHERE`)
- [ ] `deleteMany` com filter → `DELETE ... WHERE`
- [ ] `/files`, `/uploads/:name`, `/ocr`, `/ai` → mantêm (não dependem da BD)

### Fase 3 — Migração de dados existentes
- [ ] Script `src/server/migrate-json-to-pg.mjs`
- [ ] Ler `.data/gestao.json`, mapear campos (snake_case), inserir por tabela
- [ ] Preservar `id`, `created_date`, `owner_id` originais
- [ ] Validar contagens antes/depois por recurso
- [ ] Backup do JSON antes de apagar

### Fase 4 — Validação e cutover
- [ ] Smoke test de cada recurso (CRUD) contra a BD
- [ ] Verificar isolamento `owner_id` (user A não vê user B)
- [ ] Testar login/register/reset
- [ ] Remover `loadDb`/`saveDb` e dependência do JSON
- [ ] Atualizar `.env.example` e README

### Fase 5 — Hardening *(pós-migração, fora do escopo mínimo)*
- [ ] Refresh tokens + HttpOnly cookies
- [ ] Rate limiting nos endpoints de auth
- [ ] Proteção dos uploads por token
- [ ] Índices adicionais conforme queries reais
- [ ] (Opcional) Supabase Storage p/ faturas em vez de disco

## 5. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| `matches()` JSON suporta `$in` e campos aninhados | Implementar tradutor filter→WHERE; cobrir `=` e `$in` (suficiente p/ uso atual) |
| Tipos: JSON guardava tudo como string | SQL tem tipos; converter datas e números no script de migração |
| `owner_id` em users (admins) | users não têm owner_id; lógica admin mantém-se inalterada |
| Connection string em produção | Usar variável `DATABASE_URL`; pool com limit de conexões |
| Perda de dados na cutover | Manter JSON até Fase 4 validar; backup antes |

## 6. Reversão

Até Fase 4 o JSON permanece intacto — basta reverter `server.mjs` para a versão anterior. Após remover `loadDb`/`saveDb`, o backup JSON + script de migração permitem reverter re-importando.

## 7. Critério de conclusão

- Todos os 14 recursos CRUD funcionam contra PostgreSQL.
- Login/register/reset password funcionam.
- Utilizador não-admin não acede a recursos de outros.
- `.data/gestao.json` já não é lido em runtime.
- Nenhuma alteração na UI ou nos repositórios frontend.