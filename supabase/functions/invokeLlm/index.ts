import { bytesToBase64, callGemini, corsHeaders, getUser, json, schemaHint } from '../_shared/common.ts';

// Equivalente ao Core.InvokeLLM: prompt, response_json_schema, file_urls.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (!(await getUser(req))) return json({ error: 'Não autorizado' }, 401);
    const { prompt, response_json_schema, file_urls } = await req.json();
    if (!prompt) return json({ error: 'prompt é obrigatório' }, 400);

    const parts: unknown[] = [{ text: response_json_schema ? prompt + schemaHint(response_json_schema) : prompt }];
    const urls = Array.isArray(file_urls) ? file_urls : file_urls ? [file_urls] : [];
    for (const url of urls) {
      const r = await fetch(url);
      if (!r.ok) throw new Error('Não foi possível ler o ficheiro');
      const mime = r.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
      parts.push({ inline_data: { mime_type: mime, data: bytesToBase64(new Uint8Array(await r.arrayBuffer())) } });
    }
    return json(await callGemini(parts, response_json_schema));
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});