import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search, Bookmark, ChevronLeft, ChevronRight, Building2, ArrowRight, ChevronDown } from 'lucide-react';
import { InstitutionsService } from '../../../types/services/InstitutionsService';
import type { Institution } from '../../../types/models/Institution';
import { useAppStore } from '../../../context/AppContext';

type InstitutionClassification = 'Government' | 'Private';
type InstitutionView = Institution & {
   classification: InstitutionClassification;
   source: 'backend' | 'government-json';
};

type GovernmentInstitutionJson = {
   id?: string;
   _id?: string;
   name: string;
   unicode_suffix?: string;
   abbreviation?: string;
   description?: string;
   type?: string[] | string;
   country?: string;
   website?: string;
   image_url?: string;
   recognition?: any;
   contact_info?: any;
   contact?: {
      address?: string;
      phone?: string[];
      website?: string;
   };
   location?: string;
   programs?: any;
};

function normalizeGovernmentJson(payload: any): GovernmentInstitutionJson[] {
   if (!payload) return [];
   if (Array.isArray(payload)) return payload as GovernmentInstitutionJson[];
   if (Array.isArray(payload.institutions)) return payload.institutions as GovernmentInstitutionJson[];
   if (Array.isArray(payload.items)) return payload.items as GovernmentInstitutionJson[];
   return [];
}

function normalizeWebsiteUrl(value: unknown): string | undefined {
   const raw = typeof value === 'string' ? value.trim() : '';
   if (!raw) return undefined;
   if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
   return `https://${raw}`;
}

function toApiInstitutionLike(gov: GovernmentInstitutionJson): InstitutionView {
   const id = String(gov._id ?? gov.id ?? '').trim() || `gov-${gov.name}`;
   const now = new Date().toISOString();
   const typeArray = Array.isArray(gov.type) ? gov.type : gov.type ? [String(gov.type)] : [];
   const website =
      normalizeWebsiteUrl(gov.website) ??
      normalizeWebsiteUrl(gov.contact?.website);

   const contactInfo = (gov as any).contact_info ?? {
      address: gov.contact?.address,
      phone: gov.contact?.phone,
      website,
      location: gov.location,
   };

   const description =
      gov.description ??
      (gov.location ? `${gov.name} is a government institution located in ${gov.location}.` : `${gov.name} is a government institution in Sri Lanka.`);

   return {
      _id: id,
      name: gov.name,
      description,
      website,
      country: gov.country ?? 'Sri Lanka',
      image_url: gov.image_url,
      type: typeArray,
      recognition: (gov as any).recognition,
      contact_info: contactInfo,
      confidence_score: 1,
      created_at: now,
      updated_at: now,
      classification: 'Government',
      source: 'government-json',
   };
}

const InstitutionsPage = () => {
   const [searchParams] = useSearchParams();
   const normalizeTypeParam = (value: string | null): 'All' | InstitutionClassification => {
      if (!value) return 'All';
      const trimmed = value.trim();
      if (!trimmed) return 'All';
      const lowered = trimmed.toLowerCase();
      if (lowered === 'government' || lowered === 'government university' || lowered === 'government universities') return 'Government';
      if (lowered === 'private' || lowered === 'private institute' || lowered === 'private institutes') return 'Private';
      return 'All';
   };

   const initialQuery = searchParams.get('q') || '';
   const initialType = normalizeTypeParam(searchParams.get('type'));
   const { toggleSavedInstitution, savedInstitutions } = useAppStore();

   const [institutions, setInstitutions] = useState<InstitutionView[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [govError, setGovError] = useState<string | null>(null);

   const [search, setSearch] = useState(initialQuery);
   const [typeFilter, setTypeFilter] = useState<'All' | InstitutionClassification>(initialType);
   // Remove location/district filter as not present in API
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 6;

   useEffect(() => {
      let cancelled = false;
      const fetchInstitutions = async () => {
         setLoading(true);
         setError(null);
         setGovError(null);
         try {
            const [apiRes, govRes] = await Promise.all([
               InstitutionsService.listInstitutions(1, 1000),
               fetch('/government-institutions.json').then(async (r) => {
                  if (!r.ok) return null;
                  return r.json();
               }).catch(() => null),
            ]);
            if (!cancelled) {
               const apiInstitutions: InstitutionView[] = (apiRes.data ?? []).map((inst) => ({
                  ...(inst as Institution),
                  classification: 'Private',
                  source: 'backend',
               }));

               const govInstitutionsRaw = normalizeGovernmentJson(govRes);
               const govInstitutions: InstitutionView[] = govInstitutionsRaw
                  .filter((x) => x && typeof x.name === 'string' && x.name.trim() !== '')
                  .map(toApiInstitutionLike);

               setInstitutions([...govInstitutions, ...apiInstitutions]);

               // If the JSON exists but has no institutions, show a gentle hint.
               if (govRes && govInstitutions.length === 0) {
                  setGovError('Government institutions JSON loaded, but it contains no institutions yet.');
               }
            }
         } catch (err: any) {
            if (!cancelled) setError(err?.message || 'Failed to load institutions');
         } finally {
            if (!cancelled) setLoading(false);
         }
      };
      fetchInstitutions();
      return () => { cancelled = true; };
   }, []);

   useEffect(() => {
      const t = normalizeTypeParam(searchParams.get('type'));
      setTypeFilter(t);
   }, [searchParams]);

   useEffect(() => {
      const q = searchParams.get('q') || '';
      setSearch(q);
      setCurrentPage(1);
   }, [searchParams]);

   const filtered = useMemo(() => {
      return institutions.filter(inst => {
         const q = search.trim().toLowerCase();
         const contactText = Array.isArray(inst.contact_info)
            ? inst.contact_info.join(' ')
            : inst.contact_info
               ? Object.values(inst.contact_info as any).join(' ')
               : '';
         const haystack = [
            inst.name,
            inst.description ?? '',
            inst.website ?? '',
            inst.country ?? '',
            (inst as any).institution_code ?? '',
            contactText,
         ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

         const matchesSearch = !q || haystack.includes(q);
         const matchesType = typeFilter === 'All' || inst.classification === typeFilter;
         return matchesSearch && matchesType;
      });
   }, [search, typeFilter, institutions]);

   // Remove districts logic
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
      <div className="min-h-screen bg-white dark:bg-slate-950 pb-24">

         <div className="relative h-[400px] bg-slate-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-40">
               <img src="https://th.bing.com/th/id/R.f07cdec4e23cf34b886f3d2723a43c45?rik=eo8HOKNqJ6id1Q&riu=http%3a%2f%2fbizenglish.adaderana.lk%2fwp-content%2fuploads%2fThe-NSBM-Green-University-T-1.jpg&ehk=%2bZ50pNAdHDavEfDUrxRSy1OJPHEERMuPBhMLFJPIEMY%3d&risl=&pid=ImgRaw&r=0" className="w-full h-full object-cover" alt="" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            <div className="relative z-10 text-center px-6 animate-fade-in-up">
              <span className="inline-block px-5 py-2 rounded-full bg-blue-600/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.4em] mb-0.8">Professional Directory</span>
               <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">Find Your Future University</h1>
               <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium ">Verified data on Sri Lanka's leading state and private academic institutes.</p>
            </div>
         </div>


            <div className="container mx-auto px-6 -mt-16 relative z-10">
               {/* Enhanced Filter/Search Bar */}
               <div className="glass dark:bg-slate-900/90 rounded-[2.5rem] shadow-premium p-8 mb-16 reveal">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                     <div className="flex-1 flex items-center bg-white dark:bg-slate-800/80 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-inner px-6 py-4 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors" />
                        <input
                           type="text"
                           placeholder="Search by name or location..."
                           value={search}
                           onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                           className="w-full pl-14 pr-6 py-3 bg-transparent border-none outline-none font-bold text-slate-800 dark:text-white text-lg placeholder:text-slate-400"
                        />
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="relative">
                           <select
                              value={typeFilter}
                              onChange={(e) => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
                              className="appearance-none px-6 py-3 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all shadow-sm text-base"
                           >
                              <option value="All">All Institutions</option>
                              <option value="Government">Government</option>
                              <option value="Private">Private</option>
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                        </div>
                     </div>
                  </div>
               </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {loading && (
                  <div className="col-span-full text-center py-32">Loading institutions...</div>
               )}
               {error && (
                  <div className="col-span-full text-center text-red-500 py-6">{error}</div>
               )}
               {govError && !error && (
                  <div className="col-span-full text-center text-amber-600 py-2 text-sm">{govError}</div>
               )}

                  {currentItems.map((inst) => (
                     <div key={inst._id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-lg hover:shadow-premium transition-all duration-500 group flex flex-col reveal">
                        <div className="h-56 md:h-64 relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                           {((inst as any).image_url || (inst as any).imageUrl) && String((inst as any).image_url || (inst as any).imageUrl).trim() !== '' ? (
                              <img
                                 src={(inst as any).image_url || (inst as any).imageUrl}
                                 alt={inst.name + ' campus image'}
                                 className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                 onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                           ) : (
                              <span className="text-5xl font-black text-primary-600 dark:text-primary-400 select-none">
                                 {inst.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                              </span>
                           )}
                           <div className="absolute top-6 left-6">
                              <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-premium ${inst.classification === 'Government' ? 'bg-indigo-600' : 'bg-primary-600'}`}>
                                 {inst.classification}
                              </span>
                           </div>
                           <button
                              onClick={() => toggleSavedInstitution(inst._id)}
                              className={`absolute top-6 right-6 p-3 rounded-2xl backdrop-blur-md transition-all active:scale-90 ${savedInstitutions.includes(inst._id) ? 'bg-primary-600 text-white' : 'bg-black/20 text-white/70 hover:bg-white/40'}`}
                           >
                              <Bookmark size={20} className={savedInstitutions.includes(inst._id) ? 'fill-current' : ''} />
                           </button>
                        </div>
                        <div className="p-8 flex flex-col flex-1">
                           <div className="flex justify-between items-start mb-6">
                              <div className="min-w-0">
                                 <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">
                                    {inst.name}
                                 </h3>
                                 {(() => {
                                    const c: any = inst.contact_info;
                                    const locationText = Array.isArray(c)
                                       ? c?.[0]
                                       : c?.location || c?.address || '';
                                    return locationText ? (
                                       <div className="flex items-center text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                                          <MapPin size={14} className="mr-2 text-primary-500" /> {String(locationText)}
                                       </div>
                                    ) : null;
                                 })()}
                              </div>
                           </div>
                           <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                              {inst.description}
                           </p>
                           <div className="mt-auto pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 {Array.isArray(inst.programs) && (
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                       {inst.programs.length} Programs
                                    </div>
                                 )}
                              </div>
                              <Link to={`/institutions/${inst._id}`} className="text-primary-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group/btn">
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
                     <button onClick={() => { setSearch(''); setTypeFilter('All'); }} className="mt-10 btn-secondary mx-auto px-10">Clear all filters</button>
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