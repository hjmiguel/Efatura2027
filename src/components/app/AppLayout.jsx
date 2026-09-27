import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, ArrowLeftRight, PieChart, CreditCard, Sparkles,
  FileText, Landmark, LogOut, Receipt,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getFirstName } from '@/lib/format';
import RightRail from '@/components/app/RightRail';
import NotificationsBell from '@/components/app/NotificationsBell';

const mainNav = [
  { label: 'Início', icon: LayoutGrid, path: '/app' },
  { label: 'Transações', icon: ArrowLeftRight, path: '/app/transacoes' },
  { label: 'Orçamento', icon: PieChart, path: '/app/orcamento' },
  { label: 'Pagamentos', icon: CreditCard, path: '/app/pagamentos' },
  { label: 'Assistente', icon: Sparkles, path: '/app/assistente' },
];

const archiveNav = [
  { label: 'Dedutíveis', icon: Receipt, path: '/app/dedutiveis' },
  { label: 'Situação fiscal', icon: Landmark, path: '/app/fiscal' },
  { label: 'Documentos', icon: FileText, path: '/app/documentos' },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (!u?.phone || !u?.nif) {
        navigate('/completar-perfil', { replace: true });
      }
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout('/entrar');
  };

  const isActive = (path) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  const firstName = getFirstName(user?.full_name) || 'utilizador';
  const initials = (user?.full_name || 'U')
    .trim()
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const SidebarLink = ({ item }) => {
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-[11px] transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          active
            ? 'bg-primary text-[#eafff7] font-semibold'
            : 'text-muted-foreground font-medium hover:text-ink hover:bg-[#f1f5f3]'
        }`}
      >
        {item.icon && <item.icon className="w-[17px] h-[17px] shrink-0" strokeWidth={1.8} />}
        <span>{item.label}</span>
      </Link>
    );
  };

  const BottomLink = ({ item }) => {
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        aria-current={active ? 'page' : undefined}
        className={`flex flex-col items-center gap-1 py-1.5 px-2 w-[62px] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
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
      <a href="#main-content" className="skip-link">Saltar para o conteúdo</a>
      {/* ===== Desktop sidebar ===== */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-[264px] flex-col bg-surface border-r border-line z-30">
        {/* Brand */}
        <div className="px-5 pt-6 pb-2">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center relative overflow-hidden">
              <div
                className="absolute top-0 inset-x-0 h-1.5 bg-gold"
                style={{
                  WebkitMask:
                    'radial-gradient(circle at 5px -1px, transparent 3px, #000 3px) repeat-x',
                  WebkitMaskSize: '10px 6px',
                  mask: 'radial-gradient(circle at 5px -1px, transparent 3px, #000 3px) repeat-x',
                  maskSize: '10px 6px',
                }}
              />
              <span className="font-heading font-bold text-[#eafff7] text-[15px] relative">G+</span>
            </div>
            <div>
              <div className="font-heading font-semibold text-ink text-[17px] leading-tight">Gestão+</div>
              <div className="font-mono text-[9.5px] tracking-[.16em] text-muted-2 mt-0.5">EDIÇÃO · LUANDA</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="pt-4 pb-1.5 px-3">
            <span className="mark">§ NAVEGAÇÃO</span>
          </div>
          <div className="space-y-0.5">
            {mainNav.map((item) => (
              <SidebarLink key={item.path} item={item} />
            ))}
          </div>

          <div className="pt-5 pb-1.5 px-3">
            <span className="mark">§ ARQUIVO</span>
          </div>
          <div className="space-y-0.5">
            {archiveNav.map((item) => (
              <SidebarLink key={item.path} item={item} />
            ))}
          </div>
        </nav>

        {/* Premium card */}
        <div className="px-4 pt-2">
          <div className="border border-line rounded-2xl p-4">
            <div className="mark">PLANO PREMIUM</div>
            <div className="font-heading font-semibold text-[19px] mt-1.5 text-ink">
              2.500 Kz <span className="text-[13px] text-muted-foreground font-normal font-body">/ mês</span>
            </div>
            <div className="text-[12px] text-muted-foreground mt-1.5 leading-snug">
              Assistente sem limites e relatórios avançados.
            </div>
            <Link
              to="/app/perfil"
              className="block w-full mt-3 bg-primary text-[#eafff7] rounded-[10px] py-2.5 font-heading font-semibold text-[11.5px] tracking-[.08em] text-center hover:bg-primary-2 transition-colors"
            >
              SUBSCREVER
            </Link>
          </div>
        </div>

        {/* User profile */}
        <div className="px-3 pt-3 pb-4 border-t border-line mt-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Link to="/app/perfil" className="w-[34px] h-[34px] rounded-full bg-green-soft text-primary flex items-center justify-center font-bold text-[13px] shrink-0">
              {initials}
            </Link>
            <Link to="/app/perfil" className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-ink leading-tight truncate">
                {user?.full_name || 'Utilizador'}
              </div>
              {user?.nif && (
                <div className="font-mono text-[10px] text-muted-2 mt-0.5">NIF · {user.nif}</div>
              )}
            </Link>
            <button
              onClick={handleLogout}
              aria-label="Terminar sessão"
              className="p-1.5 rounded-lg text-muted-2 hover:text-destructive hover:bg-danger-soft transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title="Terminar sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Mobile app bar ===== */}
      <header className="md:hidden sticky top-0 z-30 bg-surface border-b border-line" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center gap-2.5 px-[18px] py-3">
          <Link to="/app/perfil" className="shrink-0">
            <div className="w-[42px] h-[42px] rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-base">
              {initials || 'G+'}
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
          <NotificationsBell />
          <Link
            to="/app/documentos"
            aria-label="Documentos"
            className="w-10 h-10 rounded-[11px] border border-line bg-surface flex items-center justify-center text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <FileText className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* ===== Main content ===== */}
      <main id="main-content" className="md:ml-[264px] xl:mr-[340px] pb-24 md:pb-0 min-h-screen">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <Outlet />
        </div>
      </main>

      {/* ===== Right rail (desktop xl+) ===== */}
      <RightRail />

      {/* ===== Mobile bottom nav ===== */}
      <nav aria-label="Navegação principal" className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-line">
        <div className="flex items-center justify-around px-1.5 pb-3 pt-1">
          {mainNav.map((item) => (
            <BottomLink key={item.path} item={item} />
          ))}
        </div>
      </nav>
    </div>
  );
}