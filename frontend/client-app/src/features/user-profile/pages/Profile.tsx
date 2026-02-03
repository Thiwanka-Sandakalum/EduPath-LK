import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
// Fix: Import Building2 which was used in the component but not imported from lucide-react
import {
   Camera, User, Mail, Book, GraduationCap,
   MapPin, Briefcase, Save, LogOut, Phone, Calendar,
   Plus, Trash2, Edit2, CheckCircle, Scroll, Award, Laptop, Wrench, X,
   ChevronRight, Fingerprint, ShieldCheck, HardHat, FileText, Building2
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import type { StudentDetails, AdditionalEducation } from '../../../types/user';

const PROFILE_STORAGE_KEY = 'eduPath_profile_student_details';
const EDUCATION_STORAGE_KEY = 'eduPath_profile_additional_education';

const SRI_LANKA_DISTRICTS = [
   'Ampara',
   'Anuradhapura',
   'Badulla',
   'Batticaloa',
   'Colombo',
   'Galle',
   'Gampaha',
   'Hambantota',
   'Jaffna',
   'Kalutara',
   'Kandy',
   'Kegalle',
   'Kilinochchi',
   'Kurunegala',
   'Mannar',
   'Matale',
   'Matara',
   'Monaragala',
   'Mullaitivu',
   'Nuwara Eliya',
   'Polonnaruwa',
   'Puttalam',
   'Ratnapura',
   'Trincomalee',
   'Vavuniya',
];

const Profile = () => {
   const navigate = useNavigate();
   const { user, logout, isAuthenticated, isLoading } = useAuth0();
   const [loading, setLoading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<Partial<StudentDetails>>();

   const watchedMobile = watch('mobile');
   const watchedDistrict = watch('district');

   const [educationList, setEducationList] = useState<AdditionalEducation[]>([]);
   const [isAddingEdu, setIsAddingEdu] = useState(false);
   const [editingEduId, setEditingEduId] = useState<string | null>(null);

   const [eduForm, setEduForm] = useState<Partial<AdditionalEducation>>({
      type: 'Diploma',
      mode: 'Full-time',
      hasCertificate: false,
      completionYear: ''
   });
   const [isOngoing, setIsOngoing] = useState(false);

   useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         navigate('/');
         return;
      }
      if (!isAuthenticated) return;

      // Restore saved profile fields
      try {
         const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
         if (raw) {
            const saved = JSON.parse(raw) as Partial<StudentDetails>;
            Object.entries(saved).forEach(([key, value]) => {
               setValue(key as keyof StudentDetails, value as any);
            });
         }
      } catch {
         // ignore malformed storage
      }

      // Default full name (if not already saved)
      if (user?.name) {
         const currentFullName = getValues('fullName');
         if (typeof currentFullName !== 'string' || !currentFullName.trim()) {
            setValue('fullName', user.name);
         }
      }

      // Restore saved additional education
      try {
         const rawEdu = localStorage.getItem(EDUCATION_STORAGE_KEY);
         if (rawEdu) {
            const savedEdu = JSON.parse(rawEdu) as AdditionalEducation[];
            if (Array.isArray(savedEdu)) setEducationList(savedEdu);
         }
      } catch {
         // ignore malformed storage
      }
   }, [isAuthenticated, isLoading, navigate]);

   useEffect(() => {
      if (!isAuthenticated) return;
      try {
         localStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify(educationList));
      } catch {
         // ignore
      }
   }, [educationList, isAuthenticated]);

   useEffect(() => {
      if (!isAuthenticated) return;
      // Auto-save form fields so the left summary and refresh stay in sync
      try {
         const current = getValues();
         localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(current));
      } catch {
         // ignore
      }
   }, [watchedMobile, watchedDistrict, isAuthenticated, getValues]);

   const handleGeneralSubmit = (data: Partial<StudentDetails>) => {
      setLoading(true);
      setTimeout(() => {
         try {
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
         } catch {
            // ignore
         }
         setLoading(false);
         alert('Profile updated successfully!');
      }, 800);
   };

   const handleAddEdu = () => {
      setEduForm({
         type: 'Diploma',
         mode: 'Full-time',
         hasCertificate: false,
         completionYear: ''
      });
      setIsOngoing(false);
      setEditingEduId(null);
      setIsAddingEdu(true);
   };

   const handleEditEdu = (edu: AdditionalEducation) => {
      setEduForm(edu);
      setIsOngoing(edu.completionYear === 'Ongoing');
      setEditingEduId(edu.id);
      setIsAddingEdu(true);
   };

   const handleDeleteEdu = (id: string) => {
      if (window.confirm("Delete this qualification?")) {
         const updatedList = educationList.filter(e => e.id !== id);
         setEducationList(updatedList);
         // Optionally, sync with your backend
      }
   };

   const saveEduItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!eduForm.courseName || !eduForm.institute) return;

      const newItem: AdditionalEducation = {
         id: editingEduId || Date.now().toString(),
         type: eduForm.type as any,
         courseName: eduForm.courseName || '',
         institute: eduForm.institute || '',
         field: eduForm.field || '',
         startYear: eduForm.startYear || '',
         completionYear: isOngoing ? 'Ongoing' : (eduForm.completionYear || ''),
         mode: eduForm.mode as any,
         hasCertificate: eduForm.hasCertificate || false,
         nvqLevel: eduForm.type === 'NVQ' ? eduForm.nvqLevel : undefined,
         description: eduForm.description || ''
      };

      const updatedList = editingEduId
         ? educationList.map(item => item.id === editingEduId ? newItem : item)
         : [...educationList, newItem];

      setEducationList(updatedList);
      setIsAddingEdu(false);
      // Optionally, sync with your backend
   };

   const handleLogout = () => {
      if (window.confirm('Are you sure you want to log out?')) {
         logout({ logoutParams: { returnTo: window.location.origin } });
      }
   };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Avatar upload would require backend or Auth0 Management API
      alert('Profile picture change is not supported in this demo.');
   };

   const getEduIcon = (type: string) => {
      switch (type) {
         case 'Diploma': return <Scroll size={20} className="text-purple-500" />;
         case 'NVQ': return <Wrench size={20} className="text-orange-500" />;
         case 'Certificate': return <Award size={20} className="text-blue-500" />;
         case 'Professional Course': return <Briefcase size={20} className="text-slate-500" />;
         case 'Online Course': return <Laptop size={20} className="text-emerald-500" />;
         case 'Vocational': return <HardHat size={20} className="text-red-500" />;
         default: return <Book size={20} className="text-slate-500" />;
      }
   };

   if (!isAuthenticated || !user) return null;

   return (
      <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-950 font-sans pb-24 transition-colors duration-300">

         {/* Centered Minimal Header */}
         <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-center">
               <h1 className="text-[14px] md:text-[16px] font-black text-[#1e293b] dark:text-white uppercase tracking-[0.2em]">STUDENT PROFILE</h1>
            </div>
         </div>

         <div className="container mx-auto px-4 mt-12 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

               {/* LEFT COLUMN: Student Identity Card */}
               <div className="lg:col-span-4">
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-white dark:border-slate-800 overflow-hidden sticky top-24 reveal">
                     <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                     <div className="px-8 pb-10 -mt-12 flex flex-col items-center">
                        <div className="relative mb-6 group">
                           <div className="w-32 h-32 rounded-[2rem] border-4 border-white dark:border-slate-900 shadow-2xl bg-white flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-500">
                              <img
                                 src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                 alt="Profile"
                                 className="w-full h-full object-cover"
                              />
                           </div>
                           <button
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all border-2 border-white dark:border-slate-900 active:scale-90"
                           >
                              <Camera size={18} />
                           </button>
                           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        <h2 className="text-2xl font-black text-[#0f172a] dark:text-white text-center mb-1 leading-tight">{user.name}</h2>
                        <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500 text-center mb-8 lowercase tracking-wide">{user.email}</p>

                        <div className="w-full grid grid-cols-1 gap-2">
                           <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-100 transition-all">
                              <Phone size={18} className="text-blue-500" />
                              <span>{typeof watchedMobile === 'string' && watchedMobile.trim() ? watchedMobile : 'No Mobile Registered'}</span>
                           </div>
                           <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-100 transition-all">
                              <MapPin size={18} className="text-blue-500" />
                              <span>{typeof watchedDistrict === 'string' && watchedDistrict.trim() ? watchedDistrict : 'District Not Set'}</span>
                           </div>
                           <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-100 transition-all">
                              <ShieldCheck size={18} className="text-blue-500" />
                              <span className="uppercase tracking-tighter">Verified Student Account</span>
                           </div>
                        </div>

                        <button
                           onClick={handleLogout}
                           className="w-full mt-10 bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 py-4 rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-[10px] hover:bg-red-100 transition-all flex items-center justify-center gap-3 border border-red-100 dark:border-red-900/20 active:scale-[0.98]"
                        >
                           <LogOut size={16} /> Secure Logout
                        </button>
                     </div>
                  </div>
               </div>

               {/* RIGHT COLUMN: Profile Content */}
               <div className="lg:col-span-8 space-y-10">

                  {/* Main form section */}
                  <form onSubmit={handleSubmit(handleGeneralSubmit)} className="space-y-10 animate-fade-in">

                     {/* SECTION 1: PERSONAL */}
                     <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-white dark:border-slate-800 overflow-hidden reveal reveal-delay-100">
                        <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-5">
                           <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><User size={24} /></div>
                           <div>
                              <h2 className="font-black text-[14px] uppercase tracking-[0.1em] text-slate-800 dark:text-white">Personal Information</h2>
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Your official identification details</p>
                           </div>
                        </div>

                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="md:col-span-2">
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Legal Full Name</label>
                              <input {...register("fullName", { required: true })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all focus:bg-white" />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Contact Mobile</label>
                              <input {...register("mobile")} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all focus:bg-white" placeholder="07XXXXXXXX" />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Birth Date</label>
                              <input type="date" {...register("dob")} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all focus:bg-white" />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Gender Identification</label>
                              <select {...register("gender")} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all focus:bg-white appearance-none">
                                 <option value="">Select Gender</option>
                                 <option value="Male">Male</option>
                                 <option value="Female">Female</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Resident District</label>
                              <select {...register("district")} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all focus:bg-white appearance-none">
                                 <option value="">Choose District</option>
                                 {SRI_LANKA_DISTRICTS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                 ))}
                              </select>
                           </div>
                        </div>
                     </div>

                     {/* SECTION 2: ACADEMIC */}
                     <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-white dark:border-slate-800 overflow-hidden reveal reveal-delay-200">
                        <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-5">
                           <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl"><GraduationCap size={24} /></div>
                           <div>
                              <h2 className="font-black text-[14px] uppercase tracking-[0.1em] text-slate-800 dark:text-white">Academic Performance</h2>
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">High school results and credentials</p>
                           </div>
                        </div>

                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Education Level</label>
                              <select {...register("eduLevel")} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all focus:bg-white appearance-none">
                                 <option value="A/L">G.C.E. A/L</option>
                                 <option value="O/L">G.C.E. O/L</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Year of Completion</label>
                              <input type="number" {...register("completionYear")} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all focus:bg-white" placeholder="YYYY" />
                           </div>
                           <div className="md:col-span-2">
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">School / Institute Name</label>
                              <input {...register("schoolName")} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all focus:bg-white" placeholder="Enter school name" />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Academic Result (GPA/Z-Score)</label>
                              <input {...register("results")} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all focus:bg-white" placeholder="e.g. 1.8500" />
                           </div>
                        </div>
                     </div>

                     {/* SAVE BUTTON */}
                     <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="group relative px-12 py-5 bg-[#0f172a] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-900/20 disabled:opacity-70">
                           <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                           <span className="relative flex items-center gap-3">
                              {loading ? 'Processing Update...' : <><Save size={18} /> Commit Profile Changes</>}
                           </span>
                        </button>
                     </div>
                  </form>

                  {/* SECTION 3: ADDITIONAL EDUCATION (Timeline Style) */}
                  <div className="space-y-6 reveal reveal-delay-300">
                     <div className="flex justify-between items-center px-4">
                        <div>
                           <h2 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white">Additional Education</h2>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Diplomas, NVQs & Professional Courses</p>
                        </div>
                        {!isAddingEdu && (
                           <button onClick={handleAddEdu} className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95">
                              <Plus size={16} /> New Entry
                           </button>
                        )}
                     </div>

                     {!isAddingEdu && (
                        <div className="grid grid-cols-1 gap-6">
                           {educationList.length === 0 ? (
                              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                 <div className="inline-block p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl mb-6 text-slate-300">
                                    <FileText size={48} />
                                 </div>
                                 <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">No additional records found</p>
                                 <button onClick={handleAddEdu} className="mt-8 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Add your first qualification</button>
                              </div>
                           ) : (
                              <div className="grid grid-cols-1 gap-5">
                                 {educationList.map(edu => (
                                    <div key={edu.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-8 group hover:shadow-2xl transition-all duration-500">
                                       <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                                          {getEduIcon(edu.type)}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start mb-4">
                                             <div>
                                                <h3 className="font-black text-[#0f172a] dark:text-white text-[16px] uppercase tracking-wide leading-tight">{edu.courseName}</h3>
                                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                   <Building2 size={14} className="text-slate-300" /> {edu.institute}
                                                </p>
                                             </div>
                                             <div className="flex gap-2">
                                                <button onClick={() => handleEditEdu(edu)} className="p-2.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteEdu(edu.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                             </div>
                                          </div>
                                          <div className="flex flex-wrap gap-2.5 mt-6">
                                             <span className="text-[9px] font-black px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-100 dark:border-slate-800 uppercase tracking-widest">{edu.type}</span>
                                             <span className="text-[9px] font-black px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar size={12} /> {edu.completionYear}
                                             </span>
                                             {edu.hasCertificate && (
                                                <span className="text-[9px] font-black px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 uppercase tracking-widest flex items-center gap-2">
                                                   <CheckCircle size={12} /> Verified
                                                </span>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     )}

                     {/* MODAL/INLINE FORM FOR ADDING EDU */}
                     {isAddingEdu && (
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-blue-100 dark:border-slate-800 overflow-hidden animate-fade-in-up">
                           <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                    {editingEduId ? <Edit2 size={18} /> : <Plus size={18} />}
                                 </div>
                                 <h2 className="font-black text-[12px] uppercase tracking-[0.2em] text-slate-800 dark:text-white">
                                    {editingEduId ? 'Modify Qualification' : 'New Academic Record'}
                                 </h2>
                              </div>
                              <button onClick={() => setIsAddingEdu(false)} className="text-slate-300 hover:text-slate-600 p-2 hover:bg-white rounded-full transition-all"><X size={20} /></button>
                           </div>

                           <div className="p-10">
                              <form onSubmit={saveEduItem} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Credential Classification</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white appearance-none" value={eduForm.type} onChange={(e) => setEduForm({ ...eduForm, type: e.target.value as any })}><option>Diploma</option><option>NVQ</option><option>Certificate</option><option>Online Course</option><option>Vocational</option><option>Other</option></select>
                                 </div>
                                 <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Official Program Name</label>
                                    <input required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" value={eduForm.courseName} onChange={(e) => setEduForm({ ...eduForm, courseName: e.target.value })} placeholder="e.g. Higher National Diploma in IT" />
                                 </div>
                                 <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Awarding Institute</label>
                                    <input required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" value={eduForm.institute} onChange={(e) => setEduForm({ ...eduForm, institute: e.target.value })} placeholder="e.g. SLIIT" />
                                 </div>
                                 <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Start Session (Year)</label>
                                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" placeholder="YYYY" value={eduForm.startYear} onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })} />
                                 </div>
                                 <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Graduation Year</label>
                                    <div className="flex gap-4">
                                       <input type="number" disabled={isOngoing} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white disabled:opacity-30" placeholder="YYYY" value={eduForm.completionYear} onChange={(e) => setEduForm({ ...eduForm, completionYear: e.target.value })} />
                                       <label className="flex items-center gap-3 cursor-pointer select-none bg-slate-50 px-5 rounded-2xl border border-slate-100 dark:bg-slate-800/50">
                                          <input type="checkbox" checked={isOngoing} onChange={(e) => setIsOngoing(e.target.checked)} className="w-5 h-5 rounded-[0.5rem] border-slate-200 text-blue-600 focus:ring-blue-500" />
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ongoing</span>
                                       </label>
                                    </div>
                                 </div>
                                 <div className="md:col-span-2">
                                    <label className="flex items-center gap-5 p-7 bg-blue-50/50 dark:bg-slate-800/30 rounded-[2rem] cursor-pointer border border-transparent hover:border-blue-200 transition-all">
                                       <input type="checkbox" checked={eduForm.hasCertificate} onChange={(e) => setEduForm({ ...eduForm, hasCertificate: e.target.checked })} className="w-6 h-6 rounded-[0.6rem] border-slate-200 text-blue-600 focus:ring-blue-500" />
                                       <div className="flex flex-col">
                                          <span className="text-xs font-black uppercase tracking-[0.1em] text-[#1e293b] dark:text-slate-200">Official Certification Received</span>
                                          <span className="text-[10px] text-slate-500 font-medium">I have physically or digitally obtained the final certificate.</span>
                                       </div>
                                    </label>
                                 </div>
                              </form>
                           </div>
                           <div className="p-10 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-5">
                              <button onClick={() => setIsAddingEdu(false)} className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 transition-all">Discard</button>
                              <button onClick={saveEduItem} className="px-10 py-4 bg-[#1e293b] dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/10 hover:scale-105 transition-all active:scale-95">{editingEduId ? 'Update Record' : 'Add To Profile'}</button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Profile;