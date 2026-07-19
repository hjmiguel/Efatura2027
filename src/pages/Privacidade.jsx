import React from 'react';
import Seo from '@/components/Seo';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const sections = [
  {
    title: '1. Dados pessoais recolhidos',
    body: 'A Gestão+ recolhe os seguintes dados pessoais: nome, endereço de email, número de identificação fiscal (NIF) e dados de faturas e despesas que introduzas ou autorizes a obter. A recolha é feita no momento do registo e durante a utilização da app.',
  },
  {
    title: '2. Base legal',
    body: 'O tratamento dos teus dados pessoais fundamenta-se no teu consentimento (artigo 9.º da Lei n.º 22/11, de 17 de Junho) e na execução do contrato de prestação de serviços. O consentimento é livre, específico, informado e pode ser retirado a qualquer momento.',
  },
  {
    title: '3. Finalidade do tratamento',
    body: 'Os teus dados são utilizados para: (i) criar e gerir a tua conta; (ii) organizar e apresentar as tuas faturas e despesas; (iii) gerar relatórios e orçamentos; (iv) enviar avisos de prazo de pagamento; (v) preparar informação para o cumprimento das obrigações fiscais, incluindo o IRPS a partir de 2027.',
  },
  {
    title: '4. Acesso a dados da AGT',
    body: 'Se autorizares, a app acede às faturas eletrónicas emitidas sob o teu NIF através da interface da AGT. Este acesso é facultativo e pode ser revogado a qualquer momento nas definições da app. A revogação não afeta os dados já registados, mas interrompe a obtenção automática de novas faturas.',
  },
  {
    title: '5. Sem intermediação financeira',
    body: 'A Gestão+ não recebe, retém nem transfere fundos. Os pagamentos são efetuados diretamente pelo utilizador às entidades prestadoras de serviços. A app não armazena dados bancários completos — apenas referências de pagamento (entidade, referência e montante) para te ajudar a organizar.',
  },
  {
    title: '6. Partilha de dados',
    body: 'A Gestão+ não vende, aluga nem cede os teus dados pessoais a terceiros. Os dados podem ser partilhados apenas quando: (i) exigido por lei ou autoridade competente; (ii) necessário para a prestação do serviço (ex.: prestador de pagamentos para a subscrição Premium); (iii) com o teu consentimento expresso.',
  },
  {
    title: '7. Segurança dos dados',
    body: 'Implementamos medidas técnicas e organizativas adequadas para proteger os teus dados contra acesso não autorizado, alteração, divulgação ou destruição. Incluem encriptação em trânsito, controlo de acessos e auditorias regulares. Nenhum sistema é 100% seguro, mas comprometemo-nos a manter os melhores padrões.',
  },
  {
    title: '8. Retenção de dados',
    body: 'Os teus dados são retaindos pelo tempo necessário à prestação do serviço. Se encerrares a conta, os dados pessoais são eliminados num prazo de 90 dias, exceto quando a lei exigir retenção por período superior (ex.: dados fiscais relevantes para o IRPS).',
  },
  {
    title: '9. Direitos do titular dos dados',
    body: 'Ao abrigo da Lei 22/11, tens direito a: (i) acesso aos teus dados; (ii) retificação de dados incorretos; (iii) eliminação dos teus dados ("direito ao esquecimento"); (iv) limitação do tratamento; (v) portabilidade dos dados; (vi) oposição ao tratamento; (vii) retirada do consentimento. Para exercer estes direitos, contacta apoio@gestaomais.ao.',
  },
  {
    title: '10. Assistente de IA',
    body: 'A app inclui um assistente de IA que responde a perguntas sobre as tuas finanças. As perguntas são processadas para gerar respostas, mas não são utilizadas para treinar modelos externos. Podes desativar o assistente nas definições da app.',
  },
  {
    title: '11. Menores',
    body: 'A app não se destina a menores de 18 anos. Não recolhemos intencionalmente dados de menores. Se detetares que um menor forneceu dados sem autorização, contacta-nos para os eliminarmos.',
  },
  {
    title: '12. Alterações a esta política',
    body: 'Podemos atualizar esta Política de Privacidade a qualquer momento. Notificaremos os utilizadores sobre alterações relevantes através da app ou por email. A utilização continuada após a entrada em vigor das alterações constitui aceitação da política atualizada.',
  },
  {
    title: '13. Autoridade de controlo',
    body: 'Se consideras que o tratamento dos teus dados viola a Lei 22/11, tens o direito de apresentar reclamação junto da autoridade de proteção de dados competente em Angola.',
  },
];

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-background">
      <Seo title="Política de Privacidade" description="Como a Gestão+ recolhe, trata e protege os teus dados pessoais e financeiros." path="/privacidade" />
      <Navbar />
      <main className="pt-28 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-2 mb-3">
            Legal
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-ink mb-3">
            Política de Privacidade
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
              Questões sobre a tua privacidade? Escreve-nos para{' '}
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