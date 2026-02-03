
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
   Palette,
   Moon,
   Sun,
   User,
   Shield,
   HelpCircle,
   LogOut,
   ChevronRight
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppStore } from '../../../context/AppContext';

const Settings = () => {
   const navigate = useNavigate();
   const { darkMode, toggleDarkMode } = useAppStore();
   const { logout } = useAuth0();

   const handleLogout = () => {
      if (window.confirm('Are you sure you want to log out?')) {
         logout({ logoutParams: { returnTo: window.location.origin } });
      }
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-12 transition-colors duration-300">

         {/* Centered Minimal Header - Matching Profile Style */}
         <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-center">
               <h1 className="text-[14px] md:text-[16px] font-black text-[#1e293b] dark:text-white uppercase tracking-[0.2em]">SETTINGS</h1>
            </div>
         </div>

         <div className="container mx-auto px-4 w-full md:max-w-2xl mt-12 space-y-6">

            {/* Appearance Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden reveal">
               <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <Palette size={20} className="text-primary-600" /> Appearance
                  </h2>
               </div>

               <div className="p-6">
                  {/* Dark Mode Toggle */}
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                           {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <div>
                           <div className="font-medium text-slate-900 dark:text-white">Dark Mode</div>
                           <div className="text-xs text-slate-500 dark:text-slate-400">Adjust the appearance to reduce eye strain</div>
                        </div>
                     </div>
                     <button
                        onClick={toggleDarkMode}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-primary-600' : 'bg-slate-300'}`}
                     >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                  </div>
               </div>
            </div>

            {/* Account Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden reveal reveal-delay-100">
               <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <User size={20} className="text-primary-600" /> Account
                  </h2>
               </div>

               <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  <button onClick={() => navigate('/profile')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left">
                     <div className="font-medium text-slate-700 dark:text-slate-200">Personal Information</div>
                     <ChevronRight size={18} className="text-slate-400" />
                  </button>

                  <div className="px-6 py-4 flex items-center justify-between">
                     <div className="font-medium text-slate-700 dark:text-slate-200">Email Notifications</div>
                     <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-primary-600" defaultChecked />
                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer checked:bg-primary-600"></label>
                     </div>
                  </div>
               </div>
            </div>

            {/* General / Other */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden reveal reveal-delay-200">
               <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left">
                     <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-medium">
                        <Shield size={18} /> Privacy & Security
                     </div>
                     <ChevronRight size={18} className="text-slate-400" />
                  </button>
                  <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left">
                     <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-medium">
                        <HelpCircle size={18} /> Help & Support
                     </div>
                     <ChevronRight size={18} className="text-slate-400" />
                  </button>
                  <button onClick={handleLogout} className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group">
                     <div className="flex items-center gap-3 text-red-600 font-medium group-hover:text-red-700">
                        <LogOut size={18} /> Log Out
                     </div>
                  </button>
               </div>
            </div>

            <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-4 reveal reveal-delay-300">
               EduPath LK • Version 1.0.5
            </div>

         </div>
      </div>
   );
};

export default Settings;
