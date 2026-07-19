import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon, ArrowLeftRight, Wallet, CreditCard,
  FileText, Receipt, Landmark, MessageSquare, User,
  LogOut, Bell, PieChart,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { label: 'Início', icon: HomeIcon, path: '/app' },
  { label: 'Transações', icon: ArrowLeftRight, path: '/app/transacoes' },
  { label: 'Contas', icon: Wallet, path: '/app/contas' },
  { label: 'Orçamento', icon: PieChart, path: '/app/orcamento', soon: true },
  { label: 'Pagamentos', icon: CreditCard, path: '/app/pagamentos', soon: true },
  { label: 'Documentos', icon: FileText, path: '/app/documentos', soon: true },
  { label: 'Dedutíveis', icon: Receipt, path: '/app/dedutiveis' },
  { label: 'Situação fiscal', icon: Landmark, path: '/app/fiscal' },
  { label: 'Assistente', icon: MessageSquare, path: '/app/assistente' },
  { label: 'Perfil', icon: User, path: '/app/perfil' },
];

const mobileNavItems = [
  { label: 'Início', icon: HomeIcon, path: '/app' },
  { label: 'Contas', icon: Wallet, path: '/app/contas' },
  { label: 'Transações', icon: ArrowLeftRight, path: '/app/transacoes' },
  { label: 'Dedutíveis', icon: Receipt, path: '/app/dedutiveis' },
  { label: 'Perfil', icon: User, path: '/app/perfil' },
];

export default function AppLayout() {
  const location = useLocation();

  const handleLogout = async () => {
    await base44.auth.logout('/entrar');
  };

  const isActive = (path) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  const Logo = ({ compact }) => (
    <Link to="/" className="flex items-center gap-2">
      <div className={`relative ${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg bg-primary flex items-center justify-center overflow-hidden`}>
        <div className={`absolute top-0 inset-x-0 ${compact ? 'h-0.5' : 'h-1'} bg-gold`} />
        <span className={`font-heading font-bold text-white relative ${compact ? 'text-xs' : 'text-sm'}`}>G+</span>
      </div>
      <span className="font-heading font-bold text-ink text-lg">Gestão+</span>
    </Link>
  );

  const NavItem = ({ item }) => {
    const active = isActive(item.path);
    if (item.soon) {
      return (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-2 cursor-not-allowed">
          <item.icon className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium flex-1">{item.label}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-2/70 bg-muted px-1.5 py-0.5 rounded">em breve</span>
        </div>
      );
    }
    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
          active
            ? 'bg-primary text-white font-medium'
            : 'text-muted-foreground hover:text-ink hover:bg-muted'
        }`}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="text-sm">{item.label}</span>
      </Link>
    );
  };

  const MobileNavItem = ({ item }) => {
    const active = isActive(item.path);
    if (item.soon) {
      return (
        <div className="flex flex-col items-center gap-0.5 py-1 px-2 text-muted-2/50 cursor-not-allowed">
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </div>
      );
    }
    return (
      <Link
        to={item.path}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 ${active ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <item.icon className="w-5 h-5" />
        <span className="text-[10px] font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-surface border-r border-line z-30">
        <div className="px-6 py-5">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
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

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-line">
        <div className="flex items-center justify-between px-4 h-14">
          <Logo compact />
          <button className="p-2 text-muted-foreground hover:text-ink rounded-lg">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="md:ml-60 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-line">
        <div className="flex items-center justify-around h-16">
          {mobileNavItems.map((item) => (
            <MobileNavItem key={item.path} item={item} />
          ))}
        </div>
      </nav>
    </div>
  );
}