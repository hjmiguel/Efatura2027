import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';


export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-heading font-bold text-white text-sm">G+</span>
              </div>
              <span className="font-heading font-bold text-white text-lg">Gestão+</span>
            </div>
            <p className="text-sm leading-relaxed">
              O teu dinheiro, em dia. Feito para Angola.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-3">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
              <li><a href="#irps" className="hover:text-white transition-colors">IRPS</a></li>
              <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/termos" className="hover:text-white transition-colors">Termos de uso</Link></li>
              <li><Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link to="/privacidade" className="hover:text-white transition-colors">Lei 22/11</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-3">Contactos</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>apoio@gestaomais.ao</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                <span>+244 900 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Luanda, Angola</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 text-xs text-white/40 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Gestão+. Todos os direitos reservados.</p>
          <p>Pagamento seguro pela EMIS. Dados ao abrigo da Lei 22/11.</p>
        </div>
      </div>
    </footer>
  );
}