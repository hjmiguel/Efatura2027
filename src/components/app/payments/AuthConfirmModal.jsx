import React from 'react';

export default function AuthConfirmModal({ data, onClose, onAuthorize }) {
  if (!data) return null;

  const Icon = data.icon;
  const initials = data.name.slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-sm rounded-3xl shadow-talao-lg p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-muted"></div>
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-[#1A6652] flex items-center justify-center mx-auto mb-4">
          {Icon ? (
            <Icon className="w-7 h-7 text-white" />
          ) : (
            <span className="text-white font-heading font-bold text-[15px]">{initials}</span>
          )}
        </div>

        {/* Text */}
        <h3 className="font-heading font-bold text-[15px] text-ink mb-1 leading-snug">
          Autorizas a {data.name} a enviar faturas para o teu NIF?
        </h3>
        <p className="text-[13px] text-muted-foreground mb-5">Podes revogar quando quiseres.</p>

        {/* Buttons */}
        <button
          onClick={onAuthorize}
          className="w-full py-3 bg-[#1A6652] text-white rounded-xl text-sm font-medium mb-2 hover:bg-[#15513f] transition-colors"
        >
          Autorizar
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 border border-[#1A6652] text-[#1A6652] rounded-xl text-sm font-medium hover:bg-[#1A6652]/5 transition-colors"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}