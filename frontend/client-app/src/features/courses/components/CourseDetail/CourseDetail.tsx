

import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// import { courses, institutions } from '../../../../data/mockData';
import { ProgramsService } from '../../../../types/services/ProgramsService';
import { InstitutionsService } from '../../../../types/services/InstitutionsService';
import { useAppStore } from '../../../../context/AppContext';
import { Clock, DollarSign, Calendar, ArrowLeft, Check, AlertCircle, X, MapPin, BookOpen, Briefcase, Globe, Users, Star, Building2, ChevronRight, Bookmark, CheckCircle, GitCompare, Bot } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
   _id?: string;
   degree_program_id: string;
   university_id: string;
   proposed_intake?: number;
   cutoff_marks?: Record<string, string | number | null | undefined>;
   academic_year?: string;
};

type GovernmentInstitution = {
   _id: string;
   name?: string;
   website?: string;
   contact?: any;
   location?: any;
   image_url?: string;
   imageUrl?: string;
};

type CourseChatContext = {
   courseId: string;
   title: string;
   description?: string;
   level?: string;
   field?: string;
   institutionId?: string;
   institutionName?: string;
   classification?: 'Government' | 'Private' | 'Unknown';
   governmentOfferings?: Array<{
      universityId: string;
      universityName: string;
      proposedIntake?: number;
      academicYear?: string;
   }>;
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

const formatAlRequirements = (alReq: any): string => {
   if (!alReq || typeof alReq !== 'object') return '';
   const stream = typeof alReq.stream === 'string' ? alReq.stream.trim() : '';
   const subjects = Array.isArray(alReq.subjects)
      ? alReq.subjects.filter((s: any) => typeof s === 'string' && s.trim()).map((s: string) => s.trim())
      : [];
   const minGrades = alReq.minimum_grades;
   const minGradesText = minGrades && typeof minGrades === 'object'
      ? Object.entries(minGrades)
         .filter(([k, v]) => typeof k === 'string' && k.trim() && (typeof v === 'string' || typeof v === 'number'))
         .map(([k, v]) => `${k}: ${String(v)}`)
         .join(', ')
      : '';

   const parts = [
      stream ? `A/L Stream: ${stream}` : '',
      subjects.length ? `Subjects: ${subjects.join(', ')}` : '',
      minGradesText ? `Minimum grades: ${minGradesText}` : '',
   ].filter(Boolean);
   return parts.join(' | ');
};

const formatOlRequirements = (olReq: any): string => {
   if (!olReq) return '';
   if (typeof olReq === 'string') return olReq.trim();
   if (typeof olReq !== 'object') return '';
   const parts: string[] = [];
   if (typeof olReq.minimum_passes === 'number') parts.push(`O/L minimum passes: ${olReq.minimum_passes}`);
   if (Array.isArray(olReq.required_subjects)) {
      const req = olReq.required_subjects
         .filter((s: any) => typeof s === 'string' && s.trim())
         .map((s: string) => s.trim());
      if (req.length) parts.push(`Required subjects: ${req.join(', ')}`);
   }
   return parts.join(' | ');
};

const fieldImages: Record<string, string> = {
   'IT': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2000&auto=format&fit=crop',
   'Engineering': 'https://images.unsplash.com/photo-1581094794329-cdac82aadbcc?q=80&w=2000&auto=format&fit=crop',
   'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2000&auto=format&fit=crop',
   'Medicine': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000&auto=format&fit=crop',
   'Arts': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2000&auto=format&fit=crop',
   'Science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2000&auto=format&fit=crop',
};

const CourseDetail = () => {

   const params = useParams();
   const id = typeof params.id === 'string' ? params.id.trim() : undefined;
   const navigate = useNavigate();
   const [showApplyModal, setShowApplyModal] = useState(false);

   const { toggleSavedCourse, savedCourses, compareCourses, toggleCompareCourse } = useAppStore();
   const isValidId = (value?: string) => {
      if (!value) return false;
      const v = value.trim();
      if (!v || v === 'undefined' || v === 'null') return false;
      if (v.includes('[object Object]')) return false;
      return true;
   };

   const extractId = (value: unknown): string | null => {
      if (typeof value === 'string') {
         const trimmed = value.trim();
         return isValidId(trimmed) ? trimmed : null;
      }
      if (value && typeof value === 'object') {
         const v: any = value;
         const candidate = v.$oid ?? v.oid ?? v.id ?? v._id;
         return extractId(candidate);
      }
      return null;
   };

   const isSavedCourse = Boolean(isValidId(id) && savedCourses.includes(id as string));
   const isComparedCourse = Boolean(isValidId(id) && compareCourses.includes(id as string));

   const [course, setCourse] = useState<any>(null);
   const [institution, setInstitution] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const [loadDebug, setLoadDebug] = useState<{
      id?: string;
      looksLikeGovernmentId: boolean;
      govTried: boolean;
      govFound: boolean;
      govError?: string;
      backendTried: boolean;
      backendFound: boolean;
      backendError?: string;
   }>({
      id,
      looksLikeGovernmentId: false,
      govTried: false,
      govFound: false,
      backendTried: false,
      backendFound: false,
   });

   const [isGovernmentCourse, setIsGovernmentCourse] = useState(false);
   const [governmentOfferings, setGovernmentOfferings] = useState<GovernmentCourseOffering[]>([]);
   const [governmentPrimaryAcademicYear, setGovernmentPrimaryAcademicYear] = useState<string | null>(null);
   const [governmentInstitutionsById, setGovernmentInstitutionsById] = useState<Record<string, GovernmentInstitution>>({});
   const [governmentProgramMeta, setGovernmentProgramMeta] = useState<{
      stream?: string;
      medium?: string;
      aptitudeRequired?: boolean;
      alText?: string;
      olText?: string;
   } | null>(null);

   const [relatedCourses, setRelatedCourses] = useState<any[]>([]);
   const [relatedLoading, setRelatedLoading] = useState(false);

   React.useEffect(() => {
      // When navigating between /courses/:id routes, keep UX consistent
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowApplyModal(false);
   }, [id]);

   React.useEffect(() => {
      let cancelled = false;

      setError(null);
      setCourse(null);
      setInstitution(null);
      setIsGovernmentCourse(false);
      setGovernmentOfferings([]);
      setGovernmentPrimaryAcademicYear(null);
      setGovernmentInstitutionsById({});
      setGovernmentProgramMeta(null);
      setLoadDebug({
         id,
         looksLikeGovernmentId: false,
         govTried: false,
         govFound: false,
         backendTried: false,
         backendFound: false,
      });

      if (!isValidId(id)) {
         setLoading(false);
         setError('Course not found');
         return;
      }

      setLoading(true);

      const loadGovernmentCourseById = async (courseId: string) => {
         const normalizedCourseId = courseId.trim();
         const normalizedCourseIdUpper = normalizedCourseId.toUpperCase();

         const degreeJson = await safeJsonFetch('/government-degree-programs.json');
         const programsRaw = extractArrayFromJson(degreeJson, ['degreePrograms', 'degree_programs', 'programs', 'data']);
         const programs = programsRaw.filter((p: any) => p && typeof p === 'object' && typeof p._id === 'string') as GovernmentDegreeProgram[];
         const match = programs.find((p) => String(p._id).trim().toUpperCase() === normalizedCourseIdUpper);
         if (!match) return null;

         const offeringsJson = await safeJsonFetch('/government-course-offerings.json');
         const offeringsRaw = extractArrayFromJson(offeringsJson, ['offerings', 'course_offerings', 'data']);
         const offerings = offeringsRaw
            .filter((o: any) => o && typeof o === 'object' && typeof o.degree_program_id === 'string' && typeof o.university_id === 'string')
            .map((o: any) => ({
               _id: typeof o._id === 'string' ? o._id : undefined,
               degree_program_id: String(o.degree_program_id).trim(),
               university_id: String(o.university_id).trim(),
               proposed_intake: typeof o.proposed_intake === 'number' ? o.proposed_intake : undefined,
               cutoff_marks: o.cutoff_marks && typeof o.cutoff_marks === 'object' ? o.cutoff_marks : undefined,
               academic_year: typeof o.academic_year === 'string' ? o.academic_year : undefined,
            })) as GovernmentCourseOffering[];

         const matchedOfferings = offerings.filter((o) => String(o.degree_program_id).trim().toUpperCase() === normalizedCourseIdUpper);

         const instJson = await safeJsonFetch('/government-institutions.json');
         const govInstRaw = extractArrayFromJson(instJson, ['institutions', 'data', 'universities']);
         const govInstitutions = govInstRaw
            .filter((i: any) => i && typeof i === 'object' && typeof i._id === 'string') as GovernmentInstitution[];
         const instById = new Map<string, GovernmentInstitution>();
         for (const gi of govInstitutions) instById.set(gi._id, gi);
         const instRecord: Record<string, GovernmentInstitution> = {};
         for (const gi of govInstitutions) instRecord[gi._id] = gi;

         const year = matchedOfferings.find((o) => typeof o.academic_year === 'string' && o.academic_year.trim())?.academic_year ?? null;

         const alText = formatAlRequirements(match.al_requirements);
         const olText = formatOlRequirements(match.ol_requirements);
         const aptitudeRequired = Boolean(match.aptitude_test_required);
         const medium = typeof match.medium_of_instruction === 'string' ? match.medium_of_instruction.trim() : undefined;
         const stream = typeof match.stream === 'string' ? match.stream.trim() : undefined;

         const minQualParts = [
            alText ? alText : '',
            olText ? olText : '',
            typeof match.aptitude_test_required === 'boolean' ? `Aptitude test: ${match.aptitude_test_required ? 'Required' : 'Not required'}` : '',
            medium ? `Medium: ${medium}` : '',
         ].filter(Boolean);

         const normalizedCourse: any = {
            _id: match._id,
            title: match.title || match.name || match._id,
            name: match.title || match.name || match._id,
            field: stream || 'Government',
            level: 'Undergraduate',
            duration: typeof match.duration_years === 'number' ? { years: match.duration_years } : undefined,
            fees: 'Free',
            url: undefined,
            description:
               typeof match.description === 'string' && match.description.trim()
                  ? match.description.trim()
                  : 'Government university degree program.',
            eligibility: {
               minimum_qualifications: minQualParts.length ? minQualParts.join('\n') : 'N/A',
            },
         };

         // Pick a representative institution for the header if exactly one offering.
         let representativeInstitution: any = { name: 'Government Universities' };
         if (matchedOfferings.length === 1) {
            const uni = instById.get(matchedOfferings[0].university_id);
            if (uni) representativeInstitution = uni;
         } else if (matchedOfferings.length > 1) {
            representativeInstitution = { name: 'Multiple Government Universities' };
         }

         return {
            course: normalizedCourse,
            representativeInstitution,
            offerings: matchedOfferings,
            academicYear: year,
            meta: {
               stream,
               medium,
               aptitudeRequired,
               alText,
               olText,
               instById,
               instRecord,
            },
         };
      };

      const looksLikeGovernmentId = typeof id === 'string' && /^[cC]\d+$/.test(id);
      setLoadDebug((d) => ({
         ...d,
         id,
         looksLikeGovernmentId,
      }));

      const applyGovernmentCourse = (gov: Awaited<ReturnType<typeof loadGovernmentCourseById>>) => {
         if (!gov) return false;
         setIsGovernmentCourse(true);
         setGovernmentOfferings(gov.offerings);
         setGovernmentPrimaryAcademicYear(gov.academicYear);
         setGovernmentInstitutionsById(gov.meta.instRecord || {});
         setGovernmentProgramMeta({
            stream: gov.meta.stream,
            medium: gov.meta.medium,
            aptitudeRequired: gov.meta.aptitudeRequired,
            alText: gov.meta.alText,
            olText: gov.meta.olText,
         });
         setCourse(gov.course);
         setInstitution(gov.representativeInstitution);
         setError(null);
         return true;
      };

      const applyBackendCourse = (data: any) => {
         setIsGovernmentCourse(false);
         setGovernmentOfferings([]);
         setGovernmentPrimaryAcademicYear(null);
         setGovernmentProgramMeta(null);
         setGovernmentInstitutionsById({});
         setCourse(data);

         const instId = (data as any)?.institution_id;
         if (typeof instId === 'string' && instId.trim()) {
            InstitutionsService.getInstitution(instId)
               .then((instData) => {
                  if (cancelled) return;
                  setInstitution(instData);
               })
               .catch(() => {
                  if (cancelled) return;
                  setInstitution(null);
               });
         } else {
            setInstitution(null);
         }
      };

      (async () => {
         try {
            // Prefer JSON for government-style IDs (C001, C090, etc.), since backend IDs are typically ObjectIds.
            if (looksLikeGovernmentId) {
               setLoadDebug((d) => ({ ...d, govTried: true }));
               const gov = await loadGovernmentCourseById(id as string);
               if (cancelled) return;
               if (applyGovernmentCourse(gov)) {
                  setLoadDebug((d) => ({ ...d, govFound: true }));
                  return;
               }
            }

            setLoadDebug((d) => ({ ...d, backendTried: true }));
            const data = await ProgramsService.getProgram(id as string);
            if (cancelled) return;
            if (!data || typeof data !== 'object') throw new Error('Invalid program response');
            applyBackendCourse(data);
            setLoadDebug((d) => ({ ...d, backendFound: true }));
         } catch {
            if (cancelled) return;
            try {
               setLoadDebug((d) => ({ ...d, govTried: true }));
               const gov = await loadGovernmentCourseById(id as string);
               if (cancelled) return;
               if (applyGovernmentCourse(gov)) {
                  setLoadDebug((d) => ({ ...d, govFound: true }));
                  return;
               }
               setCourse(null);
               setInstitution(null);
               setError('Course not found');
            } catch (e: any) {
               const msg = typeof e?.message === 'string' ? e.message : undefined;
               setLoadDebug((d) => ({ ...d, govError: msg || d.govError || 'Government lookup failed' }));
               setCourse(null);
               setInstitution(null);
               setError('Course not found');
            }
         } finally {
            if (cancelled) return;
            setLoading(false);
         }
      })();

      return () => {
         cancelled = true;
      };
   }, [id]);

   const governmentInstitutionById = useMemo(() => {
      const m = new Map<string, GovernmentInstitution>();
      for (const [k, v] of Object.entries(governmentInstitutionsById)) {
         if (v && typeof v === 'object' && typeof (v as any)?._id === 'string') m.set(k, v as GovernmentInstitution);
      }
      return m;
   }, [governmentInstitutionsById]);

   const governmentOfferingsView = useMemo(() => {
      if (!isGovernmentCourse) return [] as Array<{
         universityId: string;
         universityName: string;
         universityWebsite?: string;
         proposedIntake?: number;
         academicYear?: string;
         cutoffMarks?: Record<string, string | number | null | undefined>;
      }>;

      const currentGovCourseId = typeof (course as any)?._id === 'string' ? (course as any)._id.trim().toUpperCase() : '';

      const rows = (governmentOfferings || [])
         .filter((o) => {
            if (!currentGovCourseId) return true;
            const oid = typeof o?.degree_program_id === 'string' ? o.degree_program_id.trim().toUpperCase() : '';
            return oid === currentGovCourseId;
         })
         .map((o) => {
            const uni = governmentInstitutionById.get(o.university_id);
            const name = (uni?.name || o.university_id || 'Unknown University').toString();
            const website = typeof uni?.contact?.website === 'string' ? uni.contact.website : (typeof uni?.website === 'string' ? uni.website : undefined);
            return {
               universityId: o.university_id,
               universityName: name,
               universityWebsite: typeof website === 'string' && website.trim() ? website.trim() : undefined,
               proposedIntake: typeof o.proposed_intake === 'number' ? o.proposed_intake : undefined,
               academicYear: typeof o.academic_year === 'string' ? o.academic_year : undefined,
               cutoffMarks: o.cutoff_marks,
            };
         });

      // Some datasets contain multiple rows for the same university (e.g., cutoff marks split by district groups).
      // Merge them to show a single offering card per university.
      const mergedByUni = new Map<string, (typeof rows)[number]>();
      for (const r of rows) {
         const key = `${r.universityId}`;
         const existing = mergedByUni.get(key);
         if (!existing) {
            mergedByUni.set(key, r);
            continue;
         }

         const mergedCutoffs = {
            ...(existing.cutoffMarks || {}),
            ...(r.cutoffMarks || {}),
         };

         mergedByUni.set(key, {
            ...existing,
            proposedIntake:
               typeof existing.proposedIntake === 'number' && typeof r.proposedIntake === 'number'
                  ? Math.max(existing.proposedIntake, r.proposedIntake)
                  : (existing.proposedIntake ?? r.proposedIntake),
            cutoffMarks: Object.keys(mergedCutoffs).length ? mergedCutoffs : (existing.cutoffMarks ?? r.cutoffMarks),
            universityWebsite: existing.universityWebsite ?? r.universityWebsite,
            universityName: existing.universityName || r.universityName,
            academicYear: existing.academicYear ?? r.academicYear,
         });
      }

      return Array.from(mergedByUni.values()).sort((a, b) => a.universityName.localeCompare(b.universityName));
   }, [course, governmentOfferings, governmentInstitutionById, isGovernmentCourse]);

   const handleAskAiAboutThisCourse = () => {
      if (!course) return;
      const courseId = (typeof (course as any)?._id === 'string' && (course as any)._id.trim())
         ? (course as any)._id.trim()
         : (typeof id === 'string' ? id.trim() : '');
      if (!courseId) return;

      const ctx: CourseChatContext = {
         courseId,
         title: String(course?.name || course?.title || courseId),
         description: typeof course?.description === 'string' ? course.description : undefined,
         level: typeof course?.level === 'string' ? course.level : undefined,
         field: typeof course?.field === 'string' ? course.field : undefined,
         institutionId: typeof (institution as any)?._id === 'string' ? String((institution as any)._id) : undefined,
         institutionName: typeof (institution as any)?.name === 'string' ? String((institution as any).name) : undefined,
         classification: isGovernmentCourse ? 'Government' : 'Private',
         governmentOfferings: isGovernmentCourse
            ? governmentOfferingsView.map((o) => ({
               universityId: o.universityId,
               universityName: o.universityName,
               proposedIntake: o.proposedIntake,
               academicYear: o.academicYear,
            }))
            : undefined,
      };

      navigate('/chat', {
         state: {
            startNew: true,
            courseContext: ctx,
         },
      });
   };

   React.useEffect(() => {
      if (!course) return;

      const currentIdRaw = (course as any)?._id || (course as any)?.id || id;
      const currentId = typeof currentIdRaw === 'string' ? currentIdRaw : undefined;
      const courseSpecs: unknown[] = Array.isArray(course?.specializations) ? course.specializations : [];
      const normalizedSpecs = courseSpecs
         .filter((v: unknown): v is string => typeof v === 'string')
         .map((v) => v.trim())
         .filter(Boolean);
      const specs = Array.from(new Set(normalizedSpecs));
      const level = typeof course?.level === 'string' ? course.level : undefined;

      let cancelled = false;
      setRelatedLoading(true);

      const pageSize = 20;
      const specRequests = specs.length
         ? specs.slice(0, 3).map((spec) =>
            ProgramsService.listPrograms(
               1,
               pageSize,
               undefined,
               undefined,
               level,
               undefined,
               spec,
               undefined,
               undefined,
               'name:asc'
            )
         )
         : [
            ProgramsService.listPrograms(
               1,
               pageSize,
               undefined,
               undefined,
               level,
               undefined,
               undefined,
               undefined,
               undefined,
               'name:asc'
            ),
         ];

      Promise.all(specRequests)
         .then((results) => {
            const combined = results.flatMap((r: any) => (r?.data || []) as any[]);

            const byId = new Map<string, any>();
            for (const p of combined) {
               const pid = (p?._id || p?.id) as string | undefined;
               if (!pid) continue;
               if (currentId && pid === currentId) continue;
               if (!byId.has(pid)) byId.set(pid, p);
            }

            let filtered = Array.from(byId.values());
            if (specs.length) {
               filtered = filtered.filter((p) => {
                  const pSpecs = Array.isArray(p?.specializations)
                     ? p.specializations.filter((v: any) => typeof v === 'string').map((v: string) => v.trim())
                     : [];
                  return pSpecs.some((s: string) => specs.includes(s));
               });
            }

            const selected = filtered.slice(0, 3);
            if (cancelled) return;
            setRelatedCourses(selected);
         })
         .catch(() => {
            if (cancelled) return;
            setRelatedCourses([]);
         })
         .finally(() => {
            if (cancelled) return;
            setRelatedLoading(false);
         });

      return () => {
         cancelled = true;
      };
   }, [course, id]);

   if (loading && !course) {
      return <div className="container mx-auto px-4 py-20 text-center">Loading...</div>;
   }
   if (error || !course) {
      return (
         <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Course not found</h2>
            {import.meta.env.DEV && (
               <div className="mt-4 mx-auto max-w-2xl text-left bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
                  <div className="font-bold mb-2">Debug</div>
                  <div>ID: <span className="font-mono">{loadDebug.id || '(none)'}</span></div>
                  <div>looksLikeGovernmentId: {String(loadDebug.looksLikeGovernmentId)}</div>
                  <div>govTried: {String(loadDebug.govTried)} | govFound: {String(loadDebug.govFound)}</div>
                  {loadDebug.govError && <div>govError: {loadDebug.govError}</div>}
                  <div>backendTried: {String(loadDebug.backendTried)} | backendFound: {String(loadDebug.backendFound)}</div>
                  {loadDebug.backendError && <div>backendError: {loadDebug.backendError}</div>}
                  <div className="mt-2 text-slate-500">If ID is not like C001/C090, it wont be treated as a government course.</div>
               </div>
            )}
            <button onClick={() => navigate('/courses')} className="mt-4 text-blue-600 hover:underline">Return to Courses</button>
         </div>
      );
   }

   // Fallbacks for missing institution
   const inst = institution || {};
   const institutionImageUrl =
      typeof (inst as any)?.imageUrl === 'string' && (inst as any).imageUrl.trim()
         ? (inst as any).imageUrl.trim()
         : typeof (inst as any)?.image_url === 'string' && (inst as any).image_url.trim()
            ? (inst as any).image_url.trim()
            : '';

   const institutionWebsite =
      typeof (inst as any)?.contact?.website === 'string' && (inst as any).contact.website.trim()
         ? (inst as any).contact.website.trim()
         : typeof (inst as any)?.contact_info?.website === 'string' && (inst as any).contact_info.website.trim()
            ? (inst as any).contact_info.website.trim()
            : typeof (inst as any)?.website === 'string' && (inst as any).website.trim()
               ? (inst as any).website.trim()
               : '';

   const heroImage = fieldImages[course.field] || institutionImageUrl;

   // Helper to render fees breakdown
   const renderFeesBreakdown = (breakdown: any) => {
      if (!breakdown || typeof breakdown !== 'object') return null;

      // Some APIs return fees as a flat object (e.g. { amount, currency, breakdown: "..." })
      // while others return nested groups (e.g. { "Year 1": { Tuition: 1000 } }).
      const entries = Object.entries(breakdown);
      const looksNested = entries.some(([, v]) => v && typeof v === 'object' && !Array.isArray(v));

      if (!looksNested) {
         return (
            <div className="mt-2">
               <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <ul className="text-slate-600 text-sm space-y-1">
                     {entries.map(([label, value], i) => (
                        <li key={i}>
                           <span className="font-medium">{label}:</span> {value?.toLocaleString?.() ?? String(value)}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         );
      }

      return (
         <div className="mt-2 space-y-2">
            {Object.entries(breakdown).map(([group, fees]: any, idx) => {
               if (!fees || typeof fees !== 'object') return null;
               return (
               <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="font-bold text-slate-700 mb-1">{group}</div>
                  <ul className="text-slate-600 text-sm space-y-1">
                     {Object.entries(fees).map(([label, value]: any, i) => (
                        <li key={i}><span className="font-medium">{label}:</span> {value?.toLocaleString?.() ?? value}</li>
                     ))}
                  </ul>
               </div>
               );
            })}
         </div>
      );
   };

   const toShortUrl = (raw: unknown) => {
      if (typeof raw !== 'string') return '';
      const trimmed = raw.trim();
      if (!trimmed) return '';
      const noProtocol = trimmed.replace(/^https?:\/\//i, '').replace(/\/$/, '');
      return noProtocol.length > 50 ? `${noProtocol.slice(0, 50)}…` : noProtocol;
   };

   const formatDuration = (d: any) => {
      if (!d || (typeof d === 'object' && !d.years && !d.months && !d.weeks)) return 'N/A';
      if (typeof d === 'string') return d;
      if (typeof d === 'object') {
         const parts: string[] = [];
         if (d.years) parts.push(`${d.years} Year${d.years > 1 ? 's' : ''}`);
         if (d.months) parts.push(`${d.months} Month${d.months > 1 ? 's' : ''}`);
         if (d.weeks) parts.push(`${d.weeks} Week${d.weeks > 1 ? 's' : ''}`);
         return parts.join(' ') || 'N/A';
      }
      return 'N/A';
   };

   const requirementsText =
      course?.eligibility?.minimum_qualifications
         ? String(course.eligibility.minimum_qualifications)
         : 'N/A';

   const requirementsClass =
      requirementsText !== 'N/A' && requirementsText.length > 40
         ? 'text-sm md:text-base leading-snug'
         : 'text-lg md:text-xl leading-tight';

   const investmentText =
      course?.fees && typeof course.fees === 'string'
         ? (course.fees.includes('Free') ? 'Free (Government funded)' : course.fees)
         : 'N/A';

   // (moved above early returns to avoid hook order changes)

   const renderCutoffMarks = (cutoffMarks?: Record<string, any>) => {
      if (!cutoffMarks || typeof cutoffMarks !== 'object') return <div className="text-slate-500 text-sm">No cutoff marks available.</div>;
      const entries = Object.entries(cutoffMarks)
         .filter(([district, mark]) => typeof district === 'string' && district.trim() && (typeof mark === 'string' || typeof mark === 'number'))
         .map(([district, mark]) => ({ district: district.trim(), mark }))
         .sort((a, b) => a.district.localeCompare(b.district));

      if (!entries.length) return <div className="text-slate-500 text-sm">No cutoff marks available.</div>;

      return (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
            {entries.map((e) => (
               <div key={e.district} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                  <span className="text-slate-600 text-sm font-medium">{e.district}</span>
                  <span className="text-slate-900 text-sm font-bold">{String(e.mark)}</span>
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
               <img src={heroImage} alt={course.name || course.title || 'Course'} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-slate-900/80"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center pb-16">
               <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                     {/* Left Side: Title & Info */}
                     <div className="flex-1 space-y-4 reveal">
                        {/* University Name */}
                        <div className="flex items-center gap-2 text-slate-300 text-lg font-medium mb-1">
                           <MapPin size={20} className="text-blue-400" />
                           {inst._id ? (
                              <Link to={`/institutions/${inst._id}`} className="hover:text-white transition-colors border-b border-transparent hover:border-white">
                                 {inst.name}
                              </Link>
                           ) : (
                              <span>{inst.name || 'Unknown Institution'}</span>
                           )}
                        </div>
                        {/* Course Name */}
                        <div className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                           {course.name || course.title}
                        </div>
                        {/* Badges */}
                        <div className="flex gap-2 mb-2">
                           {course.level && (
                              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded uppercase tracking-wider">
                                 {course.level}
                              </span>
                           )}
                           {course.field && (
                              <span className="px-3 py-1 bg-slate-700 text-slate-200 text-xs font-bold rounded uppercase tracking-wider border border-slate-600">
                                 {course.field}
                              </span>
                           )}
                        </div>
                     </div>

                     {/* Right Side: Actions */}
                     <div className="flex items-center gap-4 reveal reveal-delay-100">
                        <button
                           onClick={handleAskAiAboutThisCourse}
                           className="px-6 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20"
                           title="Ask AI about this course"
                        >
                           <Bot size={20} /> Ask AI
                        </button>

                        <button
                           onClick={() => id && toggleSavedCourse(id)}
                           className={`px-6 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 ${isSavedCourse ? 'bg-white text-blue-600 shadow-lg' : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'}`}
                        >
                           {isSavedCourse ? <CheckCircle size={20} /> : <Bookmark size={20} className={isSavedCourse ? 'fill-current' : ''} />}
                           {isSavedCourse ? 'Saved' : 'Save'}
                        </button>

                        <button
                           onClick={() => {
                              if (!id) return;
                              const action = toggleCompareCourse(id);
                              if (action === 'limit') {
                                 alert('You can compare up to 3 courses only. Remove one from Tools → Comparison Matrix.');
                              }
                           }}
                           className={`px-6 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 ${isComparedCourse ? 'bg-white text-emerald-600 shadow-lg' : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'}`}
                        >
                           {isComparedCourse ? <CheckCircle size={20} /> : <GitCompare size={20} />}
                           {isComparedCourse ? 'Compared' : 'Compare'}
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

                  {/* 2. MODERN STATS CARD (like uploaded image) */}
                  <div className="w-full bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 -mt-12 mb-12 border border-slate-100 flex flex-col md:flex-row items-stretch text-center overflow-x-auto">
                     {/* Duration */}
                     <div className="flex-1 flex flex-col justify-center px-8 py-8 min-w-[220px] border-b md:border-b-0 md:border-r border-slate-100">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                           <Clock size={20} className="text-blue-500" /> Duration
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                              {formatDuration(course.duration)}
                        </div>
                     </div>
                     {/* Next Intake */}
                     <div className="flex-1 flex flex-col justify-center px-8 py-8 min-w-[220px]">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                           <Calendar size={20} className="text-amber-500" /> Next Intake
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
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
            

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

               {/* Main Content Column */}
               <div className="lg:col-span-2 space-y-10">

                  {/* Program Overview (like screenshot) */}
                  <section className="reveal bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                     <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {course.name || course.title}
                     </h2>
                     <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">
                        {typeof course.description === 'string' && course.description.trim() ? course.description.trim() : 'N/A'}
                     </p>

                     {typeof course.url === 'string' && course.url.trim() && (
                        <div className="mt-4">
                           <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={course.url}
                              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                           >
                              <Globe size={16} className="text-blue-600" />
                              <span className="truncate max-w-full">{toShortUrl(course.url)}</span>
                           </a>
                        </div>
                     )}
                  </section>

                  {/* Investment & Requirements (after description card) */}
                  <section className="reveal">
                     <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                              <DollarSign size={18} className="text-emerald-500" /> Investment
                           </div>
                           <div className="text-lg md:text-xl font-extrabold text-slate-900 break-words">
                              {investmentText}
                           </div>
                           {course?.fees && typeof course.fees === 'object' && renderFeesBreakdown(course.fees)}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                              <AlertCircle size={18} className="text-purple-500" /> Requirements
                           </div>
                           <div className={`font-extrabold text-slate-900 break-words ${requirementsClass}`}>
                              {requirementsText}
                           </div>
                        </div>

                        {isGovernmentCourse && (
                           <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                 <Building2 size={18} className="text-blue-600" /> Government Offerings
                              </div>

                              <div className="text-slate-700 text-sm">
                                 {governmentPrimaryAcademicYear ? (
                                    <div><span className="font-semibold">Academic year:</span> {governmentPrimaryAcademicYear}</div>
                                 ) : (
                                    <div className="text-slate-500">Academic year: N/A</div>
                                 )}
                                 {governmentProgramMeta?.medium ? (
                                    <div className="mt-1"><span className="font-semibold">Medium:</span> {governmentProgramMeta.medium}</div>
                                 ) : null}
                                 {typeof governmentProgramMeta?.aptitudeRequired === 'boolean' ? (
                                    <div className="mt-1"><span className="font-semibold">Aptitude test:</span> {governmentProgramMeta.aptitudeRequired ? 'Required' : 'Not required'}</div>
                                 ) : null}
                              </div>

                              {governmentOfferingsView.length === 0 ? (
                                 <div className="text-slate-500 mt-3">No government course offerings found for this program.</div>
                              ) : (
                                 <div className="mt-4 space-y-4">
                                    {governmentOfferingsView.map((o) => (
                                       <div key={o.universityId} className="border border-slate-100 rounded-xl p-4">
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                             <div className="font-bold text-slate-900">
                                                <Link
                                                   to={`/institutions/${o.universityId}`}
                                                   className="hover:underline"
                                                >
                                                   {o.universityName}
                                                </Link>
                                             </div>
                                             <div className="text-slate-600 text-sm">
                                                {typeof o.proposedIntake === 'number' ? (
                                                   <span><span className="font-semibold">Proposed intake:</span> {o.proposedIntake}</span>
                                                ) : (
                                                   <span>Proposed intake: N/A</span>
                                                )}
                                             </div>
                                          </div>

                                          <details className="mt-3">
                                             <summary className="cursor-pointer text-sm font-semibold text-blue-700 hover:text-blue-800">
                                                View cutoff marks by district
                                             </summary>
                                             {renderCutoffMarks(o.cutoffMarks)}
                                          </details>
                                       </div>
                                    ))}
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  </section>

                  {/* Related Courses (with duration, address, categories, read more) */}
                  <section className="reveal">
                     <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Courses</h2>
                     {relatedLoading ? (
                        <div className="text-slate-500">Loading related courses...</div>
                     ) : relatedCourses.length === 0 ? (
                        <div className="text-slate-500">No related courses found.</div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                           {relatedCourses.map((rc) => {
                                 const rcId = extractId((rc as any)?._id) ?? extractId((rc as any)?.id);
                              const categories: string[] = Array.isArray(rc?.specializations)
                                 ? rc.specializations.filter((v: any) => typeof v === 'string' && v.trim())
                                 : [];

                              return (
                                 <div
                                    key={rcId ?? String(rc?.name || rc?.title || Math.random())}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow"
                                 >
                                    <div className="flex items-start justify-between gap-4">
                                       <div>
                                          <div className="text-lg font-extrabold text-slate-900 leading-tight whitespace-normal break-words">
                                             {rc?.name || rc?.title || 'Untitled Course'}
                                          </div>
                                       </div>
                                    </div>

                                    <div className="mt-4 flex-1">
                                       <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Specializations</div>
                                       <div className="mt-2 flex flex-wrap gap-2">
                                          {categories.length > 0 ? (
                                             categories.slice(0, 4).map((cat) => (
                                                <span
                                                   key={cat}
                                                   className="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-600"
                                                >
                                                   {cat}
                                                </span>
                                             ))
                                          ) : (
                                             <span className="text-slate-500 text-sm">N/A</span>
                                          )}
                                       </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                       {rcId ? (
                                          <Link
                                             to={`/courses/${rcId}`}
                                             className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-black uppercase tracking-widest text-[11px]"
                                          >
                                             Read More
                                          </Link>
                                       ) : (
                                          <span className="inline-flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[11px]">
                                             Read More
                                          </span>
                                       )}

                                       {typeof rc?.url === 'string' && rc.url.trim() && (
                                          <a
                                             href={rc.url}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             title={rc.url}
                                             className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-500 hover:text-slate-700 max-w-[180px]"
                                          >
                                             <Globe size={14} className="shrink-0" />
                                             <span className="truncate">{toShortUrl(rc.url)}</span>
                                          </a>
                                       )}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     )}
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
                        {institutionWebsite && (
                           <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                              <Globe size={18} className="text-blue-600" />
                              <a href={institutionWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">
                                 {institutionWebsite}
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
                        {!(inst.location || inst.country || institutionWebsite || course.url) && (
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

                  {/* About Institution (placed below Contact Admissions as requested) */}
                  <section className="reveal reveal-delay-200">
                     <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Building2 className="text-blue-600" /> About {inst.name || 'Institution'}
                     </h2>
                     <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex justify-center">
                           {institutionImageUrl ? (
                              <img
                                 src={institutionImageUrl}
                                 alt={inst.name}
                                 className="w-24 h-24 rounded-3xl object-cover shadow-md border border-slate-100"
                                 onError={(e) => {
                                    e.currentTarget.src =
                                       'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=400&auto=format&fit=crop';
                                 }}
                              />
                           ) : (
                              <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black">
                                 N/A
                              </div>
                           )}
                        </div>

                        <div className="mt-4 flex justify-center">
                           <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl text-sm font-bold text-slate-700 border border-slate-100">
                              <Globe size={16} className="text-blue-500" />
                              {Array.isArray(inst.type) ? inst.type.join(', ') : inst.type || 'N/A'}
                           </div>
                        </div>

                        <p className="mt-4 text-slate-600 leading-relaxed text-center">
                           {inst.description || inst.overview || 'No overview available.'}
                        </p>

                        {inst._id && (
                           <Link
                              to={`/institutions/${inst._id}`}
                              className="mt-6 flex items-center justify-center w-full py-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold rounded-xl border border-slate-200 hover:border-blue-200 transition-all group"
                           >
                              Visit Official University Profile
                              <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                           </Link>
                        )}
                     </div>
                  </section>

               </div>
            </div>

         </div>

         {/* Apply Modal */}
         {showApplyModal && (
            <ApplyModal
               course={course}
               instName={institution?.name || 'Unknown Institution'}
               onClose={() => setShowApplyModal(false)}
            />
         )}

      </div>
   );
};

// Extracted Apply Modal Component
const ApplyModal = ({ course, instName, onClose }: { course: any, instName: string, onClose: () => void }) => {
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
         const courseId = String(course?._id || course?.id || '');
         const courseTitle = String(course?.name || course?.title || '');
         addApplication({
            id: Date.now().toString(),
            courseId,
            courseTitle,
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
                     <p className="text-slate-500 font-medium mt-1">for {course?.name || course?.title || 'this course'}</p>
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
