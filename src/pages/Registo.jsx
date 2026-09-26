import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { appApi } from '@/api/appClient';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, UserPlus, Phone, IdCard } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/components/ui/use-toast';
import GoogleIcon from '@/components/GoogleIcon';

export default function Registo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [nif, setNif] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }
    if (!phone.trim() || !nif.trim()) {
      setError('O número de telefone e o NIF são obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      const result = await appApi.auth.register({ email, password });
      if (result?.access_token) {
        appApi.auth.setToken(result.access_token);
        await appApi.auth.updateMe({ phone, nif });
        window.location.href = '/app';
        return;
      }
      setShowOtp(true);
    } catch (err) {
      setError(err.message || 'O registo falhou.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await appApi.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        appApi.auth.setToken(result.access_token);
      }
      await appApi.auth.updateMe({ phone, nif });
      window.location.href = '/app';
    } catch (err) {
      setError(err.message || 'Código de verificação inválido.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await appApi.auth.resendOtp(email);
      toast({
        title: 'Código enviado',
        description: 'Verifica o teu email para o novo código.',
      });
    } catch (err) {
      setError(err.message || 'Falha ao reenviar o código.');
    }
  };

  const handleGoogle = () => {
    appApi.auth.loginWithProvider('google', '/app');
  };

  if (showOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Seo title="Criar conta" description="Cria a tua conta Gestão+ e começa a organizar as tuas finanças pessoais." path="/registo" />
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-ink">Verifica o teu email</h1>
            <p className="text-muted-foreground mt-2 text-sm">Enviámos um código para {email}</p>
          </div>

          <div className="bg-surface rounded-talao shadow-talao border border-line p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger-soft text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="flex justify-center mb-6">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
                autoFocus
                autoComplete="one-time-code"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              className="w-full h-12 font-medium"
              onClick={handleVerify}
              disabled={loading || otpCode.length < 6}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A verificar...
                </>
              ) : (
                'Verificar'
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Não recebeste o código?{' '}
              <button onClick={handleResend} className="text-primary font-medium hover:underline">
                Reenviar
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Seo title="Criar conta" description="Cria a tua conta Gestão+ e começa a organizar as tuas finanças pessoais." path="/registo" />
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-ink">Criar conta</h1>
          <p className="text-muted-foreground mt-2 text-sm">Começa a organizar as tuas contas</p>
        </div>

        <div className="bg-surface rounded-talao shadow-talao border border-line p-8">
          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium mb-6"
            onClick={handleGoogle}
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Registar com Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-3 text-muted-2">ou</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-soft text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="o.teu@email.ao"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar palavra-passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Número de telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="9XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nif">NIF</Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                <Input
                  id="nif"
                  type="text"
                  placeholder="O teu número de identificação fiscal"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A criar conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tens conta?{' '}
          <Link to="/entrar" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}