import React, { useState } from 'react';
import { appApi } from '@/api/appClient';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, IdCard, Loader2, ShieldCheck } from 'lucide-react';

export default function CompletarPerfil() {
  const [phone, setPhone] = useState('');
  const [nif, setNif] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim() || !nif.trim()) {
      setError('O número de telefone e o NIF são obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      await appApi.auth.updateMe({ phone, nif });
      window.location.href = '/app';
    } catch (err) {
      setError(err.message || 'Não foi possível guardar os dados.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Seo title="Completar registo" description="Termina o teu registo na Gestão+." path="/completar-perfil" />
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-ink">Falta pouco</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Precisamos do teu número de telefone e do NIF para concluir o registo.
          </p>
        </div>

        <div className="bg-surface rounded-talao shadow-talao border border-line p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-soft text-destructive text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  autoFocus
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
                  A guardar...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}