
import React from 'react';
import { useAppStore } from '../../../context/AppContext';
import { institutions } from '../../../data/mockData';
import { Bookmark, FileText, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
   const { savedInstitutions, applications, inquiries } = useAppStore();

   return (
      <div className="container mx-auto px-4 py-8 min-h-screen bg-slate-50">
         <h1 className="text-3xl font-bold text-slate-900 mb-8 reveal">My Dashboard</h1>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 reveal">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
               <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Bookmark /></div>
               <div>
                  <div className="text-2xl font-bold">{savedInstitutions.length}</div>
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

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 reveal reveal-delay-200">
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
               ) : (
                  <div className="space-y-4">
                     {savedInstitutions.map(id => {
                        const inst = institutions.find(i => i.id === id);
                        if (!inst) return null;
                        return (
                           <div key={id} className="flex items-center gap-4 p-3 border rounded-lg">
                              <img src={inst.imageUrl} alt="" className="w-12 h-12 rounded-md object-cover" />
                              <div className="flex-1">
                                 <div className="font-semibold">{inst.name}</div>
                                 <div className="text-xs text-slate-500">{inst.location}</div>
                              </div>
                              <Link to={`/institutions/${inst.id}`} className="text-blue-600 text-sm font-medium hover:underline">View</Link>
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
