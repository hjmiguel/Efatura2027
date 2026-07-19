import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, ScrollText, ArrowLeft, Building2, Briefcase } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Utilizadores', icon: Users, path: '/admin/utilizadores' },
  { label: 'Trilha de auditoria', icon: ScrollText, path: '/admin/auditoria' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    base44.auth.me().then(u => {
      if (u.role !== 'admin') {
        navigate('/app');
        return;
      }
      setUser(u);
      setChecking(false);
    }).catch(() => navigate('/entrar'));
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout('/entrar');
  };

  const isActive = (path) => path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  if (checking) {
    return (
      <div className="dark fixed inset-0 flex items-center justify-center bg-[hsl(163_34%_10%)]">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[hsl(163_34%_10%)] text-slate-100">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-[hsl(163_30%_13%)] border-r border-slate-800 z-30">
        <div className="px-6 py-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
            <Shield className="w-4 h-4 text-ink" />
          </div>
          <div>
            <span className="font-heading font-bold text-white text-sm">Gestão+</span>
            <span className="text-[10px] text-slate-500 block">Backoffice</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive(item.path)
                  ? 'bg-gold/15 text-gold font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
          <Link to="/parceiros" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
            <Briefcase className="w-4 h-4 shrink-0" />
            <span className="text-sm">Portal de parceiros</span>
          </Link>
          <Link to="/empresas" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="text-sm">Corporativo</span>
          </Link>
          <Link to="/app" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="text-sm">Voltar à app</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors w-full">
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      <header className="md:hidden sticky top-0 z-30 bg-[hsl(163_30%_13%)] border-b border-slate-800">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            <span className="font-heading font-bold text-white">Backoffice</span>
          </div>
          <Link to="/app" className="text-slate-400 text-sm">Voltar</Link>
        </div>
      </header>

      <main className="md:ml-60 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}