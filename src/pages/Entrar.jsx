import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Seo from '@/components/Seo';
import { Loader2, ArrowLeft } from 'lucide-react';
import GoogleIcon from '@/components/GoogleIcon';

export default function Entrar() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = '/app';
    } catch (err) {
      setError(err.message || 'Email ou palavra-passe incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider('google', '/app');
  };

  return (
    <div className="min-h-screen flex bg-[#f4f4f4]">
      <Seo title="Entrar" description="Acede à tua conta Gestão+ para gerir faturas, pagamentos e dedutíveis IRPS." path="/entrar" />

      {/* Left pane — dark */}
      <div className="hidden md:flex md:w-[40%] flex-col justify-between p-10 bg-ink text-white relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gold" />
            <span className="font-heading font-bold text-white text-sm relative">G+</span>
          </div>
          <span className="font-heading font-bold text-lg">Gestão+</span>
        </div>

        {/* Headline */}
        <div className="max-w-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-white/60 mb-4">Edição A1 • Luanda</p>
          <h1 className="font-heading text-4xl xl:text-5xl font-bold leading-tight">
            O teu dinheiro,<br />
            <span className="text-gold">em dia.</span>
          </h1>
          <p className="text-white/70 text-sm mt-5 leading-relaxed">
            Junta faturas, paga por Multicaixa Express e sabe sempre quanto te sobra.
          </p>
        </div>

        {/* Footer */}
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          Conforme a Lei 22/11 • EMIS
        </p>
      </div>

      {/* Right pane — light */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="p-6">
          <Link
            to="/registo"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-2 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Criar conta
          </Link>
        </div>

        {/* Center form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="w-full max-w-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-2 mb-2">Entrar</p>
            <h2 className="font-heading text-2xl font-bold text-ink mb-8">Bem-vindo de volta.</h2>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full h-12 flex items-center justify-center gap-2 bg-white border border-line rounded-lg text-sm font-medium text-ink hover:bg-muted transition-colors"
            >
              <GoogleIcon className="w-5 h-5" />
              Entrar com Google
            </button>

            {/* Separator */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-line" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-2">Ou email</span>
              <div className="flex-1 h-px bg-line" />
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger-soft text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[10px] font-medium uppercase tracking-wider text-muted-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="o.teu@email.ao"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-[#e8edf2] border border-transparent rounded-lg text-sm text-ink placeholder:text-muted-2 focus:outline-none focus:border-ink transition-colors"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[10px] font-medium uppercase tracking-wider text-muted-2">
                    Palavra-passe
                  </label>
                  <Link to="/forgot-password" className="text-xs text-ink hover:underline">
                    Esqueceste-te?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-[#e8edf2] border border-transparent rounded-lg text-sm text-ink placeholder:text-muted-2 focus:outline-none focus:border-ink transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A entrar...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <p className="text-center text-xs text-muted-2 mt-6">
              Ainda não tens conta?{' '}
              <Link to="/registo" className="text-ink font-medium hover:underline">
                Criar
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-2">
            © 2026 Gestão+ • Luanda
          </p>
        </div>
      </div>
    </div>
  );
}