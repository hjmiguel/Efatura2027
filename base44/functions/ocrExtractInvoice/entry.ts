import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

function base64ToBytes(base64) {
  const clean = base64.includes(',') ? base64.split(',')[1] : base64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { image_base64, mime_type, file_name } = body;
    if (!image_base64) {
      return Response.json({ error: 'image_base64 é obrigatório' }, { status: 400 });
    }

    const bytes = base64ToBytes(image_base64);
    const file = new File([bytes], file_name || 'fatura.jpg', { type: mime_type || 'image/jpeg' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadPublicFile({ file });

    const extracted = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: 'Extrai os dados desta fatura angolana. Devolve JSON com: issuer_name, issuer_nif, document_number, amount (numérico em kwanza), issue_date (YYYY-MM-DD), due_date, entity (Multicaixa), reference (Multicaixa), iban, has_nif (boolean), deductible_type (um de: none, saude, educacao, habitacao, pensao_alimentos, previdencia — classifica com base no emitente: farmácias/clínicas=saude, escolas/universidades=educacao, seguradoras/previdência=previdencia, etc.). Se um campo não existir, usa null.',
      file_urls: [file_url],
      response_json_schema: {
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
      },
    });

    return Response.json(extracted);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}