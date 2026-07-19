import React, { useState, useCallback } from 'react';
import { FileSpreadsheet, Check, AlertTriangle, X, ArrowLeft, Download } from 'lucide-react';

const STEPS = ['upload', 'mapping', 'validation', 'done'];

export default function PartnerImport({ onDone }) {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({
    nif: 'nif',
    descricao: 'descricao',
    valor: 'valor',
    vencimento: 'vencimento',
    pagamento: 'pagamento',
    entidade: 'entidade',
    referencia: 'referencia',
  });

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleFile = (f) => {
    setFile(f);
    // Simulate parsing rows
    const mockRows = [
      { nif: '5000846236', descricao: 'Electricidade junho', valor: '18450', vencimento: '2026-06-28', pagamento: 'referencia', entidade: '00115', referencia: '940118207', status: 'ready' },
      { nif: '5417002219', descricao: 'Telecomunicações', valor: '24900', vencimento: '2026-06-26', pagamento: 'referencia', entidade: '00115', referencia: '112883920', status: 'ready' },
      { nif: '5219884410', descricao: 'Água junho', valor: '31000', vencimento: '2026-06-30', pagamento: 'referencia', entidade: '00115', referencia: '772091453', status: 'warning' },
      { nif: '5008771230', descricao: 'Serviço mensal', valor: '9800', vencimento: '2026-06-19', pagamento: 'referencia', entidade: '00115', referencia: '553210987', status: 'error' },
    ];
    setRows(mockRows);
    setStep('mapping');
  };

  const ready = rows.filter((r) => r.status === 'ready').length;
  const warnings = rows.filter((r) => r.status === 'warning').length;
  const errors = rows.filter((r) => r.status === 'error').length;

  const statusLabel = {
    ready: { label: 'Pronta', cls: 'pill-paid' },
    warning: { label: 'Aviso', cls: 'pill-pend' },
    error: { label: 'Erro', cls: 'pill-late' },
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">§ 03 · Importar</span>
          <h1 className="font-heading text-xl font-bold text-ink mt-1">Importar faturas de Excel ou CSV</h1>
        </div>
        <span className="mark">JUL · 2026</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, idx) => (
          <React.Fragment key={s}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
              STEPS.indexOf(step) >= idx ? 'bg-primary text-white' : 'bg-muted text-muted-2'
            }`}>
              {STEPS.indexOf(step) > idx ? <Check className="w-3.5 h-3.5" /> : idx + 1}
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${STEPS.indexOf(step) > idx ? 'bg-primary' : 'bg-line'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Upload step */}
      {step === 'upload' && (
        <div className="space-y-4">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-[12px] font-medium text-ink hover:bg-muted transition-colors">
            <Download className="w-3.5 h-3.5" /> Descarregar modelo
          </button>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('partner-file-input').click()}
            className={`border-2 border-dashed rounded-talao p-10 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/40'
            }`}
          >
            <FileSpreadsheet className="w-10 h-10 text-[#1C8A6A] mx-auto mb-3" />
            <p className="text-[14px] font-medium text-ink">Arrasta o ficheiro ou clica para escolher</p>
            <p className="text-[12px] text-muted-2 mt-1">.xlsx, .xls ou .csv · até 5.000 linhas por ficheiro</p>
            <input
              id="partner-file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            />
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Cada linha é uma fatura. Usa o modelo para garantir as colunas certas: NIF, descrição, valor, vencimento e dados de pagamento. As faturas só chegam a NIFs que tenham ligado a tua empresa.
          </p>
        </div>
      )}

      {/* Mapping step */}
      {step === 'mapping' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[13px] text-ink">
            <FileSpreadsheet className="w-4 h-4 text-[#1C8A6A]" />
            <span className="font-medium">{file?.name}</span>
            <span className="text-muted-2">· {rows.length} linhas lidas</span>
            <button onClick={() => { setFile(null); setStep('upload'); }} className="ml-auto text-muted-2 hover:text-ink">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground">Confirma a correspondência das colunas.</p>

          <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-2 border-b border-line">
                  <th className="px-5 py-2.5 font-medium text-[11px]">Campo do sistema</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Coluna do ficheiro</th>
                  <th className="px-5 py-2.5 font-medium text-[11px]">Exemplo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { sys: 'NIF', key: 'nif', example: '5000846236' },
                  { sys: 'Descrição', key: 'descricao', example: 'Electricidade junho' },
                  { sys: 'Valor (Kz)', key: 'valor', example: '18450' },
                  { sys: 'Vencimento', key: 'vencimento', example: '2026-06-28' },
                  { sys: 'Tipo de pagamento', key: 'pagamento', example: 'referencia' },
                  { sys: 'Entidade / IBAN', key: 'entidade', example: '00115' },
                  { sys: 'Referência', key: 'referencia', example: '940118207' },
                ].map((row) => (
                  <tr key={row.key} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-3 text-ink font-medium text-[13px]">{row.sys}</td>
                    <td className="px-5 py-3">
                      <select
                        value={mapping[row.key]}
                        onChange={(e) => setMapping({ ...mapping, [row.key]: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg border border-line text-[12px] font-mono focus:outline-none focus:border-primary/40"
                      >
                        <option value={row.key}>{row.key}</option>
                        <option value="">— ignorar —</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{row.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setFile(null); setStep('upload'); }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-line text-muted-foreground text-sm hover:bg-muted">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button onClick={() => setStep('validation')} className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-2">
              Validar linhas
            </button>
          </div>
        </div>
      )}

      {/* Validation step */}
      {step === 'validation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
              <p className="text-[11px] text-muted-2">Prontas a enviar</p>
              <p className="font-mono text-[22px] font-bold text-ok mt-1.5">{ready}</p>
            </div>
            <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
              <p className="text-[11px] text-muted-2">Com aviso</p>
              <p className="font-mono text-[22px] font-bold text-[#9a6a16] mt-1.5">{warnings}</p>
            </div>
            <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
              <p className="text-[11px] text-muted-2">Com erro</p>
              <p className="font-mono text-[22px] font-bold text-destructive mt-1.5">{errors}</p>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-2 border-b border-line">
                    <th className="px-5 py-2.5 font-medium text-[11px]">Linha</th>
                    <th className="px-5 py-2.5 font-medium text-[11px]">NIF</th>
                    <th className="px-5 py-2.5 font-medium text-[11px]">Valor</th>
                    <th className="px-5 py-2.5 font-medium text-[11px]">Vencimento</th>
                    <th className="px-5 py-2.5 font-medium text-[11px]">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const st = statusLabel[r.status];
                    return (
                      <tr key={idx} className="border-b border-line/50 last:border-0">
                        <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{idx + 2}</td>
                        <td className="px-5 py-3 font-mono text-[12px] text-ink">{r.nif}</td>
                        <td className="px-5 py-3 font-mono text-ink">{r.valor} Kz</td>
                        <td className="px-5 py-3 text-[12px] text-muted-foreground">{r.vencimento}</td>
                        <td className="px-5 py-3">
                          <span className={`${st.cls} text-[10.5px] font-bold px-2.5 py-0.5 rounded-full`}>
                            {r.status === 'ready' ? 'Pronta' : r.status === 'warning' ? 'Aviso: valor acima do habitual' : 'Erro: NIF não autorizou'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-muted-2 leading-relaxed">
            As linhas com erro são ignoradas. Podes corrigir o ficheiro e voltar a importar só essas. As linhas com aviso são enviadas e ficam assinaladas.
          </p>

          <div className="flex gap-2">
            <button onClick={() => setStep('mapping')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-line text-muted-foreground text-sm hover:bg-muted">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button className="px-4 py-2 rounded-lg border border-line text-muted-foreground text-sm hover:bg-muted">
              Exportar erros
            </button>
            <button onClick={() => setStep('done')} className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-2">
              Enviar {ready} faturas
            </button>
          </div>
        </div>
      )}

      {/* Done step */}
      {step === 'done' && (
        <div className="bg-surface border border-line rounded-talao p-8 text-center shadow-soft">
          <div className="w-14 h-14 rounded-full bg-green-soft flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-ok" />
          </div>
          <h2 className="font-heading font-bold text-lg text-ink">Importação concluída</h2>
          <p className="text-[13px] text-muted-foreground mt-2">
            {ready} faturas enviadas. {errors} linhas ignoradas por erro.
          </p>
          <p className="text-[12px] text-muted-2 mt-1">
            Os utilizadores vão recebê-las na app e ser avisados antes do prazo.
          </p>
          <div className="flex gap-2 mt-6 max-w-xs mx-auto">
            <button onClick={() => { setStep('upload'); setFile(null); setRows([]); }} className="flex-1 px-4 py-2 rounded-lg border border-line text-muted-foreground text-sm hover:bg-muted">
              Importar outro
            </button>
            <button onClick={onDone} className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-2">
              Ver faturas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}