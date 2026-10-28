import { createClient } from 'npm:@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Cliente com o token do utilizador: as regras RLS aplicam-se.
export function userClient(req: Request) {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
}

// Cliente com privilégios totais: só para operações de administração.
export function adminClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
}

export async function getUser(req: Request) {
  const { data } = await userClient(req).auth.getUser();
  return data.user;
}

export function bytesToBase64(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

// Chamada ao Google Gemini Flash. `parts` pode incluir texto e imagens (inline_data).
export async function callGemini(parts: unknown[], jsonSchema?: unknown) {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY não configurada');
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  const body: Record<string, unknown> = { contents: [{ role: 'user', parts }] };
  if (jsonSchema) body.generationConfig = { responseMimeType: 'application/json' };
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const out = await res.json();
  const text = out.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  if (!jsonSchema) return text;
  return JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''));
}

export function schemaHint(schema: unknown) {
  return `\n\nResponde apenas com JSON válido que cumpra este esquema:\n${JSON.stringify(schema)}`;
}

// Lê registos de uma entidade (formato plano: { id, ...data }), respeitando RLS.
export async function listEntity(req: Request, entity: string, limit = 500) {
  const { data, error } = await userClient(req)
    .from('records')
    .select('id, data')
    .eq('entity', entity)
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, ...r.data }));
}