import React from 'react';
import { Briefcase } from 'lucide-react';
import ModuleEntrar from '@/components/auth/ModuleEntrar';

export default function ParceirosEntrar() {
  return (
    <ModuleEntrar
      icon={Briefcase}
      moduleTag="Portal de parceiros"
      headline="Integração"
      headlineAccent="de faturação."
      description="Emite, consulta e sincroniza faturas em nome dos teus clientes."
      footerLabel="PARCEIROS · GESTÃO+"
      accentBarClass="bg-brandblue"
      accentTextClass="text-brandblue"
      accentFocusClass="focus:border-brandblue"
      requiredRole="partner"
      redirectPath="/parceiros"
      path="/parceiros/entrar"
    />
  );
}