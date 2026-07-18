# Prompt — Landing Page Gestão+

**Versão:** 2.0
**Data:** 19 de julho de 2026
**Referência construída:** Gestao-Mais-Angola-Landing-v1.1.html

## Identidade do produto

Aplicação de finanças pessoais para Angola. Organiza faturas, pagamentos por Multicaixa Express e preparação para o IRPS de 2027. Sem intermediação financeira, o utilizador paga diretamente e a app organiza. Conformidade com a Lei 22/11 na proteção de dados, e NIF como condição para a dedução fiscal.

---

## Sistema de design

### Cores

Usa exatamente estes valores. São os tokens da aplicação e não podem divergir, senão a marca parte-se entre o site e o produto.

| Uso | Valor |
|-----|-------|
| Fundo principal | #EAEEEC |
| Superfícies e cartões | #FFFFFF |
| Primário, verde da marca | #0E5C4A |
| Primário 2, gradientes e hover | #12715C |
| Ouro, accent | #E8A23D |
| Ouro suave, fundos | #F6E2BC |
| Tinta, texto escuro | #10211C |
| Linha, bordas | #E2E8E4 |
| Perigo | #D2483B, fundo suave #F7E0DC |
| Verde positivo | #1C8A6A, fundo suave #DCF0E6 |
| Azul, só Multicaixa | #3a64a8 |
| Texto secundário | #6B7A74 |
| Texto discreto | #93A099 |

### Regra da cor

O verde é o dinheiro que a pessoa já controla. O ouro é o dinheiro que ela pode recuperar. Tudo o que fala de dedução no IRPS é dourado, nunca verde. O vermelho usa-se pouco, só para problemas. O azul fica reservado ao Multicaixa Express.

### Tipografia

Space Grotesk para títulos e botões, com tracking apertado.
Inter para o corpo, antialiased.
JetBrains Mono para montantes, IBAN e referências, com `font-variant-numeric: tabular-nums`.

### Forma e sombra

Raio de 18 px nos cartões e no talão, 12 px nos botões.
Sombras em três níveis: subtil, média e profunda. A base é `0 8px 24px -12px rgba(16,33,28,.28)`.
Foco do teclado com contorno dourado de 2 px, afastado 3 px.

### Elemento de assinatura: o talão

Cartão no formato de recibo, com:
- Cabeçalho colorido, verde primário ou dourado.
- Borda superior serrilhada, feita com máscara CSS de recortes semicirculares.
- Linha de perfuração tracejada, com entalhes circulares nas extremidades.
- Corpo com campos de chave e valor.
- Campos copiáveis para entidade e referência, com retorno visual ao copiar.

---

## Estrutura da página

### 1. Barra de progresso do scroll
Fixa no topo, 3 px, gradiente verde para dourado, z-index 100. A largura acompanha a percentagem percorrida. Escondida com `prefers-reduced-motion`.

### 2. Navbar, fixa
Logótipo G+ num quadrado verde, com recorte serrilhado dourado no topo do quadrado, e a palavra Gestão+.
Ligações: Como funciona, IRPS, Preços.
Ações: Entrar em texto, Criar conta em botão verde.
No telemóvel, menu de hambúrguer colapsável. Abaixo de 420 px, esconde o botão Entrar.
Fundo translúcido com desfoque ao rolar.

### 3. Hero

Lado esquerdo:
- Crachá em pílula verde suave: "Feito para Angola".
- Título: "O teu dinheiro, em dia."
- Subtítulo: "Junta as tuas faturas, paga por Multicaixa Express e sabe sempre quanto te sobra. Feito para Angola."
- Botões: "Criar conta grátis" a verde, e "Ver como funciona" em branco com borda.
- Texto pequeno: "Grátis para começar. Sem cartão de crédito."

Lado direito:
- Telemóvel escuro com ecrã de painel. Cumprimento "Olá, Samara", cartão verde com "Disponível" e 247.300 Kz em contador animado, cartão dourado com "Dedutível no IRPS" e 128.400 Kz em contador animado, lista de três faturas com estados, e barra inferior.
- Talão sobreposto ao telemóvel, rodado 6 graus. Cabeçalho verde ENDE, montante 18.450 Kz, campos copiáveis Entidade 00556 e Referência 123 456 789, vencimento 30/07/2026, e botão "Pagar com Multicaixa Express".

### 4. Faixa AGT, fundo verde primário

Título: "As tuas faturas chegam sozinhas."
Texto: "Com a tua autorização, a Gestão+ mostra as faturas eletrónicas emitidas sob o teu NIF. Sem tirar foto, sem digitar. Tu autorizas, e podes revogar quando quiseres."
Crachá: "com dados da AGT, mediante consentimento".

Painel direito, cartão translúcido:
- Ponto verde pulsante com "A receber em tempo real".
- Três faturas a cair em cascata, cada uma com o seu selo.

**Os dois selos, e isto é o mais importante desta secção.**

A AGT distingue faturas emitidas de faturas pagas, e o site tem de mostrar essa diferença. O selo é uma rosácea de doze pontas com um visto dentro, em dois estados:

- **Emitida**, rosácea desenhada só a contorno. Significa que a fatura está registada sob o NIF e já conta para a dedução do IRPS. Não significa que foi paga.
- **Paga**, rosácea preenchida. Significa que a AGT confirmou a liquidação.

Aplica assim nas três faturas do painel: Escola Portuguesa com selo Emitida, Clínica Sagrada Esperança com selo Paga, ENDE com selo Emitida.

Por baixo, uma legenda curta com os dois selos e o que cada um quer dizer. Sem esta legenda o utilizador não percebe a diferença, e a diferença é o argumento.

Não uses a rosácea como enfeite noutros sítios. Ela tem significado fiscal e perde força se virar decoração.

### 5. Faixa de números, quatro colunas sobre fundo claro

| Número | Legenda |
|--------|---------|
| 261 | softwares certificados pela AGT que já emitem fatura eletrónica |
| 2027 | ano em que o IRPS entra em vigor, com deduções |
| 3 min | para ligares a AGT e veres as tuas faturas |
| 0 Kz | para começar. O plano gratuito não expira |

Números grandes em JetBrains Mono, a verde. Todos com contador animado.

### 6. Problema, fundo claro

Título: "Hoje, gerir as tuas contas é uma dor de cabeça."
Três cartões com barra lateral vermelha fina:
- Faturas espalhadas por papel, email e WhatsApp. Quando precisas, não encontras.
- Prazos que passam. Ninguém te avisa. Descobres quando chega a multa.
- Referências à mão. Copiar dezoito dígitos e depois perder o comprovativo.

No hover, a barra passa a verde e o texto avança 4 px.

### 7. Como funciona, fundo branco, id="como-funciona"

Título: "Quatro passos e estás a usar."
Linha conectora horizontal no desktop, que cresce de 0 a 80 por cento, com gradiente verde para dourado.
Quatro passos com círculos verdes que saltam em tempos escalonados:

1. **Liga a AGT e as empresas.** As faturas eletrónicas chegam sozinhas. As empresas ligadas enviam com a referência de pagamento. As de papel entram por foto.
2. **Recebe o aviso.** Antes do prazo, na app e por WhatsApp.
3. **Paga por Multicaixa Express.** Direto nas empresas ligadas, com a referência que elas enviaram.
4. **A app concilia.** A fatura fica como paga, sem tratares de comprovativos.

Nota sobre as três fontes, para não se perder: a AGT verifica que a fatura existe sob o teu NIF, as empresas dão a referência que permite pagar, e a foto cobre o que ainda é papel. São papéis diferentes e complementares. Só a empresa tem a referência de pagamento, por isso o canal das empresas não pode desaparecer da mensagem.

### 8. Demonstração das faturas a chegar, duas colunas

Coluna esquerda:
- Etiqueta: "Sem esforço".
- Título: "As faturas entram sozinhas."
- Texto: "Ligas a AGT e as empresas uma vez. A partir daí, as faturas aparecem aqui sozinhas e já classificadas. As de saúde e educação ficam marcadas como dedutíveis, e as das empresas ligadas trazem a referência para pagares num toque."
- Linha com ponto verde pulsante: "A receber em tempo real".

Coluna direita, cartão branco com cabeçalho "A CHEGAR AGORA" e três linhas:
- ENDE, Energia junho, 18.450, fundo branco.
- Clínica Sagrada Esperança, Saúde dedutível no IRPS, 22.400, fundo dourado suave.
- Escola Portuguesa, Educação dedutível no IRPS, 96.000, fundo dourado suave.

As linhas caem com intervalo largo entre si, para parecer que estão mesmo a chegar.

### 9. Faixa IRPS, fundo dourado suave, id="irps"

Etiqueta: "IRPS 2027".
Título: "A partir de 2027, guardar a fatura vale dinheiro."
Texto: "O novo IRPS deixa deduzir despesas de saúde, educação e renda de habitação. Mas só contam as faturas com o teu NIF. A Gestão+ guarda-as por ti e avisa quando falta o NIF."
Nota legal: "O IRPS entra em vigor a 1 de janeiro de 2027. A primeira declaração é entregue em 2028, sobre as despesas de 2027."

Talão dourado, rodado menos 3 graus: "Dedutível no IRPS", 128.400 Kz em contador animado, pílulas de Saúde 22.400, Educação 96.000 e Renda 10.000, e um aviso "2 faturas sem o teu NIF. Sem NIF não contam para a dedução."

**Regra que não se viola:** não prometas valores de poupança. Enquanto os limites de dedução não forem publicados em Diário da República, a página fala da funcionalidade, nunca do valor que se poupa.

### 10. Funcionalidades, fundo claro

Título: "Tudo o que precisas para gerir o teu dinheiro."
Grelha de três por dois, com hover que sobe 5 px e intensifica a sombra:
- Faturas verificadas pela AGT, com a tua autorização.
- Faturas das empresas ligadas, já com a referência de pagamento.
- Leitura por foto, para o que ainda é papel.
- Orçamento por categoria.
- Metas de poupança.
- Assistente, que responde com os teus dados.

### 11. Preços, fundo branco, id="precos"

Título: "Começa grátis. Subscreve quando precisares."
Gratuito, 0 Kz: registo de despesas, orçamento, faturas da AGT, até 10 faturas manuais por mês.
Premium, 2.500 Kz por mês, destacado com borda verde e crachá "Recomendado": assistente sem limites, relatórios, alertas proativos, faturas ilimitadas.
Montantes em mono, com separador de milhares português, que é o espaço.

### 12. Confiança, fundo claro

Título: "A Gestão+ nunca recebe o teu dinheiro."
Três pilares centrados: pagamento seguro pela EMIS, proteção de dados ao abrigo da Lei 22/11, e dados fiscais acedidos com autorização revogável.

### 13. Perguntas frequentes, acordeão, largura máxima 760 px

Título: "O que costumam perguntar."
Só uma aberta de cada vez. O sinal de mais roda 45 graus ao abrir.

**A Gestão+ fica com o meu dinheiro?**
Não. A app nunca recebe nem reencaminha dinheiro. Quando pagas por Multicaixa Express, o pagamento vai direto da tua conta para a empresa, pela rede da EMIS. A app organiza e regista, nada mais.

**Como é que a app vê as minhas faturas da AGT?**
Só com a tua autorização expressa, dada dentro da app. Autorizas a consulta das faturas emitidas sob o teu NIF, e podes revogar quando quiseres, no separador Empresas. Sem autorização, não há acesso.

**Quanto vou poupar no IRPS?**
Não damos esse número, e desconfia de quem der. Os limites de dedução só ficam fechados com a publicação em Diário da República. O que a app faz é somar as tuas despesas dedutíveis e garantir que as faturas têm o teu NIF, que é a condição para contarem.

**Preciso de instalar alguma coisa?**
Não. A Gestão+ abre no navegador e podes instalá-la no ecrã inicial do telemóvel com um toque. Funciona também com rede fraca, porque guarda o essencial no aparelho.

**E as faturas de papel?**
Tiras foto e a app lê o emissor, o montante e o prazo. Serve para o que ainda não é eletrónico, e para os pequenos comerciantes que ainda não emitem fatura eletrónica.

### 14. Chamada final, fundo branco

Título: "Começa a guardar as tuas faturas hoje."
Subtexto: "As despesas de 2027 contam para a declaração de 2028. Quanto mais cedo começas, mais organizas."
Botão grande: "Criar conta grátis".

### 15. Rodapé, fundo tinta escuro

Quatro colunas: marca e descrição, Produto, Legal com termos, privacidade e Lei 22/11, e Contactos.
Linha inferior: "Btouch, Consultoria e Serviço, Lda · NIF 5002234173 · Luanda, Angola" e "© 2026 Gestão+", com nota de pagamento seguro pela EMIS.

---

## Sistema de animação

### Revelação no scroll

IntersectionObserver com limiar de 0,16 e margem inferior de 60 px. Cada elemento anima uma vez e deixa de ser observado.
Quatro variantes: para cima com 24 px, da esquerda com menos 26 px, da direita com mais 26 px, e escala 0,955.
Duração 0,75 s, curva `cubic-bezier(.22,.68,.3,1)`, atrasos escalonados de 0,09 s até seis níveis.

### Animações específicas

| Elemento | Animação | Duração e atraso |
|---|---|---|
| Telemóvel no hero | translateY(38px) e rotate(1.5°) para zero | 1 s |
| Talão no hero | scale(0.94) para 1 | 0,75 s, atraso 0,5 s |
| Talão no hero | flutuação de 11 px | 5,5 s, infinito, atraso 1,25 s |
| Ponto pulsante | anel de escala 1 para 2,75 e opacidade 0,8 para 0 | 2 s, infinito |
| Linha dos passos | largura 0 para 80% | 1,5 s, atraso 0,25 s |
| Círculos dos passos | scale(0.4) para 1,12 para 1 | 0,6 s, atrasos 0,3, 0,62, 0,94 e 1,26 s |
| Faturas da AGT | translateY(14px) e opacidade | 0,75 s, atrasos 0,3, 1,0 e 1,7 s |
| Selos rosácea | scale(0) e rotate(-40°) para 1,18 e rotate(4°) para 1 | 0,55 s, atraso 0,95 s |
| Contadores | requestAnimationFrame com desaceleração cúbica | 1,4 s |

Contadores a aplicar: os quatro da faixa de números, o disponível no telemóvel, o dedutível dentro do telemóvel, e o dedutível do talão dourado do IRPS. Formata com separador português, portanto 128 400 e não 128,400.

### Interações de hover

Cartões sobem 5 px e intensificam a sombra, em 0,3 s.
Botões primários sobem 2 px e ganham sombra verde. Botões dourados ganham sombra dourada.
Cartões do problema mudam a barra lateral para verde e avançam o texto 4 px.

### Acessibilidade

Com `prefers-reduced-motion: reduce`, desliga todas as animações:
- Elementos de revelação ficam visíveis, com opacidade 1 e sem transformação.
- Flutuação, pulso, saltos, quedas e rosáceas passam a `animation: none`.
- A linha dos passos fica estática a 80 por cento.
- A barra de progresso passa a `display: none`.
- Os hover deixam de transformar.
- Os contadores mostram o valor final de imediato.

Isto tem de funcionar mesmo, não é decorativo.
Foco do teclado visível em todos os elementos interativos, com contorno dourado.

### Responsividade

Abaixo de 960 px, todas as grelhas passam a uma coluna e o talão deixa de estar sobreposto, ficando por baixo do telemóvel.
Abaixo de 420 px, esconde o botão Entrar e reduz o título do hero.
O `html` e o `body` levam `overflow-x: hidden`, porque as animações que deslocam na horizontal criam barra lateral sem isso.

---

## Tom e linguagem

Português de Portugal, na variante usada em Angola. Trata a pessoa por tu.
Montantes sempre em Kz, com separador de milhares em espaço.
Tom sóbrio, confiante e direto. Sem efeitos divertidos e sem exageros de marketing. Numa aplicação de dinheiro, a animação serve para revelar conteúdo e dar confiança, não para entreter.
Não uses travessões longos. Não uses ponto e vírgula nos textos de interface.

---

## O que mudou face à versão anterior

1. **Verde primário corrigido** para #0E5C4A. A versão anterior trazia #1a624f, que não é a cor da marca. O site e a aplicação têm de usar o mesmo verde.
2. **Vermelho corrigido** para #D2483B.
3. **Selos da AGT com significado.** Passam a ter dois estados, emitida em contorno e paga em cheio, com legenda. Na versão anterior a rosácea era decoração nos cartões de confiança, o que desperdiçava o conceito e podia induzir em erro.
4. **Acrescentada a faixa de números**, quatro dados que dão contexto ao mercado.
5. **Acrescentadas as perguntas frequentes**, cinco, incluindo a resposta honesta sobre quanto se poupa.
6. **Acrescentada a secção de demonstração** das faturas a chegar.
7. **Acrescentada a regra** de não prometer valores de poupança fiscal.
8. **Acrescentado** o `overflow-x: hidden`, sem o qual as animações laterais criam barra de deslocamento no telemóvel.
9. **Três fontes em vez de duas.** O primeiro passo passa a nomear a AGT, as empresas e a foto. Só a empresa tem a referência de pagamento, portanto omitir esse canal deixava a promessa de pagar por Multicaixa Express sem explicação de onde vem o número.