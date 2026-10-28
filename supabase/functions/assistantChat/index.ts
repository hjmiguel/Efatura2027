import { callGemini, corsHeaders, getUser, json, listEntity, schemaHint } from '../_shared/common.ts';

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
15. Se o utilizador pedir "conselhos", oferece padrões e factos dos dados dele, nunca prescrições.

FUNCIONALIDADES:
- Resumo mensal de gastos
- Alerta de faturas a vencer (descritivo: "vence amanhã", não "paga já")
- Identificação de padrões de gasto (factos, não prescrições)
- Insights de orçamento
- Ajuda com categorização de despesas`;

const SCHEMA = {
  type: 'object',
  properties: {
    resposta: { type: 'string' },
    fonte_dados: { type: 'string' },
  },
  required: ['resposta'],
};

const kz = (n: number) => (n || 0).toFixed(2);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const user = await getUser(req);
    if (!user) return json({ error: 'Não autorizado' }, 401);

    const { message, history } = await req.json();
    if (!message || typeof message !== 'string') return json({ error: 'Mensagem inválida' }, 400);

    const [accounts, allTxns, invoices, categories, dependents] = await Promise.all([
      listEntity(req, 'Account'),
      listEntity(req, 'Transaction'),
      listEntity(req, 'Invoice'),
      listEntity(req, 'Category'),
      listEntity(req, 'Dependent'),
    ]);
    const transactions = allTxns.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 100);

    const now = new Date();
    const catName = (id: string) => categories.find((c) => c.id === id)?.name || 'Sem categoria';

    const monthTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthIncome = monthTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const monthExpense = monthTxns.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    const byCategory: Record<string, number> = {};
    for (const t of monthTxns.filter((t) => t.amount < 0)) {
      const n = catName(t.category_id);
      byCategory[n] = (byCategory[n] || 0) + Math.abs(t.amount);
    }

    const deductible = invoices.filter(
      (i) => i.deductible_type && i.deductible_type !== 'none' && i.has_nif !== false && i.status === 'paid',
    );
    const byType: Record<string, number> = {};
    for (const i of deductible) byType[i.deductible_type] = (byType[i.deductible_type] || 0) + (i.amount || 0);
    const deductibleTotal = deductible.reduce((s, i) => s + (i.amount || 0), 0);

    const pending = invoices
      .filter((i) => i.status === 'pending' || i.status === 'overdue')
      .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))
      .slice(0, 10);

    const firstName = (user.user_metadata?.full_name || 'utilizador').trim().split(' ')[0];
    const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

    const context = `DADOS DO UTILIZADOR (${firstName}):
Data atual: ${now.toISOString().split('T')[0]}

CONTAS:
Total: ${kz(totalBalance)} Kz
${accounts.map((a) => `- ${a.name} (${a.bank_name}, ${a.type}): ${kz(a.balance)} Kz`).join('\n') || 'Nenhuma conta registada.'}

RESUMO DO MÊS ATUAL:
Receitas: ${kz(monthIncome)} Kz
Despesas: ${kz(monthExpense)} Kz
Saldo: ${kz(monthIncome - monthExpense)} Kz

DESPESAS POR CATEGORIA (mês atual):
${Object.entries(byCategory).map(([c, v]) => `- ${c}: ${kz(v)} Kz`).join('\n') || 'Nenhuma despesa este mês.'}

FATURAS PENDENTES:
${pending.map((i) => `- ${i.issuer_name}: ${kz(i.amount)} Kz (vence ${i.due_date}, ${Math.ceil((new Date(i.due_date).getTime() - now.getTime()) / 86400000)} dias) [${i.status}]`).join('\n') || 'Nenhuma fatura pendente.'}

DEDUTÍVEIS IRPS (faturas pagas com NIF):
Total: ${kz(deductibleTotal)} Kz
${Object.entries(byType).map(([t, v]) => `- ${t}: ${kz(v)} Kz`).join('\n') || 'Nenhuma despesa dedutível registada.'}

DEPENDENTES: ${dependents.length}${dependents.length ? ' (' + dependents.map((d) => d.name).join(', ') + ')' : ''}

TRANSAÇÕES RECENTES:
${transactions.slice(0, 15).map((t) => `- ${t.date} | ${t.description} | ${kz(t.amount)} Kz | ${catName(t.category_id)}`).join('\n') || 'Nenhuma transação registada.'}`;

    const messages = [{ role: 'system', content: SYSTEM_PROMPT + '\n\n' + context }];
    if (Array.isArray(history)) {
      for (const h of history.slice(-10)) {
        messages.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content });
      }
    }
    messages.push({ role: 'user', content: message });

    const prompt = messages.map((m) => `[${m.role}] ${m.content}`).join('\n\n') + schemaHint(SCHEMA);
    const out = await callGemini([{ text: prompt }], SCHEMA);

    return json({ response: out.resposta ?? out, source: out.fonte_dados ?? null, timestamp: now.toISOString() });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});