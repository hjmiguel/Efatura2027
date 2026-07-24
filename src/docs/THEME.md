# THEME.md — Gestão+ (Angola)

> Descrição profunda do design system, pronta para copiar e colar noutro contexto (Claude, ChatGPT, Figma AI, etc.).

---

## 1. Identidade visual

**Direção:** editorial clássico, sério mas acolhedor, para finanças pessoais angolanas. Não é fintech agressiva nem banco tradicional. É a app que o utilizador em Luanda abre para gerir faturas, pagamentos e deduções fiscais.

**Sensação:** confiança, ordem, clareza. Acores são verde (crescimento/dinheiro) e dourado (valor/recompensa), com fundo cinza claro que respira.

**Assinatura visual:** o **talão de pagamento** com recorte serrilhado no topo. Este é o elemento distintivo — aparece no hero, no diálogo de pagamento, no resumo de faturas e nos cards de referência MCX.

---

## 2. Paleta de cores

| Nome | Hex | Uso |
|---|---|---|
| **ink** | `#10211C` | Títulos, texto principal, ícones primários |
| **primary** | `#0E5C4A` | Botões primários, barra de navegação, destaques positivos |
| **primary-2** | `#12715C` | Hover / active do primary |
| **gold** | `#E8A23D` | Acento Premium, recompensas, badges especiais, cartão IRPS |
| **gold-soft** | `#F6E2BC` | Fundo de badges gold, hover de itens dourados |
| **ok** | `#1C8A6A` | Sucesso, receitas, estado "pago" |
| **green-soft** | `#DCF0E6` | Fundo de estados positivos, receitas, hover suave |
| **danger** | `#D2483B` | Erros, atrasos, estado "pendente crítico", exclusão |
| **danger-soft** | `#F7E0DC` | Fundo de alertas de erro |
| **blue** | `#3a64a8` | Links, informação, estados "info" |
| **bg** | `#EAEEEC` | Fundo geral da app |
| **surface** | `#FFFFFF` | Cartões, modais, bottom sheets, inputs |
| **line** | `#C9D3CD` | Bordas, divisores, linhas de tabela |
| **muted** | `#6B7A74` | Texto secundário, labels, timestamps |
| **muted-2** | `#93A099` | Placeholders, desativado |

**Regras de uso:**
- Nunca usar `#000000` ou `#FFFFFF` diretamente no texto. Usar `ink` e `surface`.
- Verde é sempre para **receita / positivo / sucesso**. Dourado é para **valor especial / Premium / IRPS**. Vermelho é para **despesa crítica / erro**.
- Fundos de estado: `green-soft` para receitas, `gold-soft` para despesas comuns, `danger-soft` para alertas.
- Todas as cores são semânticas — não usar classes hardcoded como `bg-white` ou `text-black`.

---

## 3. Tipografia

**Fontes:**
- **Display / títulos:** `Space Grotesk`, peso 500–700, tracking apertado.
- **Corpo / UI:** `Inter`, peso 400–600.
- **Valores / referências / IBAN:** `JetBrains Mono`, tabular nums ligado.

**Escala tipográfica (mobile-first):**

| Elemento | Fonte | Tamanho | Peso | Tracking | Cor |
|---|---|---|---|---|---|
| H1 | Space Grotesk | 32–40px | 700 | -0.02em | ink |
| H2 | Space Grotesk | 24–28px | 600 | -0.01em | ink |
| H3 | Space Grotesk | 18–20px | 600 | 0 | ink |
| Body | Inter | 14–16px | 400 | 0 | ink/90 |
| Caption | Inter | 12px | 400 | 0 | muted |
| Label / eyebrow | JetBrains Mono | 10px | 700 | 0.28em uppercase | muted ou primary |
| Valor grande | JetBrains Mono | 28–36px | 700 | -0.02em | ink ou primary |
| Valor pequeno | JetBrains Mono | 14px | 600 | 0 | ink |

**Regras:**
- Todos os valores monetários usam **JetBrains Mono** com `font-variant-numeric: tabular-nums`.
- Labels de secção usam **JetBrains Mono 10px uppercase**, tracking 0.28em, com prefixo numérico tipo "§ 01".
- Títulos alinham à esquerda com hierarquia forte. Evitar caixas centradas genéricas.

---

## 4. Componentes base

### Cartão (Card)

```css
.card {
  background: var(--surface);
  border-radius: 18px;
  box-shadow: 0 8px 24px -12px rgba(16, 33, 28, 0.28);
  border: 1px solid rgba(16, 33, 28, 0.06);
  padding: 20px 24px;
}
```

- Canto: **18px** (nunca 8px, nunca 24px).
- Sombra suave, difusa, na cor `ink` com 28% opacidade.
- No mobile, cartões tocam as bordas laterais com padding interno.

### Botões

- **Primário:** `bg-primary`, texto branco, cantos 12px, padding 12px 20px, fonte 14px semibold.
- **Secundário:** fundo `surface`, borda 1px `line`, texto `ink`.
- **Ghost:** sem fundo, texto `primary`, hover `green-soft`.
- **Danger:** `bg-danger`, texto branco.
- **Gold:** `bg-gold`, texto `ink` (usado para CTA Premium).

### Inputs

- Fundo `surface`, borda 1px `line`, cantos 12px.
- Focus: `ring-2 ring-primary`.
- Placeholder: `muted-2`.
- Labels em cima, 12px, `muted`, com tracking leve.

### Badges

- **Sucesso:** `bg-green-soft text-ok`
- **Pendente:** `bg-gold-soft text-gold`
- **Erro:** `bg-danger-soft text-danger`
- **Premium:** `bg-gold text-ink`

---

## 5. Layout e grid

- **Desktop:** sidebar fixa à esquerda (260px), conteúdo com margem generosa (24–32px), máximo 1440px.
- **Mobile:** bottom tab bar, conteúdo edge-to-edge, cartões empilhados, padding horizontal 16px.
- **Landing page:** seções full-width alternadas, padding vertical 80–120px, grid editorial (nunca caixa centralizada genérica).
- **Grid preferido:** 12 colunas com gutter 24px.

**Regras de espaçamento:**
- Conteúdo alinha à esquerda com ritmo vertical.
- Espaçamentos em múltiplos de 4px: 8, 12, 16, 20, 24, 32, 48, 64, 80.

---

## 6. Elemento de assinatura — o talão

Componente distintivo: um cartão com topo serrilhado, como um talão de Multicaixa.

### CSS do recorte serrilhado

```css
.receipt-notch {
  mask-image: radial-gradient(circle 6px at 6px 0, transparent 6px, black 6.5px);
  mask-size: 16px 100%;
  mask-repeat: repeat-x;
  -webkit-mask-image: radial-gradient(circle 6px at 6px 0, transparent 6px, black 6.5px);
  -webkit-mask-size: 16px 100%;
  -webkit-mask-repeat: repeat-x;
  height: 12px;
  width: 100%;
  background: var(--primary);
}
```

### Estrutura do cartão

- **Topo:** faixa `primary` com o recorte serrilhado, contém o emissor e o montante.
- **Corpo:** linhas com label + valor, separadas por linhas tracejadas.
- Cada linha pode ter botão "Copiar".
- Fundo branco, cantos 18px, sombra suave.

### Estados do talão

- **Normal:** topo `primary`.
- **Premium:** topo `gold`.
- **Atrasado / pendente crítico:** topo `danger` ou badge vermelho.

---

## 7. Estados e feedback

| Estado | Fundo | Texto | Ícone |
|---|---|---|---|
| Pago | `green-soft` | `ok` | check |
| Pendente | `gold-soft` | `gold` | clock |
| Atrasado | `danger-soft` | `danger` | alert |
| Premium | `gold` | `ink` | crown |
| Info | `surface` | `blue` | info |

**Focus visible:** outline 2px `primary`, offset 2px, cantos 6px.

---

## 8. Mobile / PWA

- **Viewport:** `viewport-fit=cover`, safe areas respeitadas.
- **Tab bar inferior:** 5 ícones, altura ~64px, fundo `surface` com blur, sombra superior suave.
- **Bottom sheet:** em vez de modais centrais para pagamento e conciliação.
- **Tabelas viram listas:** cards empilhados com as mesmas informações.
- **Touch targets:** mínimo 44px.

---

## 9. Tom de voz

- Português de Angola, direto, prático.
- Sem jargão bancário excessivo.
- Tratar o utilizador por "tu" (ex: "Marlon, a tua fatura da ENDE vence amanhã").
- Mensagens de erro claras: "Não conseguimos carregar as faturas. Tenta outra vez."

---

## 10. Prompt compacto para copiar

```
Cria uma app PWA de finanças pessoais para Angola chamada "Gestão+". Tema editorial clássico: fundo #EAEEEC, texto #10211C, botões #0E5C4A, acentos dourados #E8A23D. Fontes: Space Grotesk (títulos), Inter (corpo), JetBrains Mono (valores). Cartões com border-radius: 18px e sombra 0 8px 24px -12px rgba(16,33,28,.28). Elemento de assinatura: cartão-talão com recorte serrilhado no topo. Mobile: bottom tab bar, desktop: sidebar fixa. Layout sem caixas centradas genéricas — conteúdo em ecrã completo, hierarquia editorial forte.
```

---

## 11. Variantes específicas por ecrã

### Landing page
- Hero com talão da ENDE flutuando à direita do texto.
- Secções: Problema, Como funciona (4 passos), Funcionalidades, Empresas, Preços, Confiança, Rodapé.
- CTA primário: "Começar grátis" (verde). CTA secundário: "Ver preços" (ghost).

### App do utilizador (`/app`)
- Início: património grande no topo, depois contas em cards, movimentos e agenda.
- Pagamentos: lista de faturas com badges de estado, talão ao expandir.
- Dedutíveis: cartão dourado "Dedutível no IRPS" em destaque.
- Perfil: campos em cards separados, secções de retenção IRT/INSS.

### Portal de parceiros (`/parceiros`)
- Tema mais operacional, mas mantendo cartões 18px e paleta.
- Dashboard com KPIs em cards, tabela de faturas, formulário de emissão.
- API keys: tokens com prefixo `gp_test_` / `gp_live_`, botão de revogação vermelho.

### Backoffice (`/admin`)
- Tema escuro opcional: fundo `ink`, surface `#16221E`, texto `surface`.
- KPIs grandes no topo, tabelas de utilizadores, auditoria com linha do tempo.

---

## 12. Restrições de implementação

- Nunca usar `bg-white`, `text-black`, `bg-[#...]` hardcoded.
- Nunca usar fontes genéricas (Inter, Poppins) sem propósito.
- Manter todos os valores monetários em `JetBrains Mono`.
- Manter o recorte serrilhado do talão como SVG ou CSS mask.
- Respeitar a hierarquia editorial: rótulos pequenos e uppercase, títulos grandes, corpo arejado.