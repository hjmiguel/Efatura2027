import { callGemini, corsHeaders, getUser, json, schemaHint } from '../_shared/common.ts';

const SCHEMA = {
  type: 'object',
  properties: {
    issuer_name: { type: 'string' },
    issuer_nif: { type: 'string' },
    document_number: { type: 'string' },
    amount: { type: 'number' },
    issue_date: { type: 'string' },
    due_date: { type: 'string' },
    entity: { type: 'string' },
    reference: { type: 'string' },
    iban: { type: 'string' },
    has_nif: { type: 'boolean' },
    deductible_type: { type: 'string' },
  },
};

const PROMPT =
  'Extrai os dados desta fatura angolana. Devolve JSON com: issuer_name, issuer_nif, document_number, amount (numérico em kwanza), issue_date (YYYY-MM-DD), due_date, entity (Multicaixa), reference (Multicaixa), iban, has_nif (boolean), deductible_type (um de: none, saude, educacao, habitacao, pensao_alimentos, previdencia — classifica com base no emitente: farmácias/clínicas=saude, escolas/universidades=educacao, seguradoras/previdência=previdencia, etc.). Se um campo não existir, usa null.';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (!(await getUser(req))) return json({ error: 'Não autorizado' }, 401);
    const { image_base64, mime_type } = await req.json();
    if (!image_base64) return json({ error: 'image_base64 é obrigatório' }, 400);
    const data = image_base64.includes(',') ? image_base64.split(',')[1] : image_base64;

    const result = await callGemini(
      [{ text: PROMPT + schemaHint(SCHEMA) }, { inline_data: { mime_type: mime_type || 'image/jpeg', data } }],
      SCHEMA,
    );
    return json(result);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});