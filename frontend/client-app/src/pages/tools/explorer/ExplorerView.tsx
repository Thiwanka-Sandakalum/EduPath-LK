import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Briefcase, Building2, CheckCircle2, Globe, GraduationCap, MapPin, Star } from 'lucide-react';
import type { Course } from '../../../types/course';
import type { Institution } from '../../../types/institution';
import { courses, institutions } from '../../../data/mockData';

export type ExplorerViewProps = {
  onBack: () => void;
};

type ExplorerTab = 'overview' | 'career' | 'finance' | 'internship';

type ExplorerFilters = {
  interest: string;
  district: string;
  uniType: 'Government' | 'Private' | 'Both';
  alStream: string;
  budget: string;
  goal: string;
};

type ExplorerRecommendation = {
  degree: {
    title: string;
    uniName: string;
    faculty?: string;
    dept?: string;
    duration?: string;
    mode?: string;
    medium?: string;
  };
  careerMapping: {
    title: string;
    desc: string;
    sector: string;
    employers: string;
    demandLevel: string;
    environment: string;
  };
  progression: Array<{ title: string; yearsExp: string; skills: string }>;
  finance: {
    entrySalary: string;
    midSalary: string;
    seniorSalary: string;
    growthTrend: string;
  };
  internships: Array<{ title: string; providers: string; duration: string; skills: string }>;
  relevanceScore: number;
  linkedCourseId?: string;
  linkedInstitutionId?: string;
};

const DISTRICTS = ['All', 'Colombo', 'Gampaha', 'Kandy', 'Galle', 'Kalutara', 'Kurunegala', 'Matara', 'Badulla', 'Anuradhapura'];
const INTERESTS = ['Technology', 'Health', 'Business', 'Arts', 'Engineering', 'Science', 'Education', 'Law'];

const interestToField = (interest: string) => {
  const m: Record<string, string> = {
    Technology: 'IT',
    Engineering: 'Engineering',
    Business: 'Business',
    Health: 'Medicine',
    Science: 'Science',
  };
  return m[interest] || interest;
};

const scoreCourse = (course: Course, interest: string, goal: string) => {
  const field = interestToField(interest).toLowerCase();
  const title = (course.title || '').toLowerCase();
  const courseField = (course.field || '').toLowerCase();
  const goalText = (goal || '').toLowerCase();

  let score = 0;
  if (courseField.includes(field)) score += 50;
  if (title.includes(field)) score += 25;
  if (goalText && (title.includes(goalText) || course.description.toLowerCase().includes(goalText))) score += 15;
  return score;
};

const buildRecommendationFromCourse = (course: Course, inst: Institution | undefined, relevanceScore: number): ExplorerRecommendation => {
  const instName = inst?.name || 'Unknown Institution';
  const field = course.field || 'General';

  const careerTitle =
    field === 'IT'
      ? 'Software & Data Careers'
      : field === 'Engineering'
        ? 'Engineering Careers'
        : field === 'Business'
          ? 'Business & Management Careers'
          : field === 'Medicine'
            ? 'Healthcare Careers'
            : 'Career Pathways';

  return {
    degree: {
      title: course.title,
      uniName: instName,
      duration: course.duration,
      mode: 'Full-time',
      medium: 'English/Sinhala/Tamil (varies)',
    },
    careerMapping: {
      title: careerTitle,
      desc: `Based on this course focus, you can build a pathway into ${field} roles with a strong foundation in core skills and projects.`,
      sector: field,
      employers: 'Government, private sector, startups, NGOs (varies by field)',
      demandLevel: field === 'IT' ? 'High' : 'Medium',
      environment: 'Hybrid / on-site (depends on employer)',
    },
    progression: [
      { title: 'Entry Level', yearsExp: '0–2 years', skills: 'Core fundamentals, communication, teamwork, tools' },
      { title: 'Mid Level', yearsExp: '2–5 years', skills: 'Specialization, problem-solving, delivery, leadership basics' },
      { title: 'Senior Level', yearsExp: '5+ years', skills: 'Architecture/strategy, mentoring, stakeholder management' },
    ],
    finance: {
      entrySalary: 'Varies by sector and skills',
      midSalary: 'Varies by sector and experience',
      seniorSalary: 'Varies by sector and role',
      growthTrend: field === 'IT' ? 'Growing' : 'Stable to Growing',
    },
    internships: [
      { title: 'Internship / Trainee', providers: 'Industry partners, labs, SMEs', duration: '3–6 months', skills: 'Practical exposure, portfolio building' },
      { title: 'Project-based placement', providers: 'Research groups / companies', duration: '8–12 weeks', skills: 'Problem framing, implementation, reporting' },
    ],
    relevanceScore,
    linkedCourseId: course.id,
    linkedInstitutionId: course.institutionId,
  };
};

const ExplorerView: React.FC<ExplorerViewProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ExplorerTab>('overview');

  const [filters, setFilters] = useState<ExplorerFilters>({
    interest: 'Technology',
    district: 'All',
    uniType: 'Both',
    alStream: 'Physical Science',
    budget: 'All',
    goal: '',
  });

  const [results, setResults] = useState<ExplorerRecommendation[]>([]);
  const [selected, setSelected] = useState<ExplorerRecommendation | null>(null);

  const filteredCoursePool = useMemo(() => {
    const allowedInstitutionIds = new Set(
      institutions
        .filter(i => filters.uniType === 'Both' || i.type === filters.uniType)
        .map(i => i.id)
    );

    return courses.filter(c => allowedInstitutionIds.has(c.institutionId));
  }, [filters.uniType]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 650));

      const scored = filteredCoursePool
        .map(c => ({ course: c, score: scoreCourse(c, filters.interest, filters.goal) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      const recs = scored.map(({ course, score }) => {
        const inst = institutions.find(i => i.id === course.institutionId);
        const relevanceScore = Math.min(100, Math.max(30, score));
        return buildRecommendationFromCourse(course, inst, relevanceScore);
      });

      // If we don't have enough (small mock dataset), add generic recommendations.
      while (recs.length < 3) {
        recs.push({
          degree: {
            title: `${filters.interest} Degree Pathway`,
            uniName: filters.uniType === 'Government' ? 'Government University (varies)' : filters.uniType === 'Private' ? 'Private Institute (varies)' : 'University/Institute (varies)',
            duration: '3–4 Years (typical)',
            mode: 'Full-time',
            medium: 'Varies',
          },
          careerMapping: {
            title: `${filters.interest} Career Map`,
            desc: 'Explore related degrees and build skills through projects, internships and certifications.',
            sector: filters.interest,
            employers: 'Private sector, government, NGOs (varies)',
            demandLevel: 'Medium',
            environment: 'Varies',
          },
          progression: [
            { title: 'Start', yearsExp: '0–1 years', skills: 'Foundations + projects' },
            { title: 'Grow', yearsExp: '1–3 years', skills: 'Specialize + internships' },
            { title: 'Lead', yearsExp: '3+ years', skills: 'Leadership + portfolio' },
          ],
          finance: {
            entrySalary: 'Varies',
            midSalary: 'Varies',
            seniorSalary: 'Varies',
            growthTrend: 'Stable',
          },
          internships: [{ title: 'Industry internship', providers: 'Companies', duration: '3–6 months', skills: 'Practical exposure' }],
          relevanceScore: 55,
        });
      }

      setResults(recs);
      setSelected(recs[0] || null);
      setActiveTab('overview');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary-600 mb-12 transition-all"
        >
          <ArrowLeft size={18} className="mr-3" /> Exit Explorer
        </button>

        {step === 1 ? (
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-100 dark:border-slate-800 shadow-premium">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-premium">
                  <Globe size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Degree & Career Explorer</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Map programs to career pathways</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Interest Area</label>
                  <select
                    value={filters.interest}
                    onChange={e => setFilters({ ...filters, interest: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                  >
                    {INTERESTS.map(v => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">District</label>
                  <select
                    value={filters.district}
                    onChange={e => setFilters({ ...filters, district: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                  >
                    {DISTRICTS.map(v => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">University Type</label>
                  <select
                    value={filters.uniType}
                    onChange={e => setFilters({ ...filters, uniType: e.target.value as ExplorerFilters['uniType'] })}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                  >
                    {['Both', 'Government', 'Private'].map(v => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">A/L Stream</label>
                  <select
                    value={filters.alStream}
                    onChange={e => setFilters({ ...filters, alStream: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                  >
                    {['Physical Science', 'Bio Science', 'Commerce', 'Technology', 'Arts'].map(v => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Your goal (optional)</label>
                  <textarea
                    value={filters.goal}
                    onChange={e => setFilters({ ...filters, goal: e.target.value })}
                    placeholder="e.g. I want to work in cybersecurity / build AI systems / become a project manager..."
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-5 font-bold outline-none h-28 resize-none dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={generateRecommendations}
                disabled={loading}
                className="w-full bg-primary-600 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-glow hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Recommendations'} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Results</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">Top Matches</div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 hover:underline"
                >
                  Edit Filters
                </button>
              </div>

              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelected(r);
                    setActiveTab('overview');
                  }}
                  className={
                    'w-full text-left p-6 rounded-[2rem] border transition-all ' +
                    (selected?.degree.title === r.degree.title
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-900/40'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary-300')
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{r.degree.title}</div>
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">{r.degree.uniName}</div>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      {r.relevanceScore}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-8">
              {selected && (
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-premium overflow-hidden">
                  <div className="p-10 md:p-12 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                      <div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary-600">
                          <GraduationCap size={16} /> Recommendation
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">{selected.degree.title}</h2>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                            <Building2 size={14} className="inline mr-2" /> {selected.degree.uniName}
                          </span>
                          <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                            <MapPin size={14} className="inline mr-2" /> {filters.district}
                          </span>
                          <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                            <Star size={14} className="inline mr-2" /> {selected.relevanceScore}/100
                          </span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-primary-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-premium shrink-0">
                        <Briefcase size={30} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-10">
                      {([
                        ['overview', 'Overview'],
                        ['career', 'Career'],
                        ['finance', 'Finance'],
                        ['internship', 'Internships'],
                      ] as Array<[ExplorerTab, string]>).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key)}
                          className={
                            'px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ' +
                            (activeTab === key
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary-500')
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-10 md:p-12">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Degree Snapshot</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {[{ k: 'Duration', v: selected.degree.duration }, { k: 'Mode', v: selected.degree.mode }, { k: 'Medium', v: selected.degree.medium }].map((x) => (
                            <div key={x.k} className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{x.k}</div>
                              <div className="text-sm font-black text-slate-900 dark:text-white mt-2">{x.v || '—'}</div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Why this match</div>
                          <div className="text-slate-700 dark:text-slate-300 font-medium mt-2 leading-relaxed">{selected.careerMapping.desc}</div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'career' && (
                      <div className="space-y-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Career Map</div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                          <div className="text-xl font-black text-slate-900 dark:text-white">{selected.careerMapping.title}</div>
                          <div className="text-slate-500 dark:text-slate-400 font-medium mt-2">Sector: {selected.careerMapping.sector}</div>
                          <div className="text-slate-500 dark:text-slate-400 font-medium">Demand: {selected.careerMapping.demandLevel}</div>
                          <div className="text-slate-500 dark:text-slate-400 font-medium">Employers: {selected.careerMapping.employers}</div>
                        </div>
                        <div className="space-y-3">
                          {selected.progression.map((p, i) => (
                            <div key={i} className="flex gap-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black shrink-0">{i + 1}</div>
                              <div>
                                <div className="text-sm font-black text-slate-900 dark:text-white">{p.title}</div>
                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{p.yearsExp}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-2">{p.skills}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'finance' && (
                      <div className="space-y-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Finance</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {[
                            { k: 'Entry', v: selected.finance.entrySalary },
                            { k: 'Mid', v: selected.finance.midSalary },
                            { k: 'Senior', v: selected.finance.seniorSalary },
                            { k: 'Trend', v: selected.finance.growthTrend },
                          ].map((x) => (
                            <div key={x.k} className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{x.k}</div>
                              <div className="text-sm font-black text-slate-900 dark:text-white mt-2">{x.v}</div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                          Note: Salary figures vary by skills, location and employer. Use internships/projects to boost outcomes.
                        </div>
                      </div>
                    )}

                    {activeTab === 'internship' && (
                      <div className="space-y-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Internships</div>
                        <div className="space-y-4">
                          {selected.internships.map((x, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                              <div className="flex items-start justify-between gap-6">
                                <div>
                                  <div className="text-sm font-black text-slate-900 dark:text-white">{x.title}</div>
                                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Providers: {x.providers}</div>
                                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Duration: {x.duration}</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0">
                                  <CheckCircle2 size={18} />
                                </div>
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-3">Skills: {x.skills}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100 dark:border-slate-800 mt-12">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-bold">
                        <Globe size={18} className="text-primary-600" />
                        Generated from local dataset (mockData) + heuristics
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep(1)}
                          className="px-7 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
                        >
                          New Search
                        </button>
                        <button
                          onClick={onBack}
                          className="px-7 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary-600 text-white shadow-glow hover:bg-primary-700 transition-all flex items-center gap-2"
                        >
                          Done <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorerView;
