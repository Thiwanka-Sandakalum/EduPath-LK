import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { scholarships } from '../../../data/mockData';
import {
   Trophy, Calendar, Globe, Search, Filter, MapPin, GraduationCap,
   CheckCircle, ArrowRight, AlertTriangle, DollarSign, Info, ChevronDown, ChevronUp
} from 'lucide-react';

const heroImages = [
   "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000",
   "https://images.unsplash.com/photo-1627556592933-ffe99c1cd9eb?q=80&w=2000",
   "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2000"
];

const ScholarshipsPage = () => {
   const [searchParams] = useSearchParams();
   const initialQuery = searchParams.get('q') || '';
   const [searchQuery, setSearchQuery] = useState(initialQuery);
   const [filterType, setFilterType] = useState('All');
   const [filterField, setFilterField] = useState('All');
   const [expandedId, setExpandedId] = useState<string | null>(null);
   const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
      }, 12000);
      return () => clearInterval(timer);
   }, []);

   useEffect(() => {
      const q = searchParams.get('q');
      if (q !== null) setSearchQuery(q);
   }, [searchParams]);

   const fields = Array.from(new Set(scholarships.map(s => s.field))).sort();
   const filteredScholarships = useMemo(() => {
      return scholarships.filter(s => {
         const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.provider.toLowerCase().includes(searchQuery.toLowerCase());
         const matchesType = filterType === 'All' || s.type === filterType;
         const matchesField = filterField === 'All' || s.field === filterField;
         return matchesSearch && matchesType && matchesField;
      });
   }, [searchQuery, filterType, filterField]);

   const getStatusBadge = (status: string) => {
      switch (status) {
         case 'Open': return 'bg-emerald-500 text-white';
         case 'Closing Soon': return 'bg-amber-500 text-white';
         case 'Closed': return 'bg-slate-400 text-white';
         case 'Upcoming': return 'bg-blue-500 text-white';
         default: return 'bg-slate-200 text-slate-700';
      }
   };

   const toggleExpand = (id: string) => {
      setExpandedId(prev => prev === id ? null : id);
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">

         <div className="relative h-[450px] bg-slate-900 overflow-hidden flex items-center justify-center">
            {heroImages.map((img, index) => (
               <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-40' : 'opacity-0'}`}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
               </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            <div className="relative z-10 text-center px-6 animate-fade-in-up">
               <span className="inline-block px-5 py-2 rounded-full bg-blue-600/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.4em] mb-6">Financial Support</span>
               <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none">Scholarship Central</h1>
               <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium">Find your path to fully funded higher education locally and internationally.</p>
            </div>
         </div>

         <div className="container mx-auto px-6 -mt-16 relative z-10">

            <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] shadow-2xl shadow-slate-900/10 border border-slate-100 dark:border-slate-800 mb-16 reveal">
               <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-grow relative group">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-primary-500" />
                     <input
                        type="text"
                        placeholder="Search by scholarship name, provider, or country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] focus:ring-4 focus:ring-blue-600/10 focus:border-blue-400 outline-none font-bold text-slate-800 dark:text-white transition-all placeholder:text-slate-400 shadow-inner"
                     />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
                     <div className="relative min-w-[200px]">
                        <select
                           value={filterType}
                           onChange={(e) => setFilterType(e.target.value)}
                           className="w-full appearance-none px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer focus:ring-4 focus:ring-blue-600/10 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-750"
                        >
                           <option value="All">All Types</option>
                           <option value="Local">Local Only</option>
                           <option value="International">International</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                     </div>

                     <div className="relative min-w-[200px]">
                        <select
                           value={filterField}
                           onChange={(e) => setFilterField(e.target.value)}
                           className="w-full appearance-none px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer focus:ring-4 focus:ring-blue-600/10 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-750"
                        >
                           <option value="All">All Fields</option>
                           {fields.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               {filteredScholarships.map((s, index) => {
                  const isExpanded = expandedId === s.id;
                  return (
                     <div
                        key={s.id}
                        className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-500 overflow-hidden relative reveal ${isExpanded ? 'border-blue-600 shadow-2xl ring-8 ring-blue-600/5' : 'border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl'
                           }`}
                     >
                        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full border-r border-slate-100 dark:border-slate-800 z-10 hidden md:block"></div>
                        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full border-l border-slate-100 dark:border-slate-800 z-10 hidden md:block"></div>

                        <div className="p-8 md:p-12">
                           <div className="flex flex-col lg:flex-row gap-10">

                              <div className="lg:w-1/4 flex flex-col items-center lg:items-start text-center lg:text-left">
                                 <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-2xl mb-6 group-hover:scale-105 transition-transform ${s.type === 'International' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                                    {s.type === 'International' ? <Globe size={40} /> : <Trophy size={40} />}
                                 </div>
                                 <div className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm ${getStatusBadge(s.status)}`}>
                                    {s.status}
                                 </div>
                              </div>

                              <div className="lg:w-2/4">
                                 <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 leading-tight">{s.title}</h3>
                                 <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                                    <span className="flex items-center"><GraduationCap size={16} className="mr-2 text-blue-500" /> {s.provider}</span>
                                    <span className="flex items-center"><MapPin size={16} className="mr-2 text-blue-500" /> {s.country}</span>
                                 </div>

                                 <div className="flex flex-wrap gap-3 mb-8">
                                    <span className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                                       {s.field}
                                    </span>
                                    <span className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                                       Value: {s.amount}
                                    </span>
                                    <span className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                                       Deadline: {s.deadline}
                                    </span>
                                 </div>

                                 {!isExpanded && (
                                    <div className="flex gap-3 overflow-hidden">
                                       {s.eligibility.slice(0, 2).map((criteria, i) => (
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
                                    onClick={() => toggleExpand(s.id)}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2"
                                 >
                                    {isExpanded ? 'Minimize View' : 'Detailed Insight'}
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                 </button>
                                 <a
                                    href={s.applicationLink || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full lg:w-auto bg-slate-900 dark:bg-blue-600 hover:opacity-95 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                                 >
                                    Access Portal <ArrowRight size={16} />
                                 </a>
                              </div>
                           </div>

                           {isExpanded && (
                              <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
                                 <div className="space-y-8">
                                    <div>
                                       <h4 className="flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6">
                                          <CheckCircle size={18} className="mr-3 text-blue-600" /> Eligibility Framework
                                       </h4>
                                       <ul className="space-y-3">
                                          {s.eligibility.map((item, i) => (
                                             <li key={i} className="text-sm font-medium text-slate-500 dark:text-slate-400 pl-6 relative">
                                                <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-blue-500/30"></span>
                                                {item}
                                             </li>
                                          ))}
                                       </ul>
                                    </div>
                                    <div>
                                       <h4 className="flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6">
                                          <DollarSign size={18} className="mr-3 text-emerald-500" /> Funding Benefits
                                       </h4>
                                       <ul className="space-y-3">
                                          {s.benefits.map((item, i) => (
                                             <li key={i} className="text-sm font-medium text-slate-500 dark:text-slate-400 pl-6 relative">
                                                <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-emerald-500/30"></span>
                                                {item}
                                             </li>
                                          ))}
                                       </ul>
                                    </div>
                                 </div>

                                 <div className="space-y-8">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800">
                                       <h4 className="flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6">
                                          <Info size={18} className="mr-3 text-blue-500" /> Procedural Steps
                                       </h4>
                                       <div className="space-y-6">
                                          {s.applicationSteps?.map((step, i) => (
                                             <div key={i} className="flex gap-4">
                                                <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 text-[10px] font-black flex items-center justify-center shadow-sm">{i + 1}</span>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{step}</p>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                    {s.importantInfo && (
                                       <div className="flex items-start gap-4 p-6 bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-400 rounded-2xl text-sm border border-amber-100 dark:border-amber-900/20">
                                          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                                          <div>
                                             <span className="font-black uppercase tracking-widest text-[10px] block mb-2">Notice:</span>
                                             <ul className="list-disc pl-4 space-y-2 font-medium">
                                                {s.importantInfo.map((info, i) => <li key={i}>{info}</li>)}
                                             </ul>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  );
               })}

               {filteredScholarships.length === 0 && (
                  <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 reveal">
                     <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm text-slate-300"><Search size={32} /></div>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">No Active Scholarships</h3>
                     <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">Try adjusting your filters to find suitable financial aid opportunities.</p>
                     <button onClick={() => { setSearchQuery(''); setFilterType('All'); setFilterField('All'); }} className="mt-10 text-blue-600 font-black text-[11px] uppercase tracking-widest hover:underline">Clear all filters</button>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default ScholarshipsPage;