import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, LayoutDashboard, Wallet, Users, PieChart, Landmark, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { label: 'Tesouraria', icon: LayoutDashboard, path: '/empresas' },
  { label: 'Contas a pagar', icon: Wallet, path: '/empresas/pagamentos' },
  { label: 'Fornecedores', icon: Users, path: '/empresas/fornecedores' },
  { label: 'Centros de custo', icon: PieChart, path: '/empresas/centros' },
  { label: 'Fiscal', icon: Landmark, path: '/empresas/fiscal' },
];

export default function CorporateLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    base44.auth.me().then((u) => {
      if (u.app_role !== 'corporate') { navigate('/app'); return; }
      setChecking(false);
    }).catch(() => navigate('/empresas/entrar'));
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout('/entrar');
  };

  const isActive = (path) => path === '/empresas' ? location.pathname === '/empresas' : location.pathname.startsWith(path);

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Saltar para o conteúdo</a>
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-surface border-r border-line z-30">
        <div className="px-6 py-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
            <Building2 className="w-4 h-4 text-gold" />
          </div>
          <div>
            <span className="font-heading font-bold text-ink text-sm">Gestão+</span>
            <span className="text-[10px] text-muted-2 block">Corporativo</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive(item.path) ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive(item.path) ? 'bg-primary text-white font-medium' : 'text-muted-foreground hover:text-ink hover:bg-muted'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-line space-y-0.5">
          <Link to="/app" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-ink hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="text-sm">Voltar à app</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-danger-soft transition-colors w-full">
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      <header className="md:hidden sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-line" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-ink" />
            <span className="font-heading font-bold text-ink">Corporativo</span>
          </div>
          <Link to="/app" className="text-sm text-muted-foreground">Voltar</Link>
        </div>
        <div className="flex gap-1 px-2 pb-2 overflow-x-auto">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} aria-current={isActive(item.path) ? 'page' : undefined} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive(item.path) ? 'bg-primary text-white' : 'text-muted-foreground bg-muted'
            }`}>
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <main id="main-content" className="md:ml-60 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}