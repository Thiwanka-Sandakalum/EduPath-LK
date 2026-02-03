import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ShieldCheck,
  X,
} from 'lucide-react';

export type ScholarshipResolverViewProps = {
  onBack: () => void;
};

type ResolverTab = 'eligible' | 'conditional' | 'blocked';

type ResolverScholarship = {
  name: string;
  provider: string;
  amount: string;
  deadline: string;
  explanation: string;
  docChecklist?: string[];
  probabilityScore?: string;
  missingRequirement?: string;
  fixSteps?: string;
  violatedRule?: string;
  alternativeSuggested?: string;
  deadlineRisk?: string;
};

type ResolverResults = {
  eligible: ResolverScholarship[];
  conditional: ResolverScholarship[];
  blocked: ResolverScholarship[];
  summary: {
    totalValuePerYear: string;
    monthlyEstimate: string;
    fundingGapEstimate: string;
  };
  analytics?: {
    ruralBenefitRate?: string;
    successLikelihood?: string;
  };
};

type FormData = {
  income: string;
  district: string;
  stream: string;
  level: string;
  schoolType: string;
  medium: string;
  gender: string;
  disability: string;
  orphan: string;
  firstGen: string;
  rural: string;
  performance: string;
};

const DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kandy',
  'Galle',
  'Kalutara',
  'Kurunegala',
  'Matara',
  'Badulla',
  'Anuradhapura',
  'Jaffna',
  'Batticaloa',
  'Trincomalee',
];

const STREAMS = ['Physical Science', 'Bio Science', 'Commerce', 'Technology', 'Arts'];

const toNumber = (value: string) => {
  const n = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const estimateScore = (form: FormData) => {
  const income = toNumber(form.income);
  const z = Number.parseFloat(form.performance);
  const normalizedIncome = clamp(1 - income / 200000, 0, 1);
  const normalizedZ = clamp((Number.isFinite(z) ? z : 1.0) / 3, 0, 1);
  const extra =
    (form.rural === 'Yes' ? 0.08 : 0) +
    (form.disability === 'Yes' ? 0.08 : 0) +
    (form.orphan === 'Yes' ? 0.06 : 0) +
    (form.firstGen === 'Yes' ? 0.04 : 0);

  return clamp(0.55 * normalizedZ + 0.35 * normalizedIncome + extra, 0, 1);
};

const buildHeuristicResults = (form: FormData): ResolverResults => {
  const income = toNumber(form.income);
  const z = Number.parseFloat(form.performance);
  const score = estimateScore(form);

  const likelyMerit = Number.isFinite(z) && z >= 1.8;
  const lowIncome = income > 0 && income <= 100000;
  const veryLowIncome = income > 0 && income <= 60000;

  const eligible: ResolverScholarship[] = [];
  const conditional: ResolverScholarship[] = [];
  const blocked: ResolverScholarship[] = [];

  if (likelyMerit) {
    eligible.push({
      name: 'Merit-based Scholarships (General)',
      provider: 'Government / Universities / Private Trusts',
      amount: 'Varies by scheme',
      deadline: 'Varies by academic year',
      probabilityScore: `${Math.round(score * 100)}%`,
      explanation:
        'Your academic performance suggests you may qualify for merit-based awards. Confirm scheme-specific cutoffs and application windows.',
      docChecklist: ['A/L results sheet', 'National ID', 'School/University letters (if required)'],
    });
  } else {
    conditional.push({
      name: 'Merit-based Scholarships (General)',
      provider: 'Government / Universities / Private Trusts',
      amount: 'Varies by scheme',
      deadline: 'Varies by academic year',
      missingRequirement: 'Higher academic ranking / cutoff',
      fixSteps: 'Improve competitive scores where applicable and watch faculty-level awards after enrollment.',
      deadlineRisk: 'Medium',
      explanation:
        'Some schemes are highly competitive. You may still qualify for need-based support or faculty-level awards.',
    });
  }

  if (veryLowIncome || lowIncome) {
    eligible.push({
      name: 'Need-based Assistance (General)',
      provider: 'Government / Universities / Welfare Units',
      amount: 'Varies (monthly or term-based)',
      deadline: 'Usually during admissions / enrollment',
      probabilityScore: `${Math.round((score + 0.15) * 100)}%`,
      explanation:
        'Your household income indicates you may be a strong candidate for need-based assistance. Verify income thresholds per scheme.',
      docChecklist: ['Income certificate', 'Grama Niladhari / Divisional Secretariat certification (if required)'],
    });
  } else {
    conditional.push({
      name: 'Need-based Assistance (General)',
      provider: 'Government / Universities / Welfare Units',
      amount: 'Varies (monthly or term-based)',
      deadline: 'Usually during admissions / enrollment',
      missingRequirement: 'Income threshold (scheme-specific)',
      fixSteps: 'Check official notices for exact income ceilings and required certificates.',
      deadlineRisk: 'Low',
      explanation:
        'Some need-based schemes require income below a set threshold. Check the latest official criteria.',
    });
  }

  if (form.disability === 'Yes' || form.orphan === 'Yes') {
    eligible.push({
      name: 'Special Category Assistance (General)',
      provider: 'Government / Social Services / Universities',
      amount: 'Varies by category',
      deadline: 'Varies by scheme',
      probabilityScore: `${Math.round((score + 0.1) * 100)}%`,
      explanation:
        'Some schemes prioritize special categories (disability/orphan). Prepare supporting documents and verify eligibility criteria.',
      docChecklist: ['Medical certification (if applicable)', 'Legal/guardian documentation (if applicable)'],
    });
  }

  // Always include an informational “blocked” example to signal verification.
  blocked.push({
    name: 'Time-limited Calls / Past Intakes',
    provider: 'Various',
    amount: 'N/A',
    deadline: 'N/A',
    violatedRule: 'Applications may be closed for the current intake',
    alternativeSuggested:
      'Use official ministry/university notices, and set reminders. Many schemes reopen annually.',
    explanation:
      'Some schemes open only during a short window. If a call is closed, look for the next cycle or alternative schemes.',
  });

  const eligibleCount = eligible.length;
  const conditionalCount = conditional.length;
  const summaryValue = eligibleCount >= 2 ? 'Medium to High' : eligibleCount === 1 ? 'Medium' : 'Low to Medium';

  return {
    eligible,
    conditional,
    blocked,
    summary: {
      totalValuePerYear: `${summaryValue} (estimate)`,
      monthlyEstimate: eligibleCount >= 2 ? 'LKR 10,000 – 50,000 (estimate)' : 'Varies',
      fundingGapEstimate: 'Depends on tuition + living costs',
    },
    analytics: {
      ruralBenefitRate: form.rural === 'Yes' ? 'Higher' : 'Standard',
      successLikelihood:
        eligibleCount >= 2 ? 'High' : eligibleCount === 1 ? 'Medium' : conditionalCount ? 'Medium' : 'Low',
    },
  };
};

const Pill = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={
      'px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ' +
      (active
        ? 'bg-primary-600 text-white border-primary-600 shadow-glow'
        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary-500')
    }
  >
    {label}
  </button>
);

const ScholarshipResolverView: React.FC<ScholarshipResolverViewProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ResolverTab>('eligible');
  const [results, setResults] = useState<ResolverResults | null>(null);

  const [formData, setFormData] = useState<FormData>({
    income: '45000',
    district: 'Colombo',
    stream: 'Physical Science',
    level: 'AL Completed',
    schoolType: 'National',
    medium: 'English',
    gender: 'Male',
    disability: 'No',
    orphan: 'No',
    firstGen: 'No',
    rural: 'No',
    performance: '1.8500',
  });

  const computed = useMemo(() => (results ? results[activeTab] : []), [results, activeTab]);

  const runResolver = async () => {
    setLoading(true);
    try {
      // Heuristic-only implementation (works offline / without API keys)
      // You can swap this to Gemini later if you want.
      await new Promise(r => setTimeout(r, 600));
      const data = buildHeuristicResults(formData);
      setResults(data);
      setStep(3);
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
          <ArrowLeft size={18} className="mr-3" /> Exit Resolver
        </button>

        <div className="max-w-3xl mx-auto">
          {(step === 1 || step === 2) && (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-100 dark:border-slate-800 shadow-premium animate-fade-in-up">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-premium">
                  <BadgeCheck size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Scholarship Resolver</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Quick eligibility signals (demo mode)
                  </p>
                </div>
              </div>

              {step === 1 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Monthly Family Income (LKR)</label>
                      <input
                        value={formData.income}
                        onChange={e => setFormData({ ...formData, income: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">District</label>
                      <select
                        value={formData.district}
                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                      >
                        {DISTRICTS.map(d => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">A/L Stream</label>
                      <select
                        value={formData.stream}
                        onChange={e => setFormData({ ...formData, stream: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                      >
                        {STREAMS.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Performance (Z-Score or similar)</label>
                      <input
                        value={formData.performance}
                        onChange={e => setFormData({ ...formData, performance: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                        placeholder="e.g. 1.8500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Continue Assessment <ArrowRight size={18} />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Medium</label>
                      <select
                        value={formData.medium}
                        onChange={e => setFormData({ ...formData, medium: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                      >
                        {['Sinhala', 'Tamil', 'English'].map(v => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">School Type</label>
                      <select
                        value={formData.schoolType}
                        onChange={e => setFormData({ ...formData, schoolType: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                      >
                        {['National', 'Provincial', 'Private', 'Other'].map(v => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Rural</label>
                      <select
                        value={formData.rural}
                        onChange={e => setFormData({ ...formData, rural: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                      >
                        {['No', 'Yes'].map(v => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Disability</label>
                      <select
                        value={formData.disability}
                        onChange={e => setFormData({ ...formData, disability: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                      >
                        {['No', 'Yes'].map(v => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Orphan</label>
                      <select
                        value={formData.orphan}
                        onChange={e => setFormData({ ...formData, orphan: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                      >
                        {['No', 'Yes'].map(v => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">First Generation</label>
                      <select
                        value={formData.firstGen}
                        onChange={e => setFormData({ ...formData, firstGen: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold outline-none dark:text-white"
                      >
                        {['No', 'Yes'].map(v => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] hover:border-primary-500 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={runResolver}
                      disabled={loading}
                      className="flex-1 bg-primary-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-glow hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? 'Analyzing...' : 'Resolve Eligibility'} <ArrowRight size={18} />
                    </button>
                  </div>

                  <div className="mt-8 text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />
                    Results are guidance-only. Always verify with official notices.
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && results && (
            <div className="animate-fade-in space-y-8">
              <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/10 blur-[150px] pointer-events-none"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400">Summary</h3>
                    <div className="text-3xl font-black">{results.summary.totalValuePerYear}</div>
                    <div className="text-slate-300 text-sm font-medium">Monthly: {results.summary.monthlyEstimate}</div>
                    <div className="text-slate-400 text-xs font-bold">Gap: {results.summary.fundingGapEstimate}</div>
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[{ label: 'Eligible', value: results.eligible.length }, { label: 'Conditional', value: results.conditional.length }, { label: 'Blocked', value: results.blocked.length }].map((k) => (
                      <div key={k.label} className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">{k.label}</div>
                        <div className="text-4xl font-black mt-2">{k.value}</div>
                      </div>
                    ))}
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Likelihood</div>
                      <div className="text-xl font-black mt-2">{results.analytics?.successLikelihood || '—'}</div>
                      <div className="text-xs text-slate-400 font-bold mt-1">Rural rate: {results.analytics?.ruralBenefitRate || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Pill active={activeTab === 'eligible'} label="Eligible" onClick={() => setActiveTab('eligible')} />
                <Pill active={activeTab === 'conditional'} label="Conditional" onClick={() => setActiveTab('conditional')} />
                <Pill active={activeTab === 'blocked'} label="Blocked" onClick={() => setActiveTab('blocked')} />
              </div>

              <div className="space-y-6">
                {computed.length === 0 && (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <X size={26} />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">No items</div>
                    <div className="text-slate-500 dark:text-slate-400 font-medium mt-2">Try another tab or adjust inputs.</div>
                  </div>
                )}

                {computed.map((s, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-lg">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600">{s.provider}</div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{s.name}</h3>
                        <div className="flex flex-wrap gap-3 mt-5">
                          <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                            Amount: {s.amount}
                          </span>
                          <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                            Deadline: {s.deadline}
                          </span>
                          {s.probabilityScore && (
                            <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                              Score: {s.probabilityScore}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-premium">
                        <CheckCircle2 size={22} />
                      </div>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-6 leading-relaxed">{s.explanation}</p>

                    {Array.isArray(s.docChecklist) && s.docChecklist.length > 0 && (
                      <div className="mt-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Documents</div>
                        <div className="flex flex-wrap gap-2">
                          {s.docChecklist.slice(0, 8).map((d, i) => (
                            <span key={i} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {s.missingRequirement && (
                      <div className="mt-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300 mb-2">Missing</div>
                        <div className="text-sm font-bold text-amber-900 dark:text-amber-200">{s.missingRequirement}</div>
                        {s.fixSteps && <div className="text-sm text-amber-800 dark:text-amber-200/80 mt-2 font-medium">{s.fixSteps}</div>}
                      </div>
                    )}

                    {s.violatedRule && (
                      <div className="mt-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-5">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-700 dark:text-rose-300 mb-2">Blocked</div>
                        <div className="text-sm font-bold text-rose-900 dark:text-rose-200">{s.violatedRule}</div>
                        {s.alternativeSuggested && (
                          <div className="text-sm text-rose-800 dark:text-rose-200/80 mt-2 font-medium">{s.alternativeSuggested}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => {
                    setStep(1);
                    setResults(null);
                    setActiveTab('eligible');
                  }}
                  className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
                >
                  Modify Profile Data
                </button>
                <button
                  onClick={onBack}
                  className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary-600 text-white shadow-glow hover:bg-primary-700 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipResolverView;
