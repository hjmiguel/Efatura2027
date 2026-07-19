import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, ScrollText, ArrowLeft, Building2, Briefcase, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { label: 'Painel e métricas', icon: LayoutDashboard, path: '/admin' },
  { label: 'Acessos e papéis', icon: Users, path: '/admin/utilizadores' },
  { label: 'Conformidade', icon: ScrollText, path: '/admin/auditoria' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    base44.auth.me().then((u) => {
      if (u.role !== 'admin') { navigate('/app'); return; }
      setUser(u);
      setChecking(false);
    }).catch(() => navigate('/entrar'));
  }, []);

  const handleLogout = async () => { await base44.auth.logout('/entrar'); };
  const isActive = (path) => path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const initials = (user?.full_name || 'A').trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-surface border-b border-line">
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
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-line min-h-[calc(100vh-3.5rem)] py-5 px-3 sticky top-14">
          <div className="px-3 pb-2"><span className="mark">§ NAVEGAÇÃO</span></div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm transition-colors ${
                    active ? 'bg-primary text-[#eafff7] font-semibold' : 'text-muted-foreground font-medium hover:text-ink hover:bg-[#f1f5f3]'
                  }`}
                >
                  <item.icon className="w-[16px] h-[16px] shrink-0" strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-5 pb-1.5 px-3"><span className="mark">§ MÓDULOS</span></div>
          <div className="space-y-0.5">
            <Link to="/parceiros" className="flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm font-medium text-muted-foreground hover:text-ink hover:bg-[#f1f5f3] transition-colors">
              <Briefcase className="w-[16px] h-[16px] shrink-0" strokeWidth={1.8} /> Portal de parceiros
            </Link>
            <Link to="/empresas" className="flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm font-medium text-muted-foreground hover:text-ink hover:bg-[#f1f5f3] transition-colors">
              <Building2 className="w-[16px] h-[16px] shrink-0" strokeWidth={1.8} /> Corporativo
            </Link>
          </div>

          <div className="mt-auto px-3 pt-4 border-t border-line">
            <div className="flex items-center gap-2.5 px-1 py-1.5">
              <div className="w-[32px] h-[32px] rounded-full bg-gold-soft text-[#9a6a16] flex items-center justify-center font-bold text-[12px] shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-ink leading-tight truncate">{user?.full_name || 'Admin'}</div>
                <div className="font-mono text-[9.5px] text-muted-2 mt-0.5">ADMINISTRADOR</div>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg text-muted-2 hover:text-destructive hover:bg-danger-soft transition-colors shrink-0" title="Sair">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile top nav */}
        <div className="md:hidden sticky top-14 z-20 bg-surface border-b border-line">
          <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors ${
                    active ? 'bg-primary text-[#eafff7]' : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" /> {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}