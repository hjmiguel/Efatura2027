import React from 'react';
import Seo from '@/components/Seo';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const sections = [
  {
    title: '1. Aceitação dos termos',
    body: 'Ao registar-te e utilizar a aplicação Gestão+ ("a app"), aceitas os presentes Termos de Uso. Se não concordas com algum ponto, não deves utilizar a app. A utilização por menores de 18 anos requer autorização de um responsável legal.',
  },
  {
    title: '2. Descrição do serviço',
    body: 'A Gestão+ é uma aplicação de gestão financeira pessoal que ajuda utilizadores em Angola a organizar faturas, controlar despesas e preparar-se para o cumprimento das obrigações fiscais, incluindo o IRPS a entrar em vigor em 2027. A app inclui: registo e organização de faturas, orçamento por categorias, avisos de prazo, assistente de IA e relatórios.',
  },
  {
    title: '3. Sem intermediação financeira',
    body: 'A Gestão+ NÃO é uma instituição financeira, nem bancária, nem de pagamento. A app não recebe, retém, transfere nem movimenta fundos do utilizador. Todos os pagamentos são efetuados diretamente pelo utilizador às entidades prestadoras de serviços, nomeadamente através do Multicaixa Express, operado pela EMIS. A app apenas organiza a informação e apresenta referências de pagamento.',
  },
  {
    title: '4. Registo e conta',
    body: 'Para utilizar a app, deves registar-te com um endereço de email válido e criar uma palavra-passe. É tua responsabilidade manter a confidencialidade das tuas credenciais e garantir que a informação fornecida no registo é verdadeira. A conta é pessoal e intransmissível.',
  },
  {
    title: '5. Acesso a dados da AGT',
    body: 'A app pode aceder às faturas eletrónicas emitidas sob o teu NIF através da interface da AGT, mediante o teu consentimento expresso. Este acesso é facultativo: podes concedê-lo, recusá-lo ou revogá-lo a qualquer momento nas definições da app. A revogação não afeta os dados já registados, mas impede a obtenção de novas faturas por via automática.',
  },
  {
    title: '6. Responsabilidades do utilizador',
    body: 'Comprometes-te a: (i) utilizar a app apenas para fins pessoais e lícitos; (ii) não fornecer informação falsa ou enganosa; (iii) não tentar aceder a dados de terceiros; (iv) manter a tua informação de contacto atualizada. A exatidão dos dados registados depende da qualidade da informação que introduzes ou autorizas a app a obter.',
  },
  {
    title: '7. Planos e subscrição',
    body: 'A app oferece um plano gratuito, com funcionalidades limitadas, e um plano Premium pago (2.500 Kz/mês). A subscrição do Premium é processada por um prestador de pagamentos externo. O cancelamento pode ser feito a qualquer momento, mantendo o acesso até ao fim do período já pago. Não há reembolso de períodos parciais.',
  },
  {
    title: '8. Limitação de responsabilidade',
    body: 'A Gestão+ fornece ferramentas de organização e informação, mas não garante a exatidão absoluta dos dados obtidos de terceiros (incluindo a AGT e as entidades prestadoras de serviços). A app não constitui aconselhamento fiscal, contabilístico ou jurídico. Para a declaração do IRPS, consulta um técnico oficial de contas ou a AGT.',
  },
  {
    title: '9. Disponibilidade do serviço',
    body: 'Procuramos manter a app disponível 24 horas por dia, mas não garantimos interrupções zero. Acesso a dados de terceiros (como a AGT) pode estar temporariamente indisponível por motivos alheios à Gestão+. Reservamo-nos o direito de suspender o serviço para manutenção ou atualizações.',
  },
  {
    title: '10. Encerramento de conta',
    body: 'Podes encerrar a tua conta a qualquer momento nas definições da app. O encerramento elimina os teus dados pessoais e registos associados, exceto quando a lei exigir a sua retenção. A Gestão+ reserva-se o direito de encerrar contas que violem estes Termos.',
  },
  {
    title: '11. Alterações aos termos',
    body: 'Podemos atualizar estes Termos a qualquer momento. Notificaremos os utilizadores sobre alterações relevantes através da app ou por email. A utilização continuada após a entrada em vigor das alterações constitui aceitação dos novos Termos.',
  },
  {
    title: '12. Lei aplicável',
    body: 'Estes Termos regem-se pela legislação da República de Angola, incluindo a Lei n.º 22/11, de 17 de Junho, sobre a Proteção de Dados Pessoais. Qualquer litígio será dirimido nos tribunais de Luanda, salvo disposição legal em contrário.',
  },
];

export default function Termos() {
  return (
    <div className="min-h-screen bg-background">
      <Seo title="Termos de Uso" description="Termos de Uso da aplicação Gestão+ — uso do serviço, dados e subscrições." path="/termos" />
      <Navbar />
      <main className="pt-28 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-2 mb-3">
            Legal
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-ink mb-3">
            Termos de Uso
          </h1>
          <p className="text-sm text-muted-foreground mb-12">
            Última atualização: 17 de julho de 2026
          </p>

          <div className="space-y-8">
            {sections.map((s, i) => (
              <section key={i}>
                <h2 className="font-heading text-lg font-bold text-ink mb-2">{s.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-line">
            <p className="text-sm text-muted-foreground">
              Questões sobre estes Termos? Escreve-nos para{' '}
              <a href="mailto:apoio@gestaomais.ao" className="text-primary font-medium hover:underline">
                apoio@gestaomais.ao
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}