import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
   ActionIcon,
   Alert,
   Badge,
   Box,
   Button,
   Card,
   Collapse,
   Code,
   Divider,
   Group,
   Loader,
   Menu,
   Modal,
   MultiSelect,
   Select,
   SimpleGrid,
   Stack,
   Table,
   Text,
   TextInput,
   Textarea,
   Title,
   useMantineColorScheme,
} from '@mantine/core';
import { ExternalLink, Eye, Filter, MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { InstitutionsService } from '../types/services/InstitutionsService';
import { ProgramsService } from '../types/services/ProgramsService';
import type { Institution } from '../types/models/Institution';
import type { Program } from '../types/models/Program';
import { emitAdminDataChanged } from '../utils/adminEvents';

const DELIVERY_MODES = ['On-campus', 'Online', 'Hybrid', 'Distance'];

const GOVERNMENT_INSTITUTION_ID = 'GOV';

const COURSES_FILTER_DEBUG_VERSION = '2026-02-03-a';

const API_PAGE_LIMIT = 100;
const PROGRAMS_PAGE_LIMIT = 100;

const normalizeKey = (value: any) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const getErrorMessage = (err: any): string => {
   return err?.body?.message || err?.message || err?.statusText || 'Request failed';
};

const safeString = (value: any): string => (typeof value === 'string' ? value : value == null ? '' : String(value));

type GovernmentDegreeProgram = {
   _id: string;
   title: string;
   stream?: string;
   duration_years?: number;
   medium_of_instruction?: string[];
   al_requirements?: any;
   ol_requirements?: any;
   aptitude_test_required?: boolean;
};

type GovernmentDegreeProgramsPayload = {
   updatedAt?: string;
   degreePrograms?: GovernmentDegreeProgram[];
};

const getGovernmentDegreeProgramsPublicUrl = () => {
   const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
   const origin = typeof window !== 'undefined' ? window.location.origin : '';
   return `${origin}${basePath}government-degree-programs.json`;
};

type GovernmentInstitution = {
   _id: string;
   name: string;
};

type GovernmentInstitutionsPayload = {
   updatedAt?: string;
   institutions?: GovernmentInstitution[];
};

const getGovernmentInstitutionsPublicUrl = () => {
   const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
   const origin = typeof window !== 'undefined' ? window.location.origin : '';
   return `${origin}${basePath}government-institutions.json`;
};

const stripBom = (text: string) => (text && text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);

const formatDuration = (duration: any): string => {
   if (!duration || typeof duration !== 'object') return '—';
   const years = typeof duration.years === 'number' ? duration.years : undefined;
   const months = typeof duration.months === 'number' ? duration.months : undefined;
   const weeks = typeof duration.weeks === 'number' ? duration.weeks : undefined;
   const days = typeof duration.days === 'number' ? duration.days : undefined;

   const parts: string[] = [];
   if (years != null) parts.push(`${years} year${years === 1 ? '' : 's'}`);
   if (months != null) parts.push(`${months} month${months === 1 ? '' : 's'}`);
   if (weeks != null) parts.push(`${weeks} week${weeks === 1 ? '' : 's'}`);
   if (days != null) parts.push(`${days} day${days === 1 ? '' : 's'}`);
   return parts.length ? parts.join(' ') : '—';
};

const toIsoDate = (yyyyMmDd?: string) => {
   const raw = (yyyyMmDd || '').trim();
   if (!raw) return new Date().toISOString();
   const d = new Date(`${raw}T00:00:00.000Z`);
   return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
};

const isGovernmentProgram = (p: Program) => {
   const instKey = normalizeKey(safeString((p as any)?.institution_id));
   if (instKey && instKey === normalizeKey(GOVERNMENT_INSTITUTION_ID)) return true;
   const src = (p as any)?.extensions?.source;
   return typeof src === 'string' && src.toLowerCase().includes('government');
};

const parseJsonOrEmpty = (value: string, fieldName: string): Record<string, any> | undefined => {
   const t = value.trim();
   if (!t) return undefined;
   try {
      const parsed = JSON.parse(t);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
      throw new Error('not an object');
   } catch {
      throw new Error(`${fieldName} must be valid JSON object. Example: {"years": 4}`);
   }
};

const parseListOrJsonArray = (value: string, fieldName: string): any[] | undefined => {
   const t = value.trim();
   if (!t) return undefined;
   if (t.startsWith('[')) {
      try {
         const parsed = JSON.parse(t);
         if (Array.isArray(parsed)) return parsed;
         throw new Error('not array');
      } catch {
         throw new Error(`${fieldName} must be a JSON array or newline list.`);
      }
   }
   const lines = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
   return lines.length ? lines : undefined;
};

const Courses: React.FC = () => {
   const { colorScheme } = useMantineColorScheme();
   const isDark = colorScheme === 'dark';
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();

   const [programs, setPrograms] = useState<Program[]>([]);
   const [governmentPrograms, setGovernmentPrograms] = useState<Program[]>([]);
   const [governmentLoadError, setGovernmentLoadError] = useState<string | null>(null);
   const [governmentInstitutions, setGovernmentInstitutions] = useState<GovernmentInstitution[]>([]);
   const [institutions, setInstitutions] = useState<Institution[]>([]);

   const [loading, setLoading] = useState(false);
   const [loadError, setLoadError] = useState<string | null>(null);
   const [filtersOpen, setFiltersOpen] = useState(false);
   const [refreshTick, setRefreshTick] = useState(0);

   const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
   const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
   const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null);
   const [sourceFilter, setSourceFilter] = useState<'all' | 'private' | 'government'>('all');
   const [availableLevels, setAvailableLevels] = useState<string[]>([]);

   const selectedLevelKeySet = useMemo(() => {
      return new Set(selectedLevels.map((v) => normalizeKey(v)).filter(Boolean));
   }, [selectedLevels]);

   // SourceFilter is the single source of truth for visibility.
   const showPrivate = sourceFilter === 'all' || sourceFilter === 'private';
   const showGovernment = sourceFilter === 'all' || sourceFilter === 'government';

   const institutionMap = useMemo(() => {
      const m = new Map<string, Institution>();
      for (const i of institutions) m.set(i._id, i);
      return m;
   }, [institutions]);

   const privateInstitutionKeySet = useMemo(() => {
      const s = new Set<string>();
      for (const i of institutions) {
         if (i?._id) s.add(normalizeKey(i._id));
         const code = (i as any)?.institution_code;
         if (code) s.add(normalizeKey(code));
      }
      return s;
   }, [institutions]);

   const isPrivateProgramLocal = useCallback(
      (p: Program) => {
         const instKey = normalizeKey(safeString((p as any)?.institution_id));
         return !!instKey && privateInstitutionKeySet.has(instKey);
      },
      [privateInstitutionKeySet]
   );

   const governmentInstitutionKeySet = useMemo(() => {
      const s = new Set<string>();
      for (const g of governmentInstitutions) s.add(normalizeKey(g._id));
      return s;
   }, [governmentInstitutions]);

   // Government programs can come from the public JSON list (institution_id === GOV),
   // and some may exist in the API (institution_id matches a known government institution).
   const isGovernmentProgramLocal = useCallback(
      (p: Program) => {
         if (isGovernmentProgram(p)) return true;
         const instKey = normalizeKey(safeString((p as any).institution_id));
         return !!instKey && governmentInstitutionKeySet.has(instKey);
      },
      [governmentInstitutionKeySet]
   );

   const isGovernmentInstitutionSelected = useMemo(() => {
      if (!selectedInstitutionId) return false;
      return selectedInstitutionId === GOVERNMENT_INSTITUTION_ID || governmentInstitutionKeySet.has(normalizeKey(selectedInstitutionId));
   }, [selectedInstitutionId, governmentInstitutionKeySet]);

   const selectedPrivateInstitution = useMemo(() => {
      if (!selectedInstitutionId) return null;
      if (isGovernmentInstitutionSelected) return null;
      return institutions.find((i) => i._id === selectedInstitutionId) || null;
   }, [institutions, selectedInstitutionId, isGovernmentInstitutionSelected]);

   const selectedPrivateInstitutionMatchKeys = useMemo(() => {
      if (!selectedInstitutionId) return [] as string[];
      if (isGovernmentInstitutionSelected) return [] as string[];
      const keys = [selectedInstitutionId];
      const code = selectedPrivateInstitution?.institution_code;
      if (code) keys.push(code);
      const name = selectedPrivateInstitution?.name;
      if (name) keys.push(name);
      return Array.from(new Set(keys.map((k) => normalizeKey(k)).filter(Boolean)));
   }, [selectedInstitutionId, isGovernmentInstitutionSelected, selectedPrivateInstitution]);

   const [modalOpen, setModalOpen] = useState(false);
   const [editId, setEditId] = useState<string | null>(null);
   const [formError, setFormError] = useState<string | null>(null);
   const [form, setForm] = useState({
      institution_id: '',
      name: '',
      program_code: '',
      description: '',
      level: '',
      duration_json: '',
      delivery_mode: [] as string[],
      fees_json: '',
      eligibility_json: '',
      curriculum_summary: '',
      specializations_text: '',
      url: '',
      extensions_json: '',
   });

   useEffect(() => {
      const query = searchParams.get('search');
      if (query !== null) setSearchTerm(query);
   }, [searchParams]);

   useEffect(() => {
      if (sourceFilter === 'private') {
         if (selectedInstitutionId && isGovernmentInstitutionSelected) setSelectedInstitutionId(null);
         return;
      }

      if (sourceFilter === 'government') {
         if (selectedInstitutionId && !isGovernmentInstitutionSelected) setSelectedInstitutionId(null);
      }
   }, [sourceFilter, selectedInstitutionId, isGovernmentInstitutionSelected]);

   useEffect(() => {
      let cancelled = false;
      (async () => {
         try {
            const all: Institution[] = [];
            let page = 1;
            let totalPages = 1;
            const maxPages = 50;

            while (page <= totalPages && page <= maxPages) {
               const res = await InstitutionsService.listInstitutions(page, API_PAGE_LIMIT, undefined, undefined, 'name:asc');
               const data = res.data || [];
               all.push(...data);

               const nextTotalPages = res.pagination?.total_pages;
               if (typeof nextTotalPages === 'number' && Number.isFinite(nextTotalPages) && nextTotalPages > 0) {
                  totalPages = nextTotalPages;
               } else {
                  if (data.length < API_PAGE_LIMIT) break;
               }

               page += 1;
            }

            if (!cancelled) setInstitutions(all);
         } catch {
            if (!cancelled) setInstitutions([]);
         }
      })();

      fetch(getGovernmentInstitutionsPublicUrl(), { cache: 'no-store' })
         .then(async (r) => {
            if (!r.ok) throw new Error(`Failed to load government universities (${r.status})`);
            const text = await r.text();
            return JSON.parse(stripBom(text)) as GovernmentInstitutionsPayload;
         })
         .then((payload) => {
            if (cancelled) return;
            const list = Array.isArray(payload.institutions) ? payload.institutions : [];
            const mapped = list
               .filter((g) => g && typeof g._id === 'string' && typeof g.name === 'string')
               .map((g) => ({ _id: g._id, name: g.name }));
            setGovernmentInstitutions(mapped);
         })
         .catch(() => {
            if (cancelled) return;
            setGovernmentInstitutions([]);
         });

      setGovernmentLoadError(null);
      const govUrl = getGovernmentDegreeProgramsPublicUrl();
      fetch(govUrl, { cache: 'no-store' })
         .then(async (r) => {
            if (!r.ok) throw new Error(`Failed to load government courses (${r.status})`);
            const text = await r.text();
            return JSON.parse(stripBom(text)) as GovernmentDegreeProgramsPayload;
         })
         .then((payload) => {
            if (cancelled) return;
            const updatedAtIso = toIsoDate(payload.updatedAt);
            const list = Array.isArray(payload.degreePrograms) ? payload.degreePrograms : [];
            const mapped = list
               .filter((d) => d && typeof d._id === 'string' && typeof d.title === 'string')
               .map((d): Program => ({
                  _id: d._id,
                  institution_id: GOVERNMENT_INSTITUTION_ID,
                  name: d.title,
                  program_code: d._id,
                  description: undefined,
                  level: 'Bachelor' as any,
                  duration: typeof d.duration_years === 'number' ? { years: d.duration_years } : undefined,
                  delivery_mode: ['On-campus'] as any,
                  fees: undefined,
                  eligibility: undefined,
                  curriculum_summary: undefined,
                  specializations: d.stream ? [d.stream] : undefined,
                  url: undefined,
                  extensions: {
                     source: 'Government',
                     stream: d.stream,
                     medium_of_instruction: d.medium_of_instruction,
                     al_requirements: d.al_requirements,
                     ol_requirements: d.ol_requirements,
                     aptitude_test_required: d.aptitude_test_required,
                  },
                  confidence_score: 1,
                  created_at: updatedAtIso,
                  updated_at: updatedAtIso,
               }));
            setGovernmentPrograms(mapped);
         })
         .catch((err: any) => {
            if (cancelled) return;
            setGovernmentPrograms([]);
            setGovernmentLoadError(err?.message || 'Failed to load government courses');
         });

      ProgramsService.getProgramDistinctValues('level')
         .then((res) => {
            if (cancelled) return;
            setAvailableLevels((res.values || []).filter(Boolean));
         })
         .catch(() => {
            if (cancelled) return;
            setAvailableLevels([]);
         });

      return () => {
         cancelled = true;
      };
   }, [refreshTick]);

   useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setLoadError(null);

      if (!showPrivate) {
         setPrograms([]);
         setLoading(false);
         return () => {
            cancelled = true;
         };
      }

      const nameFilter = searchTerm.trim() ? searchTerm.trim() : undefined;
      // API supports one level; if multiple selected we will filter client-side.
      // Only send the level to the API if it's a known backend level; otherwise
      // fetch broadly and filter client-side (prevents empty results when backend
      // isn't available to populate distinct levels).
      const apiLevel =
         selectedLevels.length === 1 && availableLevels.includes(selectedLevels[0])
         ? selectedLevels[0]
         : undefined;

      const fetchPaged = async (institutionKey?: string) => {
         const all: Program[] = [];
         let page = 1;
         let totalPages = 1;
         const maxPages = 50;

         while (page <= totalPages && page <= maxPages) {
            const res = await ProgramsService.listPrograms(
               page,
               PROGRAMS_PAGE_LIMIT,
               institutionKey,
               nameFilter,
               apiLevel,
               undefined,
               undefined,
               undefined,
               undefined,
               'name:asc'
            );
            const data = res.data || [];
            all.push(...data);

            const nextTotalPages = res.pagination?.total_pages;
            if (typeof nextTotalPages === 'number' && Number.isFinite(nextTotalPages) && nextTotalPages > 0) {
               totalPages = nextTotalPages;
            } else {
               if (data.length < PROGRAMS_PAGE_LIMIT) break;
            }

            page += 1;
         }

         return all;
      };

      (async () => {
         try {
            // If a private institution is selected, try filtering by _id first.
            // If that yields no results and a code exists, try filtering by institution_code.
            // If both yield no results, fall back to fetching all programs and filtering client-side.
            const isGovSelected = !!(selectedInstitutionId && isGovernmentInstitutionSelected);
            if (selectedInstitutionId && !isGovSelected) {
               const byId = await fetchPaged(selectedInstitutionId);
               if (cancelled) return;
               if (byId.length > 0) {
                  setPrograms(byId);
               } else {
                  const code = selectedPrivateInstitution?.institution_code;
                  if (code) {
                     const byCode = await fetchPaged(code);
                     if (cancelled) return;
                     if (byCode.length > 0) {
                        setPrograms(byCode);
                     } else {
                        const all = await fetchPaged(undefined);
                        if (cancelled) return;
                        setPrograms(all);
                     }
                  } else {
                     const all = await fetchPaged(undefined);
                     if (cancelled) return;
                     setPrograms(all);
                  }
               }
            } else {
               const all = await fetchPaged(undefined);
               if (cancelled) return;
               setPrograms(all);
            }
         } catch (err: any) {
            if (cancelled) return;
            setLoadError(getErrorMessage(err));
            setPrograms([]);
         } finally {
            if (cancelled) return;
            setLoading(false);
         }
      })();

      return () => {
         cancelled = true;
      };
   }, [searchTerm, selectedLevels, selectedInstitutionId, refreshTick, showPrivate, isGovernmentInstitutionSelected, selectedPrivateInstitution]);

   const filteredPrograms = useMemo(() => {
      const levelOk = (p: Program) => {
         if (selectedLevelKeySet.size === 0) return true;
         const levelKey = normalizeKey(safeString((p as any).level));
         return selectedLevelKeySet.has(levelKey);
      };
      const searchOk = (p: Program) => {
         const q = searchTerm.trim().toLowerCase();
         if (!q) return true;
         const hay = `${safeString(p.name)} ${safeString((p as any).program_code)} ${safeString((p as any)?.extensions?.stream)} ${safeString(p._id)}`.toLowerCase();
         return hay.includes(q);
      };

      const institutionOk = (p: Program) => {
         if (!selectedInstitutionId) return true;
         if (isGovernmentInstitutionSelected) return isGovernmentProgramLocal(p);
         if (selectedPrivateInstitutionMatchKeys.length === 0) return p.institution_id === selectedInstitutionId;
         const instKey = normalizeKey(p.institution_id);
         return selectedPrivateInstitutionMatchKeys.includes(instKey);
      };

      const merged: Program[] = [];
      // When the API contains government programs (institution_id matches a known government institution),
      // keep them out of "Private only" and show them under "Government only".
      if (showPrivate) {
         // Strict rule: only show API programs that belong to known private institutions.
         // This guarantees "Private only" never includes government/unknown courses.
         const hasPrivateIndex = privateInstitutionKeySet.size > 0;
         merged.push(
            ...programs.filter((p) => (hasPrivateIndex ? isPrivateProgramLocal(p) : !isGovernmentProgramLocal(p)))
         );
      }
      if (showGovernment) merged.push(...programs.filter((p) => isGovernmentProgramLocal(p)), ...governmentPrograms);

      return merged
         .filter((p) => institutionOk(p) && levelOk(p) && searchOk(p))
         .sort((a, b) => a.name.localeCompare(b.name));
   }, [
      programs,
      governmentPrograms,
      selectedLevels,
      selectedLevelKeySet,
      showPrivate,
      showGovernment,
      selectedInstitutionId,
      searchTerm,
      governmentInstitutionKeySet,
      selectedPrivateInstitutionMatchKeys,
      isGovernmentInstitutionSelected,
      isGovernmentProgramLocal,
      isPrivateProgramLocal,
      privateInstitutionKeySet,
   ]);

   const toggleLevel = (lvl: string) => {
      setSelectedLevels((prev) => (prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]));
   };

   const openEdit = (p: Program) => {
      if (isGovernmentProgramLocal(p)) {
         alert('Government courses are read-only here.');
         return;
      }
      setEditId(p._id);
      setFormError(null);
      setForm({
         institution_id: p.institution_id,
         name: p.name,
         program_code: safeString((p as any).program_code),
         description: safeString((p as any).description),
         level: safeString((p as any).level),
         duration_json: p.duration ? JSON.stringify(p.duration, null, 2) : '',
         delivery_mode: Array.isArray((p as any).delivery_mode) ? (p as any).delivery_mode : [],
         fees_json: p.fees ? JSON.stringify(p.fees, null, 2) : '',
         eligibility_json: p.eligibility ? JSON.stringify(p.eligibility, null, 2) : '',
         curriculum_summary: safeString((p as any).curriculum_summary),
         specializations_text: Array.isArray((p as any).specializations) ? (p as any).specializations.join('\n') : '',
         url: safeString((p as any).url),
         extensions_json: (p as any).extensions ? JSON.stringify((p as any).extensions, null, 2) : '',
      });
      setModalOpen(true);
   };

   const handleDelete = (id: string) => {
      const target = filteredPrograms.find((p) => p._id === id);
      if (target && isGovernmentProgramLocal(target)) {
         alert('Government courses are read-only here.');
         return;
      }
      if (!confirm('Delete this course/program?')) return;
      ProgramsService.deleteProgram(id)
         .then(() => {
            setPrograms((prev) => prev.filter((p) => p._id !== id));
            emitAdminDataChanged('courses');
         })
         .catch((err: any) => {
            alert(getErrorMessage(err));
         });
   };

   const handleSave = () => {
      const name = form.name.trim();
      const institution_id = form.institution_id;
      if (!name || !institution_id) {
         setFormError('Name and Institution are required.');
         return;
      }
      setFormError(null);

      let duration: Record<string, any> | undefined;
      let fees: Record<string, any> | undefined;
      let eligibility: Record<string, any> | undefined;
      let extensions: Record<string, any> | undefined;
      try {
         duration = parseJsonOrEmpty(form.duration_json, 'Duration');
         fees = parseJsonOrEmpty(form.fees_json, 'Fees');
         eligibility = parseJsonOrEmpty(form.eligibility_json, 'Eligibility');
         extensions = parseJsonOrEmpty(form.extensions_json, 'Extensions');
      } catch (e: any) {
         setFormError(e?.message || 'Invalid JSON');
         return;
      }

      let specializations: any[] | undefined;
      try {
         specializations = parseListOrJsonArray(form.specializations_text, 'Specializations');
      } catch (e: any) {
         setFormError(e?.message || 'Invalid specializations');
         return;
      }

      const payload: any = {
         institution_id,
         name,
         program_code: form.program_code.trim() || undefined,
         description: form.description.trim() || undefined,
         level: form.level || undefined,
         duration,
         delivery_mode: form.delivery_mode.length ? form.delivery_mode : undefined,
         fees,
         eligibility,
         curriculum_summary: form.curriculum_summary.trim() || undefined,
         specializations: specializations as any,
         url: form.url.trim() || undefined,
         extensions,
      };

      const req = editId ? ProgramsService.updateProgram(editId, payload) : ProgramsService.createProgram(payload);
      req
         .then((saved) => {
            if (editId) {
               setPrograms((prev) => prev.map((p) => (p._id === editId ? saved : p)));
            } else {
               setPrograms((prev) => [saved, ...prev]);
            }
            emitAdminDataChanged('courses');
            setModalOpen(false);
         })
         .catch((err: any) => {
            setFormError(getErrorMessage(err));
         });
   };

   const apiGovernmentCount = useMemo(() => programs.filter((p) => isGovernmentProgramLocal(p)).length, [programs, isGovernmentProgramLocal]);
   const apiPrivateCount = useMemo(() => programs.length - apiGovernmentCount, [programs.length, apiGovernmentCount]);
   const totalLoaded = (showPrivate ? apiPrivateCount : 0) + (showGovernment ? apiGovernmentCount + governmentPrograms.length : 0);

   const institutionFilterOptions = useMemo(() => {
      if (sourceFilter === 'government') {
         // Government degree programs are not mapped to specific institutions in the dataset,
         // so only support filtering as "All Government".
         return [{ value: GOVERNMENT_INSTITUTION_ID, label: 'All Government (UGC)' }];
      }
      if (sourceFilter === 'private') {
         return institutions.map((i) => ({ value: i._id, label: i.name }));
      }

      // All: show both groups
      return [
         {
            group: 'Government',
            items: [{ value: GOVERNMENT_INSTITUTION_ID, label: 'All Government (UGC)' }],
         },
         {
            group: 'Private',
            items: institutions.map((i) => ({ value: i._id, label: i.name })),
         },
      ] as any;
   }, [institutions, sourceFilter]);

   return (
      <Stack>
         <Group justify="space-between">
            <Box>
               <Title order={2}>Courses</Title>
               <Text c="dimmed" size="sm">Manage degree programs and requirements.</Text>
             
            </Box>
            <Group>
               <Button
                  variant={filtersOpen ? 'filled' : 'default'}
                  leftSection={<Filter size={16} />}
                  onClick={() => setFiltersOpen((v) => !v)}
               >
                  Filters
               </Button>
               <Button leftSection={<Plus size={16} />} onClick={() => navigate('/admin/courses/new')}>New Course</Button>
            </Group>
         </Group>

         <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            {[
               { label: 'Total', val: totalLoaded },
               { label: 'Private', val: showPrivate ? apiPrivateCount : 0 },
               { label: 'Government', val: showGovernment ? apiGovernmentCount + governmentPrograms.length : 0 },
               { label: 'Showing', val: filteredPrograms.length },
            ].map((stat, i) => (
               <Card key={i} withBorder padding="md" radius="md">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">{stat.label}</Text>
                  <Text size="xl" fw={700}>{stat.val}</Text>
               </Card>
            ))}
         </SimpleGrid>

         <Card withBorder radius="md" padding="0" mt="md">
            <Group p="md" justify="space-between" wrap="wrap">
               <Group wrap="wrap" gap="sm">
                  <TextInput
                     placeholder="Search..."
                     leftSection={<Search size={16} />}
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     w={320}
                  />

                  <Select
                     placeholder="University Type"
                     value={sourceFilter}
                     onChange={(v) => {
                        const next = (((v as any) || 'all') as any) as 'all' | 'private' | 'government';
                        setSourceFilter(next);

                        // If user switches source, clear incompatible institution filter immediately
                        // (avoids a confusing empty table until effects run).
                        if (next === 'private') {
                           if (selectedInstitutionId && isGovernmentInstitutionSelected) setSelectedInstitutionId(null);
                        }
                        if (next === 'government') {
                           if (selectedInstitutionId && !isGovernmentInstitutionSelected) {
                              setSelectedInstitutionId(GOVERNMENT_INSTITUTION_ID);
                           }
                        }
                     }}
                     data={[
                        { value: 'all', label: 'All' },
                        { value: 'private', label: 'Private only' },
                        { value: 'government', label: 'Government only' },
                     ]}
                     w={220}
                     size="xs"
                  />

                  <Select
                     placeholder="Institution"
                     data={institutionFilterOptions}
                     value={selectedInstitutionId}
                     onChange={(val) => {
                        setSelectedInstitutionId(val);
                        if (!val) return;
                        if (val === GOVERNMENT_INSTITUTION_ID || governmentInstitutionKeySet.has(normalizeKey(val))) {
                           setSourceFilter('government');
                           return;
                        }
                        setSourceFilter('private');
                     }}
                     clearable
                     searchable
                     w={320}
                  />
               </Group>

               <Group gap="xs" wrap="wrap">
                  <Button variant="default" size="xs" onClick={() => setRefreshTick((t) => t + 1)}>
                     Refresh
                  </Button>
               </Group>
            </Group>

            <Collapse in={filtersOpen}>
               <Box px="md" pb="md">
                  <Card withBorder radius="md" p="md">
                     <Stack gap="sm">
                        <Group gap="md" justify="space-between" wrap="wrap">
                           <Text size="sm" c="dimmed">
                              Use “University Type” above to switch between Private/Government.
                           </Text>

                           <MultiSelect
                              label="Level"
                              placeholder="All"
                              data={(availableLevels.length ? availableLevels : ['Certificate', 'Diploma', 'Bachelor', 'Master', 'Doctorate', 'Postgraduate']).map((v) => ({ value: v, label: v }))}
                              value={selectedLevels}
                              onChange={(val) => setSelectedLevels(val)}
                              searchable
                              clearable
                              w={360}
                           />
                        </Group>
                     </Stack>
                  </Card>
               </Box>
            </Collapse>

            {loadError ? (
               <Box px="md" pb="md">
                  <Alert color="red" title="Unable to load courses" withCloseButton onClose={() => setLoadError(null)}>
                     <Stack gap={6}>
                        <Text size="sm">{loadError}</Text>
                        <Group justify="flex-end" gap="xs">
                           <Button size="xs" variant="default" onClick={() => setRefreshTick((t) => t + 1)}>
                              Retry
                           </Button>
                        </Group>
                     </Stack>
                  </Alert>
               </Box>
            ) : null}

            {showGovernment && governmentLoadError ? (
               <Box px="md" pb="md">
                  <Alert color="yellow" title="Government courses not loaded" withCloseButton onClose={() => setGovernmentLoadError(null)}>
                     <Stack gap={6}>
                        <Text size="sm">{governmentLoadError}</Text>
                        <Text size="sm" c="dimmed">
                           Expected file: <Code>{getGovernmentDegreeProgramsPublicUrl()}</Code>
                        </Text>
                     </Stack>
                  </Alert>
               </Box>
            ) : null}

            <Table>
               <Table.Thead bg={isDark ? 'dark.6' : 'gray.0'}>
                  <Table.Tr>
                     <Table.Th>Course</Table.Th>
                     <Table.Th>Level</Table.Th>
                     <Table.Th>Source</Table.Th>
                     <Table.Th style={{ textAlign: 'right' }}>Action</Table.Th>
                  </Table.Tr>
               </Table.Thead>
               <Table.Tbody>
                  {loading ? (
                     <Table.Tr>
                        <Table.Td colSpan={4} align="center" py="xl">
                           <Group justify="center" gap="xs">
                              <Loader size="sm" />
                              <Text c="dimmed" size="sm">Loading courses…</Text>
                           </Group>
                        </Table.Td>
                     </Table.Tr>
                  ) : filteredPrograms.length === 0 ? (
                     <Table.Tr>
                        <Table.Td colSpan={4} align="center" py="xl" c="dimmed">
                           No courses found
                        </Table.Td>
                     </Table.Tr>
                  ) : (
                     filteredPrograms.map((p) => {
                        const gov = isGovernmentProgramLocal(p);
                        const level = safeString((p as any).level) || '—';
                        const url = safeString((p as any).url) || '';
                        return (
                           <Table.Tr key={p._id}>
                              <Table.Td>
                                 <Text fw={600} size="sm" lineClamp={2}>{p.name}</Text>
                              </Table.Td>
                              <Table.Td>
                                 <Badge variant="light" color="blue">{level}</Badge>
                              </Table.Td>
                              <Table.Td>
                                 <Badge size="sm" variant={gov ? 'light' : 'outline'} color={gov ? 'gray' : 'blue'}>
                                    {gov ? 'Government' : 'Private'}
                                 </Badge>
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right' }}>
                                 <Menu position="bottom-end">
                                    <Menu.Target>
                                       <ActionIcon variant="subtle" color="gray" aria-label="Actions">
                                          <MoreVertical size={16} />
                                       </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                       <Menu.Item leftSection={<Eye size={14} />} onClick={() => navigate(`/admin/courses/${p._id}`)}>
                                          View details
                                       </Menu.Item>
                                       <Menu.Divider />
                                       <Menu.Item
                                          leftSection={<ExternalLink size={14} />}
                                          disabled={!url}
                                          component={url ? 'a' : 'button'}
                                          href={url || undefined}
                                          target={url ? '_blank' : undefined}
                                          rel={url ? 'noreferrer' : undefined}
                                       >
                                          Open link
                                       </Menu.Item>
                                       <Menu.Item leftSection={<Pencil size={14} />} disabled={gov} onClick={() => openEdit(p)}>
                                          Edit
                                       </Menu.Item>
                                       <Menu.Item leftSection={<Trash2 size={14} />} color="red" disabled={gov} onClick={() => handleDelete(p._id)}>
                                          Delete
                                       </Menu.Item>
                                    </Menu.Dropdown>
                                 </Menu>
                              </Table.Td>
                           </Table.Tr>
                        );
                     })
                  )}
               </Table.Tbody>
            </Table>
         </Card>

         <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Edit Course" size="lg">
            <Stack>
               {formError ? (
                  <Alert color="red" title="Can't save" withCloseButton onClose={() => setFormError(null)}>
                     <Text size="sm">{formError}</Text>
                  </Alert>
               ) : null}

               <Select
                  label="Institution"
                  required
                  searchable
                  data={institutions.map((i) => ({ value: i._id, label: i.name }))}
                  value={form.institution_id}
                  onChange={(val) => setForm((p) => ({ ...p, institution_id: val || '' }))}
               />

               <TextInput label="Course/Program Name" required placeholder="BSc..." value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />

               <Group grow>
                  <Select
                     label="Level"
                     data={(availableLevels.length ? availableLevels : ['Certificate','Diploma','Bachelor','Master','Doctorate','Postgraduate']).map((v) => ({ value: v, label: v }))}
                     value={form.level || null}
                     onChange={(val) => setForm((p) => ({ ...p, level: val || '' }))}
                     clearable
                  />
               </Group>

               <TextInput label="Program Code" value={form.program_code} onChange={(e) => setForm((p) => ({ ...p, program_code: e.target.value }))} />
               <Textarea label="Description" minRows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />

               <MultiSelect
                  label="Delivery Mode"
                  data={DELIVERY_MODES}
                  value={form.delivery_mode}
                  onChange={(val) => setForm((p) => ({ ...p, delivery_mode: val }))}
                  searchable
                  clearable
               />

               <Textarea label="Specializations (one per line or JSON array)" minRows={3} value={form.specializations_text} onChange={(e) => setForm((p) => ({ ...p, specializations_text: e.target.value }))} />

               <TextInput label="URL" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} />
               <Textarea label="Curriculum Summary" minRows={3} value={form.curriculum_summary} onChange={(e) => setForm((p) => ({ ...p, curriculum_summary: e.target.value }))} />

               <Divider my="xs" label="JSON Fields" />
               <Textarea label="Duration (JSON object)" minRows={3} placeholder='{"years": 4}' value={form.duration_json} onChange={(e) => setForm((p) => ({ ...p, duration_json: e.target.value }))} />
               <Textarea label="Fees (JSON object)" minRows={3} placeholder='{"total": 2500000, "currency": "LKR"}' value={form.fees_json} onChange={(e) => setForm((p) => ({ ...p, fees_json: e.target.value }))} />
               <Textarea label="Eligibility (JSON object)" minRows={3} placeholder='{"subjects": ["Maths", "Physics"]}' value={form.eligibility_json} onChange={(e) => setForm((p) => ({ ...p, eligibility_json: e.target.value }))} />
               <Textarea label="Extensions (JSON object)" minRows={3} value={form.extensions_json} onChange={(e) => setForm((p) => ({ ...p, extensions_json: e.target.value }))} />

               <Group justify="flex-end" mt="xs">
                  <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Update Course</Button>
               </Group>
            </Stack>
         </Modal>
      </Stack>
   );
};

export default Courses;