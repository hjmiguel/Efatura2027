import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from '@/components/Seo';

const slides = [
  {
    emoji: '📸',
    title: ['Controla o teu dinheiro', 'sem esforço'],
    sub: 'Regista uma despesa em segundos, à mão ou por foto do recibo. Tudo organizado por categorias.',
  },
  {
    emoji: '🧾',
    title: ['Nunca percas', 'um pagamento'],
    sub: 'Faturas e compromissos num só sítio. A app lembra-te antes do prazo e dá-te a referência ou o IBAN para copiar e colar.',
  },
  {
    emoji: '🧠',
    title: ['Um assistente que', 'cuida das contas'],
    sub: 'Resumos claros, alertas de orçamento e deteção de pagamentos a mais. Por texto e por voz, com avisos por WhatsApp.',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  const next = () => {
    if (isLast) {
      navigate('/entrar');
    } else {
      setStep(step + 1);
    }
  };

  const skip = () => navigate('/entrar');

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 py-6 max-w-md mx-auto">
      <Seo title="Bem-vindo" description="Gestão+ — finanças pessoais em Angola." path="/onboarding" />

      {/* Skip */}
      <div className="flex justify-end">
        <button
          onClick={skip}
          className="text-sm font-semibold text-primary hover:text-primary-2 transition-colors"
        >
          Saltar
        </button>
      </div>

      {/* Illustration + text */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-48 h-48 rounded-[30px] bg-gradient-to-br from-primary to-primary-2 flex items-center justify-center text-7xl text-white shadow-talao-lg mb-8">
          {slide.emoji}
        </div>
        <h1 className="font-heading text-[25px] font-semibold leading-[1.2] tracking-tight text-ink">
          {slide.title[0]}<br />{slide.title[1]}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3 max-w-xs">
          {slide.sub}
        </p>
      </div>

      {/* Dots */}
      <div className="flex gap-2 justify-center mb-5">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === step ? 'w-6 bg-primary' : 'w-2 bg-muted-2/40'
            }`}
          />
        ))}
      </div>

      {/* Button */}
      <button
        onClick={next}
        className="w-full rounded-[14px] py-[15px] font-heading font-semibold text-[15px] bg-primary text-primary-foreground hover:bg-primary-2 transition-colors"
      >
        {isLast ? 'Começar' : 'Continuar'}
      </button>
    </div>
  );
}