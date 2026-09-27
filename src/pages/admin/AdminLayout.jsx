import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, ArrowLeft, Building2, Briefcase, LogOut, ShieldAlert, CreditCard, FileCheck, Store, FlaskConical } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navSections = [
  {
    label: 'VISÃO',
    items: [{ label: 'Painel e métricas', icon: LayoutDashboard, path: '/admin' }],
  },
  {
    label: 'OPERAÇÃO',
    items: [
      { label: 'Empresas', icon: Store, path: '/admin/empresas' },
      { label: 'Antifraude', icon: ShieldAlert, path: '/admin/antifraude' },
      { label: 'Acessos e papéis', icon: Users, path: '/admin/acessos' },
    ],
  },
  {
    label: 'PLATAFORMA',
    items: [
      { label: 'Planos e receita', icon: CreditCard, path: '/admin/planos' },
      { label: 'Conformidade', icon: FileCheck, path: '/admin/conformidade' },
      { label: 'Testes automáticos', icon: FlaskConical, path: '/admin/testes' },
    ],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [checking, setChecking] = React.useState(true);
  const [badges, setBadges] = React.useState({ companies: 0, fraud: 0 });

  React.useEffect(() => {
    base44.auth.me().then((u) => {
      if (u.app_role !== 'admin') { navigate('/app'); return; }
      setUser(u);
      setChecking(false);
      loadBadges();
    }).catch(() => navigate('/admin/entrar'));
  }, []);

  async function loadBadges() {
    try {
      const [consents, invoices] = await Promise.all([
        base44.entities.PartnerConsent.list(),
        base44.entities.Invoice.list(),
      ]);
      setBadges({
        companies: consents.filter((c) => c.consent_status === 'active').length,
        fraud: invoices.filter((i) => i.source === 'partner').length,
      });
    } catch (err) { console.error(err); }
  }

  const handleLogout = async () => { await base44.auth.logout('/entrar'); };
  const isActive = (path) => path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);
  const getBadge = (path) => {
    if (path === '/admin/empresas') return badges.companies;
    if (path === '/admin/antifraude') return badges.fraud;
    return 0;
  };

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const initials = (user?.full_name || 'A').trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const allNavItems = navSections.flatMap((s) => s.items);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Saltar para o conteúdo</a>
      <header className="sticky top-0 z-30 bg-surface border-b border-line" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-ink/10" />
              <Shield className="w-4 h-4 text-ink relative" />
            </div>
            <div>
              <div className="font-heading font-bold text-ink text-[15px] leading-tight">Backoffice</div>
              <div className="font-mono text-[9.5px] tracking-[.16em] text-muted-2 mt-0.5">ADMIN · GESTÃO+</div>
            </div>
          </div>
          <Link to="/app" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-2 hover:text-ink transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar à app
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar — dark */}
        <aside className="hidden md:flex flex-col w-[240px] shrink-0 bg-ink text-white min-h-[calc(100vh-3.5rem)] py-5 px-3 sticky top-14">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              <div className="px-3 pb-2"><span className="text-[9.5px] font-bold tracking-[.16em] text-white/60 uppercase">{section.label}</span></div>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  const badge = getBadge(item.path);
                  return (
                    <Link key={item.path} to={item.path} aria-current={active ? 'page' : undefined} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${active ? 'bg-primary text-[#eafff7] font-semibold' : 'text-white/70 font-medium hover:text-white hover:bg-white/5'}`}>
                      <item.icon className="w-[16px] h-[16px] shrink-0" strokeWidth={1.8} />
                      <span className="flex-1">{item.label}</span>
                      {badge > 0 && <span className="bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{badge}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          <div className="mb-4">
            <div className="px-3 pb-2"><span className="text-[9.5px] font-bold tracking-[.16em] text-white/60 uppercase">Módulos</span></div>
            <div className="space-y-0.5">
              <Link to="/parceiros" className="flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                <Briefcase className="w-[16px] h-[16px] shrink-0" strokeWidth={1.8} /> Portal de parceiros
              </Link>
              <Link to="/empresas" className="flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                <Building2 className="w-[16px] h-[16px] shrink-0" strokeWidth={1.8} /> Corporativo
              </Link>
            </div>
          </div>

          <div className="mt-auto px-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2.5 px-1 py-1.5">
              <div className="w-[32px] h-[32px] rounded-full bg-gold-soft text-[#9a6a16] flex items-center justify-center font-bold text-[12px] shrink-0">{initials}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-white leading-tight truncate">{user?.full_name || 'Admin'}</div>
                <div className="font-mono text-[9.5px] text-white/60 mt-0.5">ADMINISTRADOR</div>
              </div>
              <button onClick={handleLogout} aria-label="Terminar sessão" className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" title="Sair">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile top nav */}
        <div className="md:hidden sticky top-14 z-20 bg-surface border-b border-line">
          <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
            {allNavItems.map((item) => {
              const active = isActive(item.path);
              const badge = getBadge(item.path);
              return (
                <Link key={item.path} to={item.path} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors ${active ? 'bg-primary text-[#eafff7]' : 'text-muted-foreground'}`}>
                  <item.icon className="w-3.5 h-3.5" /> {item.label}
                  {badge > 0 && <span className="bg-destructive text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main id="main-content" className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}