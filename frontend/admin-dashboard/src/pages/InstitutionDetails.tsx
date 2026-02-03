import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
   ActionIcon,
   Alert,
   Badge,
   Box,
   Button,
   Card,
   Divider,
   Group,
   Loader,
   Stack,
   Table,
   Text,
   Title,
} from '@mantine/core';
import { ArrowLeft, Eye, Globe } from 'lucide-react';
import { InstitutionType } from '../types';
import { InstitutionsService } from '../types/services/InstitutionsService';
import { ProgramsService } from '../types/services/ProgramsService';
import type { Institution as ApiInstitution } from '../types/models/Institution';
import type { Program } from '../types/models/Program';

const GOVERNMENT_INSTITUTION_ID = 'GOV';

type GovernmentInstitution = {
   _id: string;
   name: string;
   type?: string;
   location?: string;
   abbreviation?: string;
   image_url?: string;
   contact?: {
      address?: string;
      phone?: string[];
      website?: string;
   };
};

type GovernmentInstitutionsPayload = {
   updatedAt?: string;
   institutions?: GovernmentInstitution[];
};

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

const getGovernmentInstitutionsPublicUrl = () => {
   const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
   const origin = typeof window !== 'undefined' ? window.location.origin : '';
   return `${origin}${basePath}government-institutions.json`;
};

const getGovernmentDegreeProgramsPublicUrl = () => {
   const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
   const origin = typeof window !== 'undefined' ? window.location.origin : '';
   return `${origin}${basePath}government-degree-programs.json`;
};

const stripBom = (text: string) => (text && text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);

const safeString = (value: any): string => (typeof value === 'string' ? value : value == null ? '' : String(value));

const normalizeWebsiteUrl = (website?: string) => {
   const w = (website || '').trim();
   if (!w) return undefined;
   if (w.startsWith('http://') || w.startsWith('https://')) return w;
   return `https://${w}`;
};

const getWebsiteLabel = (url?: string) => {
   const raw = (url || '').trim();
   if (!raw) return undefined;
   try {
      const u = new URL(raw);
      return u.hostname.replace(/^www\./i, '');
   } catch {
      return raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] || 'Website';
   }
};

const toIsoDate = (yyyyMmDd?: string) => {
   const raw = (yyyyMmDd || '').trim();
   if (!raw) return new Date().toISOString();
   const d = new Date(`${raw}T00:00:00.000Z`);
   return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
};

const getVerificationStatus = (inst: ApiInstitution, isGovernment: boolean) => {
   if (isGovernment) return { label: 'Verified', color: 'green' as const };
   const score = inst.confidence_score ?? 0;
   if (score >= 0.75) return { label: 'Verified', color: 'green' as const };
   if (score >= 0.5) return { label: 'Review', color: 'yellow' as const };
   return { label: 'Unverified', color: 'red' as const };
};

const InstitutionDetails: React.FC = () => {
   const navigate = useNavigate();
   const { id } = useParams();

   const [institution, setInstitution] = useState<ApiInstitution | null>(null);
   const [isGovernment, setIsGovernment] = useState(false);
   const [programs, setPrograms] = useState<Program[]>([]);

   const [programsLoadError, setProgramsLoadError] = useState<string | null>(null);

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const websiteLabel = useMemo(() => getWebsiteLabel(institution?.website), [institution?.website]);

   useEffect(() => {
      let cancelled = false;

      const run = async () => {
         if (!id) {
            setError('Missing institution id');
            setLoading(false);
            return;
         }

         setLoading(true);
         setError(null);
         setInstitution(null);
         setIsGovernment(false);
         setPrograms([]);
         setProgramsLoadError(null);

         try {
            // 1) Try government JSON first (no auth required)
            const govUrl = getGovernmentInstitutionsPublicUrl();
            const govPayload = await fetch(govUrl, { cache: 'no-store' })
               .then(async (r) => {
                  if (!r.ok) throw new Error(`Failed to load government institutions (${r.status})`);
                  const text = await r.text();
                  return JSON.parse(stripBom(text)) as GovernmentInstitutionsPayload;
               })
               .catch(() => null);

            const govList = Array.isArray(govPayload?.institutions) ? govPayload!.institutions! : [];
            const foundGov = govList.find((g) => g && g._id === id);

            if (foundGov) {
               const updatedAtIso = toIsoDate(govPayload?.updatedAt);
               const website = normalizeWebsiteUrl(foundGov.contact?.website);
               const contact_info = {
                  address: foundGov.contact?.address,
                  phone: foundGov.contact?.phone,
                  website: website || undefined,
                  location: foundGov.location,
               };

               const mapped: ApiInstitution = {
                  _id: foundGov._id,
                  name: foundGov.name,
                  institution_code: foundGov.abbreviation,
                  description: undefined,
                  type: [InstitutionType.STATE, foundGov.type || ''].filter(Boolean),
                  country: 'Sri Lanka',
                  website,
                  recognition: undefined,
                  contact_info,
                  confidence_score: 1,
                  created_at: updatedAtIso,
                  updated_at: updatedAtIso,
               };

               let govPrograms: Program[] = [];
               try {
                  const degreeUrl = getGovernmentDegreeProgramsPublicUrl();
                  const payload = await fetch(degreeUrl, { cache: 'no-store' }).then(async (r) => {
                     if (!r.ok) throw new Error(`Failed to load government degree programs (${r.status})`);
                     const text = await r.text();
                     return JSON.parse(stripBom(text)) as GovernmentDegreeProgramsPayload;
                  });

                  const degreeUpdatedAtIso = toIsoDate(payload.updatedAt);
                  const list = Array.isArray(payload.degreePrograms) ? payload.degreePrograms : [];
                  govPrograms = list
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
                        created_at: degreeUpdatedAtIso,
                        updated_at: degreeUpdatedAtIso,
                     }))
                     .slice(0, 20);
               } catch (e: any) {
                  if (!cancelled) setProgramsLoadError(e?.message || 'Failed to load government degree programs');
               }

               if (!cancelled) {
                  setInstitution(mapped);
                  setIsGovernment(true);
                  setPrograms(govPrograms);
                  setLoading(false);
               }
               return;
            }

            // 2) Fallback to API (private institutions)
            const inst = await InstitutionsService.getInstitution(id);
            const progs = await ProgramsService.listInstitutionPrograms(id, 1, 20);

            if (cancelled) return;
            setInstitution(inst);
            setIsGovernment(false);
            setPrograms(progs.data || []);
            setLoading(false);
         } catch (e: any) {
            if (cancelled) return;
            setError(e?.body?.message || e?.message || 'Failed to load institution');
            setLoading(false);
         }
      };

      run();
      return () => {
         cancelled = true;
      };
   }, [id]);

   const verification = institution ? getVerificationStatus(institution, isGovernment) : null;

   const openProgramDetails = (programId?: string) => {
      const pid = (programId || '').trim();
      if (!pid) return;
      navigate(`/admin/courses/${pid}`);
   };

   return (
      <Box>
         <Group justify="space-between" mb="lg" wrap="wrap">
            <Group gap="sm">
               <Button
                  variant="default"
                  leftSection={<ArrowLeft size={16} />}
                  onClick={() => navigate('/admin/institutions')}
               >
                  Back
               </Button>
               <Title order={2}>Institution Details</Title>
            </Group>
         </Group>

         {loading ? (
            <Card withBorder radius="md" p="lg">
               <Group justify="center" py="xl">
                  <Loader size="sm" />
                  <Text c="dimmed">Loading…</Text>
               </Group>
            </Card>
         ) : error ? (
            <Alert color="red" title="Unable to load institution" withCloseButton onClose={() => setError(null)}>
               <Text size="sm">{error}</Text>
            </Alert>
         ) : !institution ? (
            <Card withBorder radius="md" p="lg">
               <Text c="dimmed">No data</Text>
            </Card>
         ) : (
            <Stack gap="md">
               <Card withBorder radius="md" p="lg">
                  <Group justify="space-between" align="flex-start" wrap="wrap">
                     <Stack gap={6} style={{ flex: 1, minWidth: 280 }}>
                        <Group gap="sm" wrap="wrap">
                           <Title order={3}>{institution.name}</Title>
                           <Badge variant={isGovernment ? 'light' : 'outline'} color={isGovernment ? 'gray' : 'blue'}>
                              {isGovernment ? 'Government' : 'Private'}
                           </Badge>
                           {verification ? (
                              <Badge variant="light" color={verification.color}>
                                 {verification.label}
                              </Badge>
                           ) : null}
                        </Group>

                        {institution.description ? (
                           <Text size="sm" c="dimmed">
                              {institution.description}
                           </Text>
                        ) : null}

                        {institution.website ? (
                           <Text
                              size="sm"
                              component="a"
                              href={institution.website}
                              target="_blank"
                              rel="noreferrer"
                              style={{ textDecoration: 'none' }}
                           >
                              <Group gap={8} wrap="nowrap">
                                 <Globe size={16} />
                                 <Text span size="sm">
                                    {websiteLabel || institution.website}
                                 </Text>
                              </Group>
                           </Text>
                        ) : null}
                     </Stack>
                  </Group>

                  <Divider my="md" />

                  <Group gap="xs" wrap="wrap">
                     {(Array.isArray(institution.type) && institution.type.length ? institution.type : ['—']).map((t) => (
                        <Badge key={t} variant="outline">
                           {t}
                        </Badge>
                     ))}
                     <Badge variant="light">{institution.country || '—'}</Badge>
                  </Group>
               </Card>

               <Card withBorder radius="md" p="lg">
                  <Group justify="space-between" mb="sm" wrap="wrap">
                     <Title order={4}>
                        {isGovernment ? 'Government Degree Programs (first 20)' : 'Related Programs (first 20)'}
                     </Title>
                     {isGovernment ? <Badge variant="light" color="gray">From public dataset</Badge> : null}
                  </Group>

                  {programsLoadError ? (
                     <Alert
                        color="yellow"
                        title="Programs not loaded"
                        withCloseButton
                        onClose={() => setProgramsLoadError(null)}
                        mb="sm"
                     >
                        <Text size="sm">{programsLoadError}</Text>
                     </Alert>
                  ) : null}

                  {programs.length === 0 ? (
                     <Text size="sm" c="dimmed">No programs found.</Text>
                  ) : (
                     <Box style={{ maxHeight: 320, overflow: 'auto' }}>
                        <Table striped highlightOnHover>
                           <Table.Thead>
                              <Table.Tr>
                                 <Table.Th>Name</Table.Th>
                                 <Table.Th>Level</Table.Th>
                                 <Table.Th style={{ textAlign: 'right' }}>Action</Table.Th>
                              </Table.Tr>
                           </Table.Thead>
                           <Table.Tbody>
                              {programs.map((p) => {
                                 const programId = safeString((p as any)._id || (p as any).id);
                                 const clickable = !!programId;
                                 return (
                                    <Table.Tr
                                       key={programId || p.name}
                                       onClick={() => (clickable ? openProgramDetails(programId) : undefined)}
                                       style={clickable ? { cursor: 'pointer' } : undefined}
                                    >
                                       <Table.Td>
                                          <Text fw={600} size="sm">
                                             {p.name}
                                          </Text>
                                       </Table.Td>
                                       <Table.Td>{(p as any).level || '—'}</Table.Td>
                                       <Table.Td style={{ textAlign: 'right' }}>
                                          <ActionIcon
                                             variant="subtle"
                                             color="gray"
                                             aria-label="View program details"
                                             disabled={!clickable}
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                if (clickable) openProgramDetails(programId);
                                             }}
                                          >
                                             <Eye size={16} />
                                          </ActionIcon>
                                       </Table.Td>
                                    </Table.Tr>
                                 );
                              })}
                           </Table.Tbody>
                        </Table>
                     </Box>
                  )}
               </Card>
            </Stack>
         )}
      </Box>
   );
};

export default InstitutionDetails;
