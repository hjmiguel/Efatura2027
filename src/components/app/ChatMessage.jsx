import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { getFirstName } from '@/lib/format';

export default function ChatMessage({ message, userName }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-primary text-white' : 'bg-gold-soft text-gold'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-white rounded-tr-sm'
            : 'bg-surface border border-line text-ink rounded-tl-sm'
        }`}>
          {message.content}
        </div>
        {message.timestamp && (
          <span className="text-[10px] text-muted-2 px-1">
            {new Date(message.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}