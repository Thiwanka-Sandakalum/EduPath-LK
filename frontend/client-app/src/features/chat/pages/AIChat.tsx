import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Send, Bot, User, Plus, Sparkles, RefreshCw, PanelLeftClose, PanelLeftOpen, Terminal, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../../context/AppContext';
import type { ChatSession, ChatMessage } from '../../../types/chat';

import ReactMarkdown from 'react-markdown';
import { DefaultService } from '../../../../services/chat';


type CourseChatContext = {
  courseId: string;
  title: string;
  description?: string;
  level?: string;
  field?: string;
  institutionId?: string;
  institutionName?: string;
  classification?: 'Government' | 'Private' | 'Unknown';
  governmentOfferings?: Array<{
    universityId: string;
    universityName: string;
    proposedIntake?: number;
    academicYear?: string;
  }>;
};

const CHAT_CONTEXT_STORAGE_KEY = 'eduPath_chat_course_context_by_session';

const loadContextMap = (): Record<string, CourseChatContext> => {
  try {
    const raw = localStorage.getItem(CHAT_CONTEXT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const saveContextForSession = (sessionId: string, ctx: CourseChatContext) => {
  if (!sessionId) return;
  const map = loadContextMap();
  map[sessionId] = ctx;
  localStorage.setItem(CHAT_CONTEXT_STORAGE_KEY, JSON.stringify(map));
};

const getContextForSession = (sessionId: string | null): CourseChatContext | null => {
  if (!sessionId) return null;
  const map = loadContextMap();
  const ctx = map[sessionId];
  return ctx && typeof ctx === 'object' ? ctx : null;
};


const AIChat = () => {
  const { chatSessions, saveChatSession } = useAppStore();
  const location = useLocation();
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentSources, setCurrentSources] = useState<{ title: string, uri: string }[]>([]);

  const [activeCourseContext, setActiveCourseContext] = useState<CourseChatContext | null>(null);


  const [activeSessionId, setActiveSessionId] = useState<string | null>(() =>
    chatSessions.length > 0 ? chatSessions[0].id : null
  );

  const activeSession = chatSessions.find(s => s.id === activeSessionId);

  // If navigated from a Course Detail page, start a new chat with that course context.
  useEffect(() => {
    const state: any = (location as any)?.state;
    const ctx: CourseChatContext | undefined = state?.courseContext;
    const startNew: boolean = Boolean(state?.startNew);

    if (!ctx || !ctx.courseId) return;

    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: `Course: ${ctx.title || ctx.courseId}`,
      date: 'Today',
      messages: [
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: `I’m ready. Ask me anything about “${ctx.title || ctx.courseId}”.`,
          timestamp: new Date(),
        },
      ],
    };

    if (startNew) {
      saveChatSession(newSession);
      setActiveSessionId(newSessionId);
      saveContextForSession(newSessionId, ctx);
      setActiveCourseContext(ctx);
    }

    // Clear navigation state so refresh doesn't recreate sessions.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (window as any).history?.replaceState?.({}, document.title);
  }, [location, saveChatSession]);

  // Keep active course context in sync with active session
  useEffect(() => {
    const ctx = getContextForSession(activeSessionId);
    setActiveCourseContext(ctx);
  }, [activeSessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeSession?.messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    let currentSession = activeSession;
    let sessionId = activeSessionId;

    if (!currentSession) {
      sessionId = Date.now().toString();
      currentSession = {
        id: sessionId,
        title: input.length > 40 ? input.substring(0, 40) + '...' : input,
        date: 'Today',
        messages: []
      };
      setActiveSessionId(sessionId);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    const updatedMessages = [...currentSession.messages, userMsg];
    saveChatSession({ ...currentSession, messages: updatedMessages });
    setInput('');
    setIsTyping(true);
    setCurrentSources([]);

    try {
      const botMsgId = (Date.now() + 2).toString();
      saveChatSession({
        ...currentSession,
        messages: [...updatedMessages, { id: botMsgId, role: 'bot', text: '', timestamp: new Date() }]
      });

      // Call the chat API with only the question
      const response = await DefaultService.qaEndpointQaPost({ question: input });
      const botText = response?.answer || 'No response from AI.';
      saveChatSession({
        ...currentSession,
        messages: [...updatedMessages, { id: botMsgId, role: 'bot', text: botText, timestamp: new Date() }]
      });

      // Optionally handle source if provided
      if (response?.source) {
        setCurrentSources([{ title: response.source, uri: response.source }]);
      }

    } catch (error) {
      console.error("Chat Service Error:", error);
      saveChatSession({
        ...currentSession,
        messages: [...updatedMessages, { id: 'err' + Date.now(), role: 'bot', text: "Connectivity issue. Please check your network and try again.", timestamp: new Date() }]
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setInput('');
    setCurrentSources([]);
  };

  const groupedSessions = chatSessions.reduce((acc, session) => {
    const dateKey = session.date || 'Previous';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, ChatSession[]>);

  return (
    <div className="flex bg-[#fcfdfe] dark:bg-slate-950 h-full overflow-hidden">

      {/* Sidebar */}
      <aside className={`flex-shrink-0 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-40 h-full flex flex-col ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'} lg:relative fixed inset-y-0 left-0 pt-20 lg:pt-0 shadow-premium`}>
        <div className="p-6">
          <button onClick={handleNewChat} className="w-full flex items-center justify-center gap-3 bg-primary-600 text-white px-5 py-4 rounded-2xl font-bold shadow-premium hover:bg-primary-700 transition-all active:scale-95">
            <Plus size={18} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-8 scrollbar-hide">
          {Object.keys(groupedSessions).map(date => (
            <div key={date} className="space-y-1">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">{date}</h3>
              {groupedSessions[date].map(session => (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSessionId === session.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                >
                  <span className="truncate block">{session.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative h-full">
        <header className="h-20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-premium"><Bot size={20} /></div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Academic Advisor</h2>
                <span className="text-[9px] font-bold text-primary-500 uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span> Search Grounding Active</span>
              </div>
            </div>
          </div>
        </header>

        {activeCourseContext && (
          <div className="px-6 md:px-12 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Discussing: <span className="text-primary-600">{activeCourseContext.title}</span>
                <span className="text-slate-400 font-black text-[11px] ml-2">({activeCourseContext.courseId})</span>
              </div>
              <div className="text-xs font-bold">
                <Link
                  to={`/courses/${activeCourseContext.courseId}`}
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Back to course
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-12 scrollbar-hide" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-10">
            {!activeSession || activeSession.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-4xl flex items-center justify-center mb-10 shadow-inner"><Sparkles size={40} /></div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">How can I guide you?</h2>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">Ask about latest scholarships, degree paths, or UGC intake news in Sri Lanka.</p>
              </div>
            ) : (
              activeSession.messages.map((msg, i) => (
                <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'justify-start'} animate-fade-in-up`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${msg.role === 'bot' ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className="max-w-[85%] space-y-2">
                    <div className={`px-6 py-4 rounded-3xl text-[15px] leading-relaxed shadow-premium ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none font-medium'}`}>
                      {msg.role === 'bot' ? (
                        <ReactMarkdown>{msg.text || ''}</ReactMarkdown>
                      ) : (
                        msg.text
                      )}
                      {(isTyping && i === activeSession.messages.length - 1) ? <div className="flex gap-1 py-1.5"><div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce delay-100"></div><div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-200"></div></div> : null}
                    </div>
                    {msg.role === 'bot' && currentSources.length > 0 && i === activeSession.messages.length - 1 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {currentSources.map((source, idx) => (
                          <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-all uppercase tracking-tight">
                            <ExternalLink size={10} /> {source.title.substring(0, 20)}...
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Input */}
        <div className="p-6 md:p-10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md shrink-0">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSend} className="relative">
              <div className="flex gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-premium focus-within:ring-4 focus-within:ring-primary-500/10 transition-all">
                <div className="p-3 text-slate-400"><Terminal size={18} /></div>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your educational query..." className="flex-1 bg-transparent px-2 py-4 focus:outline-none text-[15px] font-bold dark:text-white" />
                <button type="submit" disabled={!input.trim() || isTyping} className="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all flex items-center justify-center shrink-0 shadow-premium active:scale-95 disabled:opacity-40">
                  {isTyping ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </form>
            <p className="mt-6 text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">AI-Powered Real-time Educational Search • UGC Verified</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIChat;