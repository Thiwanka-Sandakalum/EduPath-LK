
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../../../../context/AppContext';
import { MapPin, Phone, Globe, Mail, CheckCircle, Clock, ArrowLeft, X, Share2, Star, BookOpen, Users, Calendar } from 'lucide-react';
import { InstitutionsService } from '../../../../types/services/InstitutionsService';
import { ProgramsService } from '../../../../types/services/ProgramsService';
import type { Institution } from '../../../../types/models/Institution';
import type { Program } from '../../../../types/models/Program';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom'; // Keep this only for programs linking

type GovernmentDegreeProgram = {
   _id: string;
   title?: string;
   name?: string;
   stream?: string;
   duration_years?: number;
   medium_of_instruction?: string;
   description?: string;
   al_requirements?: any;
   ol_requirements?: any;
   aptitude_test_required?: boolean;
};

type GovernmentCourseOffering = {
   degree_program_id: string;
   university_id: string;
   proposed_intake?: number;
   cutoff_marks?: Record<string, string | number | null | undefined>;
   academic_year?: string;
};

const safeJsonFetch = async (url: string) => {
   const res = await fetch(url, { headers: { Accept: 'application/json' } });
   if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
   const text = await res.text();
   const cleaned = text.replace(/^\uFEFF/, '');
   return JSON.parse(cleaned);
};

const extractArrayFromJson = (json: any, keys: string[]): any[] => {
   if (Array.isArray(json)) return json;
   if (!json || typeof json !== 'object') return [];
   for (const k of keys) {
      const v = (json as any)[k];
      if (Array.isArray(v)) return v;
   }
   return [];
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

function toApiInstitutionLike(gov: GovernmentInstitutionJson): Institution {
   const id = String(gov._id ?? gov.id ?? '').trim() || `gov-${gov.name}`;
   const now = new Date().toISOString();
   const typeArray = Array.isArray(gov.type) ? gov.type : gov.type ? [String(gov.type)] : ['Government'];
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
   };
}

const InstitutionDetail = () => {
   const { id } = useParams();
   const { addRecentlyViewed, addInquiry, toggleSavedInstitution, savedInstitutions } = useAppStore();
   const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'contact'>('overview');
   const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

   const [institution, setInstitution] = useState<Institution | null>(null);
   const [instCourses, setInstCourses] = useState<Program[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const isSaved = id && savedInstitutions.includes(id);

   const extractId = (value: unknown): string | null => {
      if (typeof value === 'string') {
         const trimmed = value.trim();
         if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
         if (trimmed.includes('[object Object]')) return null;
         return trimmed;
      }
      if (value && typeof value === 'object') {
         const v: any = value;
         const candidate = v.$oid ?? v.oid ?? v.id ?? v._id;
         return extractId(candidate);
      }
      return null;
   };

   useEffect(() => {
      if (!id) return;
      let cancelled = false;
      const fetchInstitution = async () => {
         setLoading(true);
         setError(null);
         try {
            const res = await InstitutionsService.getInstitution(id);
            if (!cancelled) setInstitution(res);
         } catch (err: any) {
            // Fallback: government institutions stored as static JSON (no backend record)
            try {
               const r = await fetch('/government-institutions.json');
               if (!r.ok) throw new Error('No government institutions JSON');
               const json = await r.json();
               const list = normalizeGovernmentJson(json);
               const found = list.find((x) => String(x?._id ?? x?.id ?? '').trim() === String(id));
               if (found) {
                  if (!cancelled) setInstitution(toApiInstitutionLike(found));
               } else {
                  if (!cancelled) setError(err?.message || 'Failed to load institution');
               }
            } catch {
               if (!cancelled) setError(err?.message || 'Failed to load institution');
            }
         } finally {
            if (!cancelled) setLoading(false);
         }
      };
      const fetchPrograms = async () => {
         const loadGovernmentProgramsForUniversity = async (universityId: string) => {
            const [programsJson, offeringsJson] = await Promise.all([
               safeJsonFetch('/government-degree-programs.json'),
               safeJsonFetch('/government-course-offerings.json'),
            ]);

            const programsRaw = extractArrayFromJson(programsJson, ['degreePrograms', 'degree_programs', 'programs', 'data']);
            const offeringsRaw = extractArrayFromJson(offeringsJson, ['offerings', 'course_offerings', 'data']);

            const programs = programsRaw
               .filter((p: any) => p && typeof p === 'object' && typeof p._id === 'string') as GovernmentDegreeProgram[];
            const programsById = new Map<string, GovernmentDegreeProgram>();
            for (const p of programs) programsById.set(String(p._id), p);

            const offerings = offeringsRaw
               .filter((o: any) => o && typeof o === 'object' && typeof o.degree_program_id === 'string' && typeof o.university_id === 'string')
               .map((o: any) => ({
                  degree_program_id: String(o.degree_program_id),
                  university_id: String(o.university_id),
                  proposed_intake: typeof o.proposed_intake === 'number' ? o.proposed_intake : undefined,
                  cutoff_marks: o.cutoff_marks && typeof o.cutoff_marks === 'object' ? o.cutoff_marks : undefined,
                  academic_year: typeof o.academic_year === 'string' ? o.academic_year : undefined,
               })) as GovernmentCourseOffering[];

            const programIds = new Set(
               offerings
                  .filter((o) => String(o.university_id) === String(universityId))
                  .map((o) => o.degree_program_id)
                  .filter(Boolean)
            );

            if (!programIds.size) return [] as Program[];

            const mapped: Program[] = Array.from(programIds)
               .map((pid) => programsById.get(String(pid)))
               .filter(Boolean)
               .map((p: any) => {
                  const title = p.title || p.name || p._id;
                  return {
                     _id: p._id as any,
                     name: title as any,
                     description: (p.description || 'Government university degree program.') as any,
                     level: 'Undergraduate' as any,
                     institution_id: universityId as any,
                     duration: typeof p.duration_years === 'number' ? ({ years: p.duration_years } as any) : (undefined as any),
                     fees: 'Free' as any,
                  } as any;
               })
               .sort((a: any, b: any) => String(a?.name || '').localeCompare(String(b?.name || '')));

            return mapped;
         };

         try {
            const res = await ProgramsService.listInstitutionPrograms(id, 1, 1000);
            const apiList = (res.data ?? []) as Program[];
            if (!cancelled) setInstCourses(apiList);

            // If backend returns empty for a government institution ID, try JSON fallback.
            if (!cancelled && (!apiList || apiList.length === 0)) {
               try {
                  const govList = await loadGovernmentProgramsForUniversity(id);
                  if (!cancelled && govList.length > 0) setInstCourses(govList);
               } catch {
                  // ignore
               }
            }
         } catch (err) {
            // Fallback: government courses are stored as static JSON
            try {
               const govList = await loadGovernmentProgramsForUniversity(id);
               if (!cancelled) setInstCourses(govList);
            } catch {
               // ignore
            }
         }
      };
      fetchInstitution();
      fetchPrograms();
      return () => { cancelled = true; };
   }, [id]);

   useEffect(() => {
      if (id) addRecentlyViewed(id);
   }, [id, addRecentlyViewed]);

   const { register, handleSubmit, reset, formState: { errors } } = useForm();

   const contact = institution?.contact_info as any;
   const addressText = Array.isArray(contact)
      ? contact?.[0]
      : contact?.address || contact?.location || '';
   const phoneValue = Array.isArray(contact)
      ? contact?.[1]
      : Array.isArray(contact?.phone)
         ? contact.phone[0]
         : contact?.phone;
   const emailValue = Array.isArray(contact)
      ? contact?.[2]
      : contact?.email;
   const websiteValue = institution?.website;

   if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading institution...</div>;
   if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
   if (!institution) return <div className="min-h-screen flex items-center justify-center text-slate-500">Institution not found</div>;

   const onRequestSubmit = (data: any) => {
      addInquiry({
         id: Date.now().toString(),
         entityId: institution._id,
         entityName: institution.name,
         message: data.message,
         sentAt: new Date().toISOString()
      });
      alert('Inquiry sent successfully!');
      setIsRequestModalOpen(false);
      reset();
   };

   return (
      <div className="bg-white min-h-screen font-sans pb-20">

         {/* 1. IMMERSIVE HERO SECTION */}
         <div className="relative h-[400px] w-full group overflow-hidden bg-slate-100 flex items-center justify-center">
            {institution.image_url ? (
               <img
                  src={institution.image_url}
                  alt={institution.name}
                  className="absolute inset-0 w-full h-full object-cover"
               />
            ) : (
               <span className="text-6xl font-black text-primary-600 dark:text-primary-400 select-none">
                  {institution.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
               </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90"></div>

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-end pb-12 z-20">
               <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                     <div className="reveal">
                        <div className="flex items-center gap-3 mb-4">
                           <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm border border-white/20 backdrop-blur-md bg-blue-600/80">
                              {Array.isArray(institution.type) ? institution.type.join(', ') : institution.type}
                           </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-2 tracking-tight shadow-sm leading-tight">
                           {institution.name}
                        </h1>
                        <div className="flex items-center text-lg text-slate-200 font-medium">
                           <MapPin size={20} className="mr-2 text-blue-400" /> {addressText ? String(addressText) : ''}
                        </div>
                     </div>

                     <div className="flex gap-4 reveal reveal-delay-100">
                        <button
                           onClick={() => id && toggleSavedInstitution(id)}
                           className={`px-6 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 ${isSaved ? 'bg-white text-blue-600 shadow-lg' : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'}`}
                        >
                           {isSaved ? <CheckCircle size={20} /> : <Share2 size={20} />}
                           {isSaved ? 'Saved' : 'Save'}
                        </button>
                        <button
                           onClick={() => setIsRequestModalOpen(true)}
                           className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-500/40 hover:-translate-y-1"
                        >
                           Enquire Now
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. NAVIGATION TABS (Static Position - Non Sticky) */}
         <div className="bg-white border-b border-slate-200 relative z-20">
            <div className="container mx-auto px-4">
               <div className="flex overflow-x-auto hide-scrollbar gap-8">
                  {['overview', 'programs', 'contact'].map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`py-5 font-bold text-sm uppercase tracking-wide border-b-2 transition-all whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* 3. MAIN CONTENT GRID */}
         <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row gap-12">

               {/* Main Column */}
               <div className="flex-1 min-w-0">

                  {activeTab === 'overview' && (
                     <div className="space-y-12 animate-fade-in">
                        <section className="reveal">
                           <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                              <BookOpen className="mr-3 text-blue-600" /> About the Institution
                           </h2>
                           <p className="text-slate-600 leading-8 text-lg mb-6">{institution.description}</p>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                 <div className="font-bold text-slate-700 mb-2">Institution Code</div>
                                 <div className="text-slate-500">{institution.institution_code}</div>
                              </div>
                              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                 <div className="font-bold text-slate-700 mb-2">Country</div>
                                 <div className="text-slate-500">{institution.country}</div>
                              </div>
                           </div>
                        </section>
                        <section className="reveal">
                           <h2 className="text-2xl font-bold text-slate-900 mb-6">Accreditations & Recognition</h2>
                           <div className="flex flex-wrap gap-3">
                              {Array.isArray(institution.recognition)
                                 ? institution.recognition.map(acc => (
                                    <div key={acc} className="flex items-center bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm">
                                       <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full mr-3"><CheckCircle size={16} /></div>
                                       <span className="font-medium text-slate-700">{acc}</span>
                                    </div>
                                 ))
                                 : (
                                    <div className="flex items-center bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm">
                                       <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full mr-3"><CheckCircle size={16} /></div>
                                       <span className="font-medium text-slate-700">{institution.recognition}</span>
                                    </div>
                                 )}
                           </div>
                        </section>
                     </div>
                  )}

                  {activeTab === 'programs' && (
                     <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-end mb-6 reveal">
                           <div>
                              <h2 className="text-2xl font-bold text-slate-900">Programs Offered</h2>
                              <p className="text-slate-500 mt-1">All programs and short courses available at this institution.</p>
                           </div>
                           <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-bold">{instCourses.length || (Array.isArray(institution.programs) ? institution.programs.length : 0)} Programs</span>
                        </div>
                        {instCourses.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {instCourses.map((prog) => {
                                 const progId = extractId((prog as any)?._id) ?? extractId((prog as any)?.id);
                                 const href = progId ? `/courses/${progId}` : `/courses?q=${encodeURIComponent(prog.name)}`;
                                 return (
                                    <Link
                                       to={href}
                                       key={String(progId ?? prog.name)}
                                       className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                    >
                                       <div className="flex items-center gap-3 mb-2">
                                          <BookOpen className="text-blue-500" />
                                          <span className="font-bold text-lg text-slate-800">{prog.name}</span>
                                       </div>
                                       {prog.level ? (
                                          <span className="text-slate-600 text-sm font-semibold">{prog.level}</span>
                                       ) : null}
                                       <span className="text-slate-500 text-sm line-clamp-2">
                                          {prog.description || `A recognized program at ${institution.name}. Click to view course details.`}
                                       </span>
                                    </Link>
                                 );
                              })}
                           </div>
                        ) : Array.isArray(institution.programs) && institution.programs.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {institution.programs.map((prog, idx) => (
                                 <Link
                                    key={idx}
                                    to={`/courses?q=${encodeURIComponent(prog)}`}
                                    className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                 >
                                    <div className="flex items-center gap-3 mb-2">
                                       <BookOpen className="text-blue-500" />
                                       <span className="font-bold text-lg text-slate-800">{prog}</span>
                                    </div>
                                    <span className="text-slate-500 text-sm">Search this course in Courses.</span>
                                 </Link>
                              ))}
                           </div>
                        ) : (
                           <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                              <p className="text-slate-500 font-medium">No programs listed at the moment.</p>
                           </div>
                        )}
                     </div>
                  )}

                  {activeTab === 'contact' && (
                     <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-fade-in shadow-sm reveal p-10 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center"><Mail className="mr-3 text-blue-600" /> Contact Information</h2>
                        <div className="flex flex-col gap-6">
                           <div className="flex items-center gap-4">
                              <MapPin className="text-blue-500" />
                              <span className="font-bold text-slate-700">Address:</span>
                              <span className="text-slate-600">{addressText ? String(addressText) : '—'}</span>
                           </div>
                           {phoneValue ? (
                              <div className="flex items-center gap-4">
                                 <Phone className="text-blue-500" />
                                 <span className="font-bold text-slate-700">Phone:</span>
                                 <a href={`tel:${phoneValue}`} className="text-blue-600 font-bold hover:underline">{String(phoneValue)}</a>
                              </div>
                           ) : null}
                           {emailValue ? (
                              <div className="flex items-center gap-4">
                                 <Mail className="text-blue-500" />
                                 <span className="font-bold text-slate-700">Email:</span>
                                 <a href={`mailto:${emailValue}`} className="text-blue-600 font-bold hover:underline">{String(emailValue)}</a>
                              </div>
                           ) : null}
                           <div className="flex items-center gap-4">
                              <Globe className="text-blue-500" />
                              <span className="font-bold text-slate-700">Website:</span>
                              {websiteValue ? (
                                 <a href={websiteValue} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">{websiteValue}</a>
                              ) : (
                                 <span className="text-slate-600">—</span>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Sidebar Column: now only website/email info, no admission info */}
               <div className="w-full lg:w-96 space-y-8 flex-shrink-0">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 reveal reveal-delay-200 flex flex-col gap-4 items-center">
                     <Globe className="text-blue-600 mb-2" size={32} />
                     {websiteValue ? (
                        <a href={websiteValue} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline text-lg break-all">{websiteValue}</a>
                     ) : (
                        <span className="text-slate-500 font-semibold">No website provided</span>
                     )}
                     {emailValue ? (
                        <>
                           <Mail className="text-blue-600 mb-2" size={28} />
                           <a href={`mailto:${emailValue}`} className="text-blue-600 font-bold hover:underline text-lg break-all">{String(emailValue)}</a>
                        </>
                     ) : null}
                  </div>
               </div>
            </div>
         </div>

         {/* Request Info Modal */}
         {isRequestModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
               <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative animate-fade-in-up shadow-2xl">
                  <button onClick={() => setIsRequestModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                     <X size={24} />
                  </button>

                  <div className="mb-8">
                     <h2 className="text-3xl font-bold text-slate-900 mb-2">Get Information</h2>
                     <p className="text-slate-500">Send an inquiry directly to the admission office of <span className="font-semibold text-slate-800">{institution.name}</span>.</p>
                  </div>

                  <form onSubmit={handleSubmit(onRequestSubmit)} className="space-y-5">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Your Name</label>
                        <input {...register("name", { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" placeholder="John Doe" />
                        {errors.name && <span className="text-red-500 text-xs mt-1 ml-1 font-bold">Name is required</span>}
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</label>
                        <input type="email" {...register("email", { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" placeholder="john@example.com" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Your Message</label>
                        <textarea {...register("message", { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 h-32 transition-all resize-none font-medium" placeholder="I would like to know more about..." />
                     </div>
                     <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 text-lg">Send Message</button>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default InstitutionDetail;
