import React from 'react';
import { Building2 } from 'lucide-react';

export default function CorporateSupervisionTab({ suppliers }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading font-semibold text-[15px] text-ink">Supervisão de empresas ({suppliers.length})</h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">Cada empresa gere os seus próprios utilizadores e aprovações. O admin supervisiona, não mexe nos utilizadores internos deles.</p>
      </div>

      <div className="bg-surface border border-line rounded-talao overflow-hidden shadow-soft">
        {suppliers.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-2 text-center">Nenhuma empresa registada no módulo corporativo.</p>
        ) : (
          <div className="ed-list px-5">
            {suppliers.map((s) => (
              <div key={s.id} className="it">
                <div className="w-9 h-9 rounded-xl bg-[#e7eef9] text-brandblue flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="nm">{s.name}</div>
                  <div className="sb">NIF {s.nif} · {s.category || 'Sem categoria'}</div>
                </div>
                <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${s.is_active ? 'pill-paid' : 'pill-late'}`}>
                  {s.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}