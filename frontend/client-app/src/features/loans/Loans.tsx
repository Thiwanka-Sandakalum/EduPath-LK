import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Search,
  ChevronDown,
  Wallet,
  ChevronUp,
  Info
} from 'lucide-react';

type StudentLoan = {
  id: string;
  name: string;
  provider: string;
  interestRate: string;
  maxAmount: string;
  duration: string;
  eligibility: string[];
  features: string[];
  applyLink: string;
};

type StudentLoansResponse = {
  updatedAt?: string;
  studentLoans: StudentLoan[];
};

const calculateMonthlyPayment = (principal: number, annualInterestRatePercent: number, years: number) => {
  const months = years * 12;
  if (!isFinite(months) || months <= 0) return 0;

  const monthlyRate = annualInterestRatePercent / 12 / 100;
  if (!isFinite(monthlyRate) || monthlyRate < 0) return 0;

  if (monthlyRate === 0) return principal / months;

  const factor = Math.pow(1 + monthlyRate, months);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return isFinite(emi) ? emi : 0;
};

const Loans = () => {
  const [amount, setAmount] = useState(500000);
  const [interest, setInterest] = useState(12);
  const [years, setYears] = useState(5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loans, setLoans] = useState<StudentLoan[]>([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [loansError, setLoansError] = useState<string | null>(null);

  useEffect(() => {
    setMonthlyPayment(calculateMonthlyPayment(amount, interest, years));
  }, [amount, interest, years]);

  useEffect(() => {
    const controller = new AbortController();

    const loadLoans = async () => {
      try {
        setLoansLoading(true);
        setLoansError(null);
        const res = await fetch('/student-loans.json', { signal: controller.signal });
        if (!res.ok) {
          setLoans([]);
          setLoansError('Unable to load student loan data.');
          return;
        }

        const data = (await res.json()) as StudentLoansResponse;
        if (Array.isArray(data?.studentLoans) && data.studentLoans.length > 0) {
          setLoans(data.studentLoans);
        } else {
          setLoans([]);
          setLoansError('Student loan data is empty or invalid.');
        }
      } catch (e) {
        if ((e as any)?.name === 'AbortError') return;
        setLoans([]);
        setLoansError('Unable to load student loan data.');
      } finally {
        setLoansLoading(false);
      }
    };

    void loadLoans();
    return () => controller.abort();
  }, []);

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pb-24">
            <div className="relative h-[400px] bg-slate-900 overflow-hidden flex items-center justify-center ">
            <div className="absolute inset-0 opacity-40">
               <img src="https://www.regenesys.net/reginsights/wp-content/uploads/2024/10/7-Oct_Understanding-Your-Options-Loans-for-Students-Who-Are-Unemployed.jpg" className="w-full h-full object-cover" alt="" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            <div className="relative z-10 text-center px-6 animate-fade-in-up">
              <span className="inline-block px-5 py-2 rounded-full bg-blue-600/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.4em] mb-6">Student Finance</span>
               <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none"> Student Loans</h1>
               <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium ">Compare top student loan options in Sri Lanka and estimate your monthly payments instantly.</p>
            </div>
         </div>
         
      <div className="container mx-auto px-6 mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: Estimator (sticky on desktop) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl shadow-slate-900/10 border border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary-500" /> Loan Estimator
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-1">Loan Amount (LKR)</label>
                  <input
                    type="number"
                    min={10000}
                    max={10000000}
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Interest Rate (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={interest}
                      onChange={e => setInterest(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Duration (Years)</label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={years}
                      onChange={e => setYears(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-lg"
                    />
                  </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 flex items-center gap-4">
                  <DollarSign className="w-8 h-8 text-primary-600" />
                  <div>
                    <div className="text-xs text-slate-500">Estimated Monthly Payment</div>
                    <div className="text-3xl font-black text-primary-700 dark:text-primary-300">LKR {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-black mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary-500" /> Find Student Loans
                  </h3>
                  <input
                    type="text"
                    placeholder="Search by provider or loan name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 dark:text-white shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Loan details */}
          <div className="lg:col-span-8">
            <div className="space-y-8">
          {loansLoading && (
            <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 reveal">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm text-slate-300"><Search size={32} /></div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Loading Loans</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">Fetching the latest student loan data...</p>
            </div>
          )}

          {!loansLoading && loansError && (
            <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 reveal">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm text-slate-300"><Search size={32} /></div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Loans Unavailable</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">{loansError}</p>
            </div>
          )}

          {!loansLoading && !loansError && filteredLoans.length === 0 && (
            <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 reveal">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm text-slate-300"><Search size={32} /></div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">No Loans Found</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">Try searching for a different provider or loan name.</p>
              <button onClick={() => setSearchQuery('')} className="mt-10 text-primary-600 font-black text-[11px] uppercase tracking-widest hover:underline">Clear search</button>
            </div>
          )}
          {!loansLoading && !loansError && filteredLoans.map(loan => {
            const isExpanded = expandedId === loan.id;
            return (
              <div
                key={loan.id}
                className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-500 overflow-hidden relative reveal ${isExpanded ? 'border-primary-600 shadow-2xl ring-8 ring-primary-600/5' : 'border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl'}`}
              >
                <div className="p-8 md:p-12">
                  <div className="flex flex-col lg:flex-row gap-10">
                    <div className="lg:w-1/4 flex flex-col items-center lg:items-start text-center lg:text-left">
                      <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-2xl mb-6 bg-primary-600">
                        <Wallet size={40} />
                      </div>
                      <div className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm bg-primary-100 text-primary-700">
                        {loan.provider}
                      </div>
                    </div>
                    <div className="lg:w-2/4">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 leading-tight">{loan.name}</h3>
                      <div className="flex flex-wrap gap-3 mb-8">
                        <span className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                          Max: {loan.maxAmount}
                        </span>
                        <span className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30">
                          Interest: {loan.interestRate}
                        </span>
                        <span className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                          Duration: {loan.duration}
                        </span>
                      </div>
                      {!isExpanded && (
                        <div className="flex gap-3 overflow-hidden">
                          {loan.eligibility.slice(0, 2).map((criteria, i) => (
                            <div key={i} className="text-[10px] font-black uppercase tracking-tighter text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-nowrap">
                              <CheckCircle size={12} className="inline mr-2 text-emerald-500" /> {criteria}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="lg:w-1/4 flex flex-col justify-between items-center lg:items-end gap-6 pt-10 lg:pt-0 border-t lg:border-t-0 lg:border-l border-dashed border-slate-100 dark:border-slate-800 lg:pl-10">
                      <div className="hidden lg:block"></div>
                      <button
                        onClick={() => toggleExpand(loan.id)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary-600 transition-colors flex items-center gap-2"
                      >
                        {isExpanded ? 'Minimize View' : 'Detailed Insight'}
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <a
                        href={loan.applyLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full lg:w-auto bg-primary-600 hover:opacity-95 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                      >
                        Apply Now <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
                      <div className="space-y-8">
                        <div>
                          <h4 className="flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6">
                            <CheckCircle size={18} className="mr-3 text-primary-600" /> Eligibility
                          </h4>
                          <ul className="space-y-3">
                            {loan.eligibility.map((item, i) => (
                              <li key={i} className="text-sm font-medium text-slate-500 dark:text-slate-400 pl-6 relative">
                                <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-primary-500/30"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6">
                            <Info size={18} className="mr-3 text-blue-500" /> Features
                          </h4>
                          <ul className="space-y-3">
                            {loan.features.map((item, i) => (
                              <li key={i} className="text-sm font-medium text-slate-500 dark:text-slate-400 pl-6 relative">
                                <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-blue-500/30"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-8">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800">
                          <h4 className="flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6">
                            <Calculator size={18} className="mr-3 text-primary-500" /> EMI Example
                          </h4>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">For a loan of <span className="font-bold">LKR 500,000</span> at <span className="font-bold">{loan.interestRate}</span> for <span className="font-bold">5 years</span>:</div>
                          <div className="text-2xl font-black text-primary-700 dark:text-primary-300 mb-2">LKR {(() => {
                              const p = 500000;
                              const parsedAnnualRate = parseFloat(loan.interestRate);
                              if (!isFinite(parsedAnnualRate)) return '-';
                              const emi = calculateMonthlyPayment(p, parsedAnnualRate, 5);
                              return emi > 0 ? emi.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-';
                          })()}</div>
                          <div className="text-xs text-slate-500">per month (approximate)</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loans;
