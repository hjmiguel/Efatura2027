import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { appApi } from '@/api/appClient';
import Seo from '@/components/Seo';
import { Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import GoogleIcon from '@/components/GoogleIcon';

/**
 * Página de acesso dedicada a um módulo (admin/parceiros/empresas).
 * Mesma identidade visual do Gestão+, apenas com accent de cor diferente.
 */
export default function ModuleEntrar({
  icon: Icon,
  moduleTag,
  headline,
  headlineAccent,
  description,
  footerLabel,
  accentBarClass,
  accentTextClass,
  accentFocusClass,
  requiredRole,
  redirectPath,
  backToAppPath = '/app',
  path,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDenied(false);
    setLoading(true);
    try {
      await appApi.auth.loginViaEmailPassword(email, password);
      const me = await appApi.auth.me();
      if (me?.app_role !== requiredRole) {
        setDenied(true);
        setLoading(false);
        return;
      }
      window.location.href = redirectPath;
    } catch (err) {
      setError(err.message || 'Email ou palavra-passe incorretos.');
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    appApi.auth.loginWithProvider('google', redirectPath);
  };

  const handleRetry = () => {
    appApi.auth.logout(path);
  };

  return (
    <div className="min-h-screen flex bg-[#f4f4f4]">
      <Seo title={moduleTag} description={description} path={path} />

      {/* Left pane — dark */}
      <div className="hidden md:flex md:w-[40%] flex-col justify-between p-10 bg-ink text-white relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center relative overflow-hidden">
            <div className={`absolute top-0 inset-x-0 h-1 ${accentBarClass}`} />
            <span className="font-heading font-bold text-white text-sm relative">G+</span>
          </div>
          <span className="font-heading font-bold text-lg">Gestão+</span>
        </div>

        <div className="max-w-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-white/60 mb-4">{moduleTag}</p>
          <h1 className="font-heading text-4xl xl:text-5xl font-bold leading-tight">
            {headline}<br />
            <span className={accentTextClass}>{headlineAccent}</span>
          </h1>
          <p className="text-white/70 text-sm mt-5 leading-relaxed">{description}</p>
        </div>

        <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">{footerLabel}</p>
      </div>

      {/* Right pane — light */}
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <Link to="/entrar" className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-2 hover:text-ink transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="w-full max-w-sm">
            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${accentBarClass}`}>
              <Icon className="w-5 h-5 text-ink" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-2 mb-2">{moduleTag}</p>
            <h2 className="font-heading text-2xl font-bold text-ink mb-8">Acesso reservado.</h2>

            {denied && (
              <div className="mb-5 p-4 rounded-lg bg-danger-soft flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Sem permissão para este módulo.</p>
                  <p className="text-[12px] text-destructive/80 mt-1">A tua conta não tem acesso a esta área.</p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <Link to={backToAppPath} className="text-[12px] font-semibold text-ink hover:underline">Voltar à app principal</Link>
                    <button type="button" onClick={handleRetry} className="text-[12px] font-semibold text-muted-2 hover:text-ink hover:underline">Entrar com outra conta</button>
                  </div>
                </div>
              </div>
            )}

            {!denied && (
              <>
                <button
                  type="button"
                  onClick={handleGoogle}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-white border border-line rounded-lg text-sm font-medium text-ink hover:bg-muted transition-colors"
                >
                  <GoogleIcon className="w-5 h-5" />
                  Entrar com Google
                </button>

                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-line" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-2">Ou email</span>
                  <div className="flex-1 h-px bg-line" />
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-danger-soft text-destructive text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[10px] font-medium uppercase tracking-wider text-muted-2">Email</label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      placeholder="o.teu@email.ao"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full h-12 px-4 bg-[#e8edf2] border border-transparent rounded-lg text-sm text-ink placeholder:text-muted-2 focus:outline-none ${accentFocusClass} transition-colors`}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-[10px] font-medium uppercase tracking-wider text-muted-2">Palavra-passe</label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full h-12 px-4 bg-[#e8edf2] border border-transparent rounded-lg text-sm text-ink placeholder:text-muted-2 focus:outline-none ${accentFocusClass} transition-colors`}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-60"
                  >
                    {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> A entrar...</>) : 'Entrar'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="p-6 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-2">© 2026 Gestão+ • Luanda</p>
        </div>
      </div>
    </div>
  );
}