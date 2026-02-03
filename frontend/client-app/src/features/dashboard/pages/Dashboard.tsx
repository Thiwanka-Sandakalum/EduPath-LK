
import React, { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../../context/AppContext';
import { InstitutionsService } from '../../../types/services/InstitutionsService';
import { ProgramsService } from '../../../types/services/ProgramsService';
import { Bookmark, FileText, MessageSquare, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
   const { savedInstitutions, savedCourses, applications, inquiries } = useAppStore();

   const [savedInstitutionDetails, setSavedInstitutionDetails] = useState<Record<string, any>>({});
   const [savedCourseDetails, setSavedCourseDetails] = useState<Record<string, any>>({});
   const [savedInstLoading, setSavedInstLoading] = useState(false);
   const [savedCoursesLoading, setSavedCoursesLoading] = useState(false);

   const savedItemsCount = useMemo(
      () => (savedInstitutions?.length || 0) + (savedCourses?.length || 0),
      [savedInstitutions, savedCourses]
   );

   useEffect(() => {
      const ids = Array.isArray(savedInstitutions) ? savedInstitutions : [];
      const missing = ids.filter((id) => id && !savedInstitutionDetails[id]);
      if (missing.length === 0) return;

      let cancelled = false;
      setSavedInstLoading(true);
      Promise.all(
         missing.map((id) =>
            InstitutionsService.getInstitution(id)
               .then((inst) => ({ id, inst }))
               .catch(() => ({ id, inst: null }))
         )
      )
         .then((results) => {
            if (cancelled) return;
            setSavedInstitutionDetails((prev) => {
               const next = { ...prev };
               for (const r of results) next[r.id] = r.inst;
               return next;
            });
         })
         .finally(() => {
            if (cancelled) return;
            setSavedInstLoading(false);
         });

      return () => {
         cancelled = true;
      };
   }, [savedInstitutions, savedInstitutionDetails]);

   useEffect(() => {
      const ids = Array.isArray(savedCourses) ? savedCourses : [];
      const missing = ids.filter((id) => id && !savedCourseDetails[id]);
      if (missing.length === 0) return;

      let cancelled = false;
      setSavedCoursesLoading(true);
      Promise.all(
         missing.map((id) =>
            ProgramsService.getProgram(id)
               .then((course) => ({ id, course }))
               .catch(() => ({ id, course: null }))
         )
      )
         .then((results) => {
            if (cancelled) return;
            setSavedCourseDetails((prev) => {
               const next = { ...prev };
               for (const r of results) next[r.id] = r.course;
               return next;
            });
         })
         .finally(() => {
            if (cancelled) return;
            setSavedCoursesLoading(false);
         });

      return () => {
         cancelled = true;
      };
   }, [savedCourses, savedCourseDetails]);

   return (
      <div className="container mx-auto px-4 py-8 min-h-screen bg-slate-50">
         <h1 className="text-3xl font-bold text-slate-900 mb-8 reveal">My Dashboard</h1>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 reveal">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
               <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Bookmark /></div>
               <div>
                  <div className="text-2xl font-bold">{savedItemsCount}</div>
                  <div className="text-sm text-slate-500">Saved Items</div>
               </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
               <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><FileText /></div>
               <div>
                  <div className="text-2xl font-bold">{applications.length}</div>
                  <div className="text-sm text-slate-500">Applications</div>
               </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
               <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><MessageSquare /></div>
               <div>
                  <div className="text-2xl font-bold">{inquiries.length}</div>
                  <div className="text-sm text-slate-500">Inquiries</div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 reveal reveal-delay-200">
            {/* Applications List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
               {applications.length === 0 ? (
                  <div className="text-slate-500 text-sm py-4">No applications yet. Go apply!</div>
               ) : (
                  <div className="space-y-4">
                     {applications.map(app => (
                        <div key={app.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50">
                           <div>
                              <div className="font-semibold text-slate-800">{app.courseTitle}</div>
                              <div className="text-xs text-slate-500">{app.institutionName} • {app.submittedAt}</div>
                           </div>
                           <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded capitalize">{app.status}</span>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Saved Institutions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h2 className="text-xl font-bold mb-4">Saved Institutions</h2>
               {savedInstitutions.length === 0 ? (
                  <div className="text-slate-500 text-sm py-4">Nothing saved yet.</div>
               ) : savedInstLoading && Object.keys(savedInstitutionDetails).length === 0 ? (
                  <div className="text-slate-500 text-sm py-4">Loading saved institutions...</div>
               ) : (
                  <div className="space-y-4">
                     {savedInstitutions.map(id => {
                        const inst = savedInstitutionDetails[id];
                        if (!inst) {
                           return (
                              <div key={id} className="flex items-center justify-between gap-4 p-3 border rounded-lg">
                                 <div className="flex-1">
                                    <div className="font-semibold text-slate-800">Institution</div>
                                    <div className="text-xs text-slate-500 break-all">{id}</div>
                                 </div>
                                 <Link to={`/institutions/${id}`} className="text-blue-600 text-sm font-medium hover:underline">View</Link>
                              </div>
                           );
                        }

                        const instId = (inst?._id || inst?.id) as string | undefined;
                        const imageUrl = (inst as any)?.imageUrl || (inst as any)?.image_url || '';
                        const location = (inst as any)?.location || (inst as any)?.country || '';
                        return (
                           <div key={id} className="flex items-center gap-4 p-3 border rounded-lg">
                              {imageUrl ? (
                                 <img src={imageUrl} alt="" className="w-12 h-12 rounded-md object-cover" />
                              ) : (
                                 <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                                    N/A
                                 </div>
                              )}
                              <div className="flex-1">
                                 <div className="font-semibold">{inst.name || 'Institution'}</div>
                                 <div className="text-xs text-slate-500">{location || ' '}</div>
                              </div>
                              <Link to={`/institutions/${instId || id}`} className="text-blue-600 text-sm font-medium hover:underline">View</Link>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>

            {/* Saved Courses */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h2 className="text-xl font-bold mb-4">Saved Courses</h2>
               {savedCourses.length === 0 ? (
                  <div className="text-slate-500 text-sm py-4">Nothing saved yet.</div>
               ) : savedCoursesLoading && Object.keys(savedCourseDetails).length === 0 ? (
                  <div className="text-slate-500 text-sm py-4">Loading saved courses...</div>
               ) : (
                  <div className="space-y-4">
                     {savedCourses.map((courseId) => {
                        const course = savedCourseDetails[courseId];
                        if (!course) {
                           return (
                              <div key={courseId} className="flex items-center justify-between gap-4 p-3 border rounded-lg">
                                 <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                                       <BookOpen size={18} />
                                    </div>
                                    <div className="min-w-0">
                                       <div className="font-semibold text-slate-800">Course</div>
                                       <div className="text-xs text-slate-500 break-all">{courseId}</div>
                                    </div>
                                 </div>
                                 <Link to={`/courses/${courseId}`} className="text-blue-600 text-sm font-medium hover:underline">View</Link>
                              </div>
                           );
                        }

                        const name = (course?.name || course?.title || 'Untitled Course') as string;
                        const instName = (course as any)?.institution_name || '';
                        return (
                           <div key={courseId} className="flex items-center justify-between gap-4 p-3 border rounded-lg">
                              <div className="flex items-center gap-3 min-w-0">
                                 <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                                    <BookOpen size={18} />
                                 </div>
                                 <div className="min-w-0">
                                    <div className="font-semibold text-slate-800 truncate">{name}</div>
                                    <div className="text-xs text-slate-500 truncate">{instName || ' '}</div>
                                 </div>
                              </div>
                              <Link to={`/courses/${courseId}`} className="text-blue-600 text-sm font-medium hover:underline">View</Link>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default Dashboard;
