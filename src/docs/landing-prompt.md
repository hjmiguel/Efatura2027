# Prompt — Landing Page Gestão+

## Identidade do produto
Aplicação de finanças pessoais para Angola. Organiza faturas, pagamentos via Multicaixa Express e preparação para o IRPS 2027. Sem intermediação financeira — o utilizador paga diretamente; a app organiza. Conformidade com a Lei 22/11 (proteção de dados) e NIF obrigatório para conciliação fiscal.

## Sistema de design

### Cores
- **Fundo principal:** cinza-esverdeado claro (`hsl(150 12% 93%)`)
- **Superfícies/cartões:** branco puro
- **Primário (verde):** `hsl(166 74% 21%)` — #1a624f
- **Primário 2 (hover):** #12715C
- **Ouro (accent):** #E8A23D
- **Ouro suave (fundos):** #F6E2BC
- **Tinta (texto escuro):** #10211C
- **Linha (bordas):** #E2E8E4
- **Perigo:** #C8442E / fundo suave #F7E0DC
- **OK (verde positivo):** #1C8A6A / fundo suave #DCF0E6
- **Texto discreto:** #93A099

### Tipografia
- **Headings/display:** Space Grotesk (bold, tracking apertado)
- **Corpo:** Inter (antialiased, leading relaxado)
- **Mono (montantes, IBAN, referências):** JetBrains Mono com `font-variant-numeric: tabular-nums`

### Forma e sombra
- Bordas generosas: `border-radius: 18px` (talão), `0.5rem` (geral)
- Sombras: `soft` (subtil), `talao` (média), `talao-lg` (profunda)
- Foco do teclado: contorno dourado 2px a 3px de distância

### Elemento de assinatura: Talão
Cartão no formato de talão/recibo com:
- Cabeçalho colorido (verde primário ou dourado)
- Borda superior serrilhada (máscara CSS com recortes semicirculares)
- Linha de perfuração tracejada com notches circulares nas extremidades
- Corpo com campos chave-valor
- Campos copiáveis (Entidade, Referência) com feedback visual

## Estrutura da página (topo → fundo)

### 1. Barra de progresso de scroll
- 3px fixa no topo, gradiente verde→dourado, z-index 100
- Largura acompanha `%` da página percorrida
- Escondida se `prefers-reduced-motion`

### 2. Navbar (fixa)
- Logo "G+" (quadrado verde) + "Gestão+"
- Links: Como funciona (#como-funciona), IRPS (#irps), Preços (#precos)
- Ações: "Entrar" (texto), "Criar conta" (botão verde)
- Mobile: menu hamburguer colapsável
- Fundo translúcido com blur ao fazer scroll

### 3. Hero
**Lado esquerdo (texto):**
- Badge: "• Feito para Angola" (pílula verde-suave)
- Headline: "O teu dinheiro, em dia." (grande, bold, tracking apertado)
- Subheadline: "Junta as tuas faturas, paga por Multicaixa Express e sabe sempre quanto te sobra. Feito para Angola."
- CTAs: "Criar conta grátis →" (verde) + "▷ Ver como funciona" (branco com borda)

**Lado direito (visual):**
- **PhoneMockup:** telemóvel escuro com ecrã de dashboard — cumprimento "Olá, Ana", cartão verde com "Disponível 247.300 Kz" (contador animado), lista de 3 faturas (ENDE/ELISAL/TV Cabo) com badges Pagar/Pago, indicator de home bar
- **TalaoCard:** sobreposto ao telemóvel, rotação 6°, cabeçalho verde "ENDE", montante "18.450 Kz", campos Entidade (00556) + Referência (123 456 789) copiáveis, Vencimento (30/07/2026), botão "Pagar com Multicaixa Express"

### 4. Faixa AGT (fundo verde primário)
- Headline: "As tuas faturas chegam sozinhas."
- Texto sobre autorização de acesso à AGT, revogável
- Badge: "com dados da AGT, mediante consentimento"
- **Painel direito:** cartão translúcido com ponto verde pulsante "A receber em tempo real" + 3 faturas a cair em cascata (ENDE, ELISAL, TV Cabo) com badge "Nova"
- **3 cartões de confiança** (Seguro / Com consentimento / Revogável) com selos dourados em forma de rosácea que aparecem com pop elástico

### 5. Problema (fundo claro)
- Título: "Hoje, gerir as tuas contas é uma dor de cabeça."
- 3 cartões com barra lateral (muda para verde no hover, texto avança 4px):
  - Faturas espalhadas (ícone vermelho)
  - Prazos que passam
  - Referências à mão

### 6. Como funciona (fundo branco, id="como-funciona")
- Título: "Quatro passos e estás a usar."
- Linha conectora horizontal (desktop) que cresce de 0→80% em 1.5s, gradiente verde→dourado
- 4 passos com círculos verdes que saltam (escala 0.4→1.12→1) em tempos escalonados:
  1. Liga a AGT ou tira foto
  2. Recebe o aviso
  3. Paga por Multicaixa Express
  4. A app concilia

### 7. Faixa IRPS (fundo dourado-suave, id="irps")
- Etiqueta: "IRPS 2027"
- Headline: "A partir de 2027, guardar a fatura vale dinheiro."
- Explicação do novo IRPS (deduções de saúde, educação, renda) — só contam faturas com NIF
- Nota legal sobre entrada em vigor (1 jan 2027, primeira declaração 2028)
- **TalaoCard dourado** rodado -3°: "Dedutível no IRPS", montante "128.400 Kz" (contador animado), tags Saúde/Educação/Renda

### 8. Funcionalidades (fundo claro)
- Título: "Tudo o que precisas para gerir o teu dinheiro."
- Grelha 3×2 de cartões com hover (sobe 5px + sombra):
  - Faturas da AGT, Leitura por foto, Orçamento por categoria, Metas de poupança, Assistente de IA, Avisos por WhatsApp

### 9. Preços (fundo branco, id="precos")
- Título: "Começa grátis. Subscreve quando precisares."
- 2 planos lado a lado:
  - **Gratuito** (0 Kz): registo de despesas, orçamento, faturas AGT, 10 faturas manuais/mês
  - **Premium** (2.500 Kz/mês, destacado com borda verde + badge "Recomendado"): IA sem limites, relatórios, alertas, faturas ilimitadas
- Montantes em mono, separador de milhares português (espaço)

### 10. Confiança (fundo claro)
- Título: "A Gestão+ nunca recebe o teu dinheiro."
- 3 pilares centrados: pagamento seguro EMIS, Lei 22/11, dados fiscais revogáveis

### 11. CTA Final (fundo branco)
- Headline: "Começa a guardar as tuas faturas hoje."
- Subtexto sobre 2027→2028
- Botão grande: "Criar conta grátis →"

### 12. Rodapé (fundo tinta escuro)
- 4 colunas: marca/descrição, Produto, Legal (Termos, Privacidade, Lei 22/11), Contactos
- Linha inferior: © 2026 + nota de pagamento seguro EMIS e Lei 22/11

## Sistema de animação

### Revelação no scroll
- IntersectionObserver (threshold 0.16, rootMargin 60px)
- 4 variantes: `reveal-up` (24px), `reveal-left` (-26px), `reveal-right` (+26px), `reveal-scale` (0.955)
- Duração 0.75s, curva `cubic-bezier(.22,.68,.3,1)`
- Atrasos escalonados de 0.09s

### Animações específicas
| Elemento | Animação | Duração/Atraso |
|---|---|---|
| Telemóvel (hero) | Entrada: translateY(38px)+rotate(1.5°) → 0 | 1s |
| Talão (hero) | Entrada: scale(0.94) → 1 | 0.75s, atraso 0.5s |
| Talão (hero) | Flutuação: ±11px | 5.5s, ciclo infinito, atraso 1.25s |
| Ponto pulsante (AGT) | Anel escala 1→2.75, opacidade 0.8→0 | 2s infinito |
| Linha dos passos | width 0→80% | 1.5s, atraso 0.25s |
| Círculos dos passos | scale(0.4)→1.12→1 | 0.6s, atrasos 0.3/0.62/0.94/1.26s |
| Faturas AGT | translateY(14px)→0 + opacidade | 0.75s, atrasos 0.3/1.0/1.7s |
| Selos rosácea | scale(0)rotate(-40°)→1.18 rotate(4°)→1 | 0.55s, atraso 0.95s |
| Contadores | requestAnimationFrame, desaceleração cúbica | 1.4s |

### Interações de hover
- Cartões: translateY(-5px) + sombra intensificada (0.3s)
- Botões primários: translateY(-2px) + sombra verde (0.3s)
- Botões dourados: translateY(-2px) + sombra dourada
- Cartões de problema: barra lateral → verde, texto avança 4px

### Acessibilidade
- `prefers-reduced-motion: reduce` desliga TODAS as animações:
  - Elementos de revelação ficam visíveis (opacity 1, transform none)
  - Flutuação, pulso, saltos, quedas, rosáceas = animação none
  - Linha dos passos = 80% estático
  - Barra de progresso = display none
  - Hover transforms = none
  - Contadores mostram valor final imediatamente
- Foco do teclado visível em todos os elementos interativos (contorno dourado)

## Tom e linguagem
- Português de Angola
- Nomenclatura monetária: Kz (AOA)
- Tom: sóbrio, confiante, direto — sem efeitos divertidos nem excessos
- Foco em utilidade prática e conformidade fiscal