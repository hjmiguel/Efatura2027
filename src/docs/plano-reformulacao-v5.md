# Plano de Reformulação — Alinhar App com UI v5.1

**Data:** 19 jul 2026
**Objetivo:** Reformular a aplicação mobile Gestão+ para alinhar 100% com o design UI v5.1 (HTML de referência), mantendo toda a lógica de negócio e dados existentes.

---

## 1. Estado atual vs v5.1 — principais diferenças

| Área | Atual | v5.1 (alvo) |
|---|---|---|
| **Layout mobile** | Top bar (logo + bell) + bottom nav | App bar (avatar G+, saudação, bell com dot, ícone docs) + bottom nav |
| **Bottom nav (mobile)** | Início, Contas, Transações, Dedutíveis, Perfil | Início, Transações, Orçamento, Pagamentos, Assistente |
| **Desktop** | Sidebar fixa 260px com 10 itens | Manter sidebar mas alinhar itens e estilo |
| **Início** | Grid 3 colunas desktop, cards empilhados mobile | Mobile-first: balance hero gradiente, contas scroll horizontal, quick actions 4 botões, a pagar, dedutível, meta, movimentos |
| **Navegação a ecrãs** | Contas, Dedutíveis, Fiscal como páginas separadas | Contas = scroll no Início; Dedutível e Fiscal = fluxos full-screen |
| **Onboarding** | Não existe | 3 ecrãs com ilustrações + login/registo |
| **Adicionar transação** | Modal/form | Ecrã próprio com montante grande + chips de categoria |
| **Fluxos** | Páginas/dialogos | Full-screen flows com steps (OCR 4 passos, conciliação 4, GPO 3, premium 2) |
| **Bottom sheets** | Não usa | Dialogs de pagamento, conectar empresa, notificações |
| **Linguagem editorial** | Não usa | Eyebrows (§ 02 · Movimentos), marks mono, ordinais |
| **Talão recibo** | Existe na landing | Padronizar na app: serrilhado, cabeçalho verde, perfuração |

---

## 2. Fases da reformulação

### Fase A — Fundação visual e layout (1-2 dias)

**A1. Design tokens e utilitários**
- Confirmar `src/index.css` e `tailwind.config.js` alinhados com v5.1:
  - Cores: `--primary: #0E5C4A`, `--primary-2: #12715C`, `--gold: #E8A23D`, `--bg: #EAEEEC`, `--line: #E2E8E4`, `--ink: #10211C`
  - Raio 18px padrão de cartão (`rounded-talao` já existe)
  - Sombras subtis: `0 2px 10px -8px rgba(16,33,28,.22)`
- Adicionar classes utilitárias v5.1: `.eyebrow`, `.mark`, `.ord`, `.ed-h`, `.ed-list`, `.hairline`, `.track`, `.pill` variants
- Fontes já carregadas (Space Grotesk, Inter, JetBrains Mono) — confirmar

**A2. AppLayout reformulado**
- **Mobile:** App bar fixa no topo com:
  - Avatar G+ circular (→ /app/perfil)
  - Saudação "Olá, [nome]" + sub "Bem-vinda de volta"
  - Bell com dot vermelho (→ abre bottom sheet notificações)
  - Ícone documentos (→ /app/documentos)
- **Bottom nav (mobile):** 5 itens — Início, Transações, Orçamento, Pagamentos, Assistente
- **Desktop:** Sidebar mantida mas com mesmos 5 itens + secção "Mais" com Documentos, Fiscal, Perfil
- Remover Contas e Dedutíveis do nav (Contas vira scroll no Início; Dedutível vira fluxo)

**A3. Componentes base v5.1**
Criar em `src/components/app/ui/`:
- `Card.jsx` — wrapper 18px radius, border line, shadow subtil
- `Eyebrow.jsx` — etiqueta de secção (§ 02 · Movimentos)
- `Pill.jsx` — badges (pend/paid/late/part) com cores semânticas
- `TrackBar.jsx` — barra de progresso orçamento (primary/gold/red)
- `BottomSheet.jsx` — overlay + sheet animada (substitui Dialog em mobile)
- `TalaoReceipt.jsx` — recibo com serrilhado, cabeçalho verde, perfuração
- `QuickAction.jsx` — botão de ação rápida (ícone + label)
- `AccountChip.jsx` — cartão de conta horizontal scrollável
- `BillCard.jsx` — cartão de fatura com ícone, quem, montante, ações
- `TransactionRow.jsx` — linha de transação com seta in/out

---

### Fase B — Ecrã Início (1 dia)

**B1. Reformular `Home.jsx`**
Alinhar com `#inicio` do v5.1:
1. **Balance hero** — gradiente primary→primary-2, património + recebido/gasto do mês
2. **Contas** — scroll horizontal de AccountChip + botão adicionar
3. **Quick actions** — 4 botões: Registar, Documento, Pagar, Conectar
4. **A pagar** — cartão soft-gold com total pendente + pill "X urgentes"
5. **Deduções de junho** — cartão informativo (IRT/INSS retido)
6. **Dedutível IRPS** — cartão dourado com total + chips por categoria + aviso NIF
7. **Meta** — cartão com ring de progresso (fundo emergência)
8. **Movimentos recentes** — lista flush (sem cards individuais, linhas com hairline)

**B2. Componentes a criar/refactor:**
- Refactor `PatrimonioHero` → balance gradiente v5.1
- Refactor `AccountCard` → scroll horizontal de chips
- Refactor `DeductibleCard` → cartão dourado v5.1
- Refactor `PendingInvoiceList` → cartão soft-gold "A pagar"
- Novo `GoalCard` — meta com ring conic-gradient
- Refactor `RecentTransactions` → lista editorial flush

---

### Fase C — Transações + Adicionar (1 dia)

**C1. Reformular `Transacoes.jsx`**
- Header com eyebrow "§ 02 · Movimentos" + botão "＋ Adicionar"
- Search bar arredondada
- Chips de filtro horizontal (Todas, Salário, Investimentos, Alimentação…)
- Tabbar: Todas / Receitas / Despesas
- Lista de `TransactionRow` (seta in/out, categoria pill, data, montante mono)

**C2. Novo ecrã `Adicionar.jsx`**
- Rota `/app/adicionar`
- Tabbar Despesa/Receita
- Montante grande centrado (mono 36px)
- Chips de categoria com ícones emoji
- Botão "Guardar despesa"
- Quick actions: Foto do recibo (→ fluxo OCR), WhatsApp

---

### Fase D — Orçamento com tabs (1 dia)

**D1. Reformular `Orcamento.jsx`**
- Header com eyebrow "§ 03 · Limites e metas"
- Tabbar: Orçamento / Metas / Relatórios

**Orçamento:**
- Cartão soft-gold com total gasto vs orçamentado + barra
- Lista de `BudgetBar` (ícone, nome, gasto/limite, track colorido)
- Cartão verde "Insights IA" com sugestões

**Metas:**
- Cartões com ring conic-gradient + nome + progresso + sugestão mensal
- Botão "Nova meta"

**Relatórios:**
- Cartão "Gasto por categoria" com barras horizontais
- Nota comparativa
- Botões exportar PDF/CSV

---

### Fase E — Pagamentos + fluxos (2 dias)

**E1. Reformular `Pagamentos.jsx`**
- Header eyebrow "§ 04 · Contas a pagar"
- Duas stats: Pendente (red) / Pago este mês (green)
- Tabbar 4 separadores: Pendente / Pagos / Compromissos / Empresas

**Pendente:** lista de `BillCard` (ícone, quem, referência/IBAN, montante, prazo, pill, ações Pagar/Agendar)
**Pagos:** faturas pagas com selos AGT (emitida contorno / paga cheio)
**Compromissos:** recorrentes mensais com dia
**Empresas:** AGT conn card gradiente + lista de empresas ligadas + revogar

**E2. Bottom sheet de pagamento**
- `BillPaymentSheet` — talão recibo com entidade/referência/IBAN copiável
- Botões: Pagar com MCX Express / copiar referência / abrir banco
- Variantes: referência, IBAN, RUPE

**E3. Fluxos full-screen**
Criar `src/pages/app/flows/`:
- `OcrFlow.jsx` — 4 passos: fonte → a ler → rever → guardado
- `ConciliacaoFlow.jsx` — 4 passos: comprovativo → match → confirmar → conciliado
- `GpoFlow.jsx` — 3 passos: pagar → aguardar MCX → pago
- `PremiumFlow.jsx` — 2 passos: subscrever → ativo
- `DedutiveisFlow.jsx` — detalhe dedutível com categorias + alertas NIF
- `FiscalFlow.jsx` — situação fiscal AGT com lifecycle + selos + divergências

Cada fluxo é uma rota `/app/fluxo/ocr`, etc. com steps visuais no topo.

---

### Fase F — Assistente + Documentos + Perfil (1 dia)

**F1. Reformular `Assistente.jsx`**
- Header com back + eyebrow "§ 05 · Perguntas"
- AI hero gradiente escuro com resumo do mês
- Bubbles de mensagens
- Ask bar com input + mic

**F2. Reformular `Documentos.jsx`**
- Header com back + eyebrow "§ 06 · Arquivo"
- Botão "Upload" (→ fluxo OCR)
- Storage bar (usado/total)
- Tabbar: Todos / Faturas / Recibos / Outros
- Lista de `DocRow` (ícone, nome, tipo tag, pill estado)

**F3. Reformular `Perfil.jsx`**
- Cartão perfil com avatar + nome + email + NIF chip
- Cartão Premium gradiente + botão subscrever
- Cartão PWA soft-gold (modo offline, instalação)
- Tabbar: Conta / Segurança / Dependentes / Privacidade
- Botão vermelho "Terminar sessão"

---

### Fase G — Onboarding (1 dia)

**G1. Novo `Onboarding.jsx`**
- Rota `/onboarding` (antes do login)
- 3 ecrãs com ilustrações + dots + botão Continuar
- Ecrã 1: "Controla o teu dinheiro sem esforço"
- Ecrã 2: "Nunca percas um pagamento"
- Ecrã 3: "Um assistente que cuida das contas"
- Botão "Saltar" → login

**G2. Alinhar `Entrar.jsx` e `Registo.jsx`**
- Manter layout split (dark left + form right) no desktop
- Mobile: alinhar com estilo v5.1 (campos com ícone, botão bio)

---

## 3. Ordem de execução recomendada

```
A (fundação)  →  B (Início)  →  C (Transações+Adicionar)
                                      ↓
              D (Orçamento)  →  E (Pagamentos+fluxos)
                                      ↓
              F (Assistente+Docs+Perfil)  →  G (Onboarding)
```

**Cada fase termina com app funcional** — não há breaking changes entre fases.

---

## 4. Princípios a respeitar

1. **Não mudar lógica de negócio** — apenas UI/UX; entidades, backend functions e regras fiscais intactas
2. **Mobile-first** — todos os ecrãs desenhados a 392px primeiro, desktop depois
3. **Linguagem editorial** — eyebrows §, marks mono, ordinais onde aplicável
4. **Semântica de cor** — vermelho só negativo, dourado só neutro/dedutível, verde só positivo
5. **Talão recibo** — padrão serrilhado em todos os recibos de pagamento
6. **Bottom sheets** — substituir dialogs modais em mobile para ações contextuais
7. **JetBrains Mono** — sempre em montantes, IBAN, referências, datas técnicas
8. **Componentes focados** — cada componente < 50 linhas, ficheiro próprio

---

## 5. Ficheiros a criar/modificar

### Novos ficheiros
```
src/components/app/ui/Card.jsx
src/components/app/ui/Eyebrow.jsx
src/components/app/ui/Pill.jsx
src/components/app/ui/TrackBar.jsx
src/components/app/ui/BottomSheet.jsx
src/components/app/ui/TalaoReceipt.jsx
src/components/app/ui/QuickAction.jsx
src/components/app/ui/AccountChip.jsx
src/components/app/ui/BillCard.jsx
src/components/app/ui/TransactionRow.jsx
src/components/app/ui/GoalRing.jsx
src/components/app/ui/StepIndicator.jsx
src/pages/app/Adicionar.jsx
src/pages/app/flows/OcrFlow.jsx
src/pages/app/flows/ConciliacaoFlow.jsx
src/pages/app/flows/GpoFlow.jsx
src/pages/app/flows/PremiumFlow.jsx
src/pages/app/flows/DedutiveisFlow.jsx
src/pages/app/flows/FiscalFlow.jsx
src/pages/Onboarding.jsx
```

### Ficheiros a modificar
```
src/index.css              — classes utilitárias v5.1
src/components/app/AppLayout.jsx  — app bar + bottom nav
src/pages/app/Home.jsx     — reformulação completa
src/pages/app/Transacoes.jsx
src/pages/app/Orcamento.jsx
src/pages/app/Pagamentos.jsx
src/pages/app/Assistente.jsx
src/pages/app/Documentos.jsx
src/pages/app/Perfil.jsx
src/pages/Entrar.jsx       — alinhar estilo
src/pages/Registo.jsx      — alinhar estilo
src/App.jsx                — novas rotas (adicionar, fluxos, onboarding)
```

---

## 6. Critério de aceite

A reformulação está completa quando, a abrir a app num telemóvel a 392px:
- O app bar mostra avatar, saudação, bell e docs
- O bottom nav tem exatamente 5 itens (Início, Transações, Orçamento, Pagamentos, Assistente)
- O Início mostra balance hero, contas scroll, quick actions, a pagar, dedutível, meta, movimentos
- Pagamentos abre bottom sheet com talão recibo ao tocar numa fatura
- Fluxos de OCR, conciliação, GPO e premium funcionam full-screen com steps
- Onboarding aparece antes do login para novos utilizadores
- Semântica de cor verificada em todos os ecrãs