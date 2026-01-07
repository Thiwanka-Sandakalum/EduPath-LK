import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search, Filter, Star, Globe, Bookmark, ChevronLeft, ChevronRight, Building2, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { institutions } from '../../../data/mockData';
import { useAppStore } from '../../../context/AppContext';

const InstitutionsPage = () => {
   const [searchParams] = useSearchParams();
   const initialQuery = searchParams.get('q') || '';
   const initialType = searchParams.get('type') || 'All';
   const { toggleSavedInstitution, savedInstitutions } = useAppStore();

   const [search, setSearch] = useState(initialQuery);
   const [typeFilter, setTypeFilter] = useState<string>(initialType);
   const [locationFilter, setLocationFilter] = useState<string>('All');
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 6;

   useEffect(() => {
      const t = searchParams.get('type');
      if (t) setTypeFilter(t);
   }, [searchParams]);

   const filtered = useMemo(() => {
      return institutions.filter(inst => {
         const matchesSearch = inst.name.toLowerCase().includes(search.toLowerCase()) ||
            inst.location.toLowerCase().includes(search.toLowerCase());
         const matchesType = typeFilter === 'All' || inst.type === typeFilter;
         const matchesLocation = locationFilter === 'All' || inst.district === locationFilter;
         return matchesSearch && matchesType && matchesLocation;
      });
   }, [search, typeFilter, locationFilter]);

   const districts = Array.from(new Set(institutions.map(i => i.district))).sort();
   const totalPages = Math.ceil(filtered.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

   const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
         setCurrentPage(page);
         window.scrollTo({ top: 300, behavior: 'smooth' });
      }
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">

         <div className="relative h-[400px] bg-slate-950 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-40">
               <img src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2000" className="w-full h-full object-cover" alt="" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            <div className="relative z-10 text-center px-6 animate-fade-in-up">
               <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-white text-[10px] font-black uppercase tracking-[0.4em] mb-6">
                  <Sparkles size={14} className="text-primary-400" /> Professional Directory
               </span>
               <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">Find Your Future <br /> University</h1>
               <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium opacity-80">Verified data on Sri Lanka's leading state and private academic institutes.</p>
            </div>
         </div>

         <div className="container mx-auto px-6 -mt-16 relative z-10">

            <div className="glass dark:bg-slate-900/90 rounded-[2.5rem] shadow-premium p-4 mb-16 reveal">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 relative group">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-primary-500" />
                     <input
                        type="text"
                        placeholder="Search by name or location..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none font-bold text-slate-800 dark:text-white transition-all shadow-sm"
                     />
                  </div>

                  <div className="relative">
                     <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full appearance-none px-6 py-5 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all shadow-sm"
                     >
                        <option value="All">All Classifications</option>
                        <option value="Government">Government</option>
                        <option value="Private">Private</option>
                        <option value="Vocational">Vocational</option>
                     </select>
                     <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                  </div>

                  <div className="relative">
                     <select
                        value={locationFilter}
                        onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full appearance-none px-6 py-5 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all shadow-sm"
                     >
                        <option value="All">All Districts</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                     <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {currentItems.map((inst, index) => (
                  <div key={inst.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-soft hover:shadow-premium transition-all duration-500 group flex flex-col reveal">
                     <div className="h-64 relative overflow-hidden">
                        <img src={inst.imageUrl} alt={inst.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute top-6 left-6">
                           <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-premium ${inst.type === 'Government' ? 'bg-indigo-600' : 'bg-primary-600'}`}>
                              {inst.type}
                           </span>
                        </div>
                        <button
                           onClick={() => toggleSavedInstitution(inst.id)}
                           className={`absolute top-6 right-6 p-3 rounded-2xl backdrop-blur-md transition-all active:scale-90 ${savedInstitutions.includes(inst.id) ? 'bg-primary-600 text-white' : 'bg-black/20 text-white/70 hover:bg-white/40'}`}
                        >
                           <Bookmark size={20} className={savedInstitutions.includes(inst.id) ? 'fill-current' : ''} />
                        </button>
                     </div>

                     <div className="p-10 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-6">
                           <div className="min-w-0">
                              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">
                                 {inst.name}
                              </h3>
                              <div className="flex items-center text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                                 <MapPin size={14} className="mr-2 text-primary-500" /> {inst.location}
                              </div>
                           </div>
                        </div>

                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 line-clamp-3 font-medium">
                           {inst.overview}
                        </p>

                        <div className="mt-auto pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="flex items-center text-amber-500 font-black text-sm">
                                 <Star size={16} className="fill-current mr-1.5" /> {inst.rating}
                              </div>
                              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{inst.studentCount} Students</div>
                           </div>

                           <Link to={`/institutions/${inst.id}`} className="text-primary-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group/btn">
                              Profile <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                           </Link>
                        </div>
                     </div>
                  </div>
               ))}

               {currentItems.length === 0 && (
                  <div className="col-span-full text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 reveal">
                     <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-300"><Building2 size={40} /></div>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">No Institutions Match</h3>
                     <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">Try refining your search terms or classification filters.</p>
                     <button onClick={() => { setSearch(''); setTypeFilter('All'); setLocationFilter('All'); }} className="mt-10 btn-secondary mx-auto px-10">Clear all filters</button>
                  </div>
               )}
            </div>

            {filtered.length > itemsPerPage && (
               <div className="mt-20 flex justify-center items-center gap-3 reveal">
                  <button
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className="p-4 glass rounded-2xl text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-white dark:hover:bg-slate-800"
                  >
                     <ChevronLeft size={20} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                     <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${currentPage === page
                              ? 'bg-primary-600 text-white shadow-glow'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                           }`}
                     >
                        {page}
                     </button>
                  ))}

                  <button
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className="p-4 glass rounded-2xl text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-white dark:hover:bg-slate-800"
                  >
                     <ChevronRight size={20} />
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

export default InstitutionsPage;