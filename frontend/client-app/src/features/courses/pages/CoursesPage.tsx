import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProgramsService } from '../../../types/services/ProgramsService';
import { InstitutionsService } from '../../../types/services/InstitutionsService';
import { ArrowRight, Search, BookOpen, MapPin, ChevronDown } from 'lucide-react';

const heroImages = [
  "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2000",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2000",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2000",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000"
];

const CoursesPage = () => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);



  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);


  // State for API data
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for institutions
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [instLoading, setInstLoading] = useState(false);
  const [instError, setInstError] = useState<string | null>(null);



  useEffect(() => {
    setInstLoading(true);
    setInstError(null);
    InstitutionsService.listInstitutions(1, 100)
      .then((res) => {
        setInstitutions(res.data || []);
      })
      .catch(() => {
        setInstError('Failed to load institutions');
      })
      .finally(() => setInstLoading(false));
  }, []);

  // Fetch all courses from API once
  useEffect(() => {
    setLoading(true);
    setError(null);
    ProgramsService.listPrograms(1, 100)
      .then((res) => {
        setCourses(res.data || []);
      })
      .catch(() => {
        setError('Failed to load courses');
      })
      .finally(() => setLoading(false));
  }, []);



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

        {loading ? (
          <div className="text-center py-32">Loading courses...</div>
        ) : error ? (
          <div className="text-center py-32 text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => {
                // Show institution name from API
                const inst = institutions.find(i => i._id === course.institution_id);
                // Use _id for key, fallback to index if missing
                const key = course._id || course.id || index;
                // Handle duration: if object, format as string
                let durationDisplay = course.duration;
                if (durationDisplay && typeof durationDisplay === 'object') {
                  const { years, months, weeks } = durationDisplay;
                  durationDisplay = [
                    years ? `${years}y` : null,
                    months ? `${months}m` : null,
                    weeks ? `${weeks}w` : null
                  ].filter(Boolean).join(' ');
                }
                return (
                  <div key={key} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full reveal">
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
                        {course.name}
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
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      {/* <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Annual Fee: <span className="text-slate-900 dark:text-white block text-sm mt-0.5">
                          {typeof course.fees === 'string' && course.fees ? course.fees.split(' ')[0] : (course.fees ?? 'N/A')}
                        </span>
                      </div> */}
                      <Link
                        to={`/courses/${course._id || course.id}`}
                        className="flex items-center text-blue-600 text-[10px] font-black uppercase tracking-widest group/btn"
                      >
                        View Details <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* {filteredCourses.length === 0 && (
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
            )} */}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;