import React, { useState, useEffect, useRef } from 'react';
import { appApi } from '@/api/appClient';
import { Send, Sparkles, Loader2, Mic } from 'lucide-react';
import { getFirstName, formatKzShort } from '@/lib/format';
import ChatMessage from '@/components/app/ChatMessage';
import ChatSuggestions from '@/components/app/ChatSuggestions';

export default function Assistente() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [heroData, setHeroData] = useState({ patrimonio: 0, monthExpense: 0, invoiceCount: 0 });
  const scrollRef = useRef(null);

  useEffect(() => {
    appApi.auth.me().then(u => setUserName(getFirstName(u?.full_name) || 'utilizador')).catch(() => {});
    loadHero();
  }, []);

  async function loadHero() {
    try {
      const [accts, txns, invs] = await Promise.all([
        appApi.entities.Account.list(),
        appApi.entities.Transaction.list('-date', 50),
        appApi.entities.Invoice.filter({ status: 'pending' }),
      ]);
      const now = new Date();
      const monthExp = txns
        .filter((t) => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.amount < 0; })
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      setHeroData({
        patrimonio: accts.reduce((s, a) => s + (a.balance || 0), 0),
        monthExpense: monthExp,
        invoiceCount: invs.length,
      });
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;
    const userMsg = { role: 'user', content: msgText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await appApi.functions.invoke('assistantChat', {
        message: msgText,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });
      const data = res.data || res;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || data.error || 'Ocorreu um erro. Tenta novamente.',
        timestamp: data.timestamp || new Date().toISOString()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Não consegui processar o teu pedido. Verifica a ligação e tenta novamente.',
        timestamp: new Date().toISOString()
      }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] md:h-[calc(100dvh-72px)]">
      {/* Header */}
      <div className="pb-3">
        <span className="eyebrow">§ 05 · Perguntas</span>
        <h1 className="font-heading text-xl font-bold text-ink mt-0.5">Assistente</h1>
      </div>

      {/* AI Hero (visible when no messages) */}
      {!hasMessages && (
        <div className="rounded-talao p-[18px] bg-gradient-to-br from-ink to-primary-2 text-white shadow-talao relative overflow-hidden mb-4">
          <div className="absolute -right-6 -top-8 w-[120px] h-[120px] rounded-full bg-white/8" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="font-heading font-bold text-base">Olá, {userName}!</p>
                <p className="text-[11px] text-white/60">Assistente financeiro</p>
              </div>
            </div>
            <p className="text-[13px] text-white/80 leading-relaxed mb-3">
              Tenho acesso aos teus dados reais. Pergunta-me sobre transações, faturas ou dedutíveis.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/10 rounded-lg px-3 py-2">
                <div className="text-[10px] text-white/60">Património</div>
                <div className="font-mono text-[13px] font-semibold">{formatKzShort(heroData.patrimonio)}</div>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg px-3 py-2">
                <div className="text-[10px] text-white/60">Gasto no mês</div>
                <div className="font-mono text-[13px] font-semibold">{formatKzShort(heroData.monthExpense)}</div>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg px-3 py-2">
                <div className="text-[10px] text-white/60">Por pagar</div>
                <div className="font-mono text-[13px] font-semibold">{heroData.invoiceCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2 space-y-4">
        {!hasMessages && (
          <div className="w-full">
            <ChatSuggestions onPick={handleSend} />
          </div>
        )}
        {hasMessages && (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} userName={userName} />
            ))}
            {loading && (
              <div className="flex gap-3 flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gold-soft text-gold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface border border-line">
                  <Loader2 className="w-4 h-4 text-muted-2 animate-spin" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ask bar */}
      <div className="pt-3 border-t border-line">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunta sobre as tuas finanças..."
            rows={1}
            className="flex-1 resize-none px-4 py-2.5 rounded-xl bg-surface border border-line text-sm text-ink placeholder:text-muted-2 focus:outline-none focus:border-primary/40 max-h-32"
            disabled={loading}
          />
          <button className="w-10 h-10 rounded-xl border border-line text-muted-2 flex items-center justify-center shrink-0 hover:text-primary hover:border-primary/30 transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-2 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-2 mt-1.5 text-center">
          O assistente usa os teus dados reais. Nunca inventa valores.
        </p>
      </div>
    </div>
  );
}