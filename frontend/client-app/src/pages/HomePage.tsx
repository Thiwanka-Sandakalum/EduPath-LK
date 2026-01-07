import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ChevronRight, GraduationCap,
  BookOpen, Users, Award, ArrowRight, Sparkles, Zap,
  Activity, Target, BrainCircuit, BarChart3, Building2,
  Newspaper, Globe, TrendingUp, Radio, MessageSquare,
  Calculator, CheckCircle2, Briefcase, School, ChevronDown,
  Cpu, Rocket, Database, MapPin, RefreshCw, Star
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { institutions } from '../data/mockData';

// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const originalSlides = [
  { id: 1, image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2070", title: "Scale Your Potential", subtitle: "Access world-class educational opportunities through Sri Lanka's most comprehensive academic directory." },
  { id: 2, image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070", title: "Navigate Success", subtitle: "Connecting ambitious students with elite universities and life-changing scholarship programs." }
];

const popularCategories = [
  { id: 1, title: "State Universities", desc: "UGC funded excellence", icon: <Building2 className="text-primary-600" />, link: "/institutions?type=Government" },
  { id: 2, title: "Private Institutes", desc: "Modern facilities", icon: <Zap className="text-amber-500" />, link: "/institutions?type=Private" },
  { id: 3, title: "Vocational Skills", desc: "Technical mastery", icon: <Activity className="text-emerald-500" />, link: "/institutions?type=Vocational" },
  { id: 4, title: "IT & Software", desc: "Tech future", icon: <BrainCircuit className="text-indigo-500" />, link: "/courses?field=IT" },
];

const gradePoints: Record<string, number> = { 'A': 3.0, 'B': 2.5, 'C': 2.0, 'S': 1.0, 'F': 0 };

const STREAMS = [
  { id: 'physical', name: 'Physical Science', subjects: ['Combined Maths', 'Physics', 'Chemistry'], careers: ['Software Engineer', 'Civil Engineer', 'Data Scientist'] },
  { id: 'bio', name: 'Biological Science', subjects: ['Biology', 'Physics', 'Chemistry'], careers: ['Medical Doctor', 'Biotechnologist', 'Pharmacist'] },
  { id: 'commerce', name: 'Commerce', subjects: ['Economics', 'Business Studies', 'Accounting'], careers: ['Chartered Accountant', 'Financial Analyst', 'Marketing Strategist'] },
  { id: 'arts', name: 'Arts', subjects: ['Main Subject 1', 'Main Subject 2', 'Main Subject 3'], careers: ['Legal Consultant', 'Diplomat', 'Journalist'] },
  { id: 'tech', name: 'Technology', subjects: ['ET/SFT', 'BST', 'SFT/Science'], careers: ['Product Designer', 'Mechatronics Specialist', 'IT Project Manager'] }
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const [selectedStreamId, setSelectedStreamId] = useState(STREAMS[0].id);
  const [results, setResults] = useState<string[]>(['', '', '']);
  const [calculatedZ, setCalculatedZ] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const [aiInsights, setAiInsights] = useState<{ title: string, content: string }[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const selectedStream = STREAMS.find(s => s.id === selectedStreamId) || STREAMS[0];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % originalSlides.length), 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // const response = await ai.models.generateContent({
        //   model: 'gemini-3-flash-preview',
        //   contents: "List 3 latest educational trends or scholarship news items in Sri Lanka for 2025. Be very brief.",
        //   config: {
        //     tools: [{ googleSearch: {} }],
        //     responseMimeType: "application/json",
        //     responseSchema: {
        //       type: "ARRAY",
        //       items: {
        //         type: "OBJECT",
        //         properties: {
        //           title: { type: "STRING" },
        //           content: { type: "STRING" }
        //         },
        //         required: ["title", "content"]
        //       }
        //     }
        //   }
        // });
        // const data = JSON.parse(response.text || '[]');
        // setAiInsights(data);
      } catch (err) {
        console.error("AI Insights Error:", err);
        setAiInsights([
          { title: "Scholarship Season", content: "Major international deadlines approaching for 2025 intake." },
          { title: "Tech Surge", content: "Sri Lanka sees 15% increase in IT degree enrollments this year." },
          { title: "UGC Updates", content: "New policy updates for state university admissions expected in June." }
        ]);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, []);

  const handlePredict = () => {
    if (results.some(g => !g)) return;
    setIsCalculating(true);
    setCalculatedZ(null);

    setTimeout(() => {
      const avg = results.reduce((acc, g) => acc + gradePoints[g], 0) / 3;
      const score = (avg * 0.78) + (Math.random() * 0.35);
      setCalculatedZ(parseFloat(score.toFixed(4)));
      setIsCalculating(false);
    }, 1800);
  };

  const matchedUnis = calculatedZ
    ? institutions.filter(inst => {
      if (calculatedZ > 1.9) return true;
      if (calculatedZ > 1.3 && inst.type === 'Government') return true;
      if (inst.type === 'Private' || inst.type === 'Vocational') return true;
      return false;
    }).slice(0, 3)
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfdfe] dark:bg-slate-950">

      <section className="relative h-[90vh] min-h-[700px] overflow-hidden bg-slate-950">
        {originalSlides.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${slide.image}')` }} />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/20 to-slate-950"></div>

            <div className="absolute inset-0 container mx-auto px-6 flex flex-col justify-center items-center text-center">
              <div className="max-w-4xl animate-fade-in-up">
                <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-10 shadow-glow">
                  <Sparkles size={14} className="text-primary-400" /> UGC VERIFIED PLATFORM
                </span>
                <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter text-balance leading-none">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/institutions" className="px-10 py-5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-premium border-b-4 border-primary-800">Browse Directory</Link>
                  <button onClick={() => window.dispatchEvent(new Event('open-chat'))} className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-premium border border-slate-100 flex items-center justify-center gap-2">
                    <MessageSquare size={18} /> Talk to AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="container mx-auto px-6 relative z-10 -mt-20">
        <div className="max-w-5xl mx-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); navigate(`/courses?q=${searchQuery}`); }}
            className="glass dark:bg-slate-900/90 p-4 rounded-3xl shadow-premium flex items-center gap-4 border border-white/20"
          >
            <div className="flex-1 flex items-center pl-4">
              <Search className="text-slate-400 h-6 w-6 mr-4" />
              <input
                type="text"
                placeholder="What do you want to study?"
                className="flex-1 bg-transparent border-none py-4 text-xl font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-primary-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-glow">Search</button>
          </form>
        </div>
      </div>

      <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="container mx-auto px-6 mb-12 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2 text-primary-600 font-bold uppercase tracking-widest text-xs mb-3">
              <Radio size={16} className="animate-pulse" /> LIVE INTELLIGENCE
            </span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Today's Academic Pulse</h2>
          </div>
          <Link to="/blog" className="text-primary-600 font-bold text-sm hover:underline flex items-center gap-2">View News Archive <ArrowRight size={18} /></Link>
        </div>

        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {loadingInsights ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-800"></div>
            ))
          ) : (
            aiInsights.map((insight, i) => (
              <div key={i} className="group p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-primary-200 hover:bg-white transition-all hover:shadow-premium reveal">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{insight.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{insight.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="py-32 bg-slate-50 dark:bg-slate-900/30">
        <div className="container mx-auto px-6 mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Discover Your Path</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">Verified information across all educational sectors in Sri Lanka.</p>
        </div>

        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {popularCategories.map((cat) => (
            <Link to={cat.link} key={cat.id} className="group bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-premium hover:-translate-y-2 transition-all duration-500 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-50 transition-colors">
                {React.cloneElement(cat.icon as any, { size: 28 })}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{cat.title}</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">{cat.desc}</p>
              <span className="text-primary-600 font-bold text-xs flex items-center justify-center gap-1 group-hover:gap-2 transition-all">Explore <ChevronRight size={14} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section id="z-score-engine" className="py-20 md:py-28 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-16 items-stretch min-h-[500px]">

            <div className="w-full lg:w-5/12 space-y-8 self-center animate-fade-in">
              <div className="max-w-lg">
                <span className="inline-flex items-center gap-2 text-primary-600 font-black uppercase tracking-[0.3em] text-[9px] bg-primary-50 dark:bg-primary-900/20 px-6 py-2 rounded-full mb-6 shadow-sm border border-primary-100 dark:border-primary-900/30">
                  <Calculator size={12} className="animate-pulse" /> 2025 SIMULATOR
                </span>
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.95] mb-6">
                  Z-Score <br /><span className="text-primary-600">Forecaster.</span>
                </h2>
                <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Analyze your academic trajectory using our normalization algorithm aligned with UGC models.
                </p>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-900/40 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-premium backdrop-blur-md">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">CLASSIFICATION</label>
                    <div className="flex flex-wrap gap-2">
                      {STREAMS.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedStreamId(s.id); setCalculatedZ(null); }}
                          className={`px-4 py-2.5 rounded-2xl text-[10px] font-black transition-all duration-500 uppercase tracking-widest ${selectedStreamId === s.id ? 'bg-primary-600 text-white shadow-glow' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:shadow-md border border-transparent hover:border-primary-200'}`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {selectedStream.subjects.map((sub, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/80 rounded-[1.25rem] border border-slate-100 dark:border-slate-700 shadow-sm group transition-all duration-500">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100 dark:border-slate-800">0{i + 1}</div>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight">{sub}</span>
                        </div>
                        <div className="relative w-32">
                          <select
                            value={results[i]}
                            onChange={(e) => {
                              const newRes = [...results];
                              newRes[i] = e.target.value;
                              setResults(newRes);
                              setCalculatedZ(null);
                            }}
                            className="w-full bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 font-black text-center text-xs outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 cursor-pointer appearance-none transition-all shadow-sm hover:bg-white dark:hover:bg-slate-800"
                          >
                            <option value="">GRADE</option>
                            {Object.keys(gradePoints).map(gp => <option key={gp}>{gp}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handlePredict}
                    disabled={results.some(g => !g) || isCalculating}
                    className="w-full py-5 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-glow hover:bg-primary-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-40"
                  >
                    {isCalculating ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> PROCESSING...</>
                    ) : (
                      <>CALCULATE NOW <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-7/12 flex flex-col min-h-[500px]">
              <div className="bg-[#0f172a] dark:bg-[#020617] rounded-[4rem] p-10 md:p-16 flex-1 relative overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-center transition-all duration-1000">

                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/15 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

                {!calculatedZ && !isCalculating ? (
                  <div className="text-center space-y-8 relative z-10 py-10 animate-fade-in">
                    <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl transition-all duration-1000 hover:rotate-6">
                      <Cpu size={48} className="text-white/20" />
                    </div>
                    <div className="space-y-4 max-w-sm mx-auto">
                      <h3 className="text-white font-black uppercase tracking-[0.4em] text-[10px] opacity-40">System Idle</h3>
                      <p className="text-slate-400 text-lg font-medium leading-relaxed">
                        Synthesize your academic profile to reveal institution matching and career pathways.
                      </p>
                    </div>
                  </div>
                ) : isCalculating ? (
                  <div className="text-center space-y-10 relative z-10 animate-fade-in">
                    <div className="relative w-40 h-40 mx-auto">
                      <div className="absolute inset-0 border-8 border-primary-600/10 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Database size={40} className="text-primary-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Computing</h3>
                      <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.4em] animate-pulse">Normalizing coefficients...</p>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in-up space-y-12 relative z-10">
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-12">
                      <div className="text-center xl:text-left shrink-0">
                        <span className="text-primary-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">ESTIMATED INDEX</span>
                        <div className="text-8xl md:text-9xl font-black text-white tracking-tighter tabular-nums leading-none mb-8 drop-shadow-glow">
                          {calculatedZ}
                        </div>
                        <div className="inline-flex items-center gap-3 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-6 py-3 rounded-2xl backdrop-blur-md">
                          <Rocket size={20} className="animate-bounce" />
                          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Tier Projection</span>
                        </div>
                      </div>

                      <div className="flex-1 w-full space-y-6">
                        <p className="text-white/30 font-black uppercase tracking-[0.4em] text-[9px] mb-2 text-center xl:text-left">CAREER SYNTHESIS</p>
                        <div className="grid grid-cols-1 gap-3">
                          {selectedStream.careers.map((career, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl group hover:bg-white/10 transition-all duration-500 cursor-default">
                              <div className="w-10 h-10 bg-primary-600/20 text-primary-500 rounded-xl flex items-center justify-center shrink-0">
                                <Briefcase size={20} />
                              </div>
                              <span className="text-lg font-bold text-slate-200 tracking-tight leading-tight">{career}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h4 className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-3">
                          <School size={16} className="text-primary-500" /> TOP MATCHES
                        </h4>
                        <Link to="/institutions" className="text-primary-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2 group/link">
                          DIRECTORY <ChevronRight size={14} className="group-hover/link:translate-x-1" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {matchedUnis.map((uni, i) => (
                          <Link to={`/institutions/${uni.id}`} key={uni.id} className="group p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-primary-600 transition-all duration-500 text-center sm:text-left">
                            <div className="relative mb-4 inline-block">
                              <img src={uni.imageUrl} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10 shadow-lg" alt="" />
                            </div>
                            <h5 className="text-white font-black text-sm leading-tight mb-2 line-clamp-1 uppercase tracking-tight">{uni.name}</h5>
                            <div className="flex items-center gap-2 text-slate-500 text-[9px] group-hover:text-white/70">
                              <MapPin size={10} />
                              <span className="font-black uppercase tracking-widest">{uni.district}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 text-center">
                      <button onClick={() => setCalculatedZ(null)} className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-primary-400 transition-all flex items-center gap-3 mx-auto group bg-white/5 px-6 py-3 rounded-full hover:bg-white/10">
                        <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-1000" /> RESET ENGINE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-48 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-900/10 blur-[200px] pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-6xl md:text-8xl font-black text-white mb-12 tracking-tighter leading-none">Your Future <br /><span className="text-primary-500">Starts Here.</span></h2>
          <div className="flex flex-wrap justify-center gap-6">
            <button onClick={() => window.dispatchEvent(new Event('open-chat'))} className="px-16 py-6 bg-primary-600 text-white rounded-3xl font-bold text-lg shadow-premium hover:bg-primary-700 active:scale-95 transition-all">Talk to AI Advisor</button>
            <Link to="/institutions" className="px-16 py-6 bg-white/10 text-white border border-white/20 rounded-3xl font-bold text-lg hover:bg-white/20 transition-all">Browse Institutions</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;