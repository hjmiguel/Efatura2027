import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appApi } from '@/api/appClient';
import CameraCapture from '@/components/app/CameraCapture';
import {
  Camera, FileUp, Crop, ScanLine, FileCheck2, Loader2, Search,
  Plus, ChevronRight, X, RotateCw, HardDrive,
} from 'lucide-react';
import { formatKz, formatDate } from '@/lib/format';
import Seo from '@/components/Seo';
import InvoiceDetailDialog from '@/components/app/InvoiceDetailDialog';

const docTabs = [
  { id: 'todos', label: 'Todos' },
  { id: 'faturas', label: 'Faturas' },
  { id: 'recibos', label: 'Recibos' },
  { id: 'outros', label: 'Outros' },
];

export default function Documentos() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [ocrOpen, setOcrOpen] = useState(false);
  const [tab, setTab] = useState('todos');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (searchParams.get('ocr') === '1') {
      setOcrOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function load() {
    try {
      const data = await appApi.entities.Invoice.filter({ source: 'photo_ocr' }, '-created_date', 100);
      setInvoices(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const filtered = invoices.filter((i) => {
    const matchesSearch = i.issuer_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.document_number?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (tab === 'faturas') return i.status === 'pending';
    if (tab === 'recibos') return i.status === 'paid';
    if (tab === 'outros') return i.status === 'overdue';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Storage usage (simplified: 1 doc ≈ 0.5MB, limit 50MB)
  const usedMb = (invoices.length * 0.5).toFixed(1);
  const storagePct = Math.min((invoices.length * 0.5 / 50) * 100, 100);

  return (
    <div className="space-y-4">
      <Seo title="Documentos" description="Arquiva e extrai dados das tuas faturas com OCR." path="/app/documentos" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow">§ 06 · Arquivo</span>
          <h1 className="font-heading text-2xl font-bold text-ink mt-1">Documentos</h1>
        </div>
        <button onClick={() => setOcrOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-sm font-medium btn-hover btn-primary-hover">
          <Camera className="w-4 h-4" /> Upload
        </button>
      </div>

      {/* Storage bar */}
      <div className="bg-surface border border-line rounded-talao p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="w-4 h-4 text-muted-2" />
          <span className="text-[13px] font-medium text-ink">Armazenamento</span>
          <span className="text-[12px] text-muted-2 ml-auto font-mono">{usedMb} / 50 MB</span>
        </div>
        <div className="track-v5">
          <i style={{ width: `${storagePct}%` }} />
        </div>
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

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 overflow-x-auto">
        {docTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-primary text-white' : 'text-muted-foreground hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <FileUp className="w-7 h-7 text-muted-2" />
          </div>
          <p className="font-medium text-ink">{search ? 'Nenhum resultado' : 'Sem documentos'}</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {search ? 'Tenta outra pesquisa.' : 'Fotografa uma fatura para extrair os dados automaticamente.'}
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
          <div className="px-4 pt-3 pb-1">
            <span className="eyebrow">{filtered.length} {filtered.length === 1 ? 'documento' : 'documentos'}</span>
          </div>
          <div className="px-3 pb-2">
            {filtered.map((inv) => (
              <DocRow key={inv.id} invoice={inv} onClick={() => setSelectedInvoice(inv)} />
            ))}
          </div>
        </div>
      )}

      {ocrOpen && <OcrFlow onClose={() => setOcrOpen(false)} onDone={() => { setOcrOpen(false); load(); }} />}

      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={!!selectedInvoice}
        onOpenChange={(v) => !v && setSelectedInvoice(null)}
      />
    </div>
  );
}

function DocRow({ invoice, onClick }) {
  const statusPill = invoice.status === 'paid'
    ? <span className="pill-paid text-[10px] font-bold px-2 py-0.5 rounded-full">Paga</span>
    : invoice.status === 'overdue'
    ? <span className="pill-late text-[10px] font-bold px-2 py-0.5 rounded-full">Vencida</span>
    : <span className="pill-pend text-[10px] font-bold px-2 py-0.5 rounded-full">Pendente</span>;

  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3 border-t border-line first:border-t-0 px-1 text-left hover:bg-muted/40 transition-colors rounded-lg">
      <div className="w-[38px] h-[38px] rounded-[11px] bg-[#e9f3ee] text-primary flex items-center justify-center shrink-0">
        <FileCheck2 className="w-[18px] h-[18px]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-[13.5px] text-ink truncate">{invoice.issuer_name}</p>
          {statusPill}
        </div>
        <p className="text-[11.5px] text-muted-foreground mt-0.5">
          {invoice.document_number || 'Sem nº'} · {formatDate(invoice.issue_date)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono text-[13.5px] font-semibold text-ink">{invoice.amount ? formatKz(invoice.amount) : '—'}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-2 shrink-0" />
    </button>
  );
}

function OcrFlow({ onClose, onDone }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [extractError, setExtractError] = useState('');
  const [saving, setSaving] = useState(false);
  const steps = [
    { n: 1, label: 'Capturar', icon: Camera },
    { n: 2, label: 'Cortar', icon: Crop },
    { n: 3, label: 'Extrair', icon: ScanLine },
    { n: 4, label: 'Revisar', icon: FileCheck2 },
  ];

  const handleCapture = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep(2);
  };

  const extract = async () => {
    setExtracting(true);
    try {
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await appApi.functions.invoke('ocrExtractInvoice', {
        image_base64: imageBase64, mime_type: file.type, file_name: file.name,
      });
      setExtracted(res.data || res);
      setStep(4);
    } catch (err) {
      console.error(err);
      setExtractError(err.message || 'Não foi possível ler o documento.');
      setStep(2);
    }
    finally { setExtracting(false); }
  };

  const saveInvoice = async () => {
    setSaving(true);
    try {
      await appApi.entities.Invoice.create({
        issuer_name: extracted.issuer_name || 'Desconhecido',
        issuer_nif: extracted.issuer_nif || '',
        document_number: extracted.document_number || '',
        amount: extracted.amount || 0,
        issue_date: extracted.issue_date || new Date().toISOString().slice(0, 10),
        due_date: extracted.due_date || extracted.issue_date || new Date().toISOString().slice(0, 10),
        entity: extracted.entity || '', reference: extracted.reference || '',
        iban: extracted.iban || '',
        has_nif: extracted.has_nif !== false,
        deductible_type: extracted.deductible_type || 'none',
        status: 'pending', source: 'photo_ocr',
        payment_method: extracted.entity ? 'mcx_reference' : extracted.iban ? 'iban' : 'manual',
      });
      onDone();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-surface w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-talao-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-surface z-10 flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-heading font-bold text-ink">Nova fatura</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
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

          {step === 1 && <CameraCapture onCapture={handleCapture} />}

          {step === 2 && preview && (
            <div className="space-y-4">
              <div className="bg-ink/5 rounded-2xl overflow-hidden flex items-center justify-center" style={{ minHeight: 200 }}>
                {file?.type === 'application/pdf' ? (
                  <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
                    <FileCheck2 className="w-10 h-10 text-primary" />
                    <span className="text-sm font-medium text-ink break-all">{file.name}</span>
                    <span className="text-xs text-muted-2">Documento PDF</span>
                  </div>
                ) : (
                  <img src={preview} alt="Pré-visualização" className="max-h-72 object-contain" style={{ transform: `rotate(${rotation}deg)` }} />
                )}
              </div>
              {extractError && (
                <div className="p-3 rounded-lg bg-danger-soft text-destructive text-sm break-words">{extractError}</div>
              )}
              {file?.type !== 'application/pdf' && (
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setRotation((r) => (r + 90) % 360)} className="inline-flex items-center gap-1.5 px-3 py-2 border border-line rounded-lg text-sm font-medium text-ink">
                    <RotateCw className="w-4 h-4" /> Rodar
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setStep(1); setFile(null); setPreview(null); }} className="flex-1 py-2.5 border border-line rounded-lg text-sm font-medium">Voltar</button>
                <button onClick={() => { setExtractError(''); setStep(3); extract(); }} className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium">Extrair dados</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center py-8">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
              <p className="font-medium text-ink">A extrair dados...</p>
              <p className="text-sm text-muted-foreground">A IA está a ler a tua fatura.</p>
            </div>
          )}

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
                <input type="checkbox" checked={extracted.has_nif !== false} onChange={(e) => setExtracted({ ...extracted, has_nif: e.target.checked })} className="w-4 h-4 rounded" />
                A fatura contém o meu NIF
              </label>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 border border-line rounded-lg text-sm font-medium">Voltar</button>
                <button onClick={saveInvoice} disabled={saving} className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> : <Plus className="w-4 h-4 mr-2 inline" />}
                  Guardar fatura
                </button>
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
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} className={`w-full px-3 py-2 text-sm border border-line rounded-lg bg-surface focus:border-primary/40 focus:outline-none ${mono ? 'font-mono' : ''}`} />
    </div>
  );
}