import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'IRPS', href: '#irps' },
  { label: 'Preços', href: '#precos' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-md shadow-soft' : 'bg-background/80 backdrop-blur-md border-b border-line'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-heading font-bold text-white text-sm">G+</span>
          </div>
          <span className="font-heading font-bold text-ink text-lg">Gestão+</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/entrar"
            className="text-sm font-medium text-ink hover:text-primary transition-colors px-4 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Entrar
          </Link>
          <Link
            to="/registo"
            className="text-sm font-semibold text-white bg-primary hover:bg-primary-2 transition-colors px-4 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Criar conta
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-background border-b border-line">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block text-sm font-medium text-muted-foreground hover:text-ink py-2.5"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-line flex flex-col gap-2">
              <Link
                to="/entrar"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink px-4 py-2.5 text-center rounded-lg border border-line"
              >
                Entrar
              </Link>
              <Link
                to="/registo"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-white bg-primary px-4 py-2.5 rounded-lg text-center"
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