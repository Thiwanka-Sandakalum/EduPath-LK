import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
   ActionIcon,
   Alert,
   Badge,
   Box,
   Button,
   Card,
   Checkbox,
   Collapse,
   Divider,
   Grid,
   Group,
   Loader,
   Modal,
   MultiSelect,
   NumberInput,
   RangeSlider,
   Select,
   Stack,
   Text,
   TextInput,
   Textarea,
   ThemeIcon,
   Title,
   useMantineColorScheme,
} from '@mantine/core';
import { Award, DollarSign, ExternalLink, Filter, GraduationCap, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { InstitutionsService } from '../types/services/InstitutionsService';
import { ProgramsService } from '../types/services/ProgramsService';
import type { Institution } from '../types/models/Institution';
import type { Program } from '../types/models/Program';
import { emitAdminDataChanged } from '../utils/adminEvents';

const DELIVERY_MODES = ['On-campus', 'Online', 'Hybrid', 'Distance'];

const GOVERNMENT_INSTITUTION_FILTER_VALUE = '__GOV__';
const GOVERNMENT_INSTITUTION_ID = 'GOV';

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

const stripBom = (text: string) => (text && text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);

const toIsoDate = (yyyyMmDd?: string) => {
   const raw = (yyyyMmDd || '').trim();
   if (!raw) return new Date().toISOString();
   const d = new Date(`${raw}T00:00:00.000Z`);
   return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
};

const isGovernmentProgram = (p: Program) => {
   if (p.institution_id === GOVERNMENT_INSTITUTION_ID) return true;
   const src = (p as any)?.extensions?.source;
   return typeof src === 'string' && src.toLowerCase().includes('government');
};

const formatFees = (fees: any): string => {
   if (!fees) return '—';
   if (typeof fees === 'string' || typeof fees === 'number') return String(fees);
   if (Array.isArray(fees)) return fees.filter(Boolean).join(', ') || '—';
   if (typeof fees === 'object') {
      const keys = Object.keys(fees);
      if (keys.length === 0) return '—';
      // Prefer common keys if present
      const preferred = ['total', 'annual', 'per_year', 'per_semester', 'semester', 'lkr', 'usd'];
      for (const k of preferred) {
         if (fees[k] != null) return `${k}: ${String(fees[k])}`;
      }
      return keys.slice(0, 3).map((k) => `${k}: ${String(fees[k])}`).join(', ');
   }
   return '—';
};

const extractNumericFee = (fees: any): number | null => {
   const seen = new Set<any>();
   const walk = (v: any): number[] => {
      if (v == null) return [];
      if (typeof v === 'number' && Number.isFinite(v)) return [v];
      if (typeof v === 'string') {
         const m = v.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/g);
         if (!m) return [];
         return m.map((x) => Number(x)).filter((n) => Number.isFinite(n));
      }
      if (typeof v !== 'object') return [];
      if (seen.has(v)) return [];
      seen.add(v);
      if (Array.isArray(v)) return v.flatMap(walk);
      return Object.values(v).flatMap(walk);
   };
   const nums = walk(fees).filter((n) => n > 0);
   if (nums.length === 0) return null;
   return Math.min(...nums);
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

   const [programs, setPrograms] = useState<Program[]>([]);
   const [governmentPrograms, setGovernmentPrograms] = useState<Program[]>([]);
   const [governmentLoadError, setGovernmentLoadError] = useState<string | null>(null);
   const [institutions, setInstitutions] = useState<Institution[]>([]);
   const institutionMap = useMemo(() => {
      const m = new Map<string, Institution>();
      for (const i of institutions) m.set(i._id, i);
      return m;
   }, [institutions]);

   const [loading, setLoading] = useState(false);
   const [loadError, setLoadError] = useState<string | null>(null);
   const [filtersOpen, setFiltersOpen] = useState(false);
   const [refreshTick, setRefreshTick] = useState(0);

   const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
   const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
   const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null);
   const [includePrivate, setIncludePrivate] = useState(true);
   const [includeGovernment, setIncludeGovernment] = useState(true);
   const [sourceFilter, setSourceFilter] = useState<'all' | 'private' | 'government'>('all');
   const [maxFee, setMaxFee] = useState(2500000);
   const [availableLevels, setAvailableLevels] = useState<string[]>([]);

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
      confidence_score: 0.5,
      extensions_json: '',
   });

   useEffect(() => {
      const query = searchParams.get('search');
      if (query !== null) setSearchTerm(query);
   }, [searchParams]);

   useEffect(() => {
      if (sourceFilter === 'all') {
         setIncludePrivate(true);
         setIncludeGovernment(true);
         return;
      }

      if (sourceFilter === 'private') {
         setIncludePrivate(true);
         setIncludeGovernment(false);
         if (selectedInstitutionId === GOVERNMENT_INSTITUTION_FILTER_VALUE) setSelectedInstitutionId(null);
         return;
      }

      setIncludePrivate(false);
      setIncludeGovernment(true);
      if (selectedInstitutionId && selectedInstitutionId !== GOVERNMENT_INSTITUTION_FILTER_VALUE) {
         setSelectedInstitutionId(GOVERNMENT_INSTITUTION_FILTER_VALUE);
      }
   }, [sourceFilter, selectedInstitutionId]);

   useEffect(() => {
      let cancelled = false;
      InstitutionsService.listInstitutions(1, 1000, undefined, undefined, 'name:asc')
         .then((res) => {
            if (cancelled) return;
            setInstitutions(res.data || []);
         })
         .catch(() => {
            if (cancelled) return;
            setInstitutions([]);
         });

      setGovernmentLoadError(null);
      fetch('/government-degree-programs.json', { cache: 'no-store' })
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
   }, []);

   useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setLoadError(null);

      if (!includePrivate) {
         setPrograms([]);
         setLoading(false);
         return () => {
            cancelled = true;
         };
      }

      const nameFilter = searchTerm.trim() ? searchTerm.trim() : undefined;
      // API supports one level; if multiple selected we will filter client-side.
      const apiLevel = selectedLevels.length === 1 ? selectedLevels[0] : undefined;

      const apiInstitutionId = selectedInstitutionId && selectedInstitutionId !== GOVERNMENT_INSTITUTION_FILTER_VALUE
         ? selectedInstitutionId
         : undefined;

      ProgramsService.listPrograms(
         1,
         500,
         apiInstitutionId,
         nameFilter,
         apiLevel,
         undefined,
         undefined,
         undefined,
         undefined,
         'name:asc'
      )
         .then((res) => {
            if (cancelled) return;
            setPrograms(res.data || []);
         })
         .catch((err: any) => {
            if (cancelled) return;
            setLoadError(getErrorMessage(err));
            setPrograms([]);
         })
         .finally(() => {
            if (cancelled) return;
            setLoading(false);
         });

      return () => {
         cancelled = true;
      };
   }, [searchTerm, selectedLevels, selectedInstitutionId, refreshTick, includePrivate]);

   const filteredPrograms = useMemo(() => {
      const levelOk = (p: Program) => selectedLevels.length === 0 || selectedLevels.includes(safeString(p.level));
      const feeOk = (p: Program) => {
         const n = extractNumericFee((p as any).fees);
         if (n == null) return true;
         return n <= maxFee;
      };
      const searchOk = (p: Program) => {
         const q = searchTerm.trim().toLowerCase();
         if (!q) return true;
         const hay = `${safeString(p.name)} ${safeString((p as any).program_code)} ${safeString((p as any)?.extensions?.stream)} ${safeString(p._id)}`.toLowerCase();
         return hay.includes(q);
      };

      const institutionOk = (p: Program) => {
         if (!selectedInstitutionId) return true;
         if (selectedInstitutionId === GOVERNMENT_INSTITUTION_FILTER_VALUE) return isGovernmentProgram(p);
         return p.institution_id === selectedInstitutionId;
      };

      const merged: Program[] = [];
      if (includePrivate) merged.push(...programs);
      if (includeGovernment) merged.push(...governmentPrograms);

      return merged
         .filter((p) => institutionOk(p) && levelOk(p) && feeOk(p) && searchOk(p))
         .sort((a, b) => a.name.localeCompare(b.name));
   }, [programs, governmentPrograms, selectedLevels, maxFee, includePrivate, includeGovernment, selectedInstitutionId, searchTerm]);

   const toggleLevel = (lvl: string) => {
      setSelectedLevels((prev) => (prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]));
   };

   const openNew = () => {
      setEditId(null);
      setFormError(null);
      setForm({
         institution_id:
            selectedInstitutionId && selectedInstitutionId !== GOVERNMENT_INSTITUTION_FILTER_VALUE
               ? selectedInstitutionId
               : institutions[0]?._id || '',
         name: '',
         program_code: '',
         description: '',
         level: '',
         duration_json: '',
         delivery_mode: [],
         fees_json: '',
         eligibility_json: '',
         curriculum_summary: '',
         specializations_text: '',
         url: '',
         confidence_score: 0.5,
         extensions_json: '',
      });
      setModalOpen(true);
   };

   const openEdit = (p: Program) => {
      if (isGovernmentProgram(p)) {
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
         confidence_score: typeof (p as any).confidence_score === 'number' ? (p as any).confidence_score : 0.5,
         extensions_json: (p as any).extensions ? JSON.stringify((p as any).extensions, null, 2) : '',
      });
      setModalOpen(true);
   };

   const handleDelete = (id: string) => {
      const target = filteredPrograms.find((p) => p._id === id);
      if (target && isGovernmentProgram(target)) {
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
         confidence_score: Number.isFinite(form.confidence_score) ? form.confidence_score : 0.5,
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
               <Button leftSection={<Plus size={16} />} onClick={openNew}>New Course</Button>
            </Group>
         </Group>

         <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 3 }}>
               <Card withBorder radius="md" p="md">
                  <TextInput 
                     placeholder="Search..." 
                     mb="lg" 
                     leftSection={<Search size={14} />} 
                     value={searchTerm} 
                     onChange={(e) => setSearchTerm(e.target.value)} 
                  />

                  <Collapse in={filtersOpen}>
                     <Stack gap="sm" mb="lg">
                        <Select
                           label="Source"
                           value={sourceFilter}
                           onChange={(v) => setSourceFilter((v as any) || 'all')}
                           data={[
                              { value: 'all', label: 'All (Private + Government)' },
                              { value: 'private', label: 'Private only' },
                              { value: 'government', label: 'Government only' },
                           ]}
                           size="xs"
                        />

                        <Select
                           label="Institution"
                           placeholder="All"
                           data={[
                              { value: GOVERNMENT_INSTITUTION_FILTER_VALUE, label: 'Government (UGC / State)' },
                              ...institutions.map((i) => ({ value: i._id, label: i.name })),
                           ]}
                           value={selectedInstitutionId}
                           onChange={setSelectedInstitutionId}
                           clearable
                           searchable
                        />

                        <Divider />

                        <Group gap="md" justify="space-between">
                           <Checkbox
                              label="Private"
                              checked={includePrivate}
                              onChange={(e) => {
                                 const next = e.currentTarget.checked;
                                 setIncludePrivate(next);
                                 setSourceFilter(next && includeGovernment ? 'all' : next ? 'private' : 'government');
                              }}
                           />
                           <Checkbox
                              label="Government"
                              checked={includeGovernment}
                              onChange={(e) => {
                                 const next = e.currentTarget.checked;
                                 setIncludeGovernment(next);
                                 setSourceFilter(includePrivate && next ? 'all' : next ? 'government' : 'private');
                              }}
                           />
                        </Group>
                        <Divider />
                     </Stack>
                  </Collapse>
                  
                  <Stack gap="xs" mb="lg">
                     <Text size="sm" fw={500}>Level</Text>
                     {(availableLevels.length ? availableLevels : ['Certificate','Diploma','Bachelor','Master','Doctorate','Postgraduate']).map(lvl => (
                        <Checkbox 
                           key={lvl} 
                           label={lvl} 
                           checked={selectedLevels.includes(lvl)} 
                           onChange={() => toggleLevel(lvl)} 
                        />
                     ))}
                  </Stack>

                  <Box>
                     <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500}>Max Fee</Text>
                        <Text size="xs" fw={700} c="blue">{maxFee >= 1000000 ? (maxFee/1000000).toFixed(1)+'M' : (maxFee/1000).toFixed(0)+'k'}</Text>
                     </Group>
                     <RangeSlider 
                        min={0} 
                        max={5000000} 
                        step={100000} 
                        value={[0, maxFee]} 
                        onChange={(val) => setMaxFee(val[1])} 
                        color="blue"
                     />
                  </Box>

                  {loadError ? (
                     <Alert mt="lg" color="red" title="Unable to load courses" withCloseButton onClose={() => setLoadError(null)}>
                        <Text size="sm">{loadError}</Text>
                        <Group justify="flex-end" mt="sm">
                           <Button size="xs" variant="default" onClick={() => setRefreshTick((t) => t + 1)}>Retry</Button>
                        </Group>
                     </Alert>
                  ) : null}

                  {governmentLoadError ? (
                     <Alert mt="lg" color="yellow" title="Government courses not loaded" withCloseButton onClose={() => setGovernmentLoadError(null)}>
                        <Text size="sm">{governmentLoadError}</Text>
                        <Text size="xs" c="dimmed">Expected file: /government-degree-programs.json</Text>
                     </Alert>
                  ) : null}
               </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 9 }}>
               {loading ? (
                  <Group justify="center" py="xl">
                     <Loader size="sm" />
                     <Text c="dimmed">Loading…</Text>
                  </Group>
               ) : (
                  <Grid>
                     {filteredPrograms.map((p) => {
                        const inst = institutionMap.get(p.institution_id);
                        const gov = isGovernmentProgram(p);
                        const institutionLabel = gov ? 'Government (State Universities)' : (inst?.name || p.institution_id);
                        return (
                           <Grid.Col key={p._id} span={{ base: 12, md: 6 }}>
                              <Card withBorder radius="md" p="lg">
                                 <Group align="flex-start" mb="md" justify="space-between">
                                    <Group>
                                       <ThemeIcon size={40} radius="md" variant="light" color="blue">
                                          <GraduationCap size={24} />
                                       </ThemeIcon>
                                       <Box>
                                          <Text fw={700} lineClamp={1}>{p.name}</Text>
                                          <Group gap={8} align="center">
                                             <Text size="xs" c="dimmed">{institutionLabel}</Text>
                                             {gov ? <Badge size="xs" variant="light" color="gray">Government</Badge> : null}
                                          </Group>
                                       </Box>
                                    </Group>
                                    <ActionIcon
                                       variant="subtle"
                                       color="gray"
                                       component="a"
                                       href={(p as any).url || '#'}
                                       target={(p as any).url ? '_blank' : undefined}
                                       rel={(p as any).url ? 'noreferrer' : undefined}
                                       onClick={(e) => {
                                          if (!(p as any).url) e.preventDefault();
                                       }}
                                    >
                                       <ExternalLink size={16} />
                                    </ActionIcon>
                                 </Group>

                                 <Grid gutter="xs" mb="md">
                                    <Grid.Col span={6}>
                                       <Card bg={isDark ? 'dark.6' : 'gray.0'} p="xs" radius="sm">
                                          <Group gap={4} mb={4}>
                                             <Award size={14} />
                                             <Text size="xs" c="dimmed">Eligibility</Text>
                                          </Group>
                                          <Text size="xs" fw={600} lineClamp={1}>
                                             {p.eligibility ? 'Defined' : '—'}
                                          </Text>
                                       </Card>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                       <Card bg={isDark ? 'dark.6' : 'gray.0'} p="xs" radius="sm">
                                          <Group gap={4} mb={4}>
                                             <DollarSign size={14} />
                                             <Text size="xs" c="dimmed">Fees</Text>
                                          </Group>
                                          <Text size="xs" fw={600} lineClamp={1}>{formatFees((p as any).fees)}</Text>
                                       </Card>
                                    </Grid.Col>
                                 </Grid>

                                 <Group justify="space-between">
                                    <Stack gap={0}>
                                       <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                                          {(p as any).program_code ? String((p as any).program_code) : '—'}
                                       </Text>
                                       <Text size="xs" c="blue">{safeString((p as any).level) || '—'}</Text>
                                    </Stack>
                                    <Group gap="xs">
                                       <Button variant="light" size="xs" leftSection={<Pencil size={12} />} disabled={gov} onClick={() => openEdit(p)}>
                                          Edit
                                       </Button>
                                       <Button variant="subtle" color="red" size="xs" leftSection={<Trash2 size={12} />} disabled={gov} onClick={() => handleDelete(p._id)}>
                                          Delete
                                       </Button>
                                    </Group>
                                 </Group>
                              </Card>
                           </Grid.Col>
                        );
                     })}
                  </Grid>
               )}

               {!loading && filteredPrograms.length === 0 && (
                  <Text ta="center" c="dimmed" mt="xl">No courses found.</Text>
               )}
            </Grid.Col>
         </Grid>

         <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Course" : "Add New Course"} size="lg">
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
                  <NumberInput
                     label="Confidence Score"
                     min={0}
                     max={1}
                     step={0.05}
                     decimalScale={2}
                     value={form.confidence_score}
                     onChange={(val) => setForm((p) => ({ ...p, confidence_score: typeof val === 'number' ? val : 0.5 }))}
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
                  <Button onClick={handleSave}>{editId ? 'Update Course' : 'Save Course'}</Button>
               </Group>
            </Stack>
         </Modal>
      </Stack>
   );
};

export default Courses;