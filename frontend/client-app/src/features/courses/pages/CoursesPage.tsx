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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // State for institutions
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [instLoading, setInstLoading] = useState(false);
  const [instError, setInstError] = useState<string | null>(null);

  // Filter state
  const [filterInstitution, setFilterInstitution] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterDeliveryMode, setFilterDeliveryMode] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterEligibility, setFilterEligibility] = useState('');

  // Distinct filter options
  const [levels, setLevels] = useState<string[]>([]);
  const [deliveryModes, setDeliveryModes] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [durations, setDurations] = useState<string[]>([]);
  const [eligibilities, setEligibilities] = useState<string[]>([]);




  // Fetch filter dropdown options
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

    // Fetch distinct values for dropdowns
    ProgramsService.getProgramDistinctValues('level').then(res => setLevels(res.values || []));
    ProgramsService.getProgramDistinctValues('delivery_mode').then(res => setDeliveryModes(res.values || []));
    ProgramsService.getProgramDistinctValues('specializations').then(res => setSpecializations(res.values || []));
    ProgramsService.getProgramDistinctValues('duration').then(res => setDurations(res.values || []));
    ProgramsService.getProgramDistinctValues('eligibility').then(res => setEligibilities(res.values || []));
  }, []);


  // Reset to page 1 when filters or pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterInstitution, filterLevel, filterDeliveryMode, filterSpecialization, filterName, filterDuration, filterEligibility, pageSize]);

  // Fetch courses with filters and pagination
  useEffect(() => {
    setLoading(true);
    setError(null);
    ProgramsService.listPrograms(
      currentPage,
      pageSize,
      filterInstitution || undefined,
      filterName || undefined,
      filterLevel || undefined,
      filterDeliveryMode || undefined,
      filterSpecialization || undefined,
      filterDuration || undefined,
      filterEligibility || undefined
    )
      .then((res) => {
        setCourses(res.data || []);
        setTotalPages(res.pagination?.total ? Math.ceil(res.pagination.total / pageSize) : 1);
      })
      .catch(() => {
        setError('Failed to load courses');
      })
      .finally(() => setLoading(false));
  }, [currentPage, pageSize, filterInstitution, filterLevel, filterDeliveryMode, filterSpecialization, filterName, filterDuration, filterEligibility]);



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

        {/* FILTER BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 mb-10 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Institution</label>
            <select
              className="w-48 bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
              value={filterInstitution}
              onChange={e => setFilterInstitution(e.target.value)}
            >
              <option value="">All</option>
              {institutions.map(inst => (
                <option key={inst._id} value={inst._id}>{inst.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Level</label>
            <select
              className="w-36 bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
            >
              <option value="">All</option>
              {levels.filter(lvl => typeof lvl === 'string' && lvl.trim()).map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Delivery Mode</label>
            <select
              className="w-36 bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
              value={filterDeliveryMode}
              onChange={e => setFilterDeliveryMode(e.target.value)}
            >
              <option value="">All</option>
              {deliveryModes.filter(mode => typeof mode === 'string' && mode.trim()).map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Specialization</label>
            <select
              className="w-44 bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
              value={filterSpecialization}
              onChange={e => setFilterSpecialization(e.target.value)}
            >
              <option value="">All</option>
              {specializations.filter(spec => typeof spec === 'string' && spec.trim()).map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Program Name</label>
            <input
              type="text"
              className="w-48 bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
              placeholder="Search by name"
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration</label>
            <select
              className="w-32 bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
              value={filterDuration}
              onChange={e => setFilterDuration(e.target.value)}
            >
              <option value="">All</option>
              {durations.filter(Boolean).map((dur, idx) => {
                if (typeof dur === 'string') {
                  return <option key={dur} value={dur}>{dur}</option>;
                }
                if (typeof dur === 'object' && dur !== null) {
                  // Format object duration
                  const { years, months, weeks } = dur;
                  const label = [
                    years ? `${years} year${years > 1 ? 's' : ''}` : null,
                    months ? `${months} month${months > 1 ? 's' : ''}` : null,
                    weeks ? `${weeks} week${weeks > 1 ? 's' : ''}` : null
                  ].filter(Boolean).join(' ');
                  const value = JSON.stringify(dur);
                  return <option key={value} value={value}>{label || value}</option>;
                }
                return null;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Eligibility</label>
            <select
              className="w-40 bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
              value={filterEligibility}
              onChange={e => setFilterEligibility(e.target.value)}
            >
              <option value="">All</option>
              {eligibilities.filter(el => typeof el === 'string' && el.trim()).map(el => (
                <option key={el} value={el}>{el}</option>
              ))}
            </select>
          </div>
          {/* Per-page selector */}
          <div className="ml-auto flex flex-col items-end">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Per Page</label>
            <select
              className="w-24 bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={36}>36</option>
            </select>
          </div>
          <button
            className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-blue-50 hover:text-blue-700 transition-all"
            onClick={() => {
              setFilterInstitution('');
              setFilterLevel('');
              setFilterDeliveryMode('');
              setFilterSpecialization('');
              setFilterName('');
              setFilterDuration('');
              setFilterEligibility('');
            }}
          >
            Clear Filters
          </button>
        </div>

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
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-bold disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <button
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-bold disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;