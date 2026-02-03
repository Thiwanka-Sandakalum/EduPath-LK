import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
   ActionIcon,
   Alert,
   Badge,
   Box,
   Button,
   Card,
   Center,
   Divider,
   Group,
   Loader,
   SimpleGrid,
   Stack,
   Text,
   Title,
} from '@mantine/core';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { InstitutionsService } from '../types/services/InstitutionsService';
import { ProgramsService } from '../types/services/ProgramsService';
import type { Institution } from '../types/models/Institution';
import type { Program } from '../types/models/Program';

const GOVERNMENT_INSTITUTION_ID = 'GOV';

const normalizeKey = (value: any) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const safeString = (value: any): string => (typeof value === 'string' ? value : value == null ? '' : String(value));

const stripBom = (text: string) => (text && text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);

const getErrorMessage = (err: any): string => {
   return err?.body?.message || err?.message || err?.statusText || 'Request failed';
};

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

const isGovernmentProgram = (p: Program) => {
   const instKey = normalizeKey(safeString((p as any)?.institution_id));
   if (instKey && instKey === normalizeKey(GOVERNMENT_INSTITUTION_ID)) return true;
   const src = (p as any)?.extensions?.source;
   return typeof src === 'string' && src.toLowerCase().includes('government');
};

type GovernmentDegreeProgram = {
   _id: string;
   title: string;
   stream?: string;
   duration_years?: number;
   medium_of_instruction?: string[];
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

const CourseDetails: React.FC = () => {
   const navigate = useNavigate();
   const { id } = useParams();

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [program, setProgram] = useState<Program | null>(null);
   const [institution, setInstitution] = useState<Institution | null>(null);

   useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      setProgram(null);
      setInstitution(null);

      if (!id) {
         setLoading(false);
         setError('Missing course id');
         return () => {
            cancelled = true;
         };
      }

      const loadGovernmentProgram = async (): Promise<Program | null> => {
         const url = getGovernmentDegreeProgramsPublicUrl();
         const resp = await fetch(url, { cache: 'no-store' });
         if (!resp.ok) return null;
         const text = await resp.text();
         const payload = JSON.parse(stripBom(text)) as GovernmentDegreeProgramsPayload;
         const list = Array.isArray(payload.degreePrograms) ? payload.degreePrograms : [];
         const found = list.find((d) => d && d._id === id);
         if (!found) return null;

         const mapped: Program = {
            _id: found._id,
            institution_id: GOVERNMENT_INSTITUTION_ID,
            name: found.title,
            program_code: found._id,
            description: undefined,
            level: 'Bachelor' as any,
            duration: typeof found.duration_years === 'number' ? { years: found.duration_years } : undefined,
            delivery_mode: ['On-campus'] as any,
            fees: undefined,
            eligibility: undefined,
            curriculum_summary: undefined,
            specializations: found.stream ? [found.stream] : undefined,
            url: undefined,
            extensions: {
               source: 'Government',
               stream: found.stream,
               medium_of_instruction: found.medium_of_instruction,
               aptitude_test_required: found.aptitude_test_required,
            },
            confidence_score: 1,
            created_at: payload.updatedAt ? new Date(`${payload.updatedAt}T00:00:00.000Z`).toISOString() : new Date().toISOString(),
            updated_at: payload.updatedAt ? new Date(`${payload.updatedAt}T00:00:00.000Z`).toISOString() : new Date().toISOString(),
         };

         return mapped;
      };

      (async () => {
         try {
            // Prefer API if present
            let p: Program | null = null;
            try {
               p = await ProgramsService.getProgram(id);
            } catch {
               p = await loadGovernmentProgram();
            }

            if (cancelled) return;
            if (!p) {
               setError('Course not found');
               setLoading(false);
               return;
            }

            setProgram(p);

            // Load institution (private only)
            if (!isGovernmentProgram(p) && p.institution_id) {
               try {
                  const inst = await InstitutionsService.getInstitution(p.institution_id);
                  if (!cancelled) setInstitution(inst);
               } catch {
                  if (!cancelled) setInstitution(null);
               }
            }

            if (!cancelled) setLoading(false);
         } catch (err: any) {
            if (cancelled) return;
            setError(getErrorMessage(err));
            setLoading(false);
         }
      })();

      return () => {
         cancelled = true;
      };
   }, [id]);

   const view = useMemo(() => {
      if (!program) return null;

      const gov = isGovernmentProgram(program);
      const url = safeString((program as any).url) || '';
      const level = safeString((program as any).level) || '—';
      const programCode = safeString((program as any).program_code) || '—';
      const institutionName = gov
         ? 'All Government (UGC)'
         : institution?.name || safeString(program.institution_id) || '—';

      const deliveryText = Array.isArray((program as any).delivery_mode) && (program as any).delivery_mode.length
         ? (program as any).delivery_mode.join(', ')
         : '—';

      const specializationsText = Array.isArray((program as any).specializations) && (program as any).specializations.length
         ? (program as any).specializations.join(', ')
         : '—';

      const medium = (program as any)?.extensions?.medium_of_instruction;
      const mediumText = Array.isArray(medium) && medium.length ? medium.join(', ') : '—';

      const stream = safeString((program as any)?.extensions?.stream) || '';
      const aptitude = (program as any)?.extensions?.aptitude_test_required;

      return {
         gov,
         url,
         level,
         programCode,
         institutionName,
         durationText: formatDuration(program.duration),
         deliveryText,
         specializationsText,
         stream: stream || '—',
         mediumText,
         aptitudeText: typeof aptitude === 'boolean' ? (aptitude ? 'Yes' : 'No') : '—',
         description: safeString((program as any).description) || '',
         curriculum: safeString((program as any).curriculum_summary) || '',
      };
   }, [program, institution]);

   if (loading) {
      return (
         <Center mih={240}>
            <Group gap="xs">
               <Loader size="sm" />
               <Text c="dimmed" size="sm">Loading course details…</Text>
            </Group>
         </Center>
      );
   }

   if (error || !program || !view) {
      return (
         <Stack>
            <Group justify="space-between">
               <Group gap="xs">
                  <ActionIcon variant="subtle" onClick={() => navigate('/admin/courses')} aria-label="Back">
                     <ArrowLeft size={18} />
                  </ActionIcon>
                  <Title order={2}>Course Details</Title>
               </Group>
            </Group>

            <Alert color="red" title="Unable to load">
               <Text size="sm">{error || 'Unknown error'}</Text>
            </Alert>

            <Button variant="default" onClick={() => navigate('/admin/courses')} w={180}>
               Back to Courses
            </Button>
         </Stack>
      );
   }

   return (
      <Stack>
         <Group justify="space-between" wrap="wrap">
            <Group gap="xs" wrap="wrap">
               <ActionIcon variant="subtle" onClick={() => navigate('/admin/courses')} aria-label="Back">
                  <ArrowLeft size={18} />
               </ActionIcon>
               <Box>
                  <Title order={2}>{program.name}</Title>
                  <Text size="sm" c="dimmed">{view.institutionName}</Text>
               </Box>
            </Group>

            <Group gap="xs" wrap="wrap">
               <Badge size="sm" variant={view.gov ? 'light' : 'outline'} color={view.gov ? 'gray' : 'blue'}>
                  {view.gov ? 'Government' : 'Private'}
               </Badge>
               {view.url ? (
                  <Button
                     component="a"
                     href={view.url}
                     target="_blank"
                     rel="noreferrer"
                     leftSection={<ExternalLink size={16} />}
                     variant="default"
                     size="sm"
                  >
                     Open link
                  </Button>
               ) : null}
            </Group>
         </Group>

         <Card withBorder radius="md" padding="md">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
               <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Level</Text>
                  <Text size="sm">{view.level}</Text>
               </Box>
               <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Program Code</Text>
                  <Text size="sm">{view.programCode}</Text>
               </Box>
               <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Duration</Text>
                  <Text size="sm">{view.durationText}</Text>
               </Box>
               <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Delivery Mode</Text>
                  <Text size="sm">{view.deliveryText}</Text>
               </Box>
               <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Specializations</Text>
                  <Text size="sm">{view.specializationsText}</Text>
               </Box>
               <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Stream</Text>
                  <Text size="sm">{view.stream}</Text>
               </Box>
               <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Medium</Text>
                  <Text size="sm">{view.mediumText}</Text>
               </Box>
               <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Aptitude Test</Text>
                  <Text size="sm">{view.aptitudeText}</Text>
               </Box>
            </SimpleGrid>

            {(view.description || view.curriculum) ? <Divider my="md" /> : null}

            {view.description ? (
               <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Description</Text>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{view.description}</Text>
               </Box>
            ) : null}

            {view.curriculum ? (
               <Box mt="sm">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Curriculum Summary</Text>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{view.curriculum}</Text>
               </Box>
            ) : null}
         </Card>
      </Stack>
   );
};

export default CourseDetails;
