import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface text-ink/70 border-t-4 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        {/* Colophon header */}
        <div className="text-center mb-10 pb-8 border-b-2 border-ink">
          <span className="font-heading font-black text-ink text-3xl tracking-tight">
            Gestão<span className="text-primary">+</span>
          </span>
          <p className="font-body italic text-sm text-muted-foreground mt-2">O teu dinheiro, em dia. Feito para Angola.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <h4 className="font-heading font-bold text-ink text-sm mb-3 pb-2 border-b border-line uppercase tracking-wider">Produto</h4>
            <ul className="space-y-2 text-sm font-body">
              <li><a href="#como-funciona" className="hover:text-primary transition-colors">Como funciona</a></li>
              <li><a href="#irps" className="hover:text-primary transition-colors">IRPS</a></li>
              <li><a href="#precos" className="hover:text-primary transition-colors">Preços</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-ink text-sm mb-3 pb-2 border-b border-line uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm font-body">
              <li><Link to="/termos" className="hover:text-primary transition-colors">Termos de uso</Link></li>
              <li><Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
              <li><Link to="/privacidade" className="hover:text-primary transition-colors">Lei 22/11</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-ink text-sm mb-3 pb-2 border-b border-line uppercase tracking-wider">Contactos</h4>
            <ul className="space-y-2.5 text-sm font-body">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>apoio@gestaomais.ao</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>+244 900 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Luanda, Angola</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-ink text-sm mb-3 pb-2 border-b border-line uppercase tracking-wider">Sobre</h4>
            <p className="text-sm font-body leading-relaxed">
              A Gestão+ é uma app de finanças pessoais que organiza faturas, pagamentos e prepara o teu IRPS. Sem intermediação financeira.
            </p>
          </div>
        </div>

        <div className="rule-thin pt-6 text-xs text-muted-2 flex flex-col sm:flex-row items-center justify-between gap-2 font-body">
          <p>© 2026 Gestão+. Todos os direitos reservados.</p>
          <p className="italic">Pagamento seguro pela EMIS. Dados ao abrigo da Lei 22/11.</p>
        </div>
      </div>
    </footer>
  );
}