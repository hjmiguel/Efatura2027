import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Reveal from './Reveal';

const faqs = [
  {
    q: 'A Gestão+ fica com o meu dinheiro?',
    a: 'Não. A app nunca recebe nem reencaminha dinheiro. Quando pagas por Multicaixa Express, o pagamento vai direto da tua conta para a empresa, pela rede da EMIS. A app organiza e regista, nada mais.',
  },
  {
    q: 'Como é que a app vê as minhas faturas da AGT?',
    a: 'Só com a tua autorização expressa, dada dentro da app. Autorizas a consulta das faturas emitidas sob o teu NIF, e podes revogar quando quiseres, no separador Empresas. Sem autorização, não há acesso.',
  },
  {
    q: 'Quanto vou poupar no IRPS?',
    a: 'Não damos esse número, e desconfia de quem der. Os limites de dedução só ficam fechados com a publicação em Diário da República. O que a app faz é somar as tuas despesas dedutíveis e garantir que as faturas têm o teu NIF, que é a condição para contarem.',
  },
  {
    q: 'Preciso de instalar alguma coisa?',
    a: 'Não. A Gestão+ abre no navegador e podes instalá-la no ecrã inicial do telemóvel com um toque. Funciona também com rede fraca, porque guarda o essencial no aparelho.',
  },
  {
    q: 'E as faturas de papel?',
    a: 'Tiras foto e a app lê o emissor, o montante e o prazo. Serve para o que ainda não é eletrónico, e para os pequenos comerciantes que ainda não emitem fatura eletrónica.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6">
        <Reveal>
          <h2 className="text-center font-heading text-2xl sm:text-3xl font-bold text-ink mb-10">
            O que costumam perguntar.
          </h2>
        </Reveal>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={0.06 * i}>
              <div className="bg-surface rounded-talao border border-line overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-talao"
                  aria-expanded={open === i}
                >
                  <span className="font-heading font-semibold text-ink text-sm sm:text-base">{faq.q}</span>
                  <Plus
                    className={`w-4 h-4 text-muted-2 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`}
                  />
                </button>
                {open === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}