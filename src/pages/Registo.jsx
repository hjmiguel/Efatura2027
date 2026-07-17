import React from 'react';
import { Link } from 'react-router-dom';

export default function Registo() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-6">
          <span className="font-heading font-bold text-white">G+</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-ink mb-2">Criar conta</h1>
        <p className="text-muted text-sm mb-8">
          O registo estará disponível em breve. Ainda estamos a preparar esta página.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center bg-primary hover:bg-primary-2 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Voltar à página inicial
        </Link>
      </div>
    </div>
  );
}