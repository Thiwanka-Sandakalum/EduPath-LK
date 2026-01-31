
import React, { useState, useEffect } from 'react';
import { studentLoans } from '../data/mockData';
import { 
  Building2, Calculator, ArrowRight, CheckCircle, 
  Percent, Calendar, DollarSign, Search, ChevronDown, 
  ExternalLink, Wallet, ChevronUp, FileText, Info
} from 'lucide-react';

const Loans = () => {
  const [amount, setAmount] = useState(500000);
  const [interest, setInterest] = useState(12);
  const [years, setYears] = useState(5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // EMI Calculation: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const r = interest / 12 / 100;
    const n = years * 12;
    const emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setMonthlyPayment(isFinite(emi) ? emi : 0);
  }, [amount, interest, years]);

  const filteredLoans = studentLoans.filter(loan => {
    const matchesSearch = loan.providerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          loan.loanName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || loan.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      
      {/* Hero Section */}
      <div className="relative h-[500px] bg-slate-900 overflow-hidden flex items-center justify-center">
         <div className="absolute inset-0 opacity-40">
            <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000" className="w-full h-full object-cover" alt="Finance" />
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
         <div className="relative z-10 text-center px-6 animate-fade-in-up">
            <span className="inline-block px-5 py-2 rounded-full bg-emerald-600/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.4em] mb-6">Financial Freedom</span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none">Student Loans</h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium">Empower your education with flexible funding options from Sri Lanka's top financial institutions.</p>
         </div>
      </div>

      <div className="container mx-auto px-6 -mt-24 relative z-10">
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: EMI Calculator */}
            <div className="lg:col-span-4">
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-800 reveal sticky top-24">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Calculator size={24} />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Loan Estimator</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculate Monthly Installment</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between mb-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount (LKR)</label>
                           <span className="text-sm font-bold text-slate-900 dark:text-white">{amount.toLocaleString()}</span>
                        </div>
                        <input 
                           type="range" min="100000" max="5000000" step="50000" 
                           value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                           className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                     </div>

                     <div>
                        <div className="flex justify-between mb-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Interest Rate (%)</label>
                           <span className="text-sm font-bold text-slate-900 dark:text-white">{interest}%</span>
                        </div>
                        <input 
                           type="range" min="5" max="25" step="0.5" 
                           value={interest} onChange={(e) => setInterest(Number(e.target.value))}
                           className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                     </div>

                     <div>
                        <div className="flex justify-between mb-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration (Years)</label>
                           <span className="text-sm font-bold text-slate-900 dark:text-white">{years} Years</span>
                        </div>
                        <input 
                           type="range" min="1" max="10" step="1" 
                           value={years} onChange={(e) => setYears(Number(e.target.value))}
                           className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                     </div>

                     <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Monthly Installment</p>
                        <div className="text-center text-4xl font-black text-emerald-600 dark:text-emerald-400">
                           LKR {Math.round(monthlyPayment).toLocaleString()}
                        </div>
                        <p className="text-center text-[9px] text-slate-400 mt-2">*Indicative rates only. Terms apply.</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Loan Directory */}
            <div className="lg:col-span-8 space-y-8">
               
               {/* Filters */}
               <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 reveal">
                  <div className="flex-grow relative">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                     <input 
                        type="text" 
                        placeholder="Search banks or loan schemes..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-slate-800 dark:text-white transition-all"
                     />
                  </div>
                  <div className="relative min-w-[200px]">
                     <select 
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full appearance-none px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20"
                     >
                        <option value="All">All Providers</option>
                        <option value="Government">Government Banks</option>
                        <option value="Private Bank">Private Banks</option>
                     </select>
                     <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                  </div>
               </div>

               {/* Loan Cards */}
               <div className="space-y-6">
                  {filteredLoans.map((loan, index) => {
                     const isExpanded = expandedId === loan.id;
                     return (
                        <div 
                           key={loan.id} 
                           className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-500 overflow-hidden relative group reveal ${
                              isExpanded 
                                 ? 'border-emerald-500 shadow-2xl ring-8 ring-emerald-500/5' 
                                 : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl'
                           }`}
                        >
                           <div className="p-8">
                              <div className="flex flex-col md:flex-row gap-8 items-start">
                                 {/* Logo Section */}
                                 <div className={`w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-4 border transition-all shrink-0 ${isExpanded ? 'border-emerald-200 dark:border-emerald-900' : 'border-slate-100 dark:border-slate-700'}`}>
                                    {loan.logoUrl ? (
                                       <img src={loan.logoUrl} alt={loan.providerName} className="w-full h-full object-contain" />
                                    ) : (
                                       <Building2 className="text-slate-400 h-8 w-8" />
                                    )}
                                 </div>

                                 {/* Main Info */}
                                 <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                       <h3 className="text-2xl font-black text-slate-900 dark:text-white">{loan.loanName}</h3>
                                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${loan.type === 'Government' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                          {loan.type}
                                       </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">{loan.providerName}</p>
                                    
                                    <div className="flex flex-wrap gap-4 mb-6">
                                       <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-xs border border-emerald-100 dark:border-emerald-900/20">
                                          <Percent size={14} /> {loan.interestRate}
                                       </div>
                                       <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs border border-slate-100 dark:border-slate-700">
                                          <Wallet size={14} /> Max: {loan.maxAmount}
                                       </div>
                                       <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs border border-slate-100 dark:border-slate-700">
                                          <Calendar size={14} /> {loan.repaymentPeriod}
                                       </div>
                                    </div>

                                    {!isExpanded && (
                                       <div className="flex gap-4 overflow-hidden mb-6 md:mb-0">
                                          {loan.eligibility.slice(0, 2).map((item, i) => (
                                             <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                                <CheckCircle size={10} className="text-emerald-500 shrink-0" /> {item}
                                             </div>
                                          ))}
                                       </div>
                                    )}
                                 </div>

                                 {/* Action Buttons */}
                                 <div className="w-full md:w-auto flex flex-col items-center justify-between gap-4 self-stretch pt-2">
                                    <button 
                                       onClick={() => toggleExpand(loan.id)}
                                       className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-2 order-2 md:order-1"
                                    >
                                       {isExpanded ? 'Minimize View' : 'View Details'} 
                                       {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                    </button>
                                    
                                    <a 
                                       href={loan.website} 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       className="w-full md:w-auto px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 order-1 md:order-2"
                                    >
                                       Apply Now <ArrowRight size={14} />
                                    </a>
                                 </div>
                              </div>

                              {/* Expanded Accordion Content */}
                              {isExpanded && (
                                 <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
                                    
                                    {/* Column 1: Eligibility */}
                                    <div>
                                       <h4 className="flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6">
                                          <CheckCircle size={18} className="mr-3 text-emerald-500" /> Eligibility Criteria
                                       </h4>
                                       <ul className="space-y-4">
                                          {loan.eligibility.map((item, i) => (
                                             <li key={i} className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-400 font-bold text-[10px]">
                                                   {i+1}
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{item}</span>
                                             </li>
                                          ))}
                                       </ul>
                                    </div>

                                    {/* Column 2: Terms & Procedure */}
                                    <div className="space-y-6">
                                       <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
                                          <h4 className="flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-4">
                                             <FileText size={18} className="mr-3 text-blue-500" /> Standard Procedure
                                          </h4>
                                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                             To apply for the <strong>{loan.loanName}</strong>, visit the nearest {loan.providerName} branch with your offer letter and guarantor details.
                                          </p>
                                          <a 
                                             href={loan.website} 
                                             target="_blank" 
                                             rel="noopener noreferrer"
                                             className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs hover:underline"
                                          >
                                             Download Application Form <ExternalLink size={12} />
                                          </a>
                                       </div>

                                       <div className="flex items-start gap-4 p-5 bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-400 rounded-2xl text-xs border border-amber-100 dark:border-amber-900/20">
                                          <Info size={18} className="flex-shrink-0 mt-0.5" />
                                          <p className="font-medium leading-relaxed">
                                             <strong className="block mb-1 text-[10px] uppercase tracking-widest opacity-80">Important Notice</strong>
                                             Interest rates are subject to change based on Central Bank policies. Please verify current rates with the bank before applying.
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     );
                  })}

                  {filteredLoans.length === 0 && (
                     <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-300"><Search size={24} /></div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No loans found</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Try adjusting your filters or search terms.</p>
                     </div>
                  )}
               </div>

            </div>
         </div>

      </div>
    </div>
  );
};

export default Loans;
