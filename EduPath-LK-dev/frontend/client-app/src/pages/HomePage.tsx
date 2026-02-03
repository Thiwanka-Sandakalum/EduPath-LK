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
import { InstitutionsService } from '../types/services/InstitutionsService';
import { ProgramsService } from '../types/services/ProgramsService';
import type { Institution as ApiInstitution } from '../types/models/Institution';

// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const originalSlides = [
  { id: 1, image: "https://blog.tuf.edu.pk/wp-content/uploads/2023/06/1200x800-1-864x576.jpg", title: "Scale Your Potential", subtitle: "Access world-class educational opportunities through Sri Lanka's most comprehensive academic directory." },
  { id: 2, image: "https://img.freepik.com/premium-photo/portrait-group-indian-students-graduation-gowns-holding-diplomas_979520-62999.jpg", title: "Navigate Success", subtitle: "Connecting ambitious students with elite universities and life-changing scholarship programs." },
  { id: 3, image: "https://www.nsbm.ac.lk/wp-content/uploads/2023/07/WEB-banners-Undergraduates.jpg", title: "Learn Without Limits", subtitle: "Access information about universities, scholarships, and programs in one powerful platform." },
  { id: 4, image: "https://web-cdn.meridianuniversity.edu/site-content-images/content-library/is-a-psyd-degree-worth-it-insights-into-psychology-careers-image-two.webp", title: "Empower Your Journey", subtitle: "Discover your ideal academic path with personalized recommendations and expert insights." },
];

const popularCategories = [
  { id: 1, title: "Government Universities", desc: "UGC funded excellence", icon: <Building2 className="text-primary-600" />, link: "/institutions?type=Government" },
  { id: 2, title: "Private Institutes", desc: "Modern facilities", icon: <Zap className="text-amber-500" />, link: "/institutions?type=Private" },
  { id: 3, title: "Business & Management", desc: "Leadership and entrepreneurship", icon: <Activity className="text-emerald-500" />, link: "/courses?q=Business" },
  { id: 4, title: "IT & Software", desc: "Tech future", icon: <BrainCircuit className="text-indigo-500" />, link: "/courses?q=Software" },
];

const gradePoints: Record<string, number> = { 'A': 3.0, 'B': 2.5, 'C': 2.0, 'S': 1.0, 'F': 0 };

const ARTS_MAJOR_SUBJECTS = [
  'Economics',
  'Geography',
  'History',
  'Home Economics',
  'Accounting',
  'Business Statistics',
  'Elements of Political Science',
  'Logic & Scientific Method',
  'Higher Mathematics',
  'Agricultural Science',
  'Mathematics',
  'Combined Mathematics',
  'Communication & Media Studies',
  'Information & Communication Technology',
] as const;

const ARTS_THIRD_SUBJECTS = [
  'Civil Technology',
  'Mechanical Technology',
  'Electronic and Information Technology',
  'Food Technology',
  'Agro Technology',
  'Bio-Resource Technology',
  'Buddhism',
  'Hinduism',
  'Christianity',
  'Islam',
  'Greek & Roman Civilization',
] as const;

type ArtsMajorSubject = (typeof ARTS_MAJOR_SUBJECTS)[number];
type ArtsThirdSubject = (typeof ARTS_THIRD_SUBJECTS)[number];

const STREAM_PROGRAM_KEYWORDS: Record<string, string[]> = {
  physical: ['Engineering', 'Computer', 'Software', 'Data', 'ICT', 'Mathematics', 'Physics'],
  bio: ['Medicine', 'Medical', 'Nursing', 'Pharmacy', 'Biomedical', 'Biotechnology', 'Biology'],
  commerce: ['Business', 'Management', 'Accounting', 'Finance', 'Marketing', 'Economics'],
  tech: ['Technology', 'Engineering', 'Mechatronics', 'Industrial', 'ICT', 'Information'],
  arts: ['Law', 'Arts', 'Humanities', 'Social', 'Media', 'Communication', 'Political', 'History'],
};

const STREAMS = [
  { id: 'physical', name: 'Physical Science', subjects: ['Combined Maths', 'Physics', 'Chemistry'], careers: ['Software Engineer', 'Civil Engineer', 'Data Scientist'] },
  { id: 'bio', name: 'Biological Science', subjects: ['Biology', 'Chemistry', 'Physics'], careers: ['Medical Doctor', 'Biotechnologist', 'Pharmacist'] },
  { id: 'commerce', name: 'Commerce', subjects: ['Accounting', 'Business Studies', 'Economics'], careers: ['Chartered Accountant', 'Financial Analyst', 'Marketing Strategist'] },
  { id: 'arts', name: 'Arts', subjects: ['Main Subject 1', 'Main Subject 2', 'Main Subject 3'], careers: ['Legal Consultant', 'Diplomat', 'Journalist'] },
  { id: 'tech', name: 'Technology', subjects: ['Science for Technology', 'Engineering Technology', 'ICT'], careers: ['Product Designer', 'Mechatronics Specialist', 'IT Project Manager'] }
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const [institutionIndex, setInstitutionIndex] = useState<Array<{ nameLower: string }>>([]);
  const [institutionIndexLoaded, setInstitutionIndexLoaded] = useState(false);
  const [apiInstitutions, setApiInstitutions] = useState<ApiInstitution[]>([]);

  const [selectedStreamId, setSelectedStreamId] = useState(STREAMS[0].id);
  const [results, setResults] = useState<string[]>(['', '', '']);
  const [calculatedZ, setCalculatedZ] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const [matchedInstitutions, setMatchedInstitutions] = useState<ApiInstitution[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const [physicalThirdSubject, setPhysicalThirdSubject] = useState<'Chemistry' | 'ICT'>('Chemistry');
  const [bioThirdSubject, setBioThirdSubject] = useState<'Physics' | 'Agriculture'>('Physics');
  const [commerceSecondSubject, setCommerceSecondSubject] = useState<'Business Studies' | 'ICT'>('Business Studies');
  const [commerceThirdSubject, setCommerceThirdSubject] = useState<'Economics' | 'Business Statistics' | 'ICT'>('Economics');
  const [techSecondSubject, setTechSecondSubject] = useState<'Bio System Technology' | 'Engineering Technology'>('Engineering Technology');
  const [techThirdSubject, setTechThirdSubject] = useState<'Agriculture' | 'Geography' | 'Business Studies' | 'ICT'>('ICT');

  const [artsFirstSubject, setArtsFirstSubject] = useState<ArtsMajorSubject>(ARTS_MAJOR_SUBJECTS[0]);
  const [artsSecondSubject, setArtsSecondSubject] = useState<ArtsMajorSubject>(ARTS_MAJOR_SUBJECTS[1]);
  const [artsThirdSubject, setArtsThirdSubject] = useState<ArtsThirdSubject>(ARTS_THIRD_SUBJECTS[0]);

  const [aiInsights, setAiInsights] = useState<{ title: string, content: string }[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const selectedStream = STREAMS.find(s => s.id === selectedStreamId) || STREAMS[0];

  const selectedSubjects = selectedStreamId === 'physical'
    ? ['Combined Maths', 'Physics', physicalThirdSubject]
    : selectedStreamId === 'bio'
      ? ['Biology', 'Chemistry', bioThirdSubject]
      : selectedStreamId === 'commerce'
        ? ['Accounting', commerceSecondSubject, commerceThirdSubject]
        : selectedStreamId === 'tech'
          ? ['Science for Technology', techSecondSubject, techThirdSubject]
          : selectedStreamId === 'arts'
            ? [artsFirstSubject, artsSecondSubject, artsThirdSubject]
      : selectedStream.subjects;

  const homeInstitutions = institutions as unknown as Array<{
    id?: string;
    _id?: string;
    name: string;
    type?: string | string[];
    district?: string;
    location?: string;
    imageUrl?: string;
    description?: string;
  }>;

  useEffect(() => {
    let cancelled = false;
    const loadInstitutionsIndex = async () => {
      try {
        const limit = 200;
        const first = await InstitutionsService.listInstitutions(1, limit);
        if (cancelled) return;

        const all = [...(first.data ?? [])];
        const totalPages = first.pagination?.total_pages ?? 1;
        const maxPagesToFetch = 10;
        const pagesToFetch = Math.min(totalPages, maxPagesToFetch);
        for (let page = 2; page <= pagesToFetch; page++) {
          const res = await InstitutionsService.listInstitutions(page, limit);
          if (cancelled) return;
          all.push(...(res.data ?? []));
        }

        setApiInstitutions(all as ApiInstitution[]);

        const idx = all
          .map((inst) => ({ nameLower: (inst.name ?? '').toLowerCase() }))
          .filter((x) => x.nameLower);

        setInstitutionIndex(idx);
        setInstitutionIndexLoaded(true);
      } catch {
        if (!cancelled) {
          setInstitutionIndex([]);
          setInstitutionIndexLoaded(false);
          setApiInstitutions([]);
        }
      }
    };
    loadInstitutionsIndex();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const computeMatches = async () => {
      if (!calculatedZ) {
        setMatchedInstitutions([]);
        setLoadingMatches(false);
        return;
      }

      if (apiInstitutions.length === 0) {
        setMatchedInstitutions([]);
        setLoadingMatches(false);
        return;
      }

      setLoadingMatches(true);
      try {
        const keywords = STREAM_PROGRAM_KEYWORDS[selectedStreamId] ?? [];

        const institutionById = new Map<string, ApiInstitution>();
        for (const inst of apiInstitutions) {
          institutionById.set(inst._id, inst);
        }

        const programResponses = await Promise.all(
          keywords.map(async (kw) => {
            try {
              return await ProgramsService.listPrograms(1, 30, undefined, kw);
            } catch {
              return { data: [] as any[] };
            }
          })
        );

        const scores = new Map<string, number>();
        for (const res of programResponses) {
          for (const p of res.data ?? []) {
            const instId = (p as any).institution_id as string | undefined;
            if (!instId) continue;
            if (!institutionById.has(instId)) continue;
            scores.set(instId, (scores.get(instId) ?? 0) + 1);
          }
        }

        const scoredInstitutions: Array<{ inst: ApiInstitution; score: number }> = Array.from(scores.entries())
          .map(([id, score]) => ({ inst: institutionById.get(id)!, score }))
          .filter((x) => Boolean(x.inst))
          .sort((a, b) => b.score - a.score || a.inst.name.localeCompare(b.inst.name));

        let next = scoredInstitutions.slice(0, 3).map((x) => x.inst);

        // Fallback: if no stream program matches, show universities by Z-score tier.
        if (next.length === 0) {
          const universities = apiInstitutions.filter((inst) => (inst.type ?? []).some((t) => String(t).toLowerCase().includes('university')));
          const pool = universities.length ? universities : apiInstitutions;

          const sortedByConfidence = [...pool].sort((a, b) => (b.confidence_score ?? 0) - (a.confidence_score ?? 0) || a.name.localeCompare(b.name));

          // Keep your previous tier idea but use real institutions.
          if (calculatedZ > 1.9) next = sortedByConfidence.slice(0, 3);
          else if (calculatedZ > 1.3) next = sortedByConfidence.slice(0, 3);
          else next = sortedByConfidence.slice(0, 3);
        }

        if (!cancelled) setMatchedInstitutions(next);
      } finally {
        if (!cancelled) setLoadingMatches(false);
      }
    };

    computeMatches();
    return () => {
      cancelled = true;
    };
  }, [calculatedZ, selectedStreamId, apiInstitutions]);

  useEffect(() => {
    // Only set up the timer once
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        // Ensure cycling through all slides
        const next = prev + 1;
        return next >= originalSlides.length ? 0 : next;
      });
    }, 4000); // 4 seconds for faster transitions
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

  const matchedUnis = calculatedZ ? matchedInstitutions : [];

  // Search handler: if it matches an institution name -> institutions, else -> courses.
  // The query is always sent via `q` so list pages can filter.
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      if (searchInputRef.current) searchInputRef.current.focus();
      return;
    }
    const q = trimmed.toLowerCase();

    const looksLikeInstitution = /(university|institute|college|campus|academy|school)/i.test(trimmed);
    const matchedByApi = q.length >= 2 && institutionIndex.some((x) => x.nameLower.includes(q));
    const matchedByMock = homeInstitutions.some((inst) => inst.name.toLowerCase().includes(q));

    // Prefer routing to institutions when we are confident it's an institution query.
    // If the API index hasn't loaded yet, fall back to mock + keyword heuristic.
    if (matchedByApi || matchedByMock || (!institutionIndexLoaded && looksLikeInstitution)) {
      navigate(`/institutions?q=${encodeURIComponent(trimmed)}`);
      if (searchInputRef.current) searchInputRef.current.focus();
      return;
    }
    navigate(`/courses?q=${encodeURIComponent(trimmed)}`);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfdfe] dark:bg-slate-950">

      <section className="relative h-[90vh] min-h-[700px] overflow-hidden bg-slate-950">
        {originalSlides.map((slide, index) => (
          <div
            key={slide.id}
            style={{ zIndex: index === currentSlide ? 2 : 1 }}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          >
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
            onSubmit={handleSearch}
            className="glass dark:bg-slate-900/90 p-4 rounded-3xl shadow-premium flex items-center gap-4 border border-white/20"
          >
            <div className="flex-1 flex items-center pl-4">
              <Search className="text-slate-400 h-6 w-6 mr-4" />
              <input
                ref={searchInputRef}
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
                  <Calculator size={12} className="animate-pulse" /> 2026 SIMULATOR
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
                          onClick={() => {
                            setSelectedStreamId(s.id);
                            setCalculatedZ(null);
                            setResults(['', '', '']);
                            if (s.id === 'physical') setPhysicalThirdSubject('Chemistry');
                            if (s.id === 'bio') setBioThirdSubject('Physics');
                            if (s.id === 'commerce') {
                              setCommerceSecondSubject('Business Studies');
                              setCommerceThirdSubject('Economics');
                            }
                            if (s.id === 'tech') {
                              setTechSecondSubject('Engineering Technology');
                              setTechThirdSubject('ICT');
                            }
                            if (s.id === 'arts') {
                              setArtsFirstSubject(ARTS_MAJOR_SUBJECTS[0]);
                              setArtsSecondSubject(ARTS_MAJOR_SUBJECTS[1]);
                              setArtsThirdSubject(ARTS_THIRD_SUBJECTS[0]);
                            }
                          }}
                          className={`px-4 py-2.5 rounded-2xl text-[10px] font-black transition-all duration-500 uppercase tracking-widest ${selectedStreamId === s.id ? 'bg-primary-600 text-white shadow-glow' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:shadow-md border border-transparent hover:border-primary-200'}`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {selectedSubjects.map((sub, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white dark:bg-slate-800/80 rounded-[1.25rem] border border-slate-100 dark:border-slate-700 shadow-sm group transition-all duration-500">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100 dark:border-slate-800">0{i + 1}</div>
                          {selectedStreamId === 'physical' && i === 2 ? (
                            <div className="relative min-w-[120px]">
                              <select
                                value={physicalThirdSubject}
                                onChange={(e) => {
                                  setPhysicalThirdSubject(e.target.value as 'Chemistry' | 'ICT');
                                  setCalculatedZ(null);
                                }}
                                aria-label="Select third subject"
                                className="bg-transparent border-none pl-0 pr-6 py-0 text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight outline-none cursor-pointer appearance-none hover:text-primary-600 dark:hover:text-primary-400 focus:text-primary-600 dark:focus:text-primary-400"
                              >
                                <option value="Chemistry">Chemistry</option>
                                <option value="ICT">ICT</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                          ) : selectedStreamId === 'bio' && i === 2 ? (
                            <div className="relative min-w-[120px]">
                              <select
                                value={bioThirdSubject}
                                onChange={(e) => {
                                  setBioThirdSubject(e.target.value as 'Physics' | 'Agriculture');
                                  setCalculatedZ(null);
                                }}
                                aria-label="Select third subject"
                                className="bg-transparent border-none pl-0 pr-6 py-0 text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight outline-none cursor-pointer appearance-none hover:text-primary-600 dark:hover:text-primary-400 focus:text-primary-600 dark:focus:text-primary-400"
                              >
                                <option value="Physics">Physics</option>
                                <option value="Agriculture">Agriculture</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                          ) : selectedStreamId === 'commerce' && i === 1 ? (
                            <div className="relative min-w-[140px]">
                              <select
                                value={commerceSecondSubject}
                                onChange={(e) => {
                                  setCommerceSecondSubject(e.target.value as 'Business Studies' | 'ICT');
                                  setCalculatedZ(null);
                                }}
                                aria-label="Select second subject"
                                className="bg-transparent border-none pl-0 pr-6 py-0 text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight outline-none cursor-pointer appearance-none hover:text-primary-600 dark:hover:text-primary-400 focus:text-primary-600 dark:focus:text-primary-400"
                              >
                                <option value="Business Studies">Business Studies</option>
                                <option value="ICT">ICT</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                          ) : selectedStreamId === 'commerce' && i === 2 ? (
                            <div className="relative min-w-[170px]">
                              <select
                                value={commerceThirdSubject}
                                onChange={(e) => {
                                  setCommerceThirdSubject(e.target.value as 'Economics' | 'Business Statistics' | 'ICT');
                                  setCalculatedZ(null);
                                }}
                                aria-label="Select third subject"
                                className="bg-transparent border-none pl-0 pr-6 py-0 text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight outline-none cursor-pointer appearance-none hover:text-primary-600 dark:hover:text-primary-400 focus:text-primary-600 dark:focus:text-primary-400"
                              >
                                <option value="Economics">Economics</option>
                                <option value="Business Statistics">Business Statistics</option>
                                <option value="ICT">ICT</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                          ) : selectedStreamId === 'tech' && i === 1 ? (
                            <div className="relative min-w-[190px]">
                              <select
                                value={techSecondSubject}
                                onChange={(e) => {
                                  setTechSecondSubject(e.target.value as 'Bio System Technology' | 'Engineering Technology');
                                  setCalculatedZ(null);
                                }}
                                aria-label="Select second subject"
                                className="bg-transparent border-none pl-0 pr-6 py-0 text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight outline-none cursor-pointer appearance-none hover:text-primary-600 dark:hover:text-primary-400 focus:text-primary-600 dark:focus:text-primary-400"
                              >
                                <option value="Bio System Technology">Bio System Technology</option>
                                <option value="Engineering Technology">Engineering Technology</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                          ) : selectedStreamId === 'tech' && i === 2 ? (
                            <div className="relative min-w-[190px]">
                              <select
                                value={techThirdSubject}
                                onChange={(e) => {
                                  setTechThirdSubject(e.target.value as 'Agriculture' | 'Geography' | 'Business Studies' | 'ICT');
                                  setCalculatedZ(null);
                                }}
                                aria-label="Select third subject"
                                className="bg-transparent border-none pl-0 pr-6 py-0 text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight outline-none cursor-pointer appearance-none hover:text-primary-600 dark:hover:text-primary-400 focus:text-primary-600 dark:focus:text-primary-400"
                              >
                                <option value="Agriculture">Agriculture</option>
                                <option value="Geography">Geography</option>
                                <option value="Business Studies">Business Studies</option>
                                <option value="ICT">ICT</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                          ) : selectedStreamId === 'arts' && (i === 0 || i === 1) ? (
                            <div className="relative w-full sm:w-auto sm:min-w-[240px] min-w-0">
                              <select
                                value={i === 0 ? artsFirstSubject : artsSecondSubject}
                                onChange={(e) => {
                                  const next = e.target.value as ArtsMajorSubject;
                                  if (i === 0) setArtsFirstSubject(next);
                                  else setArtsSecondSubject(next);
                                  setCalculatedZ(null);
                                }}
                                aria-label={i === 0 ? 'Select first subject' : 'Select second subject'}
                                className="w-full bg-transparent border-none pl-0 pr-6 py-0 text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight outline-none cursor-pointer appearance-none hover:text-primary-600 dark:hover:text-primary-400 focus:text-primary-600 dark:focus:text-primary-400"
                              >
                                {ARTS_MAJOR_SUBJECTS.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                          ) : selectedStreamId === 'arts' && i === 2 ? (
                            <div className="relative w-full sm:w-auto sm:min-w-[240px] min-w-0">
                              <select
                                value={artsThirdSubject}
                                onChange={(e) => {
                                  setArtsThirdSubject(e.target.value as ArtsThirdSubject);
                                  setCalculatedZ(null);
                                }}
                                aria-label="Select third subject"
                                className="w-full bg-transparent border-none pl-0 pr-6 py-0 text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight outline-none cursor-pointer appearance-none hover:text-primary-600 dark:hover:text-primary-400 focus:text-primary-600 dark:focus:text-primary-400"
                              >
                                {ARTS_THIRD_SUBJECTS.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                          ) : (
                            <span className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight truncate">{sub}</span>
                          )}
                        </div>
                        <div className="relative w-32 shrink-0 self-end sm:self-auto">
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
                    <div className="flex flex-col items-center justify-center gap-8">
                      <div className="text-center shrink-0">
                        <span className="text-primary-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">ESTIMATED INDEX</span>
                        <div className="text-7xl md:text-8xl font-black text-white tracking-tighter tabular-nums leading-none mb-8 drop-shadow-glow">
                          {calculatedZ}
                        </div>
                        <div className="inline-flex items-center gap-3 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-6 py-3 rounded-2xl backdrop-blur-md">
                          <Rocket size={20} className="animate-bounce" />
                          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Tier Projection</span>
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
                        {loadingMatches ? (
                          [1, 2, 3].map((i) => (
                            <div key={i} className="group p-5 bg-white/5 border border-white/10 rounded-3xl text-center sm:text-left animate-pulse">
                              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 shadow-lg mb-4" />
                              <div className="h-4 w-3/4 bg-white/10 rounded mb-3" />
                              <div className="h-3 w-1/2 bg-white/10 rounded" />
                            </div>
                          ))
                        ) : (
                        matchedUnis.map((uni, i) => {
                          const uniId = (uni as any).id ?? uni._id ?? String(i);
                          const imageUrl = (uni as any).imageUrl ?? (uni as any).image_url ?? '';

                          const contactText = Array.isArray(uni.contact_info)
                            ? uni.contact_info.join(' ')
                            : uni.contact_info
                              ? Object.values(uni.contact_info as any).join(' ')
                              : '';

                          const district = contactText || uni.country || '';
                          return (
                          <Link to={`/institutions/${uniId}`} key={uniId} className="group p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-primary-600 transition-all duration-500 text-center sm:text-left">
                            <div className="relative mb-4 inline-block">
                              {imageUrl ? (
                                <img src={imageUrl} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10 shadow-lg" alt="" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 shadow-lg" />
                              )}
                            </div>
                            <h5 className="text-white font-black text-sm leading-tight mb-2 line-clamp-1 uppercase tracking-tight">{uni.name}</h5>
                            <div className="flex items-center gap-2 text-slate-500 text-[9px] group-hover:text-white/70">
                              <MapPin size={10} />
                              <span className="font-black uppercase tracking-widest">{district}</span>
                            </div>
                          </Link>
                          );
                        }))}
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