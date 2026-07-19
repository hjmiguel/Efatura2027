import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';

export default function ConnectCompanyModal({ open, onClose, onSelect, companies }) {
  const [search, setSearch] = useState('');

  if (!open) return null;

  const filtered = companies.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.nif.includes(search)
  );

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-talao-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="font-heading font-bold text-ink text-lg">Conectar empresa</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
            <input
              type="text"
              placeholder="Procurar por nome ou NIF"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Company list */}
        <div className="px-5 pb-5 space-y-2">
          {filtered.map((c) => (
            <button
              key={c.nif}
              onClick={() => onSelect(c)}
              className="w-full flex items-center gap-3 p-3 bg-surface border border-line rounded-talao hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <c.icon className="w-5 h-5 text-ink" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-[14px] text-ink">{c.name}</p>
                <p className="text-[12px] text-muted-foreground">Toca para autorizar</p>
              </div>
              <div className="w-7 h-7 rounded-full border border-line flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-ink" />
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-8 text-sm text-muted-foreground">Nenhuma empresa encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}