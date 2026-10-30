import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appApi } from '@/api/appClient';

export default function NamePromptDialog({ open, onSaved }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const full_name = name.trim();
    if (!full_name) return;
    setSaving(true);
    setError('');
    try {
      await appApi.auth.updateMe({ full_name });
      onSaved(full_name);
    } catch (err) {
      console.error(err);
      setError('Não foi possível guardar o nome. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-sm"
        description="Indica o teu nome para personalizarmos a aplicação."
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Como te chamamos?</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="profile-full-name">Nome</Label>
            <Input id="profile-full-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus className="mt-1.5" />
            {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving || !name.trim()}>{saving ? 'A guardar...' : 'Guardar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}