import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { courses, institutions } from '../../../data/mockData';
import { useAppStore } from '../../../context/AppContext';
import { Course } from '../../../types';
import { Clock, Calendar, ArrowRight, Search, Filter, BookOpen, MapPin, Tag, ChevronDown } from 'lucide-react';

const heroImages = [
  "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2000",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2000",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2000",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000"
];

const CoursesPage = () => {
  const [searchParams] = useSearchParams();
  const initialField = searchParams.get('field') || 'All';
  const initialLevel = searchParams.get('level') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filterField, setFilterField] = useState(initialField);
  const [filterLevel, setFilterLevel] = useState(initialLevel);
  const [filterInst, setFilterInst] = useState('All');
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const fields = Array.from(new Set(courses.map(c => c.field))).sort();
  const levels = Array.from(new Set(courses.map(c => c.level))).sort();
  const instNames = Array.from(new Set(institutions.map(i => i.name))).sort();

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const inst = institutions.find(i => i.id === course.institutionId);
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inst && inst.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesField = filterField === 'All' || course.field === filterField;
      const matchesLevel = filterLevel === 'All' || course.level === filterLevel;
      const matchesInst = filterInst === 'All' || (inst && inst.name === filterInst);
      return matchesSearch && matchesField && matchesLevel && matchesInst;
    });
  }, [searchQuery, filterField, filterLevel, filterInst]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-24">

      <div className="relative h-[400px] bg-slate-900 overflow-hidden flex items-center justify-center">
        {heroImages.map((img, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-40' : 'opacity-0'}`}>
            <img src={img} className="w-full h-full object-cover" alt="" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        <div className="relative z-10 text-center px-6 animate-fade-in-up">
          <span className="inline-block px-5 py-2 rounded-full bg-blue-600/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.4em] mb-6">Program Directory</span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none">Find Your Course</h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium">Access over 500+ undergraduate and professional programs across the country.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-16 relative z-10">

        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] shadow-2xl shadow-slate-900/10 border border-slate-100 dark:border-slate-800 mb-16 reveal">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-grow relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-primary-500" />
              <input
                type="text"
                placeholder="Search for courses, degrees, or fields..."
                className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] focus:ring-4 focus:ring-blue-600/10 focus:border-blue-400 outline-none font-bold text-slate-800 dark:text-white transition-all placeholder:text-slate-400 shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:w-[60%]">
              <div className="relative">
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

              <div className="relative">
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full appearance-none px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer focus:ring-4 focus:ring-blue-600/10 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-750"
                >
                  <option value="All">All Levels</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filterInst}
                  onChange={(e) => setFilterInst(e.target.value)}
                  className="w-full appearance-none px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer focus:ring-4 focus:ring-blue-600/10 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-750"
                >
                  <option value="All">Institutions</option>
                  {instNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => {
            const inst = institutions.find(i => i.id === course.institutionId);
            return (
              <div key={course.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full reveal">

                <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <BookOpen size={28} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Status</span>
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter">Verified</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="heading-card text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center text-slate-400 font-bold text-[11px] uppercase tracking-wider mb-6">
                    <MapPin size={14} className="mr-2 text-blue-500" /> {inst?.name}
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 line-clamp-3 font-medium">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 dark:border-slate-800">
                      {course.level}
                    </span>
                    <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100 dark:border-blue-900/20">
                      {course.duration}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Annual Fee: <span className="text-slate-900 dark:text-white block text-sm mt-0.5">{course.fees.split(' ')[0]}</span>
                  </div>
                  <Link
                    to={`/courses/${course.id}`}
                    className="flex items-center text-blue-600 text-[10px] font-black uppercase tracking-widest group/btn"
                  >
                    View Details <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 reveal">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm text-slate-300"><Search size={32} /></div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">No Courses Matching</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">Try broadening your filters or checking different academic fields.</p>
            <button
              onClick={() => { setSearchQuery(''); setFilterField('All'); setFilterLevel('All'); setFilterInst('All'); }}
              className="mt-10 text-blue-600 font-black text-[11px] uppercase tracking-widest hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;