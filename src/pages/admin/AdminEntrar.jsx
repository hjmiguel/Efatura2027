import React from 'react';
import { Shield } from 'lucide-react';
import ModuleEntrar from '@/components/auth/ModuleEntrar';

export default function AdminEntrar() {
  return (
    <ModuleEntrar
      icon={Shield}
      moduleTag="Backoffice"
      headline="Gestão"
      headlineAccent="operacional."
      description="Painel de operação, empresas, antifraude e conformidade do Gestão+."
      footerLabel="ADMIN · GESTÃO+"
      accentBarClass="bg-gold"
      accentTextClass="text-gold"
      accentFocusClass="focus:border-gold"
      requiredRole="admin"
      redirectPath="/admin"
      path="/admin/entrar"
    />
  );
}