import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Play, FlaskConical, RefreshCw, AlertTriangle } from 'lucide-react';
import { runAllTests, getTestSummary } from '@/lib/tests';

export default function AdminTestes() {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  const runTests = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const res = runAllTests();
      setResults(res);
      setRunning(false);
    }, 150);
  }, []);

  useEffect(() => {
    runTests();
  }, [runTests]);

  const summary = getTestSummary(results);
  const allPassed = summary.total > 0 && summary.failed === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-4 h-4 text-primary" />
            <span className="eyebrow">§ QUALIDADE</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink">Testes automáticos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Validação de regras de negócio: aritmética, semântica de cor, duplicados, independência e NIF.
          </p>
        </div>
        <button
          onClick={runTests}
          disabled={running}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-[#eafff7] rounded-xl text-sm font-semibold hover:bg-primary-2 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? 'A executar...' : 'Voltar a executar'}
        </button>
      </div>

      {/* Status banner */}
      {results && !running && (
        <div
          className={`rounded-xl p-4 border ${
            allPassed
              ? 'bg-green-soft border-[#c3e6d5]'
              : 'bg-danger-soft border-[#f0ccc6]'
          }`}
        >
          <div className="flex items-center gap-3">
            {allPassed ? (
              <CheckCircle2 className="w-5 h-5 text-ok shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            )}
            <div>
              <p className={`font-heading font-semibold text-[15px] ${allPassed ? 'text-ok' : 'text-destructive'}`}>
                {allPassed
                  ? `Todos os ${summary.total} testes passaram`
                  : `${summary.failed} de ${summary.total} testes falharam`}
              </p>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">
                {allPassed
                  ? 'As regras de negócio estão a ser cumpridas em todos os fluxos.'
                  : 'Há testes que falharam — rever os detalhes abaixo.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total de testes" value={summary.total} icon={FlaskConical} tone="default" />
        <KpiCard label="Passaram" value={summary.passed} icon={CheckCircle2} tone="ok" />
        <KpiCard label="Falharam" value={summary.failed} icon={XCircle} tone="danger" />
      </div>

      {/* Loading */}
      {running && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin"></div>
        </div>
      )}

      {/* Test suites */}
      {results && !running && (
        <div className="space-y-4">
          {results.map((suite, idx) => {
            const suitePassed = suite.results.every((t) => t.passed);
            const suiteFailed = suite.results.filter((t) => !t.passed).length;
            return (
              <div key={idx} className="bg-surface border border-line rounded-xl overflow-hidden">
                {/* Suite header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <span className="mark">§{String(idx + 1).padStart(2, '0')}</span>
                    <h2 className="font-heading font-semibold text-[14px] text-ink">{suite.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {suitePassed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ok bg-green-soft px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> {suite.results.length} OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-destructive bg-danger-soft px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> {suiteFailed} falhou
                      </span>
                    )}
                  </div>
                </div>

                {/* Test results */}
                <div className="divide-y divide-line">
                  {suite.results.map((t, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-3 px-5 py-3">
                      {t.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-ok shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-medium ${t.passed ? 'text-ink' : 'text-destructive'}`}>
                          {t.name}
                        </p>
                        {!t.passed && t.error && (
                          <p className="text-[11.5px] text-muted-foreground mt-1 font-mono bg-muted/50 px-2 py-1.5 rounded">
                            {t.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Regras validadas */}
      {results && !running && (
        <div className="bg-surface border border-line rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="mark">§ REGRAS GARANTIDAS</span>
          </div>
          <div className="ed-list">
            <div className="it">
              <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
              <div className="flex-1">
                <div className="nm">Somas verificáveis à mão</div>
                <div className="sb">A soma das parcelas é sempre igual ao total apresentado.</div>
              </div>
            </div>
            <div className="it">
              <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
              <div className="flex-1">
                <div className="nm">Semântica de cor consistente</div>
                <div className="sb">Nenhum valor negativo usa dourado; nenhum positivo usa vermelho.</div>
              </div>
            </div>
            <div className="it">
              <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
              <div className="flex-1">
                <div className="nm">Sem duplicados</div>
                <div className="sb">Faturas de fontes diferentes (manual, OCR, AGT, parceiro) com mesma chave = 1 registo.</div>
              </div>
            </div>
            <div className="it">
              <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
              <div className="flex-1">
                <div className="nm">Independência das fontes</div>
                <div className="sb">Se o feed da AGT falhar, a app continua a calcular e funcionar.</div>
              </div>
            </div>
            <div className="it">
              <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
              <div className="flex-1">
                <div className="nm">NIF obrigatório para dedutível</div>
                <div className="sb">Faturas sem NIF do contribuinte não entram no acumulado dedutível do IRPS.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, tone }) {
  const toneClasses = {
    default: 'text-ink',
    ok: 'text-ok',
    danger: 'text-destructive',
  };
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow">{label}</span>
        <Icon className={`w-4 h-4 ${toneClasses[tone] || toneClasses.default}`} />
      </div>
      <div className={`font-mono text-2xl font-bold ${toneClasses[tone] || toneClasses.default}`}>
        {value}
      </div>
    </div>
  );
}