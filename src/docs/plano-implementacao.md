# Plano total de implementação — Gestão+

**Última atualização:** 19 de julho de 2026
**Plataforma:** Base44 (React + Vite + Tailwind + Base44 BaaS)
**Adaptação:** o documento original especifica TanStack Start + Supabase. Este plano adapta tudo à plataforma Base44: React Router em vez de file-based routing, entidades Base44 em vez de tabelas Supabase, backend functions em vez de server functions, e SDK Base44 em vez de Supabase client.

---

## Estado atual (já construído)

| Área | Estado |
|---|---|
| Landing page | Completa (15 secções, animações, talão, selos AGT) |
| Autenticação | Entrar, Registo, Termos, Privacidade |
| Entidades | Account, Transaction, Category, Invoice, Dependent, User (com NIF) |
| Layout da app | Sidebar desktop + bottom bar mobile |
| Ecrã Início | Património, contas, movimentos recentes, dedutível IRPS, agenda A pagar |
| Dados de teste | Samara: 3 contas, 12 transações, 9 faturas, 10 categorias, 2 dependentes |

---

## Fase 1 — O núcleo do utilizador (4 a 5 semanas)

O objetivo: a Samara gere as suas contas, transações e faturas manualmente, sem depender de integrações externas.

### 1.1 Transações
- Página `/app/transacoes` com tabela (desktop) e lista (mobile)
- Filtros: por conta, categoria, tipo, período
- Pesquisa por descrição
- Entrada manual de transação (modal ou página)
- Editar e eliminar transações
- Associação de transação a fatura (conciliação manual)

### 1.2 Contas
- Página de gestão de contas dentro de Transações ou separada
- Adicionar, editar e arquivar contas
- Ajuste manual de saldo
- Tipos: conta à ordem, poupança, numerário
- IBAN com formatação mono

### 1.3 Orçamento
- Página `/app/orcamento`
- Definir limite mensal por categoria
- Barras de progresso: gasto vs. limite
- Insights simples da IA (InvokeLLM): " Gastaste 80% do orçamento de alimentação a meio do mês"
- Sem cálculo de impostos

### 1.4 Dedutíveis e IRPS
- Página `/app/dedutiveis`
- Cartão dourado com total acumulado por categoria (Saúde, Educação, Habitação, Pensão de alimentos, Previdência)
- Lista de faturas dedutíveis com filtro por tipo
- Aviso de fatura sem NIF (não entra no acumulado)
- Exportação CSV
- Agregado familiar (dependentes) com adição e remoção
- Disclaimer: nenhum escalão, taxa ou limite em código

### 1.5 Perfil
- Página `/app/perfil` com quatro abas:
  - **Conta:** nome, email, telemóvel, NIF (com nota sobre dedução)
  - **Segurança:** alterar palavra-passe, PIN, biometria (placeholder), sessões e dispositivos
  - **Dependentes:** agregar familiar para deduções
  - **Privacidade:** exportar dados (CSV), eliminar conta com aviso

### 1.6 Documentos
- Página `/app/documentos`
- Upload de fatura por foto ou ficheiro
- OCR em 4 passos: capturar, cortar, extrair (InvokeLLM com visão), revisar
- Arquivo e pesquisa de documentos
- Criar fatura a partir do documento extraído

**Critério de pronto:** a Samara fotografa uma fatura da farmácia, a aplicação lê o valor, marca como dedutível em saúde, e o acumulado anual sobe.

---

## Fase 2 — Pagamentos (4 a 5 semanas)

Depende da adesão à EMIS, que deve começar já em paralelo.

### 2.1 Pagamentos — estrutura base
- Página `/app/pagamentos` com quatro separadores:
  - **Pendente:** faturas por pagar com referência
  - **Pagos:** faturas pagas, com selo da AGT quando verificado
  - **Compromissos:** agenda de pagamentos futuros
  - **Empresas:** gestao de autorizações e consentimentos

### 2.2 Diálogo de pagamento — Referência Multicaixa Express
- Bottom sheet no mobile, diálogo no desktop
- Três estados: escolher, confirmar, pago
- Mostrar entidade e referência (copiável, mono)
- Botão "Abrir Multicaixa Express" (deep link)
- Conciliação automática por callback (webhook)

### 2.3 Diálogo de pagamento — IBAN
- Abrir app do banco ou conciliar com comprovativo
- Upload de comprovativo + 4 passos de conciliação
- Sem pagamento a um toque

### 2.4 Pagamento de RUPE
- Canal "Pagamentos ao Estado"
- Referência única de 20 dígitos
- Gera DAR, não conciliação normal
- A app não gera RUPE, paga uma já emitida pela AGT

### 2.5 Empresas e autorizações
- Separador Empresas dentro de Pagamentos
- Conector AGT em destaque no topo
- Empresas ligadas por baixo, cada uma com botão de revogar
- Consentimento explícito e revogável, com registo de quando foi dado e retirado

### 2.6 Subscrição Premium
- Modal de subscrição: 2.500 Kz/mês
- Simulação EMIS no diálogo de subscrição
- Gestão de estado da subscrição no perfil do utilizador

**Critério de pronto:** pagar a fatura da ENDE dentro da aplicação e a fatura fechar sozinha.

---

## Fase 3 — Fontes automáticas (4 semanas)

Depende da AGT e dos primeiros parceiros.

### 3.1 Selos de verificação AGT
- Componente RosetteSeal (já existe na landing) integrado na app
- Dois estados: emitida (contorno) e paga (cheia)
- Mostrar selo nas faturas verificadas

### 3.2 Deteção de duplicados
- Quando uma fatura chega por fonte diferente (AGT, parceiro, OCR)
- Correspondência por número do documento + NIF do emitente + montante
- Registo existente passa a verificado, sem criar novo

### 3.3 Deteção de divergências
- Comparar estado na app vs. estado na AGT
- Exemplo: fatura paga por transferência que AGT ainda mostra como emitida
- Ecrã de divergências com explicação

### 3.4 Situação fiscal
- Página `/app/fiscal`
- Faturas sob o NIF (feed da AGT)
- Dedutível acumulado
- Obrigações fiscais
- Ciclo de vida da fatura: emitida → paga → verificada
- Divergências detetadas

### 3.5 Feed da AGT (fase 2 do prompt original)
- Backend function que consome o feed de faturação eletrónica
- Mediante consentimento expresso e revogável
- Distinguir faturas emitidas de faturas pagas
- Conciliação automática com faturas existentes
- Independência: se o feed falhar, a app continua utilizável

### 3.6 API pública para parceiros
- Backend functions em `base44/functions/`
- Autenticação por API Key (SHA-256)
- Endpoints: emissão de faturas, consulta de estado, listagem
- Validação de consentimento do utilizador antes de criar faturas
- Webhooks MCX com validação HMAC-SHA256

**Critério de pronto:** ligar a AGT e ver aparecer catorze faturas sem escrever nada.

---

## Fase 4 — Assistente IA (2 a 3 semanas)

### 4.1 Chat do assistente
- Página `/app/assistente`
- Interface de chat com histórico
- Usa InvokeLLM com dados reais do utilizador
- Acesso a: transações, contas, faturas, orçamento, dedutíveis
- Tom: português de Angola, direto, refere-se ao utilizador pelo primeiro nome
- Nunca inventa valores — cita sempre a fonte
- Nunca afirma quanto o utilizador vai poupar em imposto

### 4.2 Funcionalidades do assistente
- Resumo mensal de gastos
- Alerta de faturas a vencer
- Sugestões de poupança (sem prometer valores fiscais)
- Ajuda com OCR e categorização
- Insights de orçamento

**Critério de pronto:** a Samara pergunta "quanto gastei com saúde este mês?" e o assistente responde com o valor exato, citando as faturas.

---

## Fase 5 — Os outros atores (por ordem de necessidade)

### 5.1 Backoffice admin (`/admin`)
- Tema escuro
- Dashboards de KPIs reais
- Gestão de utilizadores e empresas parceiras
- Acessos e papéis: matriz de permissões editável (Administrador, Operador, Suporte, Auditor)
- Trilha de auditoria imutável
- Sandbox de testes de API pública
- Ver detalhe financeiro de um utilizador exige motivo e fica registado

### 5.2 Portal de parceiros (`/parceiros`)
- Dashboard de faturas e KPIs
- Emissão manual de faturas com geração de referência MCX
- Gestão de API Keys (criação, revogação)
- Consola de testes sandbox
- Importação de faturas via CSV

### 5.3 Módulo corporativo (`/empresas`)
- Tesouraria: saldo, entradas e saídas, vencimentos, aprovações pendentes
- Contas a pagar: pagamento em lote, centro de custo por linha
- Aprovações: limite configurável (200.000 Kz por omissão)
- Fornecedores: condições e retenção na fonte de 6,5%
- Centros de custo: orçamento, gasto e restante
- Fiscal: IVA suportado, liquidado e cativo (Lei 7/19), calendário AGT
- Utilizadores: quatro perfis (Administrador, Financeiro, Aprovador, Consulta)

**Critério de pronto (backoffice):** um auditor consegue ver quem acedeu ao detalhe financeiro de cada utilizador, com motivo e data.

---

## Fase 6 — Infraestrutura, PWA e qualidade (transversal)

### 6.1 PWA
- Manifesto, service worker, prompt de instalação
- Update toast quando há nova versão
- Ícones e splash screens

### 6.2 SEO e metadados
- Titles e descriptions únicos por rota
- sitemap.xml e robots.txt
- Meta tags Open Graph e Twitter Card
- Favicon personalizado

### 6.3 Acessibilidade
- Foco de teclado visível (contorno dourado de 2px)
- prefers-reduced-motion respeitado em todas as animações
- Navegação por teclado em todos os fluxos
- Contraste de cor verificado

### 6.4 Testes automáticos
- **Aritmética:** para cada ecrã com totais, soma das parcelas = total
- **Semântica de cor:** nenhum elemento negativo usa dourado, nenhum positivo usa vermelho
- **Duplicados:** inserir a mesma fatura pelas três fontes, confirmar que fica um registo
- **Independência:** desligar o feed da AGT e confirmar que a app continua utilizável
- **Fatura sem NIF:** confirmar que não entra no acumulado dedutível e gera aviso

### 6.5 Regras de negócio garantidas no código
1. A app nunca recebe nem reencaminha dinheiro de terceiros
2. O carril GPO não se aplica a IBAN. Referência e IBAN são fluxos distintos
3. Nenhum escalão, taxa ou limite de IRPS em código
4. Não prometer valores de poupança fiscal em nenhuma cadeia de texto
5. Consentimento explícito e revogável, com registo de quando foi dado e retirado
6. Independência das fontes: se o feed da AGT falhar, a app continua
7. O selo de emitida não prova pagamento
8. Sem duplicados: correspondência por número do documento, NIF do emitente e montante
9. Auditoria imutável, que nenhum papel desativa
10. Todas as somas visíveis têm de ser verificáveis à mão

---

## Timeline resumido

| Fase | Duração | Depende de | Estado |
|---|---|---|---|
| Base + Início | 3 semanas | Nada | **Concluído** |
| 1 — Núcleo do utilizador | 4 a 5 semanas | Nada | Por iniciar |
| 2 — Pagamentos | 4 a 5 semanas | Adesão EMIS | Por iniciar |
| 3 — Fontes automáticas | 4 semanas | AGT + parceiros | Por iniciar |
| 4 — Assistente IA | 2 a 3 semanas | Fase 1 | Por iniciar |
| 5 — Outros atores | 8 a 12 semanas | Operação real | Por iniciar |
| 6 — PWA + qualidade | Transversal | Todas | Parcial (animações, acessibilidade) |

**Caminho crítico:** EMIS (sem GPO não há Premium nem receita) → Fase 1 → Fase 2 → Fase 3 (AGT) → Fase 5 (parceiros, corporativo).

**Janela do IRPS:** código aprovado 25 jun 2026, em vigor 1 jan 2027, primeira declaração 2028 sobre despesas de 2027. Lançamento ideal: setembro 2026.