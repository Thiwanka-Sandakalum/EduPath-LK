import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, GraduationCap, Globe, ChevronDown,
  LayoutGrid, User, Settings, LogOut, Eye, EyeOff,
  Check, ArrowRight, Loader2, AlertCircle,
  Mail, Lock, User as UserIcon, Sparkles
} from 'lucide-react';
import { useAppStore } from '../../../context/AppContext';
import { useAuth0 } from '@auth0/auth0-react';
import { translations, Language } from '../../../data/translations';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { language, setLanguage } = useAppStore();
  const { user, loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const t = translations[language].nav;

  const navItems = [
    { label: t.home, path: '/' },
    { label: t.institutions, path: '/institutions' },
    { label: t.courses, path: '/courses' },
    { label: t.scholarships, path: '/scholarships' },
    { label: 'Loans', path: '/loans' },
    { label: t.tools, path: '/tools' },
    { label: t.blog, path: '/blog' },
    { label: t.chat, path: '/chat' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);



  const isLandingPage = location.pathname === '/';
  const isSolid = scrolled || !isLandingPage;

  const languages: { code: Language, label: string, display: string }[] = [
    { code: 'en', label: 'EN', display: 'English' },
    { code: 'si', label: 'SI', display: 'සිංහල' },
    { code: 'ta', label: 'TA', display: 'தமிழ்' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${isSolid
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 py-3 shadow-premium'
          : 'bg-transparent py-8'
          }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <div className={`p-2.5 rounded-2xl transition-all duration-500 shadow-glow ${isSolid ? 'bg-primary-600 text-white' : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
              } group-hover:scale-110 group-hover:rotate-6 group-active:scale-95`}>
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className={`font-black text-2xl tracking-tighter transition-colors duration-500 ${isSolid ? 'text-slate-900 dark:text-white' : 'text-white'
              }`}>
              EduPath<span className="text-primary-500">LK</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-bold px-4 py-2.5 rounded-xl transition-all relative group overflow-hidden ${location.pathname === item.path
                  ? (isSolid ? 'text-primary-600' : 'text-primary-400')
                  : (isSolid ? 'text-slate-600 hover:text-primary-600' : 'text-white/80 hover:text-white')
                  }`}
              >
                <span className="relative z-10 transition-transform group-hover:-translate-y-px">{item.label}</span>
                <span className={`absolute bottom-1 left-4 right-4 h-0.5 bg-primary-500 rounded-full transition-all duration-300 transform origin-left ${location.pathname === item.path ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                  }`}></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative hidden md:block" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all text-xs font-black tracking-widest active:scale-95 ${isSolid
                  ? 'border-slate-200/60 text-slate-700 bg-slate-50/50 hover:bg-slate-100'
                  : 'border-white/20 text-white bg-white/5 hover:bg-white/15'
                  }`}
              >
                <Globe size={16} className={isLangMenuOpen ? 'animate-spin-slow' : ''} />
                <span>{currentLang.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-500 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-[1.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden animate-fade-in-up origin-top-right p-2 max-h-[250px] overflow-y-auto">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangMenuOpen(false); }}
                      className={`w-full px-5 py-4 flex items-center justify-between text-xs font-bold rounded-xl transition-all mb-1 last:mb-0 group/item active:scale-[0.98] ${language === lang.code
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:translate-x-1'
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <Globe size={14} className={language === lang.code ? 'text-primary-500' : 'text-slate-400'} />
                        {lang.display}
                      </span>
                      {language === lang.code && (
                        <div className="bg-primary-600 text-white p-1 rounded-full shadow-glow">
                          <Check size={10} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-4 rounded-full border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md hover:shadow-soft transition-all hover:border-primary-300 dark:hover:border-primary-800 group active:scale-95"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm ring-2 ring-primary-500/20 group-hover:ring-primary-500/50 transition-all">
                    <img src={user.picture || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 hidden sm:block max-w-[100px] truncate uppercase tracking-tighter">{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-500 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 mt-3 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-[1.75rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden animate-fade-in-up origin-top-right p-2 max-h-[400px] overflow-y-auto">
                    <div className="px-5 py-5 mb-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Link to="/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 rounded-xl transition-all group active:scale-[0.98] hover:translate-x-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 group-hover:text-primary-600 transition-colors">
                          <LayoutGrid size={18} />
                        </div>
                        Dashboard
                      </Link>
                      <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 rounded-xl transition-all group active:scale-[0.98] hover:translate-x-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 group-hover:text-primary-600 transition-colors">
                          <User size={18} />
                        </div>
                        My Profile
                      </Link>
                      <Link to="/settings" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 rounded-xl transition-all group active:scale-[0.98] hover:translate-x-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 group-hover:text-primary-600 transition-colors">
                          <Settings size={18} />
                        </div>
                        Settings
                      </Link>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-3"></div>
                    <button
                      onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-5 py-4 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all uppercase tracking-widest group active:scale-[0.98] hover:translate-x-1"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                      </div>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className={`px-7 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 shadow-glow relative overflow-hidden group ${isSolid
                  ? 'bg-primary-600 text-white shadow-premium'
                  : 'bg-white text-primary-600 hover:shadow-2xl'
                  }`}
              >
                <span className="relative z-10">Sign In</span>
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              </button>
            )}

            <button
              className={`lg:hidden p-2.5 rounded-2xl transition-all active:scale-90 ${isSolid ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                }`}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        <div className={`fixed inset-0 z-[100] lg:hidden transition-all duration-700 ease-in-out ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
          <div className={`absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-700 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
              <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">EduPath<span className="text-primary-500">LK</span></span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all hover:rotate-90 active:scale-90"><X size={22} /></button>
              </div>
              <nav className="flex-1 px-4 py-10 space-y-2 overflow-y-auto scrollbar-hide">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-6 py-4.5 rounded-[1.5rem] text-xl font-black transition-all ${location.pathname === item.path ? 'bg-primary-600 text-white shadow-glow' : 'text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:translate-x-2'}`}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                {!isAuthenticated ? (
                  <button onClick={() => { setIsMobileMenuOpen(false); loginWithRedirect(); }} className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-premium active:scale-95 transition-all">Get Started</button>
                ) : (
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-3 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-sm active:scale-95 transition-all">Dashboard <ArrowRight size={18} /></Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>


    </>
  );
};

export default Navbar;