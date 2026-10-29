import React from 'react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';

export default function StatusConfirmDialog({ action, onCancel, onConfirm }) {
  const toPaid = action?.kind === 'paid';
  return (
    <AlertDialog open={!!action} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{toPaid ? 'Marcar como paga?' : 'Reverter para pendente?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {toPaid
              ? 'Vais registar manualmente esta fatura como paga e o valor será descontado da tua conta. Isto não é uma confirmação recebida do Multicaixa, da EMIS ou da AGT.'
              : 'A fatura volta a pendente, a data de pagamento é removida e o movimento associado é eliminado, repondo o saldo da conta. O estado AGT não é alterado.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}