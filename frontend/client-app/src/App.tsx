import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, Link, useNavigate, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/layout/Navbar/Navbar';
import ChatWidget from './features/chat/components/ChatWidget/ChatWidget';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, GraduationCap, ArrowRight, Send, ShieldCheck, Globe, ChevronRight } from 'lucide-react';

// Pages
import Home from './pages/HomePage';
import InstitutionsPage from './features/institutions/pages/InstitutionsPage';
import InstitutionDetail from './features/institutions/components/InstitutionDetail/InstitutionDetail';
import CoursesPage from './features/courses/pages/CoursesPage';
import CourseDetail from './features/courses/components/CourseDetail/CourseDetail';
import ScholarshipsPage from './features/scholarships/pages/Scholarships';
import Tools from './pages/ToolsPage';
import Blog from './pages/BlogPage';
import FAQ from './pages/FAQPage';
import About from './pages/AboutPage';
import Contact from './pages/ContactPage';
import Profile from './features/user-profile/pages/Profile';
import Settings from './features/user-profile/pages/Settings';
import Dashboard from './features/dashboard/pages/Dashboard';
import AIChat from './features/chat/pages/AIChat';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ForceHome = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const sessionKey = 'edupath_init_load_complete';
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, 'true');
      navigate('/', { replace: true });
    }
  }, [navigate]);
  return null;
};

const ScrollObserver = () => {
  const location = useLocation();
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    const mutationObserver = new MutationObserver(() => {
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);
  return null;
};

const MainLayout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const transparentPaths = ['/', '/institutions', '/courses', '/scholarships', '/tools', '/blog'];
  const searchParams = new URLSearchParams(location.search);
  const isToolSubView = location.pathname === '/tools' && searchParams.has('tool');
  const isHeroPath = transparentPaths.includes(location.pathname) && !isToolSubView;
  const isChatPath = location.pathname === '/chat';

  return (
    <main className={`flex-grow flex flex-col ${isChatPath ? 'h-[calc(100vh-80px)] pt-[80px]' : (isHeroPath ? 'pt-0' : 'pt-[88px]')}`}>
      {children}
    </main>
  );
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert("Verification sequence initiated. Access your email nodes for confirmation.");
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-white pt-32 pb-16 border-t border-slate-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[250px] pointer-events-none"></div>

      <div className="container mx-auto px-8 relative">
        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] p-12 md:p-20 border border-slate-800/60 mb-32 reveal shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] block">Weekly Intelligence</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">Join the Academic <br /><span className="text-blue-600 italic">Network.</span></h2>
              <p className="text-slate-400 font-medium text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">High-curation scholarship alerts and premium admission guides delivered directly to your node.</p>
            </div>
            <form onSubmit={handleSubscribe} className="relative">
              <div className="flex flex-col sm:flex-row gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex-1 flex items-center px-6">
                  <Mail className="text-slate-600 mr-4" size={20} />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-none py-5 text-base font-bold text-white placeholder-slate-700 focus:outline-none flex-1"
                    required
                  />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                  Initialize <Send size={16} />
                </button>
              </div>
              <p className="mt-6 text-[9px] text-slate-600 text-center lg:text-left font-black uppercase tracking-[0.3em]">Compliance: GDPR & Privacy Mandates Enforced.</p>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32 reveal reveal-delay-100">
          <div className="space-y-10">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="p-3.5 rounded-2xl bg-blue-600 text-white shadow-2xl transition-transform group-hover:scale-110 duration-500">
                <GraduationCap className="h-7 w-7" />
              </div>
              <span className="font-black text-2xl tracking-tighter uppercase">
                EduPath<span className="text-blue-600">LK</span>
              </span>
            </Link>
            <p className="text-slate-500 text-base leading-relaxed font-medium">
              The leading digital authority for higher education discovery in Sri Lanka, powered by verified data and native AI-driven insights.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Facebook size={18} />, href: "#" },
                { icon: <Twitter size={18} />, href: "#" },
                { icon: <Linkedin size={18} />, href: "#" },
                { icon: <Instagram size={18} />, href: "#" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 shadow-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-blue-500 mb-10">Directory</h4>
            <ul className="space-y-5">
              {[
                { label: 'Institutions', to: '/institutions' },
                { label: 'Courses', to: '/courses' },
                { label: 'Scholarships', to: '/scholarships' },
                { label: 'Utilities', to: '/tools' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 group font-bold text-sm">
                    <ChevronRight size={14} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-blue-500 mb-10">Intelligence</h4>
            <ul className="space-y-5">
              {[
                { label: 'Academic Blog', to: '/blog' },
                { label: 'Help Center', to: '/faq' },
                { label: 'Our Mission', to: '/about' },
                { label: 'Contact', to: '/contact' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 group font-bold text-sm">
                    <ChevronRight size={14} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-blue-500 mb-10">Headquarters</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin size={20} className="text-blue-600 mt-1 shrink-0" />
                <div className="text-slate-500 text-sm font-bold leading-relaxed">
                  World Trade Center,<br />Level 12, West Tower,<br />Colombo 01, Sri Lanka
                </div>
              </li>
              <li className="flex items-center gap-4 group cursor-pointer">
                <Phone size={20} className="text-blue-600 shrink-0" />
                <span className="text-slate-500 font-bold text-sm group-hover:text-white transition-colors">+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-4 group cursor-pointer">
                <Globe size={20} className="text-blue-600 shrink-0" />
                <span className="text-slate-500 font-bold text-sm group-hover:text-white transition-colors tracking-tight uppercase">edu-path-gateway.lk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8 reveal reveal-delay-200">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-3 bg-slate-900 px-6 py-2.5 rounded-xl border border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 shadow-inner">
              <ShieldCheck size={16} className="text-emerald-500" /> UGC VERIFIED DATA NODE
            </div>
            <p className="text-slate-700 text-[9px] font-black uppercase tracking-[0.3em]">© {new Date().getFullYear()} EDUPATH LK. CORE PROTOCOLS ACTIVE.</p>
          </div>
          <div className="flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-700">
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <ScrollToTop />
        <ForceHome />
        <ScrollObserver />
        <div className="flex flex-col min-h-screen font-sans bg-white text-slate-900 dark:bg-slate-950 transition-colors duration-300 selection:bg-blue-600/10 selection:text-blue-900">
          <Navbar />
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/institutions" element={<InstitutionsPage />} />
              <Route path="/institutions/:id" element={<InstitutionDetail />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/scholarships" element={<ScholarshipsPage />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<Blog />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
          <Footer />
          <ChatWidget />
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;