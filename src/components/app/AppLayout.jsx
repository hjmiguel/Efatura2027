import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid, ArrowLeftRight, PieChart, CreditCard, Sparkles,
  FileText, Landmark, User, Bell, LogOut, Receipt,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getFirstName } from '@/lib/format';

const mainNav = [
  { label: 'Início', icon: LayoutGrid, path: '/app' },
  { label: 'Transações', icon: ArrowLeftRight, path: '/app/transacoes' },
  { label: 'Orçamento', icon: PieChart, path: '/app/orcamento' },
  { label: 'Pagamentos', icon: CreditCard, path: '/app/pagamentos' },
  { label: 'Assistente', icon: Sparkles, path: '/app/assistente' },
];

const moreNav = [
  { label: 'Documentos', icon: FileText, path: '/app/documentos' },
  { label: 'Situação fiscal', icon: Landmark, path: '/app/fiscal' },
  { label: 'Dedutíveis', icon: Receipt, path: '/app/dedutiveis' },
  { label: 'Perfil', icon: User, path: '/app/perfil' },
];

export default function AppLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout('/entrar');
  };

  const isActive = (path) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  const firstName = getFirstName(user?.full_name) || 'utilizador';

  /* ---- Desktop sidebar ---- */
  const SidebarLink = ({ item }) => {
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
          active
            ? 'bg-primary text-white font-medium'
            : 'text-muted-foreground hover:text-ink hover:bg-muted'
        }`}
      >
        {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
        <span className="text-sm">{item.label}</span>
      </Link>
    );
  };

  /* ---- Mobile bottom nav ---- */
  const BottomLink = ({ item }) => {
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        className={`flex flex-col items-center gap-1 py-1.5 px-2 w-[62px] ${
          active ? 'text-primary' : 'text-muted-2'
        }`}
      >
        <item.icon className="w-[23px] h-[23px]" strokeWidth={2} />
        <span className="text-[10.5px] font-semibold">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ===== Desktop sidebar ===== */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-surface border-r border-line z-30">
        <div className="px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gold" />
              <span className="font-heading font-bold text-white text-sm relative">G+</span>
            </div>
            <span className="font-heading font-bold text-ink text-lg">Gestão+</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {mainNav.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
          <div className="pt-4 pb-1 px-3">
            <span className="text-[9.5px] font-bold uppercase tracking-[.13em] text-muted-2">Mais</span>
          </div>
          {moreNav.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-line">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-danger-soft transition-colors w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* ===== Mobile app bar ===== */}
      <header className="md:hidden sticky top-0 z-30 bg-surface border-b border-line">
        <div className="flex items-center gap-2.5 px-[18px] py-3">
          <Link to="/app/perfil" className="shrink-0">
            <div className="w-[42px] h-[42px] rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-base">
              G+
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="font-heading font-semibold text-base text-ink leading-tight">
              Olá, {firstName}
            </div>
            <div className="text-[12.5px] text-muted-foreground leading-tight mt-0.5">
              Bem-vindo de volta
            </div>
          </div>
          <button className="relative w-10 h-10 rounded-[11px] border border-line bg-surface flex items-center justify-center text-primary">
            <Bell className="w-5 h-5" />
            <span className="absolute top-[7px] right-2 w-2 h-2 rounded-full bg-destructive border-2 border-surface" />
          </button>
          <Link
            to="/app/documentos"
            className="w-10 h-10 rounded-[11px] border border-line bg-surface flex items-center justify-center text-primary"
          >
            <FileText className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* ===== Main content ===== */}
      <main className="md:ml-60 pb-24 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 md:py-6">
          <Outlet />
        </div>
      </main>

      {/* ===== Mobile bottom nav ===== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-line">
        <div className="flex items-center justify-around px-1.5 pb-3 pt-1">
          {mainNav.map((item) => (
            <BottomLink key={item.path} item={item} />
          ))}
        </div>
      </nav>
    </div>
  );
}