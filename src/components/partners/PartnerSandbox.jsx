import React, { useState } from 'react';
import { FlaskConical, Copy, Check, BookOpen } from 'lucide-react';

export default function PartnerSandbox() {
  const [form, setForm] = useState({ nif: '', amount: '', due_date: '', description: '' });
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);

  const sendTest = (e) => {
    e.preventDefault();
    setResponse({
      id: 'inv_test_' + Math.random().toString(36).substring(2, 8),
      estado: 'entregue',
      nif: form.nif,
      valor: parseFloat(form.amount) || 0,
      moeda: 'AOA',
      ambiente: 'sandbox',
    });
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">§ 06 · Sandbox</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Ambiente de testes</h1>
        </div>
        <span className="mark">JUL · 2026</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Test form */}
        <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-4 h-4 text-brandblue" />
            <h2 className="font-heading font-semibold text-[15px] text-ink">Enviar fatura de teste</h2>
            <span className="pill-part text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">Sandbox</span>
          </div>
          <form onSubmit={sendTest} className="space-y-3">
            <div>
              <label className="text-[11px] text-muted-2 block mb-1">NIF de destino</label>
              <input
                value={form.nif}
                onChange={(e) => setForm({ ...form, nif: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-2 block mb-1">Valor (Kz)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-line text-sm font-mono focus:outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-2 block mb-1">Vencimento</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-2 block mb-1">Descrição</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-primary/40"
              />
            </div>
            <button type="submit" className="w-full px-4 py-2.5 rounded-lg bg-brandblue text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Enviar para sandbox
            </button>
          </form>
        </div>

        {/* API response */}
        <div className="bg-ink rounded-talao p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-[15px] text-white">Resposta da API</h2>
            {response && (
              <button onClick={copyResponse} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          {response ? (
            <pre className="text-[11.5px] font-mono text-[#9ee6c7] leading-relaxed overflow-x-auto">
{`// 201 Created
${JSON.stringify(response, null, 2)}`}
            </pre>
          ) : (
            <p className="text-[12px] text-white/40 font-mono py-8 text-center">
              Envia uma fatura de teste para ver a resposta.
            </p>
          )}
        </div>
      </div>

      {/* Documentation */}
      <div className="bg-surface border border-line rounded-talao p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-semibold text-[15px] text-ink">Documentação</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <div>
            <h3 className="text-[13px] font-bold text-ink mb-2">Enviar uma fatura</h3>
            <p className="text-[11px] text-muted-2 mb-2 font-mono">POST /v1/faturas</p>
            <p className="text-[12px] text-muted-foreground mb-3">
              Envia uma fatura para um NIF que tenha autorizado a tua empresa. O corpo segue o modelo de fatura eletrónica da AGT.
            </p>
            <pre className="bg-ink rounded-lg p-3 text-[10.5px] font-mono text-[#9ee6c7] leading-relaxed overflow-x-auto">
{`POST https://api.gestao.ao/v1/faturas
Authorization: Bearer gmais_live_...

{
  "nif": "5000846236",
  "emissor": "ENDE",
  "descricao": "Electricidade junho",
  "valor": 18450,
  "moeda": "AOA",
  "vencimento": "2026-06-28",
  "pagamento": { "tipo": "referencia",
    "entidade": "00115",
    "referencia": "940118207" }
}`}
            </pre>
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-ink mb-2">Conformidade</h3>
            <p className="text-[12px] text-muted-foreground mb-3">O formato alinha com:</p>
            <ul className="space-y-2 text-[12px] text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Regime Jurídico das Facturas, Decreto Presidencial n.º 71/25.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Estrutura de dados e modelo de fatura eletrónica, Decreto Executivo n.º 683/25.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Código de validação e QR Code da AGT.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Ficheiro SAF-T para reporte.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}