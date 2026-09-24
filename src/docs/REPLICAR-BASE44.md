# Gestão+ — Guia de Replicação num Novo Projecto Base44

Este documento reúne tudo o necessário para recriar a aplicação **Gestão+** do zero, num projecto Base44 novo, usando as capacidades **nativas** da plataforma (entidades, autenticação, integrações, funções de backend) em vez da arquitectura desacoplada (servidor Node + Postgres/Supabase) que este projecto acabou por adoptar.

> Recomendação: no projecto novo, **não repita o desacoplamento**. Use entidades nativas do Base44 (`base44.entities.*`) e a autenticação nativa (Login/Registo/OTP). Isso elimina a necessidade de JWT próprio, servidor Node standalone e ligação directa a Postgres — e resolve, de origem, os problemas de segurança e de hospedagem que este projecto acumulou (ver secção "Problemas conhecidos a evitar").

---

## 1. Missão do produto

Gestão+ é uma aplicação de arquivo de facturas e finanças pessoais para Angola, focada em:
- Organização documental (arquivo de facturas com OCR).
- Controlo de gastos e orçamento mensal.
- Pagamentos via Multicaixa Express (referência, IBAN, RUPE).
- Conformidade com a Lei 22/11 (protecção de dados).
- IRPS tratado como benefício "silencioso" (dedutíveis), nunca como foco principal.

Bússola de produto:
- OCR de facturas é o fluxo principal (primeira classe); automação é bónus.
- Foco na utilidade **mensal** (evitar multas/atrasos), não na fiscalidade anual.
- O assistente de IA é um **navegador proactivo**, nunca um "director financeiro" — tom descritivo/neutro, nunca imperativo ou de aconselhamento de valor.

---

## 2. Modelo de dados — Entidades nativas Base44

Recriar como `base44/entities/<Nome>.jsonc` (schemas completos, sem campos base id/created_date/updated_date/created_by_id):

### Invoice (Factura)
```json
{
  "name": "Invoice",
  "type": "object",
  "properties": {
    "issuer_name": { "type": "string", "description": "Nome do emissor (ENDE, Unitel, etc.)" },
    "issuer_nif": { "type": "string", "description": "NIF do emissor" },
    "document_number": { "type": "string" },
    "amount": { "type": "number", "description": "Montante em kwanza" },
    "issue_date": { "type": "string", "format": "date" },
    "due_date": { "type": "string", "format": "date" },
    "payment_method": { "type": "string", "enum": ["mcx_reference", "iban", "rupe", "manual"] },
    "entity": { "type": "string", "description": "Entidade Multicaixa Express" },
    "reference": { "type": "string", "description": "Referência Multicaixa Express" },
    "iban": { "type": "string" },
    "status": { "type": "string", "enum": ["pending", "paid", "overdue"], "default": "pending" },
    "paid_date": { "type": "string", "format": "date" },
    "category_id": { "type": "string" },
    "has_nif": { "type": "boolean", "default": true },
    "deductible_type": { "type": "string", "enum": ["none", "saude", "educacao", "habitacao", "pensao_alimentos", "previdencia"], "default": "none" },
    "source": { "type": "string", "enum": ["manual", "photo_ocr", "partner", "agt"], "default": "manual" },
    "agt_status": { "type": "string", "enum": ["none", "emitted", "paid"], "default": "none" },
    "user_nif": { "type": "string" }
  },
  "required": ["issuer_name", "amount", "due_date", "status"]
}
```

### Transaction (Movimento)
```json
{
  "name": "Transaction",
  "type": "object",
  "properties": {
    "description": { "type": "string" },
    "amount": { "type": "number", "description": "Positivo=entrada, negativo=saída" },
    "date": { "type": "string", "format": "date" },
    "type": { "type": "string", "enum": ["income", "expense", "transfer"] },
    "account_id": { "type": "string" },
    "category_id": { "type": "string" },
    "invoice_id": { "type": "string" },
    "notes": { "type": "string" }
  },
  "required": ["description", "amount", "date", "type", "account_id"]
}
```

### Account (Conta)
```json
{
  "name": "Account",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "bank_name": { "type": "string" },
    "iban": { "type": "string" },
    "balance": { "type": "number" },
    "type": { "type": "string", "enum": ["checking", "savings", "cash"], "default": "checking" },
    "color": { "type": "string" },
    "is_active": { "type": "boolean", "default": true }
  },
  "required": ["name", "bank_name", "balance"]
}
```

### Category (Categoria)
```json
{
  "name": "Category",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "type": { "type": "string", "enum": ["income", "expense"] },
    "icon": { "type": "string", "description": "Nome do ícone lucide-react" },
    "color": { "type": "string" },
    "is_deductible": { "type": "boolean", "default": false },
    "deductible_type": { "type": "string", "enum": ["none", "saude", "educacao", "habitacao", "pensao_alimentos", "previdencia"], "default": "none" }
  },
  "required": ["name", "type"]
}
```

### Budget (Orçamento)
```json
{
  "name": "Budget",
  "type": "object",
  "properties": {
    "category_id": { "type": "string" },
    "category_name": { "type": "string" },
    "month": { "type": "string", "description": "YYYY-MM" },
    "limit": { "type": "number" },
    "spent": { "type": "number", "default": 0 }
  },
  "required": ["category_id", "month", "limit"]
}
```

### Dependent (Dependente)
```json
{
  "name": "Dependent",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "relationship": { "type": "string", "enum": ["conjuge", "filho", "pai", "mae", "outro"] },
    "nif": { "type": "string" },
    "birth_date": { "type": "string", "format": "date" }
  },
  "required": ["name", "relationship"]
}
```

### Subscription (Subscrição Premium)
```json
{
  "name": "Subscription",
  "type": "object",
  "properties": {
    "user_id": { "type": "string" },
    "plan": { "type": "string", "enum": ["monthly", "yearly"], "default": "monthly" },
    "amount": { "type": "number" },
    "status": { "type": "string", "enum": ["pending", "active", "expired", "cancelled"], "default": "pending" },
    "start_date": { "type": "string", "format": "date" },
    "end_date": { "type": "string", "format": "date" },
    "proxypay_reference": { "type": "string" },
    "proxypay_entity": { "type": "string" },
    "proxypay_payment_id": { "type": "string" }
  },
  "required": ["user_id", "plan", "amount", "status"]
}
```

### Supplier (Fornecedor — módulo empresas)
```json
{
  "name": "Supplier",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "nif": { "type": "string" },
    "iban": { "type": "string" },
    "category": { "type": "string" },
    "payment_terms_days": { "type": "number", "default": 30 },
    "withholding_rate": { "type": "number", "default": 6.5 },
    "applies_withholding": { "type": "boolean", "default": true },
    "contact_name": { "type": "string" },
    "contact_phone": { "type": "string" },
    "contact_email": { "type": "string" },
    "is_active": { "type": "boolean", "default": true }
  },
  "required": ["name", "nif"]
}
```

### CostCenter (Centro de custo — módulo empresas)
```json
{
  "name": "CostCenter",
  "type": "object",
  "properties": {
    "code": { "type": "string" },
    "name": { "type": "string" },
    "budget_monthly": { "type": "number" },
    "budget_yearly": { "type": "number" },
    "responsible_name": { "type": "string" },
    "is_active": { "type": "boolean", "default": true }
  },
  "required": ["code", "name"]
}
```

### Approval (Aprovação — módulo empresas)
```json
{
  "name": "Approval",
  "type": "object",
  "properties": {
    "entity_type": { "type": "string", "enum": ["payment", "invoice", "transfer"] },
    "entity_id": { "type": "string" },
    "entity_description": { "type": "string" },
    "amount": { "type": "number" },
    "supplier_name": { "type": "string" },
    "cost_center_id": { "type": "string" },
    "status": { "type": "string", "enum": ["pending", "approved", "rejected"], "default": "pending" },
    "requested_by_id": { "type": "string" },
    "requested_by_name": { "type": "string" },
    "approved_by_id": { "type": "string" },
    "approved_by_name": { "type": "string" },
    "decision_date": { "type": "string", "format": "date-time" },
    "decision_note": { "type": "string" },
    "requires_reason": { "type": "boolean", "default": false }
  },
  "required": ["entity_type", "entity_description", "amount", "status"]
}
```

### PartnerConsent (Consentimento de parceiro API)
```json
{
  "name": "PartnerConsent",
  "type": "object",
  "properties": {
    "partner_name": { "type": "string" },
    "partner_nif": { "type": "string" },
    "api_key_hash": { "type": "string" },
    "api_key_preview": { "type": "string" },
    "consent_status": { "type": "string", "enum": ["active", "revoked"], "default": "active" },
    "consent_date": { "type": "string", "format": "date-time" },
    "revoked_date": { "type": "string", "format": "date-time" },
    "scopes": { "type": "array", "items": { "type": "string", "enum": ["emit", "status", "list"] } },
    "user_nif": { "type": "string" }
  },
  "required": ["partner_name", "partner_nif", "api_key_hash", "consent_status", "scopes"]
}
```

### AuditLog (Registo de auditoria — admin)
```json
{
  "name": "AuditLog",
  "type": "object",
  "properties": {
    "action": { "type": "string", "enum": ["login", "view_user_detail", "update_user", "delete_user", "create_invoice", "update_invoice", "revoke_consent", "api_key_create", "api_key_revoke", "approval_grant", "approval_reject", "export_data", "settings_change"] },
    "actor_id": { "type": "string" },
    "actor_name": { "type": "string" },
    "actor_role": { "type": "string", "enum": ["admin", "operator", "support", "auditor", "partner", "corporate_admin", "corporate_finance", "corporate_approver", "corporate_read"] },
    "target_entity": { "type": "string" },
    "target_id": { "type": "string" },
    "reason": { "type": "string" },
    "details": { "type": "string" },
    "ip_address": { "type": "string" },
    "module": { "type": "string", "enum": ["admin", "partner", "corporate", "app"] }
  },
  "required": ["action", "actor_id", "actor_name", "module"]
}
```

### DataRequest (Pedido de dados — Lei 22/11)
```json
{
  "name": "DataRequest",
  "type": "object",
  "properties": {
    "user_name": { "type": "string" },
    "user_email": { "type": "string" },
    "request_type": { "type": "string", "enum": ["export", "delete", "rectification"], "default": "export" },
    "description": { "type": "string" },
    "requested_date": { "type": "string", "format": "date" },
    "deadline_date": { "type": "string", "format": "date" },
    "status": { "type": "string", "enum": ["pending", "completed"], "default": "pending" },
    "completed_date": { "type": "string", "format": "date" },
    "handled_by": { "type": "string" }
  },
  "required": ["user_name", "request_type", "status"]
}
```

**User (entidade nativa)**: usar o `User` embutido do Base44. Campos personalizados a adicionar via `base44/entities/User.jsonc`: `role` (admin/user + eventuais papéis internos), `nif`, `phone`, `agt_consent`, `agt_consent_date`.

Todas as entidades pertencem ao utilizador que as cria (`created_by_id` nativo) — não é preciso `owner_id` manual nem RLS customizado para o isolamento básico "cada utilizador só vê os seus dados"; usar RLS do Base44 (`get_capability_guide("rls")`) para formalizar essa regra por entidade.

---

## 3. Estrutura de páginas e navegação

Rotas (React Router, `src/App.jsx`):

**Público / marketing**
- `/` — Landing
- `/registo`, `/entrar`, `/forgot-password`, `/reset-password`
- `/onboarding`, `/termos`, `/privacidade`

**App (protegidas, layout com Bottom Bar mobile-first)** — prefixo `/app`:
- `/app` — Home (dashboard, saldo, resumo)
- `/app/adicionar` — Adicionar (transação/factura)
- `/app/orcamento` — Orçamento (por categoria)
- `/app/transacoes` — Lista de transações
- `/app/contas` — Contas bancárias/dinheiro
- `/app/pagamentos` — Pagamentos (facturas pendentes/pagas, compromissos, tesouraria)
- `/app/documentos` — Arquivo de facturas + upload/OCR
- `/app/dedutiveis` — Dedutíveis IRPS
- `/app/fiscal` — Resumo fiscal
- `/app/assistente` — Assistente IA (chat)
- `/app/perfil` — Perfil (conta, dependentes, privacidade, segurança)

**Admin (backoffice)** — prefixo `/admin`:
- `/admin`, `/admin/empresas`, `/admin/antifraude`, `/admin/acessos`, `/admin/planos`, `/admin/conformidade`, `/admin/testes`

**Parceiros**: `/parceiros` — portal de parceiros API (emissão de facturas, sandbox, chaves API)

**Empresas (corporate)** — prefixo `/empresas`:
- `/empresas`, `/empresas/pagamentos`, `/empresas/fornecedores`, `/empresas/centros`, `/empresas/fiscal`

---

## 4. Sistema de desenho (design system)

### Cores (HSL, `src/index.css`)
- `--background`: 150 12% 93% · `--foreground`: 163 34% 10%
- `--primary`: 166 74% 21% (verde escuro/petróleo) · `--primary-foreground`: branco
- `--accent`: 37 79% 57% (dourado)
- `--destructive`: 5 63% 53% (vermelho terracota)
- Extras: `ink` #10211C, `primary-2` #12715C, `gold` #E8A23D, `gold-soft` #F6E2BC, `danger-soft` #F7E0DC, `ok` #1C8A6A, `green-soft` #DCF0E6, `brandblue` #3a64a8, `line` #E2E8E4, `muted-2` #6E7A73

### Tipografia
- Títulos/display: **Space Grotesk**
- Corpo: **Inter**
- Montantes, IBAN, referências, NIF: **JetBrains Mono** com `tabular-nums`

### Elemento de assinatura visual
- Cartão "talão" (recibo) com recorte serrilhado no topo (`.talao-serrated-top`, máscara CSS) e linha de perfuração pontilhada entre cabeçalho e corpo (`.talao-perforation`).
- Cabeçalho do talão em gradiente verde/dourado.
- Bordas com raio 18px (`rounded-talao`), sombra suave (`shadow-talao`, `shadow-talao-lg`).

### Animações
- Curva padrão: `cubic-bezier(.22,.68,.3,1)`, duração 0.75s.
- Scroll reveal via IntersectionObserver (`.reveal-up`, `.reveal-left`, `.reveal-right`, `.reveal-scale`).
- Suporte total a `prefers-reduced-motion`: desliga todas as animações/transformações.
- Animações sóbrias e confiantes — nunca divertidas, gimmick ou muito rápidas.

### Padrões de lista/estado
- Lista editorial sem cartões individuais, separadores hairline (`.ed-list`).
- Pills de estado: `pill-pend` (dourado, pendente), `pill-paid` (verde, pago), `pill-late` (vermelho, atrasado), `pill-part` (azul, parcial).

---

## 5. Regras de negócio essenciais

- **Transferências entre contas próprias** não afectam saldos de rendimento/despesa (só movem dinheiro entre contas).
- **Estados de pagamento independentes**: uma factura pode estar `pending`/`paid`/`overdue` independentemente da AGT (`agt_status`: `none`/`emitted`/`paid`).
- **Notificações de pagamento**: apenas duas — um aviso antes do vencimento (3 dias) e um no próprio dia. Nunca mais que isso.
- **Tesouraria**: saldo futuro projectado por ordenação de vencimentos de compromissos pendentes; semáforo visual verde/vermelho conforme o saldo projectado pós-liquidação fica positivo ou negativo.
- **OCR em primeira classe**: upload de factura extrai dados directamente (sem passo de confirmação redundante) e apresenta os campos para revisão rápida antes de gravar.
- **IRPS discreto**: cartões de resumo fiscal pequenos, nunca em posição hero — dedutíveis acumulam-se silenciosamente ao longo do ano.
- **Assistente de IA**: tom descritivo e neutro; nunca dá conselhos de valor ou linguagem imperativa; só antecipa factos/projecções (ex: "tens 3 facturas a vencer esta semana", nunca "deves pagar isto primeiro").
- **Moeda**: kwanzas inteiros (sem cêntimos) em toda a interface, formatados com `Kz` e separador de milhares.
- **Retenção na fonte** (módulo empresas): fornecedores têm taxa de retenção configurável (padrão 6,5%).

---

## 6. Integrações a recriar (nativas Base44)

| Necessidade | Integração nativa Base44 |
|---|---|
| OCR de facturas (extrair dados de foto/PDF) | `Core.InvokeLLM` com `file_urls` + `response_json_schema` (schema da factura), ou `Core.ExtractDataFromUploadedFile` |
| Upload de documentos | `Core.UploadPrivateFile` (facturas são dados pessoais — usar storage privado + `CreateFileSignedUrl` para exibir) |
| Assistente de IA (chat) | Agente Base44 (`base44/agents/`) com acesso de leitura a `Invoice`, `Transaction`, `Budget`, `Account` — ver `get_capability_guide("agents")` |
| Envio de emails (avisos de vencimento, exportação de dados) | `Core.SendEmail` |
| Notificações de pagamento (3 dias antes + dia do vencimento) | Workflow agendado (`base44/workflows/`, trigger `scheduled`) que verifica facturas a vencer e envia email/notificação |
| Pagamento Multicaixa Express / subscrição Premium | Backend function dedicada com o secret `PROXYPAY_API_KEY` (Proxypay), à semelhança de `createSubscription` e `proxypayWebhook` já existentes neste projecto — podem ser copiados quase directamente |
| Integração AGT (futuro) | Backend function `agtFeed` (mantida em modo best-effort — a app deve funcionar sem ela) |
| WhatsApp (avisos/assistente) | Backend function `whatsappWebhook` + Z-API (secrets `ZAPI_*`), reaproveitável |

---

## 7. Problemas conhecidos a evitar no novo projecto

- **Não** recriar um servidor Node.js standalone (`src/server/*`) — o ambiente Base44 é serverless; use `base44/functions/`.
- **Não** implementar autenticação JWT própria — use a autenticação nativa do Base44 (Login/Registo/OTP), que já trata sessão, verificação de email e reset de password.
- **Não** guardar `password_hash` ou geri-lo manualmente — a entidade `User` nativa não permite (nem deve) isso.
- Uploads: nunca expor uma rota pública genérica `/uploads/:name` sem controlo — usar `UploadPrivateFile` + `CreateFileSignedUrl` com expiração curta para documentos financeiros.
- Definir RLS por entidade desde o início (isolamento por utilizador) em vez de deixar para depois.
- Pagamentos Multicaixa Express não têm webhook oficial da EMIS — manter conciliação manual/Proxypay como no projecto actual.
- O feed da AGT ainda não tem definição institucional — desenhar a app para funcionar sem ele.

---

## 8. Dados de demonstração

Usar comerciantes angolanos reais (ex: ENDE, Unitel, EPAL, TV Cabo) e datas correntes ao gerar dados de exemplo, nunca "Empresa X" genérica.

---

## 9. Preferências gerais

- Interface em português de Angola, nomenclatura monetária "Kz" (AOA).
- Mobile-first, navegação principal em Bottom Bar na área `/app`.
- Ícones `lucide-react` em contentores estilizados por categoria financeira.
- PWA com suporte offline total (App Shell + cache de dados via Service Worker, `manifest.json`).
- Acessibilidade total: respeitar `prefers-reduced-motion` em todas as animações.