import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProgramsService } from '../../../types/services/ProgramsService';

import { InstitutionsService } from '../../../types/services/InstitutionsService';
import { ArrowRight, Search, BookOpen, MapPin, ChevronDown, Bookmark } from 'lucide-react';
import { useAppStore } from '../../../context/AppContext';

type InstitutionClassification = 'Private' | 'Government';

type InstitutionView = {
  _id: string;
  name?: string;
  classification: InstitutionClassification;
};

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

const heroImages = [
  "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2000",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2000",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2000",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000"
];

const CoursesPage = () => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const [searchParams] = useSearchParams();

  const { toggleSavedCourse, savedCourses } = useAppStore();

  const getPaginationItems = (page: number, total: number) => {
    if (total <= 1) return [1];
    const items: Array<number | '...'> = [];
    const clamp = (n: number) => Math.max(1, Math.min(total, n));
    const current = clamp(page);

    const neighbors = 1; // show current +/- 1
    const start = clamp(current - neighbors);
    const end = clamp(current + neighbors);

    items.push(1);
    if (start > 2) items.push('...');

    for (let p = Math.max(2, start); p <= Math.min(total - 1, end); p++) {
      items.push(p);
    }

    if (end < total - 1) items.push('...');
    if (total > 1) items.push(total);

    // De-dup in edge cases (e.g. total=2)
    return items.filter((v, idx) => items.indexOf(v) === idx);
  };

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
  const pageSizeOptions = [12, 24, 36, 48];

  // State for institutions
  const [institutions, setInstitutions] = useState<InstitutionView[]>([]);
  const [instLoading, setInstLoading] = useState(false);
  const [instError, setInstError] = useState<string | null>(null);
  const [initialInstitutionDataLoaded, setInitialInstitutionDataLoaded] = useState(false);

  // Government data (JSON)
  const [governmentPrograms, setGovernmentPrograms] = useState<GovernmentDegreeProgram[]>([]);
  const [governmentOfferings, setGovernmentOfferings] = useState<GovernmentCourseOffering[]>([]);

  // Filter state
  const [filterClassification, setFilterClassification] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterDeliveryMode, setFilterDeliveryMode] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterEligibility, setFilterEligibility] = useState('');

  // Support deep links like /courses?q=some%20name
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim()) {
      setFilterName(q.trim());
    }
  }, [searchParams]);

  // Distinct filter options
  const [levels, setLevels] = useState<string[]>([]);
  const [deliveryModes, setDeliveryModes] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [durations, setDurations] = useState<string[]>([]);
  const [eligibilities, setEligibilities] = useState<string[]>([]);

  // Institution-scoped filter options (when an institution is selected)
  const [scopedLevels, setScopedLevels] = useState<string[]>([]);
  const [scopedSpecializations, setScopedSpecializations] = useState<string[]>([]);
  const [scopedOptionsLoading, setScopedOptionsLoading] = useState(false);

  const matchesClassification = (inst: InstitutionView | undefined, classification: string) => {
    if (!classification) return true;
    if (!inst) return false;
    const normalized = classification.trim().toLowerCase();
    return inst.classification.toLowerCase() === normalized;
  };

  const normalizeStr = (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

  const getGovernmentProgramSpecializations = (p: GovernmentDegreeProgram): string[] => {
    const stream = typeof p.stream === 'string' ? p.stream.trim() : '';
    return stream ? [stream] : [];
  };

  const governmentStreams = useMemo(() => {
    const values = governmentPrograms
      .flatMap((p) => getGovernmentProgramSpecializations(p))
      .filter((s): s is string => typeof s === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set<string>(values)).sort((a, b) => a.localeCompare(b));
  }, [governmentPrograms]);

  const classificationOptions = useMemo(() => {
    return ['Private', 'Government'] as string[];
  }, []);

  const visibleInstitutions = useMemo(() => {
    if (!filterClassification) return institutions;
    return institutions.filter((inst) => matchesClassification(inst, filterClassification));
  }, [institutions, filterClassification]);

  const visibleLevels = useMemo(() => {
    const baseLevels = filterInstitution ? scopedLevels : levels;
    // Government programs are currently treated as Undergraduate only.
    // Merge it in so selecting Government doesn't result in an empty Level dropdown.
    const merged = Array.from(
      new Set<string>(
        [...(baseLevels || []), 'Undergraduate']
          .filter((v): v is string => typeof v === 'string' && Boolean(v.trim()))
          .map((v) => v.trim())
      )
    );
    return merged.sort((a, b) => a.localeCompare(b));
  }, [filterInstitution, scopedLevels, levels]);

  const visibleSpecializations = useMemo(() => {
    const baseSpecs = filterInstitution ? scopedSpecializations : specializations;
    const merged = Array.from(
      new Set<string>(
        [...(baseSpecs || []), ...governmentStreams]
          .filter((v): v is string => typeof v === 'string' && Boolean(v.trim()))
          .map((v) => v.trim())
      )
    );
    return merged.sort((a, b) => a.localeCompare(b));
  }, [filterInstitution, scopedSpecializations, specializations, governmentStreams]);




  // Fetch filter dropdown options
  useEffect(() => {
    setInstLoading(true);
    setInstError(null);
    Promise.all([
      InstitutionsService.listInstitutions(1, 1000),
      safeJsonFetch('/government-institutions.json').catch(() => null),
      safeJsonFetch('/government-degree-programs.json').catch(() => null),
      safeJsonFetch('/government-course-offerings.json').catch(() => null),
    ])
      .then(([backendInstRes, govInstJson, govProgramsJson, govOfferingsJson]) => {
        const backendInstitutions = (backendInstRes?.data || []) as any[];
        const privateViews: InstitutionView[] = backendInstitutions
          .filter((i) => i && typeof i === 'object' && typeof i._id === 'string')
          .map((i) => ({ _id: String(i._id), name: i.name, classification: 'Private' as const }));

        const govRaw = govInstJson ? extractArrayFromJson(govInstJson, ['institutions', 'data', 'universities']) : [];
        const govViews: InstitutionView[] = govRaw
          .filter((i: any) => i && typeof i === 'object' && typeof i._id === 'string')
          .map((i: any) => ({ _id: String(i._id), name: i.name, classification: 'Government' as const }));

        const mergedInstitutions = [...govViews, ...privateViews].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setInstitutions(mergedInstitutions);

        const programsRaw = govProgramsJson ? extractArrayFromJson(govProgramsJson, ['degreePrograms', 'degree_programs', 'programs', 'data']) : [];
        const govPrograms = programsRaw
          .filter((p: any) => p && typeof p === 'object' && typeof p._id === 'string') as GovernmentDegreeProgram[];
        // Source dataset can contain duplicate _id entries (e.g., C054). Deduplicate to keep React keys unique.
        const dedupedGovPrograms = Array.from(new Map(govPrograms.map((p) => [String(p._id), p])).values());
        setGovernmentPrograms(dedupedGovPrograms);

        const offeringsRaw = govOfferingsJson ? extractArrayFromJson(govOfferingsJson, ['offerings', 'course_offerings', 'data']) : [];
        const govOfferings = offeringsRaw
          .filter((o: any) => o && typeof o === 'object' && typeof o.degree_program_id === 'string' && typeof o.university_id === 'string')
          .map((o: any) => ({
            degree_program_id: String(o.degree_program_id),
            university_id: String(o.university_id),
            proposed_intake: typeof o.proposed_intake === 'number' ? o.proposed_intake : undefined,
            cutoff_marks: o.cutoff_marks && typeof o.cutoff_marks === 'object' ? o.cutoff_marks : undefined,
            academic_year: typeof o.academic_year === 'string' ? o.academic_year : undefined,
          })) as GovernmentCourseOffering[];
        setGovernmentOfferings(govOfferings);
      })
      .catch(() => {
        setInstError('Failed to load institutions');
      })
      .finally(() => {
        setInstLoading(false);
        // Mark that the initial institution + government JSON load attempt is done.
        // This helps avoid rendering private-only results first and then re-rendering
        // when government datasets arrive.
        setInitialInstitutionDataLoaded(true);
      });

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
  }, [filterClassification, filterInstitution, filterLevel, filterDeliveryMode, filterSpecialization, filterName, filterDuration, filterEligibility, pageSize]);

  // If classification changes and selected institution doesn't match it, clear institution filter
  useEffect(() => {
    if (!filterClassification) return;
    if (!filterInstitution) return;
    const inst = institutions.find((i) => String(i?._id) === String(filterInstitution));
    if (!inst) return;
    if (!matchesClassification(inst, filterClassification)) {
      setFilterInstitution('');
    }
  }, [filterClassification, filterInstitution, institutions]);

  // When institution changes, scope Level & Specialization options to that institution
  useEffect(() => {
    if (!filterInstitution) {
      setScopedLevels([]);
      setScopedSpecializations([]);
      return;
    }

    const inst = institutions.find((i) => String(i?._id) === String(filterInstitution));
    const isGovernmentInstitution = inst?.classification === 'Government';
    if (isGovernmentInstitution) {
      setScopedOptionsLoading(false);
      // Scope options based on government JSON (offerings + programs)
      const offeredProgramIds = new Set(
        governmentOfferings
          .filter((o) => String(o.university_id) === String(filterInstitution))
          .map((o) => String(o.degree_program_id))
      );

      const offeredPrograms = governmentPrograms.filter((p) => offeredProgramIds.has(String(p._id)));

      const nextLevels = ['Undergraduate'];
      const specValues = offeredPrograms
        .flatMap((p) => getGovernmentProgramSpecializations(p))
        .filter((s): s is string => typeof s === 'string')
        .map((s) => s.trim())
        .filter(Boolean);
      const nextSpecs = Array.from(new Set<string>(specValues)).sort((a, b) => a.localeCompare(b));

      setScopedLevels(nextLevels);
      setScopedSpecializations(nextSpecs);

      if (filterLevel && !nextLevels.includes(filterLevel)) setFilterLevel('');
      if (filterSpecialization && !nextSpecs.includes(filterSpecialization)) setFilterSpecialization('');
      return;
    }

    let cancelled = false;
    setScopedOptionsLoading(true);

    // Fetch a large batch of programs for the institution and derive available options
    ProgramsService.listPrograms(
      1,
      5000,
      filterInstitution,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'name:asc'
    )
      .then((res) => {
        if (cancelled) return;
        const data = (res.data || []) as any[];

        const nextLevels = Array.from(
          new Set(
            data
              .map((p) => (typeof p?.level === 'string' ? p.level.trim() : ''))
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        const nextSpecs = Array.from(
          new Set(
            data
              .flatMap((p) => (Array.isArray(p?.specializations) ? p.specializations : []))
              .filter((v) => typeof v === 'string')
              .map((v: string) => v.trim())
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        setScopedLevels(nextLevels);
        setScopedSpecializations(nextSpecs);

        // Clear current selections if they are no longer valid for this institution
        if (filterLevel && !nextLevels.includes(filterLevel)) setFilterLevel('');
        if (filterSpecialization && !nextSpecs.includes(filterSpecialization)) setFilterSpecialization('');
      })
      .catch(() => {
        if (cancelled) return;
        setScopedLevels([]);
        setScopedSpecializations([]);
      })
      .finally(() => {
        if (cancelled) return;
        setScopedOptionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterInstitution, filterLevel, filterSpecialization]);

  // Fetch courses with filters and pagination
  useEffect(() => {
    let cancelled = false;

    const normalizedClassification = filterClassification.trim().toLowerCase();
    const isGovernmentOnly = normalizedClassification === 'government';
    const isPrivateOnly = normalizedClassification === 'private';
    const includeGovernment = !isPrivateOnly;
    const includeBackend = !isGovernmentOnly;

    const selectedInstitution = filterInstitution
      ? institutions.find((i) => String(i?._id) === String(filterInstitution))
      : undefined;
    const isSelectedGovernmentInstitution = selectedInstitution?.classification === 'Government';
    const isGovernmentOnlyEffective = isGovernmentOnly || (isSelectedGovernmentInstitution && !isPrivateOnly);

    // Avoid a two-phase UI (private first, then all): for "All" (and Government-only)
    // we wait until the initial institution + government JSON load attempt completes.
    const needsGovernmentDatasets = includeGovernment && (isGovernmentOnlyEffective || (!filterClassification && currentPage === 1));
    if (needsGovernmentDatasets && !initialInstitutionDataLoaded) {
      return;
    }

    setLoading(true);
    setError(null);

    const normalizeGovCourses = () => {
      const nameQ = filterName.trim().toLowerCase();
      const byInstitution = filterInstitution ? String(filterInstitution) : '';
      const specQ = normalizeStr(filterSpecialization);
      const levelQ = normalizeStr(filterLevel);

      const allowProgram = (p: GovernmentDegreeProgram) => {
        if (nameQ) {
          const title = (p.title || p.name || '').toString().toLowerCase();
          if (!title.includes(nameQ)) return false;
        }
        if (levelQ) {
          // Government programs are treated as Undergraduate for now.
          if (levelQ !== 'undergraduate') return false;
        }
        if (specQ) {
          const programSpecs = getGovernmentProgramSpecializations(p).map(normalizeStr).filter(Boolean);
          const title = normalizeStr(p.title || p.name || '');
          // Match either program stream (exact) or a title contains match.
          const streamMatch = programSpecs.some((s) => s === specQ);
          const titleMatch = title.includes(specQ);
          if (!streamMatch && !titleMatch) return false;
        }
        if (filterDeliveryMode && filterDeliveryMode.trim()) return false;
        if (filterDuration && filterDuration.trim()) return false;
        if (filterEligibility && filterEligibility.trim()) return false;

        if (byInstitution) {
          return governmentOfferings.some(
            (o) => o.degree_program_id === p._id && String(o.university_id) === byInstitution
          );
        }
        return true;
      };

      const filteredGov = governmentPrograms.filter(allowProgram);

      return filteredGov.map((p) => {
        const title = p.title || p.name || p._id;
        return {
          _id: p._id,
          name: title,
          title,
          description: p.description || 'Government university degree program.',
          level: 'Undergraduate',
          duration: typeof p.duration_years === 'number' ? { years: p.duration_years } : undefined,
          institution_id: undefined,
          __classification: 'Government',
          __institutionName: byInstitution
            ? institutions.find((i) => String(i._id) === byInstitution)?.name || 'Government University'
            : 'Government Universities',
        };
      });
    };

    if (isGovernmentOnlyEffective) {
      const govCourses = includeGovernment ? normalizeGovCourses() : [];
      const total = govCourses.length;
      const totalP = Math.max(1, Math.ceil(total / pageSize));
      const start = (currentPage - 1) * pageSize;
      if (!cancelled) {
        setCourses(govCourses.slice(start, start + pageSize));
        setTotalPages(totalP);
        setLoading(false);
      }
      return;
    }

    const fetchPrivateWindow = async (startIndex: number, count: number) => {
      if (!includeBackend || count <= 0) return { items: [] as any[], total: 0 };

      const page0 = Math.floor(startIndex / pageSize) + 1;
      const offset0 = startIndex % pageSize;

      const res0 = await ProgramsService.listPrograms(
        page0,
        pageSize,
        filterInstitution || undefined,
        filterName || undefined,
        filterLevel || undefined,
        filterDeliveryMode || undefined,
        filterSpecialization || undefined,
        filterDuration || undefined,
        filterEligibility || undefined
      );

      const list0 = (res0.data || []) as any[];
      const totalRaw: any = (res0.pagination as any)?.total;
      const total = Number(totalRaw);
      const privateTotal = Number.isFinite(total) && total >= 0 ? total : 0;

      let items = list0.slice(offset0, offset0 + count);

      if (items.length < count) {
        const res1 = await ProgramsService.listPrograms(
          page0 + 1,
          pageSize,
          filterInstitution || undefined,
          filterName || undefined,
          filterLevel || undefined,
          filterDeliveryMode || undefined,
          filterSpecialization || undefined,
          filterDuration || undefined,
          filterEligibility || undefined
        );
        const list1 = (res1.data || []) as any[];
        items = items.concat(list1.slice(0, count - items.length));
      }

      return { items, total: privateTotal };
    };

    // "All" view: combine Government + Private into one paginated list.
    // This ensures we always render exactly `pageSize` items per page and show proper page numbers.
    if (!filterClassification) {
      const govCourses = includeGovernment ? normalizeGovCourses() : [];
      const govCount = govCourses.length;

      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      const govSlice = startIndex < govCount ? govCourses.slice(startIndex, Math.min(endIndex, govCount)) : [];
      const remaining = Math.max(0, pageSize - govSlice.length);
      const privateStartIndex = Math.max(0, startIndex - govCount);

      fetchPrivateWindow(privateStartIndex, remaining)
        .then(({ items: privateSlice, total: privateTotal }) => {
          if (cancelled) return;
          const combinedTotal = govCount + privateTotal;
          const combinedTotalPages = Math.max(1, Math.ceil(combinedTotal / pageSize));
          setCourses([...govSlice, ...privateSlice]);
          setTotalPages(combinedTotalPages);
        })
        .catch(() => {
          if (cancelled) return;
          setError('Failed to load courses');
          setCourses([]);
          setTotalPages(1);
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    const isClassificationOnlyMode = Boolean(filterClassification && !filterInstitution);

    if (isClassificationOnlyMode) {
      // Fetch a larger batch then filter client-side by institution classification
      const bigPageSize = 5000;
      ProgramsService.listPrograms(
        1,
        bigPageSize,
        undefined,
        filterName || undefined,
        filterLevel || undefined,
        filterDeliveryMode || undefined,
        filterSpecialization || undefined,
        filterDuration || undefined,
        filterEligibility || undefined
      )
        .then((res) => {
          const all = (res.data || []) as any[];
          const allowed = new Set(
            visibleInstitutions.map((i) => String(i?._id)).filter(Boolean)
          );
          const filtered = all.filter((c) => allowed.has(String(c?.institution_id)));

          // Private classification-only mode should not inject government results.
          // If user chose "All" this branch won't run; if "Private" it should remain backend-only.

          const total = filtered.length;
          const totalP = Math.max(1, Math.ceil(total / pageSize));
          const start = (currentPage - 1) * pageSize;
          const pageItems = filtered.slice(start, start + pageSize);
          setCourses(pageItems);
          setTotalPages(totalP);
        })
        .catch(() => {
          setError('Failed to load courses');
        })
        .finally(() => setLoading(false));

      return;
    }

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
        const list = (res.data || []) as any[];
        // If both institution and classification are chosen, keep only matching results
        const filtered = filterClassification
          ? list.filter((c) => {
              const inst = institutions.find((i) => String(i?._id) === String(c?.institution_id));
              return inst ? matchesClassification(inst, filterClassification) : false;
            })
          : list;

        setCourses(filtered);

        const tpRaw: any = (res.pagination as any)?.total_pages;
        const totalRaw: any = (res.pagination as any)?.total;
        const apiTotalPages = Number(tpRaw);
        const apiTotal = Number(totalRaw);

        if (Number.isFinite(apiTotalPages) && apiTotalPages > 0) {
          setTotalPages(apiTotalPages);
        } else if (Number.isFinite(apiTotal) && apiTotal > 0) {
          setTotalPages(Math.ceil(apiTotal / pageSize));
        } else {
          setTotalPages(1);
        }
      })
      .catch(() => {
        setError('Failed to load courses');
      })
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [currentPage, pageSize, filterClassification, filterInstitution, filterLevel, filterDeliveryMode, filterSpecialization, filterName, filterDuration, filterEligibility, visibleInstitutions, institutions, governmentPrograms, governmentOfferings, initialInstitutionDataLoaded]);



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

        {/* FILTER BAR - Only Institution, Level, Specialization, Program Name */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Classification</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
                value={filterClassification}
                onChange={e => setFilterClassification(e.target.value)}
                disabled={instLoading || Boolean(instError)}
              >
                <option value="">All</option>
                {classificationOptions
                  .filter((c) => typeof c === 'string' && c.trim())
                  .map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Institution</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
                value={filterInstitution}
                onChange={e => setFilterInstitution(e.target.value)}
              >
                <option value="">All</option>
                {visibleInstitutions.map(inst => (
                  <option key={inst._id} value={inst._id}>{inst.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Level</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
                disabled={scopedOptionsLoading && Boolean(filterInstitution)}
              >
                <option value="">All</option>
                {visibleLevels.filter(lvl => typeof lvl === 'string' && lvl.trim()).map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Specialization</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
                value={filterSpecialization}
                onChange={e => setFilterSpecialization(e.target.value)}
                disabled={scopedOptionsLoading && Boolean(filterInstitution)}
              >
                <option value="">All</option>
                {visibleSpecializations.filter(spec => typeof spec === 'string' && spec.trim()).map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Program Name</label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm"
                placeholder="Search by name"
                value={filterName}
                onChange={e => setFilterName(e.target.value)}
              />
            </div>
            <div className="col-span-1 flex md:justify-end">
              <button
                className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-blue-50 hover:text-blue-700 transition-all w-full md:w-auto"
                onClick={() => {
                  setFilterClassification('');
                  setFilterInstitution('');
                  setFilterLevel('');
                  setFilterSpecialization('');
                  setFilterName('');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
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
                const inst = institutions.find((i) => String(i?._id) === String(course?.institution_id));
                const institutionName =
                  (inst?.name && String(inst.name).trim())
                    ? String(inst.name)
                    : (typeof (course as any)?.__institutionName === 'string' && (course as any).__institutionName.trim())
                      ? (course as any).__institutionName.trim()
                      : 'Unknown Institution';
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
                const courseId = extractId((course as any)?._id) ?? extractId((course as any)?.id) ?? '';
                const hasCourseId = Boolean(courseId);

                return (
                  <div key={key} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full reveal relative">
                    <div className="absolute top-6 right-6 flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => courseId && toggleSavedCourse(courseId)}
                        className={`p-3 rounded-2xl backdrop-blur-md transition-all active:scale-90 ${courseId && savedCourses.includes(courseId) ? 'bg-primary-600 text-white' : 'bg-black/10 dark:bg-black/20 text-slate-700 dark:text-white/70 hover:bg-white/40'}`}
                        aria-label={courseId && savedCourses.includes(courseId) ? 'Unsave course' : 'Save course'}
                        title={courseId && savedCourses.includes(courseId) ? 'Saved' : 'Save'}
                        disabled={!courseId}
                      >
                        <Bookmark size={20} className={courseId && savedCourses.includes(courseId) ? 'fill-current' : ''} />
                      </button>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 leading-none">
                        Status
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                        Verified
                      </span>
                    </div>
                    <div className="flex items-start mb-8">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <BookOpen size={28} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="heading-card text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course.name}
                      </h3>
                      <div className="flex items-center text-slate-400 font-bold text-[11px] uppercase tracking-wider mb-6">
                        <MapPin size={14} className="mr-2 text-blue-500" /> {institutionName}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 line-clamp-3 font-medium">
                        {course.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-8">
                        <span className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 dark:border-slate-800">
                          {course.level}
                        </span>
                        <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                          Verified
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
                      {hasCourseId ? (
                        <Link
                          to={`/courses/${courseId}`}
                          className="flex items-center text-blue-600 text-[10px] font-black uppercase tracking-widest group/btn"
                        >
                          View Details <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">View Details</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Page size selector (always visible) */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-12">
              <div className="text-xs font-bold text-slate-500">Page {currentPage} of {totalPages}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Per page</span>
                <select
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {pageSizeOptions.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-4">
                <div className="flex flex-wrap justify-center items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-bold disabled:opacity-50"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>

                  {getPaginationItems(currentPage, totalPages).map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`dots-${idx}`} className="px-2 text-slate-400 font-black select-none">…</span>
                      );
                    }

                    const pageNum = item;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={
                          'px-3 py-2 rounded-lg border font-black transition-all ' +
                          (isActive
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700')
                        }
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-bold disabled:opacity-50"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;