import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LogOut, User, Shield, Users, Lock } from 'lucide-react';
import ProfileAccount from '@/components/app/profile/ProfileAccount';
import ProfileSecurity from '@/components/app/profile/ProfileSecurity';
import ProfileDependents from '@/components/app/profile/ProfileDependents';
import ProfilePrivacy from '@/components/app/profile/ProfilePrivacy';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ink">Perfil</h1>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
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
    </div>
  );
}