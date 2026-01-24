
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// import { courses, institutions } from '../../../../data/mockData';
import { ProgramsService } from '../../../../types/services/ProgramsService';
import { InstitutionsService } from '../../../../types/services/InstitutionsService';
import { useAppStore } from '../../../../context/AppContext';
import { Clock, DollarSign, Calendar, ArrowLeft, Check, AlertCircle, X, MapPin, Share2, BookOpen, Briefcase, Globe, Users, Star, Building2, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Course } from '../../../../types';

const fieldImages: Record<string, string> = {
   'IT': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2000&auto=format&fit=crop',
   'Engineering': 'https://images.unsplash.com/photo-1581094794329-cdac82aadbcc?q=80&w=2000&auto=format&fit=crop',
   'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2000&auto=format&fit=crop',
   'Medicine': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000&auto=format&fit=crop',
   'Arts': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2000&auto=format&fit=crop',
   'Science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2000&auto=format&fit=crop',
};

const CourseDetail = () => {

   const { id } = useParams();
   const navigate = useNavigate();
   const [showApplyModal, setShowApplyModal] = useState(false);

   const [course, setCourse] = useState<any>(null);
   const [institution, setInstitution] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   React.useEffect(() => {
      if (!id) return;
      setLoading(true);
      setError(null);
      ProgramsService.getProgram(id)
         .then((data) => {
            setCourse(data);
            if (data && data.institution_id) {
               InstitutionsService.getInstitution(data.institution_id)
                  .then(setInstitution)
                  .catch(() => setInstitution(null));
            } else {
               setInstitution(null);
            }
         })
         .catch(() => {
            setCourse(null);
            setInstitution(null);
            setError('Course not found');
         })
         .finally(() => setLoading(false));
   }, [id]);

   if (loading) {
      return <div className="container mx-auto px-4 py-20 text-center">Loading...</div>;
   }
   if (error || !course) {
      return (
         <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Course not found</h2>
            <button onClick={() => navigate('/courses')} className="mt-4 text-blue-600 hover:underline">Return to Courses</button>
         </div>
      );
   }

   // Fallbacks for missing institution
   const inst = institution || {};
   const heroImage = fieldImages[course.field] || inst.imageUrl;

   // Helper to render fees breakdown
   const renderFeesBreakdown = (breakdown: any) => {
      if (!breakdown || typeof breakdown !== 'object') return null;
      return (
         <div className="mt-2 space-y-2">
            {Object.entries(breakdown).map(([group, fees]: any, idx) => (
               <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="font-bold text-slate-700 mb-1">{group}</div>
                  <ul className="text-slate-600 text-sm space-y-1">
                     {Object.entries(fees).map(([label, value]: any, i) => (
                        <li key={i}><span className="font-medium">{label}:</span> {value?.toLocaleString?.() ?? value}</li>
                     ))}
                  </ul>
               </div>
            ))}
         </div>
      );
   };

   return (
      <div className="min-h-screen bg-slate-50 font-sans pb-20">

         {/* 1. HERO HEADER */}
         <div className="relative h-[400px] w-full bg-slate-900 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
               <img src={heroImage} alt={course.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-slate-900/80"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center pb-16">
               <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                     {/* Left Side: Title & Info */}
                     <div className="flex-1 space-y-4 reveal">
                        <div className="flex gap-2 mb-2">
                           <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded uppercase tracking-wider">
                              {course.level}
                           </span>
                           <span className="px-3 py-1 bg-slate-700 text-slate-200 text-xs font-bold rounded uppercase tracking-wider border border-slate-600">
                              {course.field}
                           </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                           {course.title}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-300 text-lg font-medium">
                           <MapPin size={20} className="text-blue-400" />
                           {inst._id ? (
                              <Link to={`/institutions/${inst._id}`} className="hover:text-white transition-colors border-b border-transparent hover:border-white">
                                 {inst.name}
                              </Link>
                           ) : (
                              <span>{inst.name || 'Unknown Institution'}</span>
                           )}
                        </div>
                     </div>

                     {/* Right Side: Actions */}
                     <div className="flex items-center gap-4 reveal reveal-delay-100">
                        <button className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/10 hover:bg-white/20 transition-all">
                           <Share2 size={20} />
                        </button>
                        {course.url ? (
                           <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-1 text-lg flex items-center justify-center"
                           >
                              Apply Now
                           </a>
                        ) : (
                           <button
                              onClick={() => setShowApplyModal(true)}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-1 text-lg"
                           >
                              Apply Now
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="container mx-auto px-4 relative z-20">

            {/* 2. FLOATING STATS CARD (Duration & Next Intake only) */}
            <div className="w-full bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 -mt-12 mb-12 border border-slate-100 reveal">
               <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Duration */}
                  <div className="p-5 md:p-6 flex flex-col justify-center">
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <Clock size={16} className="text-blue-500" /> Duration
                     </div>
                     <div className="text-xl md:text-2xl font-bold text-slate-900">
                        {(() => {
                           const d = course.duration;
                           if (!d || (typeof d === 'object' && !d.years && !d.months && !d.weeks)) return 'N/A';
                           if (typeof d === 'string') return d;
                           if (typeof d === 'object') {
                              const parts = [];
                              if (d.years) parts.push(`${d.years} year${d.years > 1 ? 's' : ''}`);
                              if (d.months) parts.push(`${d.months} month${d.months > 1 ? 's' : ''}`);
                              if (d.weeks) parts.push(`${d.weeks} week${d.weeks > 1 ? 's' : ''}`);
                              return parts.join(' ');
                           }
                           return 'N/A';
                        })()}
                     </div>
                  </div>

                  {/* Next Intake */}
                  <div className="p-5 md:p-6 flex flex-col justify-center">
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <Calendar size={16} className="text-amber-500" /> Next Intake
                     </div>
                     <div className="text-xl md:text-2xl font-bold text-slate-900">
                        {(() => {
                           if (course.deadline && course.deadline !== 'N/A') return course.deadline;
                           // Auto-generate: next year, same month as today
                           const now = new Date();
                           const nextYear = now.getFullYear() + 1;
                           const month = now.toLocaleString('default', { month: 'long' });
                           return `${month} ${nextYear}`;
                        })()}
                     </div>
                  </div>
               </div>
            </div>
            {/* Requirements Section moved here */}
            {/* Requirements Section (Eligibility) */}
            <section className="reveal">
               <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <AlertCircle size={22} className="text-purple-500" /> Requirements
               </h2>
               {course.eligibility ? (
                  <div className="space-y-2">
                     {course.eligibility.minimum_qualifications && (
                        <div className="text-base font-bold text-slate-900 leading-snug">
                           {course.eligibility.minimum_qualifications}
                        </div>
                     )}
                     {course.eligibility.gpa !== null && course.eligibility.gpa !== undefined && (
                        <div className="text-sm text-slate-700">Minimum GPA: <span className="font-bold">{course.eligibility.gpa}</span></div>
                     )}
                     {course.eligibility.age_limit !== null && course.eligibility.age_limit !== undefined && (
                        <div className="text-sm text-slate-700">Age Limit: <span className="font-bold">{course.eligibility.age_limit}</span></div>
                     )}
                     {course.eligibility.work_experience && (
                        <div className="text-sm text-slate-700">Work Experience: <span className="font-bold">{course.eligibility.work_experience}</span></div>
                     )}
                     {Array.isArray(course.eligibility.other_requirements) && course.eligibility.other_requirements.length > 0 && (
                        <div className="text-sm text-slate-700">
                           Other Requirements:
                           <ul className="list-disc ml-6">
                              {course.eligibility.other_requirements.map((req: string, i: number) => (
                                 <li key={i}>{req}</li>
                              ))}
                           </ul>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="text-base font-bold text-slate-900 leading-snug">N/A</div>
               )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

               {/* Main Content Column */}
               <div className="lg:col-span-2 space-y-10">

                  <section className="reveal">
                     <h2 className="text-2xl font-bold text-slate-900 mb-6">Program Overview</h2>
                     <div className="mb-4">
                        <div className="text-slate-600 leading-8 text-lg">
                           {course.description || 'No description available.'}
                        </div>
                        {/* Program Code */}
                        {course.program_code && (
                           <div className="text-xs text-slate-500 mt-1">Program Code: {course.program_code}</div>
                        )}
                        {/* Academic Level */}
                        {course.level && (
                           <div className="text-xs text-slate-500 mt-1">Level: {course.level}</div>
                        )}
                        {/* Curriculum Summary */}
                        {course.curriculum_summary && (
                           <div className="text-xs text-slate-500 mt-1">{course.curriculum_summary}</div>
                        )}
                        {/* URL */}
                        {course.url && (
                           <div className="text-xs mt-2"><a href={course.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Official Program Page</a></div>
                        )}
                     </div>
                     {/* Delivery Modes */}
                     {Array.isArray(course.delivery_mode) && course.delivery_mode.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                           {course.delivery_mode.map((mode: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded uppercase tracking-wider border border-blue-100">{mode}</span>
                           ))}
                        </div>
                     )}
                     {/* Specializations */}
                     {Array.isArray(course.specializations) && course.specializations.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                           <span className="font-bold text-slate-700 mr-2">Specializations:</span>
                           {course.specializations.map((spec: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded uppercase tracking-wider border border-emerald-100">{spec}</span>
                           ))}
                        </div>
                     )}
                  </section>

                  {/* Investment Section moved here */}
                  <section className="reveal">
                     <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <DollarSign size={22} className="text-emerald-500" /> Investment
                     </h2>
                     <div className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                        {typeof course.fees === 'string'
                           ? (course.fees.includes('Free') ? 'Free (Government funded)' : course.fees)
                           : (course.fees?.amount
                              ? `${course.fees.amount} ${course.fees.currency || ''}`
                              : 'See breakdown below')}
                     </div>
                     {course.fees?.period && (
                        <div className="text-xs text-slate-500 mt-1">{course.fees.period}</div>
                     )}
                     {renderFeesBreakdown(course.fees?.breakdown)}
                  </section>

                  <section className="reveal">
                     <h2 className="text-2xl font-bold text-slate-900 mb-6">What You Will Learn</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Render whatYouLearn, curriculum_summary, or extensions.course_outline */}
                        {Array.isArray(course.whatYouLearn) && course.whatYouLearn.length > 0 ? (
                           course.whatYouLearn.map((item: string, i: number) => (
                              <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <BookOpen size={20} />
                                 </div>
                                 <span className="font-bold text-slate-700">{item}</span>
                              </div>
                           ))
                        ) : course.curriculum_summary ? (
                           <div className="text-slate-600">{course.curriculum_summary}</div>
                        ) : Array.isArray(course.extensions?.course_outline) && course.extensions.course_outline.length > 0 ? (
                           course.extensions.course_outline.map((sem: any, i: number) => (
                              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1 md:col-span-2">
                                 {Object.entries(sem).map(([semName, subjects]: any) => (
                                    <div key={semName}>
                                       <div className="font-bold text-blue-700 mb-2">{semName}</div>
                                       <ul className="list-disc ml-6 text-slate-700">
                                          {Array.isArray(subjects) && subjects.map((subj, j) => (
                                             <li key={j}>{subj}</li>
                                          ))}
                                       </ul>
                                    </div>
                                 ))}
                              </div>
                           ))
                        ) : (
                           <div className="text-slate-400">No curriculum information available.</div>
                        )}
                     </div>
                  </section>

                  {/* Detailed Institution Section (Added as per request) */}
                  <section className="reveal">
                     <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Building2 className="text-blue-600" /> About {inst.name || 'Institution'}
                     </h2>
                     <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                           <img src={inst.imageUrl} alt={inst.name} className="w-24 h-24 rounded-2xl object-cover shadow-md border border-slate-100" />
                           <div>
                              <p className="text-slate-600 leading-relaxed mb-4">{inst.description || inst.overview || 'No overview available.'}</p>
                              <div className="flex flex-wrap gap-4">
                                 <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 border border-slate-100">
                                    <Globe size={16} className="text-blue-500" /> {Array.isArray(inst.type) ? inst.type.join(', ') : inst.type || 'N/A'}
                                 </div>
                                 {/* Optionally add more institution info here if available */}
                              </div>
                           </div>
                        </div>
                        <Link
                           to={`/institutions/${inst._id}`}
                           className="flex items-center justify-center w-full py-4 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold rounded-xl border border-slate-200 hover:border-blue-200 transition-all group"
                        >
                           Visit Official University Profile <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                     </div>
                  </section>

                  {/* Additional Info Box */}
                  <section className="bg-slate-50 rounded-3xl p-8 border border-slate-200 reveal">
                     <h2 className="text-xl font-bold text-slate-900 mb-4">Important Information</h2>
                     <ul className="space-y-4">
                        <li className="flex items-start text-slate-600">
                           <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                           This program is fully accredited by the UGC and recognized internationally.
                        </li>
                        <li className="flex items-start text-slate-600">
                           <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                           Students typically need a credit pass in English at G.C.E O/L.
                        </li>
                        <li className="flex items-start text-slate-600">
                           <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                           Applications are processed on a rolling basis until the deadline.
                        </li>
                     </ul>
                  </section>

               </div>

               {/* Sidebar Column */}
               <div className="space-y-8">

                  {/* Career Paths Card (Dark Theme) */}
                  <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl reveal reveal-delay-200">
                     <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                        Career Paths
                     </h3>
                     <div className="space-y-3">
                        {Array.isArray(course.careerOpportunities)
                           ? course.careerOpportunities.map((job, i) => (
                              <div key={i} className="flex items-center bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                                 <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                                 <span className="font-bold text-slate-200 text-sm">{job}</span>
                              </div>
                           ))
                           : <div className="text-slate-400">No career opportunities listed.</div>
                        }
                     </div>
                  </div>

                  {/* Institution Contact Card (Simplified since detailed info is now in main column) */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm reveal reveal-delay-300">
                     <h4 className="font-bold text-slate-900 text-lg mb-4">Contact Admissions</h4>
                     <div className="space-y-4 text-sm text-slate-600">
                        {/* Address/location */}
                        {(inst.location || inst.country) && (
                           <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                              <MapPin size={18} className="text-blue-600" />
                              <span>{inst.location || inst.country}</span>
                           </div>
                        )}
                        {/* Institution website */}
                        {(inst.contact?.website || inst.website) && (
                           <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                              <Globe size={18} className="text-blue-600" />
                              <a href={inst.contact?.website || inst.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">
                                 {inst.contact?.website || inst.website}
                              </a>
                           </div>
                        )}
                        {/* Program-specific application URL */}
                        {course.url && (
                           <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                              <DollarSign size={18} className="text-emerald-600" />
                              <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">
                                 Apply Online
                              </a>
                           </div>
                        )}
                        {/* Fallback if no contact info */}
                        {!(inst.location || inst.country || inst.contact?.website || inst.website || course.url) && (
                           <div className="text-slate-400">No contact information available.</div>
                        )}
                     </div>
                     {/* Only show Enquire Directly if no program url */}
                     {!course.url && (
                        <button onClick={() => setShowApplyModal(true)} className="w-full mt-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all">
                           Enquire Directly
                        </button>
                     )}
                  </div>

               </div>
            </div>

         </div>

         {/* Apply Modal */}
         {showApplyModal && (
            <ApplyModal
               course={course}
               instName={institution.name}
               onClose={() => setShowApplyModal(false)}
            />
         )}

      </div>
   );
};

// Extracted Apply Modal Component
const ApplyModal = ({ course, instName, onClose }: { course: Course, instName: string, onClose: () => void }) => {
   const [currentStep, setCurrentStep] = useState(1);
   const { addApplication } = useAppStore();
   const { register, handleSubmit, formState: { errors } } = useForm();

   // Close on Escape
   React.useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
   }, [onClose]);

   const onSubmit = (data: any) => {
      if (currentStep < 3) {
         setCurrentStep(c => c + 1);
      } else {
         addApplication({
            id: Date.now().toString(),
            courseId: course.id,
            courseTitle: course.title,
            institutionName: instName,
            status: 'Pending',
            submittedAt: new Date().toLocaleDateString()
         });
         alert("Application Submitted!");
         onClose();
      }
   };

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
         <div className="bg-white rounded-3xl w-full max-w-xl p-8 animate-fade-in-up shadow-2xl relative border border-slate-100">
            <div className="mb-8">
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h2 className="text-3xl font-bold text-slate-900">Apply Now</h2>
                     <p className="text-slate-500 font-medium mt-1">for {course.title}</p>
                  </div>
                  <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
               </div>

               {/* Progress Bar */}
               <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
               </div>
               <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className={currentStep >= 1 ? 'text-blue-600' : ''}>Personal</span>
                  <span className={currentStep >= 2 ? 'text-blue-600' : ''}>Education</span>
                  <span className={currentStep >= 3 ? 'text-blue-600' : ''}>Review</span>
               </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               {currentStep === 1 && (
                  <div className="space-y-5 animate-fade-in">
                     <h3 className="font-bold text-slate-900 text-xl mb-4">Personal Details</h3>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Full Name</label>
                        <input {...register("name", { required: true })} placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors font-medium" />
                        {errors.name && <span className="text-red-500 text-xs ml-1 mt-1 block font-bold">Name is required</span>}
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">NIC Number</label>
                        <input {...register("nic", { required: true })} placeholder="National Identity Card No" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors font-medium" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</label>
                        <input type="email" {...register("email", { required: true })} placeholder="john@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors font-medium" />
                     </div>
                  </div>
               )}
               {currentStep === 2 && (
                  <div className="space-y-5 animate-fade-in">
                     <h3 className="font-bold text-slate-900 text-xl mb-4">Education Background</h3>
                     <div className="bg-amber-50 p-5 rounded-2xl text-sm text-amber-900 border border-amber-100 flex items-start">
                        <AlertCircle size={18} className="mr-3 mt-0.5 flex-shrink-0" />
                        <span><span className="font-bold block mb-1">Requirement Check:</span> {course.entryRequirements}</span>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">A/L Stream</label>
                        <select {...register("alStream")} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer font-medium">
                           <option>Physical Science</option>
                           <option>Bio Science</option>
                           <option>Commerce</option>
                           <option>Arts</option>
                           <option>Technology</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Z-Score</label>
                        <input {...register("zScore")} placeholder="e.g. 1.8500" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors font-medium" />
                     </div>
                  </div>
               )}
               {currentStep === 3 && (
                  <div className="space-y-5 animate-fade-in">
                     <h3 className="font-bold text-slate-900 text-xl mb-4">Final Review</h3>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Statement of Purpose</label>
                        <textarea {...register("statement")} placeholder="Why do you want to follow this course?" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 h-32 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none font-medium"></textarea>
                     </div>
                     <div className="text-xs text-slate-500 flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="bg-blue-100 p-1 rounded-full text-blue-600"><Check size={14} strokeWidth={3} /></div>
                        <span className="mt-0.5">By submitting this application, I confirm that all provided details are accurate and I agree to the terms of the institution.</span>
                     </div>
                  </div>
               )}

               <div className="flex gap-4 pt-6 border-t border-slate-100">
                  {currentStep > 1 && (
                     <button type="button" onClick={() => setCurrentStep(c => c - 1)} className="px-8 py-4 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors text-slate-600">Back</button>
                  )}
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg hover:shadow-blue-500/30 text-lg">
                     {currentStep === 3 ? 'Submit Application' : 'Next Step'}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default CourseDetail;
