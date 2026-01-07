
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { institutions, courses } from '../../../../data/mockData';
import { useAppStore } from '../../../../context/AppContext';
import { MapPin, Phone, Globe, Mail, CheckCircle, Clock, ArrowLeft, X, Share2, Star, BookOpen, Users, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom'; // Keep this only for programs linking

const InstitutionDetail = () => {
   const { id } = useParams();
   const { addRecentlyViewed, addInquiry, toggleSavedInstitution, savedInstitutions } = useAppStore();
   const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'contact'>('overview');
   const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

   const institution = institutions.find(i => i.id === id);
   const instCourses = courses.filter(c => c.institutionId === id);
   const isSaved = id && savedInstitutions.includes(id);

   useEffect(() => {
      if (id) addRecentlyViewed(id);
   }, [id, addRecentlyViewed]);

   const { register, handleSubmit, reset, formState: { errors } } = useForm();

   if (!institution) return <div className="min-h-screen flex items-center justify-center text-slate-500">Institution not found</div>;

   const onRequestSubmit = (data: any) => {
      addInquiry({
         id: Date.now().toString(),
         entityId: institution.id,
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
         <div className="relative h-[400px] w-full group overflow-hidden">

            <img
               src={institution.imageUrl}
               alt={institution.name}
               className="w-full h-full object-cover transition-transform duration-[2s] ease-out scale-105 group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90"></div>

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-end pb-12 z-20">
               <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                     <div className="reveal">
                        <div className="flex items-center gap-3 mb-4">
                           <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm border border-white/20 backdrop-blur-md
                      ${institution.type === 'Government' ? 'bg-purple-600/80' : 'bg-blue-600/80'}`}>
                              {institution.type}
                           </span>
                           <div className="flex items-center text-amber-400 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                              <Star size={14} className="fill-current mr-1.5" />
                              <span className="text-white text-xs font-bold">{institution.rating} Rating</span>
                           </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-2 tracking-tight shadow-sm leading-tight">
                           {institution.name}
                        </h1>
                        <div className="flex items-center text-lg text-slate-200 font-medium">
                           <MapPin size={20} className="mr-2 text-blue-400" /> {institution.location}
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
                           <p className="text-slate-600 leading-8 text-lg">{institution.overview}</p>
                        </section>

                        {/* Key Stats Grid */}
                        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 reveal">
                           {[
                              { label: 'Established', val: institution.established, icon: <Calendar /> },
                              { label: 'Students', val: institution.studentCount, icon: <Users /> },
                              { label: 'Courses', val: `${instCourses.length}+`, icon: <BookOpen /> },
                              { label: 'Type', val: institution.type, icon: <Globe /> }
                           ].map((s, i) => (
                              <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center hover:border-blue-200 transition-colors group">
                                 <div className="inline-flex p-3 bg-white rounded-full text-slate-400 mb-3 shadow-sm group-hover:text-blue-600 transition-colors">
                                    {React.cloneElement(s.icon as any, { size: 20 })}
                                 </div>
                                 <div className="font-bold text-slate-900 text-lg">{s.val}</div>
                                 <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">{s.label}</div>
                              </div>
                           ))}
                        </section>

                        <section className="reveal">
                           <h2 className="text-2xl font-bold text-slate-900 mb-6">Accreditations & Recognition</h2>
                           <div className="flex flex-wrap gap-3">
                              {institution.accreditation.map(acc => (
                                 <div key={acc} className="flex items-center bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm">
                                    <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full mr-3"><CheckCircle size={16} /></div>
                                    <span className="font-medium text-slate-700">{acc}</span>
                                 </div>
                              ))}
                           </div>
                        </section>

                        <section className="bg-slate-50 rounded-3xl p-8 border border-slate-200 reveal">
                           <h2 className="text-xl font-bold text-slate-900 mb-6">Facilities & Campus</h2>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                              {institution.facilities?.map(f => (
                                 <div key={f} className="flex items-center text-slate-700">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                    {f}
                                 </div>
                              ))}
                           </div>
                        </section>
                     </div>
                  )}

                  {activeTab === 'programs' && (
                     <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-end mb-6 reveal">
                           <div>
                              <h2 className="text-2xl font-bold text-slate-900">Available Programs</h2>
                              <p className="text-slate-500 mt-1">Explore degrees and diplomas offered.</p>
                           </div>
                           <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-bold">{instCourses.length} Courses</span>
                        </div>

                        {instCourses.length === 0 ? (
                           <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                              <p className="text-slate-500 font-medium">No active courses listed at the moment.</p>
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 gap-4">
                              {instCourses.map((course, index) => (
                                 <Link to={`/courses/${course.id}`} key={course.id} className={`group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col md:flex-row gap-6 reveal ${index % 2 !== 0 ? 'reveal-delay-100' : ''}`}>
                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                       {course.title.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                       <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                                          <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase w-fit mt-2 md:mt-0">{course.level}</span>
                                       </div>
                                       <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                                       <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                                          <span className="flex items-center"><Clock size={16} className="mr-2 text-slate-400" /> {course.duration}</span>
                                          <span className="flex items-center"><Calendar size={16} className="mr-2 text-slate-400" /> {course.deadline}</span>
                                       </div>
                                    </div>
                                    <div className="flex items-center justify-center border-l border-slate-100 pl-6 md:w-32">
                                       <span className="text-blue-600 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">
                                          Details <ArrowLeft className="rotate-180 ml-2 h-4 w-4" />
                                       </span>
                                    </div>
                                 </Link>
                              ))}
                           </div>
                        )}
                     </div>
                  )}

                  {activeTab === 'contact' && (
                     <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-fade-in shadow-sm reveal">
                        <div className="p-8 md:p-12 bg-slate-50 border-b border-slate-200 text-center">
                           <h2 className="text-2xl font-bold text-slate-900 mb-2">Get in Touch</h2>
                           <p className="text-slate-500">Contact the admission office directly.</p>
                        </div>
                        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                           <div className="p-8 text-center hover:bg-slate-50 transition-colors">
                              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                 <Phone size={24} />
                              </div>
                              <h3 className="font-bold text-slate-900 mb-1">Phone</h3>
                              <p className="text-slate-500 mb-3 text-sm">Mon-Fri from 8am to 5pm</p>
                              <a href={`tel:${institution.contact.phone}`} className="text-blue-600 font-bold hover:underline">{institution.contact.phone}</a>
                           </div>
                           <div className="p-8 text-center hover:bg-slate-50 transition-colors">
                              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                 <Mail size={24} />
                              </div>
                              <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                              <p className="text-slate-500 mb-3 text-sm">For general inquiries</p>
                              <a href={`mailto:${institution.contact.email}`} className="text-blue-600 font-bold hover:underline">{institution.contact.email}</a>
                           </div>
                           <div className="p-8 text-center hover:bg-slate-50 transition-colors">
                              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                 <Globe size={24} />
                              </div>
                              <h3 className="font-bold text-slate-900 mb-1">Website</h3>
                              <p className="text-slate-500 mb-3 text-sm">Visit official site</p>
                              <a href={`https://${institution.contact.website}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">{institution.contact.website}</a>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Sidebar Column */}
               <div className="w-full lg:w-96 space-y-8 flex-shrink-0">

                  {/* Admission Card */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 reveal reveal-delay-200">
                     <h3 className="font-bold text-xl text-slate-900 mb-6">Admission Info</h3>
                     <div className="space-y-6">
                        <div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Process</div>
                           <p className="text-slate-700 font-medium">{institution.admissionProcess}</p>
                        </div>
                        <div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fee Range</div>
                           <p className="text-slate-700 font-medium">{institution.feeRange}</p>
                        </div>
                        <button
                           onClick={() => setIsRequestModalOpen(true)}
                           className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                           Contact Admissions
                        </button>
                     </div>
                  </div>

                  {/* Location Card */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 reveal reveal-delay-300">
                     <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-slate-400" /> Location
                     </h3>
                     <div className="h-48 bg-slate-200 rounded-xl mb-4 relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold z-10 group-hover:scale-110 transition-transform">
                           View on Map
                        </div>
                        <div className="absolute inset-0 bg-slate-300 opacity-50"></div>
                     </div>
                     <p className="text-slate-600 font-medium text-center">{institution.location}, {institution.district}</p>
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
