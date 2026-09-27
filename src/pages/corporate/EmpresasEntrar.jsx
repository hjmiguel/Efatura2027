import React from 'react';
import { Building2 } from 'lucide-react';
import ModuleEntrar from '@/components/auth/ModuleEntrar';

export default function EmpresasEntrar() {
  return (
    <ModuleEntrar
      icon={Building2}
      moduleTag="Corporativo"
      headline="Tesouraria"
      headlineAccent="empresarial."
      description="Contas a pagar, fornecedores, centros de custo e fiscal da tua empresa."
      footerLabel="CORPORATIVO · GESTÃO+"
      accentBarClass="bg-ok"
      accentTextClass="text-ok"
      accentFocusClass="focus:border-ok"
      requiredRole="corporate"
      redirectPath="/empresas"
      path="/empresas/entrar"
    />
  );
}