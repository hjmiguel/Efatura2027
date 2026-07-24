import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';

const SYSTEM_PROMPT = `És o assistente financeiro do Gestão+, uma aplicação de finanças pessoais para Angola.

REGRAS OBRIGATÓRIAS:
1. Fala em português de Angola, de forma direta e prática.
2. Trata o utilizador pelo primeiro nome quando apropriado.
3. NUNCA inventes valores — só podes citar números que estão nos dados fornecidos abaixo. Se não tens a informação, diz claramente "não tenho essa informação nos teus registos".
4. NUNCA afirmes quanto o utilizador vai poupar em imposto. Podes mencionar que certas despesas são dedutíveis, mas sem prometer valores de poupança fiscal.
5. Quando citares um valor, indica a fonte (ex: "segundo as tuas faturas...", "nas tuas transações...").
6. Não dês conselhos de investimento nem recomendações sobre produtos financeiros específicos.
7. Mantém as respostas curtas e objetivas, exceto se o utilizador pedir detalhe.
8. Todos os valores monetários estão em kwanza (Kz).
9. Se o utilizador perguntar sobre algo que não está nos dados, explica que só tens acesso aos dados financeiros dele na aplicação.

POSTURA: NAVEGADOR, NÃO DIRETOR FINANCEIRO
10. Informas e antecipas, mas NUNCA mandas nem ralhas. Descreves a situação e as consequências de forma factual.
11. NUNCA uses linguagem imperativa ou prescritiva. Proibido: "deves", "devias", "não gastes", "tens de", "devias cortar", "precisas de poupar".
12. Usa linguagem descritiva: "vais pagar 816 145 Kz este mês", "faltam 568 845 Kz para cobrir os compromissos".
13. Se o utilizador não consegue pagar algo, limita-te a registar a informação sem insistir nem repetir o alerta. Nunca prescrevas o que fazer.
14. NUNCA julgues as decisões de gasto do utilizador. Se ele gastou muito, mostra o facto; não comentes se foi bem ou mal.
15. Se o utilizador pedir "conselhos", oferece padrões e factos dos dados dele (ex: "gastaste 45 000 Kz em restaurantes este mês, contra 12 000 Kz no mês passado"), nunca prescrições.

FUNCIONALIDADES:
- Resumo mensal de gastos
- Alerta de faturas a vencer (descritivo: "vence amanhã", não "paga já")
- Identificação de padrões de gasto (factos, não prescrições)
- Insights de orçamento (ex: "já usaste 80% do limite de alimentação")
- Ajuda com categorização de despesas`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Mensagem inválida' }, { status: 400 });
    }

    // Load all user's financial data
    const [accounts, transactions, invoices, categories, dependents] = await Promise.all([
      base44.entities.Account.list(),
      base44.entities.Transaction.list('-date', 100),
      base44.entities.Invoice.list(),
      base44.entities.Category.list(),
      base44.entities.Dependent.list()
    ]);

    // Build structured context with real numbers
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Monthly summary
    const monthTxns = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthIncome = monthTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const monthExpense = monthTxns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    // Category breakdown for current month
    const categoryMap = {};
    for (const t of monthTxns.filter(t => t.amount < 0)) {
      const cat = categories.find(c => c.id === t.category_id);
      const catName = cat?.name || 'Sem categoria';
      categoryMap[catName] = (categoryMap[catName] || 0) + Math.abs(t.amount);
    }

    // Deductibles
    const deductibleInvoices = invoices.filter(
      i => i.deductible_type && i.deductible_type !== 'none' && i.has_nif !== false && i.status === 'paid'
    );
    const deductibleByType = {};
    for (const inv of deductibleInvoices) {
      deductibleByType[inv.deductible_type] = (deductibleByType[inv.deductible_type] || 0) + (inv.amount || 0);
    }
    const deductibleTotal = deductibleInvoices.reduce((s, i) => s + (i.amount || 0), 0);

    // Pending invoices
    const pendingInvoices = invoices
      .filter(i => i.status === 'pending' || i.status === 'overdue')
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 10)
      .map(i => ({
        emissor: i.issuer_name,
        montante: i.amount,
        vencimento: i.due_date,
        estado: i.status,
        entidade: i.entity || null,
        referencia: i.reference || null,
        dias_restantes: Math.ceil((new Date(i.due_date) - now) / (1000 * 60 * 60 * 24))
      }));

    // Accounts summary
    const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const accountsSummary = accounts.map(a => ({
      nome: a.name,
      banco: a.bank_name,
      saldo: a.balance,
      tipo: a.type
    }));

    // Recent transactions (last 15)
    const recentTxns = transactions.slice(0, 15).map(t => ({
      descricao: t.description,
      montante: t.amount,
      data: t.date,
      tipo: t.type,
      categoria: categories.find(c => c.id === t.category_id)?.name || 'Sem categoria'
    }));

    const firstName = (user.full_name || 'utilizador').trim().split(' ')[0];

    const contextData = `DADOS DO UTILIZADOR (${firstName}):
Data atual: ${now.toISOString().split('T')[0]}

CONTAS:
Total: ${totalBalance.toFixed(2)} Kz
${accountsSummary.map(a => `- ${a.nome} (${a.banco}, ${a.tipo}): ${a.saldo.toFixed(2)} Kz`).join('\n') || 'Nenhuma conta registada.'}

RESUMO DO MÊS ATUAL:
Receitas: ${monthIncome.toFixed(2)} Kz
Despesas: ${monthExpense.toFixed(2)} Kz
Saldo: ${(monthIncome - monthExpense).toFixed(2)} Kz

DESPESAS POR CATEGORIA (mês atual):
${Object.entries(categoryMap).map(([cat, val]) => `- ${cat}: ${val.toFixed(2)} Kz`).join('\n') || 'Nenhuma despesa este mês.'}

FATURAS PENDENTES (próximas a vencer):
${pendingInvoices.map(i => `- ${i.emissor}: ${i.montante.toFixed(2)} Kz (vence ${i.vencimento}, ${i.dias_restantes} dias) [${i.estado}]`).join('\n') || 'Nenhuma fatura pendente.'}

DEDUTÍVEIS IRPS (acumulado anual, faturas pagas com NIF):
Total: ${deductibleTotal.toFixed(2)} Kz
${Object.entries(deductibleByType).map(([type, val]) => `- ${type}: ${val.toFixed(2)} Kz`).join('\n') || 'Nenhuma despesa dedutível registada.'}

DEPENDENTES: ${dependents.length} ${dependents.length > 0 ? '(' + dependents.map(d => d.name).join(', ') + ')' : ''}

TRANSAÇÕES RECENTES:
${recentTxns.map(t => `- ${t.data} | ${t.descricao} | ${t.montante.toFixed(2)} Kz | ${t.categoria}`).join('\n') || 'Nenhuma transação registada.'}`;

    // Build conversation messages
    const conversationMessages = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + contextData }
    ];

    // Add history (last 10 messages)
    if (history && Array.isArray(history)) {
      for (const h of history.slice(-10)) {
        conversationMessages.push({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: h.content
        });
      }
    }

    conversationMessages.push({ role: 'user', content: message });

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: conversationMessages.map(m => `[${m.role}] ${m.content}`).join('\n\n'),
      response_json_schema: {
        type: 'object',
        properties: {
          resposta: { type: 'string', description: 'Resposta do assistente em português de Angola' },
          fonte_dados: { type: 'string', description: 'Breve indicação de que dados foram usados (ex: "transações", "faturas", "contas")' }
        },
        required: ['resposta']
      }
    });

    return Response.json({
      response: llmResponse.resposta || llmResponse,
      source: llmResponse.fonte_dados || null,
      timestamp: now.toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});