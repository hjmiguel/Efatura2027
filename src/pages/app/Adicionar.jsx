import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Receipt, Camera, FilePlus } from 'lucide-react';

const options = [
  {
    icon: Receipt,
    label: 'Registar transação',
    desc: 'Movimento manual em kwanza — entrada ou saída',
    to: '/app/transacoes?adicionar=1',
    color: 'bg-[#e9f3ee] text-primary',
  },
  {
    icon: Camera,
    label: 'Digitalizar fatura',
    desc: 'Tira foto a um talão e extraímos os dados automaticamente',
    to: '/app/documentos?ocr=1',
    color: 'bg-blue-50 text-[#3a64a8]',
  },
  {
    icon: FilePlus,
    label: 'Criar fatura manual',
    desc: 'Insere os dados de uma fatura à mão (sem foto)',
    to: '/app/pagamentos?adicionar=1',
    color: 'bg-gold-soft text-[#8a6420]',
  },
];

export default function Adicionar() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-[18px] py-3 border-b border-line bg-surface">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-[11px] border border-line flex items-center justify-center text-ink"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="font-heading font-semibold text-base text-ink">Adicionar</div>
          <div className="text-[12.5px] text-muted-foreground">O que queres fazer?</div>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => navigate(opt.to)}
            className="w-full flex items-center gap-3.5 bg-surface border border-line rounded-talao p-4 shadow-soft text-left hover:border-primary/40 transition-colors"
          >
            <div className={`w-[46px] h-[46px] rounded-[13px] flex items-center justify-center shrink-0 ${opt.color}`}>
              <opt.icon className="w-[22px] h-[22px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-heading font-semibold text-[15px] text-ink">{opt.label}</div>
              <div className="text-[12.5px] text-muted-foreground mt-0.5 leading-snug">{opt.desc}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-2 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}