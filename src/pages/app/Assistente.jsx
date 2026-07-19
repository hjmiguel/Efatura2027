import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { getFirstName } from '@/lib/format';
import ChatMessage from '@/components/app/ChatMessage';
import ChatSuggestions from '@/components/app/ChatSuggestions';

export default function Assistente() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => setUserName(getFirstName(u?.full_name) || 'utilizador')).catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;

    const userMsg = { role: 'user', content: msgText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await base44.functions.invoke('assistantChat', {
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
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-line">
        <div className="w-10 h-10 rounded-xl bg-gold-soft flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold text-ink">Assistente</h1>
          <p className="text-xs text-muted-2">Pergunta sobre as tuas finanças</p>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4">
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gold-soft flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            <h2 className="font-heading text-lg font-bold text-ink mb-1">
              Olá, {userName}!
            </h2>
            <p className="text-sm text-muted-2 mb-6 max-w-xs">
              Sou o teu assistente financeiro. Tenho acesso aos teus dados reais — transações, contas, faturas e dedutíveis.
            </p>
            <div className="w-full max-w-md">
              <ChatSuggestions onPick={handleSend} />
            </div>
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

      {/* Input area */}
      <div className="pt-3 border-t border-line">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreve a tua pergunta..."
            rows={1}
            className="flex-1 resize-none px-4 py-2.5 rounded-xl bg-surface border border-line text-sm text-ink placeholder:text-muted-2 focus:outline-none focus:border-primary/40 max-h-32"
            disabled={loading}
          />
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