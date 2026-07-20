import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { LogOut, User, Shield, Users, Lock, Crown, WifiOff, Download, ChevronRight } from 'lucide-react';
import ProfileAccount from '@/components/app/profile/ProfileAccount';
import ProfileSecurity from '@/components/app/profile/ProfileSecurity';
import ProfileDependents from '@/components/app/profile/ProfileDependents';
import ProfilePrivacy from '@/components/app/profile/ProfilePrivacy';
import PremiumModal from '@/components/app/PremiumModal';
import { usePWA } from '@/hooks/usePWA';

const tabs = [
  { id: 'conta', label: 'Conta', icon: User },
  { id: 'seguranca', label: 'Segurança', icon: Lock },
  { id: 'dependentes', label: 'Dependentes', icon: Users },
  { id: 'privacidade', label: 'Privacidade', icon: Shield },
];

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('conta');
  const [premiumOpen, setPremiumOpen] = useState(false);
  const { installAvailable: canInstall, promptInstall: installApp } = usePWA();

  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    try {
      const me = await base44.auth.me();
      setUser(me);
    } catch (err) { console.error('Erro:', err); }
    finally { setLoading(false); }
  }

  async function handleLogout() {
    await base44.auth.logout('/entrar');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const initials = (user?.full_name || 'U').trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="bg-surface border border-line rounded-talao p-4 shadow-soft flex items-center gap-3.5">
        <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-primary to-primary-2 text-white flex items-center justify-center font-heading font-bold text-lg shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-ink truncate">{user?.full_name || 'Utilizador'}</p>
          <p className="text-[12.5px] text-muted-foreground truncate">{user?.email}</p>
          {user?.nif && (
            <span className="inline-block mt-1.5 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-gold-soft text-[#8a6420]">
              NIF {user.nif}
            </span>
          )}
        </div>
      </div>

      {/* Admin / Corporate / Partner quick links */}
      {user?.role === 'admin' && (
        <Link to="/admin" className="block bg-surface border border-line rounded-talao p-4 shadow-soft flex items-center gap-3 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-gold-soft flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#9a6a16]" />
          </div>
          <div className="flex-1">
            <p className="font-heading font-semibold text-[15px] text-ink">Backoffice admin</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Utilizadores, auditoria, antifraude e planos.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-2 shrink-0" />
        </Link>
      )}

      {/* Premium card */}
      <div className="rounded-talao p-4 bg-gradient-to-br from-ink to-primary-2 text-white shadow-talao relative overflow-hidden">
        <div className="absolute -right-6 -top-8 w-[120px] h-[120px] rounded-full bg-gold/10" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-gold" />
          </div>
          <div className="flex-1">
            <p className="font-heading font-bold text-[15px]">Gestão+ Premium</p>
            <p className="text-[12px] text-white/70 mt-0.5">Relatórios ilimitados, sync automático e mais.</p>
          </div>
          <button onClick={() => setPremiumOpen(true)} className="px-3 py-2 bg-gold text-ink rounded-lg text-[13px] font-bold shrink-0">
            Subscrever
          </button>
        </div>
      </div>

      {/* PWA card */}
      <div className="bg-gold-soft border border-[#f0dcb4] rounded-talao p-4 shadow-soft">
        <div className="flex items-center gap-2.5 mb-2">
          <WifiOff className="w-4 h-4 text-[#9a6a16]" />
          <span className="text-[13px] font-semibold text-ink">Modo offline</span>
        </div>
        <p className="text-[12.5px] text-[#8a6420] leading-relaxed mb-3">
          Instala a app no teu telemóvel para aceder às faturas e pagamentos sem ligação à internet.
        </p>
        {canInstall ? (
          <button onClick={installApp} className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface border border-line rounded-lg text-[13px] font-medium text-ink">
            <Download className="w-4 h-4" /> Instalar app
          </button>
        ) : (
          <p className="text-[11px] text-[#9a6a16] font-medium">Já instalada ou a instalar pelo menu do browser.</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                active ? 'bg-primary text-white' : 'text-muted-foreground hover:text-ink hover:bg-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-surface rounded-talao border border-line p-5">
        {activeTab === 'conta' && <ProfileAccount user={user} onUserChange={setUser} />}
        {activeTab === 'seguranca' && <ProfileSecurity user={user} />}
        {activeTab === 'dependentes' && <ProfileDependents />}
        {activeTab === 'privacidade' && <ProfilePrivacy />}
      </div>

      {/* Premium modal */}
      <PremiumModal open={premiumOpen} onOpenChange={setPremiumOpen} />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 bg-danger-soft text-destructive rounded-talao text-sm font-semibold hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Terminar sessão
      </button>
    </div>
  );
}