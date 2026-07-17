import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'IRPS', href: '#irps' },
  { label: 'Preços', href: '#precos' },
];

function formatDate() {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const d = new Date();
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-ink">
      {/* Masthead top bar */}
      <div className="border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-8 flex items-center justify-between text-[0.65rem] uppercase tracking-widest text-muted-2 font-body">
          <span className="hidden sm:block">{formatDate()}</span>
          <span className="sm:hidden">{formatDate().split(',')[0]}</span>
          <span>Luanda · Edição Nº 1</span>
          <span className="hidden sm:block">Kz · AOA</span>
        </div>
      </div>

      {/* Masthead */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col items-center">
        <Link to="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          <span className="font-heading font-black text-ink text-2xl sm:text-3xl tracking-tight">
            Gestão<span className="text-primary">+</span>
          </span>
        </Link>
      </div>

      {/* Double rule + nav bar */}
      <div className="rule-double" />
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between">
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-widest text-ink hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-5 ml-auto">
          <Link
            to="/entrar"
            className="text-xs font-semibold uppercase tracking-widest text-ink hover:text-primary transition-colors"
          >
            Entrar
          </Link>
          <Link
            to="/registo"
            className="text-xs font-semibold uppercase tracking-widest text-surface bg-primary hover:bg-primary-2 transition-colors px-4 py-2"
          >
            Criar conta
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-line bg-surface">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block text-sm font-semibold uppercase tracking-wider text-ink py-2.5 border-b border-line"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                to="/entrar"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-ink px-4 py-2.5 text-center border border-ink"
              >
                Entrar
              </Link>
              <Link
                to="/registo"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-surface bg-primary px-4 py-2.5 text-center"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}