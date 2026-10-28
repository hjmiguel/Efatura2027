import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { formatKz, formatDate } from '@/lib/format';

const serrated = {
  WebkitMask: 'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%',
  mask: 'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%',
};

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-ink text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export default function PaymentReceipt({ invoice, paidDate, onClose }) {
  const reduce = useReducedMotion();
  const feed = reduce
    ? { initial: false }
    : {
        initial: { y: '-100%' },
        animate: { y: 0 },
        transition: { duration: 1.8, ease: [0.22, 0.68, 0.3, 1], times: [0, 1] },
      };
  const stamp = reduce
    ? { initial: false }
    : {
        initial: { scale: 2.2, opacity: 0, rotate: -20 },
        animate: { scale: 1, opacity: 1, rotate: -12 },
        transition: { delay: 2, duration: 0.35, ease: [0.22, 0.68, 0.3, 1] },
      };
  const fade = reduce
    ? { initial: false }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 2.5, duration: 0.5 } };

  return (
    <div className="fixed inset-0 z-[100] bg-ink/70 flex items-center justify-center p-5" role="dialog" aria-label="Recibo de pagamento">
      <div className="w-full max-w-[320px]">
        <div className="relative z-10 h-3.5 rounded-full bg-ink border border-white/20 shadow-lg" />
        <div className="overflow-hidden -mt-1.5 pb-4">
          <motion.div {...feed}>
            <div className="bg-surface px-5 pt-6 pb-8 relative" style={serrated}>
              <p className="eyebrow text-center">Recibo de pagamento</p>
              <p className="font-mono text-[26px] font-bold text-ink text-center mt-2">{formatKz(invoice.amount)}</p>
              <div className="border-t border-dashed border-line my-4" />
              <div className="space-y-2">
                <Row label="Emissor" value={invoice.issuer_name} />
                {invoice.document_number && <Row label="Documento" value={invoice.document_number} mono />}
                {invoice.reference && <Row label="Referência" value={invoice.reference} mono />}
                <Row label="Pago em" value={formatDate(paidDate)} />
              </div>
              <motion.div
                {...stamp}
                className="absolute right-4 bottom-5 border-[3px] border-ok text-ok rounded-md px-3 py-1 font-heading font-bold text-xl tracking-widest"
                style={{ transform: 'rotate(-12deg)' }}
              >
                PAGO
              </motion.div>
            </div>
          </motion.div>
        </div>
        <motion.div {...fade} className="mt-2">
          <button onClick={onClose} className="w-full py-3 bg-primary text-white rounded-xl font-medium">
            Concluir
          </button>
        </motion.div>
      </div>
    </div>
  );
}