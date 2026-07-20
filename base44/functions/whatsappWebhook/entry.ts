import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';
import { sendText } from "../../shared/zapi.ts";

const WELCOME = `Olá! Sou o assistente do Gestão+ 📱\n\nPosso ajudar com:\n• Dicas de organização financeira\n• Informações sobre o IRPS 2027\n• Como funciona a app\n\nPara ver as tuas faturas, pagamentos e dedutíveis, acede à app Gestão+.\n\nPergunta-me algo!`;

Deno.serve(async (req) => {
  try {
    if (req.method === "GET") {
      return Response.json({ status: "ok", service: "whatsapp-webhook" });
    }

    const body = await req.json();

    const phone = String(body.phone || body.from || '');
    const messageText = String(body.message?.text || body.text || '');

    if (!phone || !messageText) {
      return Response.json({ skipped: true, reason: "not_a_text_message" });
    }

    const base44 = createClientFromRequest(req);

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `És o assistente de WhatsApp do Gestão+, uma aplicação de finanças pessoais para Angola (faturas, pagamentos Multicaixa Express, dedutíveis IRPS 2027).

Um utilizador enviou por WhatsApp: "${messageText}"

Regras:
- Responde em português de Angola, curto e prático (máx 3 frases).
- Se perguntar de dados financeiros específicos (saldos, faturas), diz que precisa de entrar na app.
- Não inventes valores.
- Se for cumprimento ("olá", "bom dia"), responde com: "${WELCOME}"`,
    });

    const reply = typeof llmResponse === 'string'
      ? llmResponse
      : (llmResponse.resposta || llmResponse.response || WELCOME);

    await sendText(phone, reply);

    return Response.json({ success: true, phone });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});