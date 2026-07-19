import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Camera, FileUp, Crop, ScanLine, FileCheck2, Loader2, Search,
  Plus, ChevronRight, X, RotateCw,
} from 'lucide-react';
import { formatKz } from '@/lib/format';
import Seo from '@/components/Seo';

export default function Documentos() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [ocrOpen, setOcrOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await base44.entities.Invoice.filter({ source: 'photo_ocr' }, '-created_date', 100);
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = invoices.filter(
    (i) =>
      i.issuer_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.document_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Seo title="Documentos" description="Arquiva e extrai dados das tuas faturas com OCR." path="/app/documentos" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Documentos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Faturas extraídas por foto</p>
        </div>
        <Button onClick={() => setOcrOpen(true)} className="btn-hover btn-primary-hover">
          <Camera className="w-4 h-4 mr-1.5" />
          Nova fatura
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por emissor ou número..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-line rounded-xl bg-surface focus:border-primary/40 focus:outline-none"
        />
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <FileUp className="w-7 h-7 text-muted-2" />
          </div>
          <p className="font-medium text-ink">
            {search ? 'Nenhum resultado' : 'Sem documentos'}
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {search ? 'Tenta outra pesquisa.' : 'Fotografa uma fatura para extrair os dados automaticamente.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv) => (
            <div key={inv.id} className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink truncate">{inv.issuer_name}</p>
                <p className="text-xs text-muted-2">
                  {inv.document_number || 'Sem nº'} · {inv.amount ? formatKz(inv.amount) : 'Sem valor'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-2 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {ocrOpen && <OcrFlow onClose={() => setOcrOpen(false)} onDone={() => { setOcrOpen(false); load(); }} />}
    </div>
  );
}

function OcrFlow({ onClose, onDone }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const steps = [
    { n: 1, label: 'Capturar', icon: Camera },
    { n: 2, label: 'Cortar', icon: Crop },
    { n: 3, label: 'Extrair', icon: ScanLine },
    { n: 4, label: 'Revisar', icon: FileCheck2 },
  ];

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep(2);
  };

  const extract = async () => {
    setExtracting(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);

      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          'Extrai os dados desta fatura angolana. Devolve JSON com: issuer_name (nome do emitente), issuer_nif (NIF do emitente), document_number (número do documento), amount (montante numérico em kwanza, sem texto), issue_date (YYYY-MM-DD), due_date (YYYY-MM-DD se existir), entity (entidade Multicaixa se existir), reference (referência Multicaixa se existir), iban (IBAN se existir), has_nif (true se a fatura contiver o NIF do cliente). Se um campo não existir, usa null.',
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
          },
        },
      });
      setExtracted(res);
      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const saveInvoice = async () => {
    setSaving(true);
    try {
      await base44.entities.Invoice.create({
        issuer_name: extracted.issuer_name || 'Desconhecido',
        issuer_nif: extracted.issuer_nif || '',
        document_number: extracted.document_number || '',
        amount: extracted.amount || 0,
        issue_date: extracted.issue_date || new Date().toISOString().slice(0, 10),
        due_date: extracted.due_date || extracted.issue_date || new Date().toISOString().slice(0, 10),
        entity: extracted.entity || '',
        reference: extracted.reference || '',
        iban: extracted.iban || '',
        has_nif: extracted.has_nif !== false,
        status: 'pending',
        source: 'photo_ocr',
        payment_method: extracted.entity ? 'mcx_reference' : extracted.iban ? 'iban' : 'manual',
      });
      onDone();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-surface w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-talao-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface z-10 flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-heading font-bold text-ink">Nova fatura</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-6">
            {steps.map((s, i) => (
              <React.Fragment key={s.n}>
                <div className={`flex flex-col items-center gap-1 ${step >= s.n ? 'text-primary' : 'text-muted-2'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s.n ? 'bg-primary text-white' : 'bg-muted'}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium">{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${step > s.n ? 'bg-primary' : 'bg-muted'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Capture */}
          {step === 1 && (
            <div className="space-y-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-line rounded-2xl py-12 hover:border-primary/40 hover:bg-muted/30 transition-colors"
              >
                <Camera className="w-10 h-10 text-muted-2" />
                <span className="font-medium text-ink">Tirar foto da fatura</span>
                <span className="text-xs text-muted-2">ou escolher ficheiro da galeria</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
            </div>
          )}

          {/* Step 2: Crop/Adjust */}
          {step === 2 && preview && (
            <div className="space-y-4">
              <div className="bg-ink/5 rounded-2xl overflow-hidden flex items-center justify-center" style={{ minHeight: 200 }}>
                <img
                  src={preview}
                  alt="Pré-visualização"
                  className="max-h-72 object-contain"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)}>
                  <RotateCw className="w-4 h-4 mr-1.5" />
                  Rodar
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setStep(1); setFile(null); setPreview(null); }} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Extract */}
          {step === 3 && (
            <div className="space-y-4 text-center py-8">
              {extracting ? (
                <>
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <p className="font-medium text-ink">A extrair dados...</p>
                  <p className="text-sm text-muted-foreground">A IA está a ler a tua fatura.</p>
                </>
              ) : (
                <>
                  <ScanLine className="w-10 h-10 text-primary mx-auto" />
                  <p className="font-medium text-ink">Pronta para extrair</p>
                  <p className="text-sm text-muted-foreground">Vamos ler os dados da fatura automaticamente.</p>
                  <Button onClick={extract} className="btn-hover btn-primary-hover">
                    <ScanLine className="w-4 h-4 mr-1.5" />
                    Extrair dados
                  </Button>
                </>
              )}
              {!extracting && (
                <Button variant="ghost" onClick={() => setStep(2)} className="text-sm">
                  Voltar
                </Button>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && extracted && (
            <div className="space-y-4">
              <div className="bg-green-soft rounded-xl p-3 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-ok shrink-0" />
                <p className="text-sm text-ok font-medium">Dados extraídos. Revê antes de guardar.</p>
              </div>
              <ExtractedField label="Emissor" value={extracted.issuer_name} onChange={(v) => setExtracted({ ...extracted, issuer_name: v })} />
              <ExtractedField label="NIF do emitente" value={extracted.issuer_nif} onChange={(v) => setExtracted({ ...extracted, issuer_nif: v })} mono />
              <ExtractedField label="Nº documento" value={extracted.document_number} onChange={(v) => setExtracted({ ...extracted, document_number: v })} mono />
              <ExtractedField label="Montante (Kz)" value={extracted.amount} onChange={(v) => setExtracted({ ...extracted, amount: parseFloat(v) || 0 })} mono type="number" />
              <ExtractedField label="Data emissão" value={extracted.issue_date} onChange={(v) => setExtracted({ ...extracted, issue_date: v })} type="date" />
              <ExtractedField label="Vencimento" value={extracted.due_date} onChange={(v) => setExtracted({ ...extracted, due_date: v })} type="date" />
              <ExtractedField label="Entidade MCX" value={extracted.entity} onChange={(v) => setExtracted({ ...extracted, entity: v })} mono />
              <ExtractedField label="Referência MCX" value={extracted.reference} onChange={(v) => setExtracted({ ...extracted, reference: v })} mono />
              <ExtractedField label="IBAN" value={extracted.iban} onChange={(v) => setExtracted({ ...extracted, iban: v })} mono />
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={extracted.has_nif !== false}
                  onChange={(e) => setExtracted({ ...extracted, has_nif: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                A fatura contém o meu NIF
              </label>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={saveInvoice} disabled={saving} className="flex-1 btn-hover btn-primary-hover">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Guardar fatura
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExtractedField({ label, value, onChange, mono, type = 'text' }) {
  return (
    <div>
      <label className="text-xs text-muted-2 block mb-1">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 text-sm border border-line rounded-lg bg-surface focus:border-primary/40 focus:outline-none ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );
}