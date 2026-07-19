import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, LayoutDashboard, Receipt, Users, Key, FlaskConical, ArrowLeft } from 'lucide-react';

const nav = [
  { id: 'painel', label: 'Painel', icon: LayoutDashboard },
  { id: 'faturas', label: 'Faturas', icon: Receipt },
  { id: 'nifs', label: 'NIFs ligados', icon: Users },
  { id: 'api', label: 'API e chaves', icon: Key },
  { id: 'sandbox', label: 'Sandbox', icon: FlaskConical },
];

export default function PartnerShell({ active, onChange, partnerName, verified }) {
  const location = useLocation();
  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-surface border-b border-line">
        <div className="px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gold" />
              <Briefcase className="w-4 h-4 text-white relative" />
            </div>
            <div>
              <div className="font-heading font-bold text-ink text-[15px] leading-tight">Portal de Parceiros</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {verified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ok">
                    <span className="w-1.5 h-1.5 rounded-full bg-ok" /> Empresa verificada
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-muted-2">Aguarda verificação</span>
                )}
              </div>
            </div>
          </div>
          <Link to="/app" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-2 hover:text-ink transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar à app
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-line min-h-[calc(100vh-3.5rem)] py-5 px-3 sticky top-14">
          <div className="px-3 pb-2">
            <span className="mark">§ NAVEGAÇÃO</span>
          </div>
          <nav className="space-y-0.5">
            {nav.map((item) => {
              const activeTab = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onChange(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm transition-colors ${
                    activeTab
                      ? 'bg-primary text-[#eafff7] font-semibold'
                      : 'text-muted-foreground font-medium hover:text-ink hover:bg-[#f1f5f3]'
                  }`}
                >
                  <item.icon className="w-[16px] h-[16px] shrink-0" strokeWidth={1.8} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto px-3 pt-4 border-t border-line">
            <div className="text-[11px] text-muted-2 font-mono truncate">{partnerName || 'Parceiro'}</div>
            <div className="text-[10px] text-muted-2 mt-0.5">Ambiente · Produção</div>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-line">
          <div className="flex items-center justify-around px-1 py-1.5">
            {nav.map((item) => {
              const activeTab = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onChange(item.id)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 w-[58px] ${activeTab ? 'text-primary' : 'text-muted-2'}`}
                >
                  <item.icon className="w-5 h-5" strokeWidth={2} />
                  <span className="text-[9.5px] font-semibold leading-tight text-center">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}