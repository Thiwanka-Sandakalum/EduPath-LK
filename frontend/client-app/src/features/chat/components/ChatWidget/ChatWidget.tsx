import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Sparkles, Zap, Smartphone, RefreshCw, ChevronRight } from 'lucide-react';
import type { ChatMessage } from '../../../../types/chat';
import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'bot', text: 'Welcome to EduPath LK! How can I assist with your education journey today?' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // const result = await ai.models.generateContentStream({
      //   model: 'gemini-3-flash-preview',
      //   contents: [
      //     ...messages.slice(-6).map(m => ({
      //       role: m.role === 'bot' ? 'model' : 'user',
      //       parts: [{ text: m.text }]
      //     })),
      //     { role: 'user', parts: [{ text: currentInput }] }
      //   ],
      //   config: {
      //     systemInstruction: "You are the EduPath LK Advisor. Help students find courses, universities (Government and Private), and scholarships in Sri Lanka. Be concise, professional, and friendly. Use formatting to make data easy to read."
      //   }
      // });

      let botText = "";
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'bot', text: "" }]);

      // for await (const chunk of result) {
      //   botText += chunk.text;
      //   setMessages(prev =>
      //     prev.map(m => m.id === botMsgId ? { ...m, text: botText } : m)
      //   );
      // }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'bot',
        text: "I encountered a connectivity issue. Please try again in a moment."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className={`fixed bottom-8 right-8 p-5 bg-primary-600 text-white rounded-[2rem] shadow-premium hover:bg-primary-700 hover:scale-110 active:scale-95 transition-all duration-300 z-[60] group ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Ask AI Assistant"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-500 border-2 border-white dark:border-slate-900"></span>
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-8 md:right-8 w-full md:w-[400px] h-full md:h-[640px] glass dark:bg-slate-900/95 md:rounded-[2.5rem] shadow-premium z-[120] flex flex-col border border-white/20 dark:border-slate-800 overflow-hidden animate-pop-in">
          {/* Header */}
          <div className="bg-slate-900 dark:bg-slate-950 p-6 flex justify-between items-center text-white shrink-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-glow">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <span className="text-[15px] font-black uppercase tracking-tight block">EduPath Advisor</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">AI Interface Active</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide bg-slate-50/30 dark:bg-slate-950/20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400'
                  }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed shadow-soft ${msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-none font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none font-medium'
                  }`}>
                  {msg.text ? <div className="whitespace-pre-wrap">{msg.text}</div> : <div className="flex gap-1 py-1.5"><div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-primary-500/70 rounded-full animate-bounce delay-75"></div><div className="w-1.5 h-1.5 bg-primary-500/40 rounded-full animate-bounce delay-150"></div></div>}
                </div>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-6 glass border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about courses, unis..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-14 h-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center hover:bg-primary-700 transition-all shadow-glow disabled:opacity-30 active:scale-90"
              >
                {isTyping ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
            <p className="mt-4 text-center text-[8px] text-slate-300 dark:text-slate-600 font-black uppercase tracking-[0.3em]">
              System Protocol: Educational Path Intelligence
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;