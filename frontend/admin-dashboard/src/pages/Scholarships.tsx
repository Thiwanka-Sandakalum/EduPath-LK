import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
   Title, Text, Group, Button, TextInput, SimpleGrid, Card, Table, Badge, Modal, Stack, SegmentedControl, Select, Box, Textarea, useMantineColorScheme
} from '@mantine/core';
import { Search, Plus, MapPin, Globe, Clock, BarChart3 } from 'lucide-react';
import { Scholarship } from '../types';
import { OpenAPI } from '../types/core/OpenAPI';
import { onAdminDataChanged } from '../utils/adminEvents';

type ScholarshipWithRaw = Scholarship & { raw?: unknown };

const SCHOLARSHIPS_PUBLIC_URL = '/scholarship.json';
const LOCAL_STORAGE_KEY = 'edupath_admin_scholarships_v1';

type ScholarshipAnalytics = {
   scholarship_id: string;
   total_views: number;
   total_unique_viewers: number;
   last_14_days: Array<{ date: string; views: number; unique_viewers: number }>;
};

function safeStringify(value: unknown): string {
   try {
      return JSON.stringify(value, null, 2);
   } catch {
      return String(value);
   }
}

function normalizeValue(value: unknown): string {
   if (value === null || value === undefined) return '';
   if (typeof value === 'string') return value;
   if (typeof value === 'number' || typeof value === 'boolean') return String(value);

   if (Array.isArray(value)) {
      return value
         .map((v) => (typeof v === 'string' ? v : safeStringify(v)))
         .filter(Boolean)
         .join(', ');
   }

   if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) return '';
      return entries
         .map(([k, v]) => `${k}: ${normalizeValue(v)}`)
         .filter(Boolean)
         .join(' | ');
   }

   return String(value);
}

function parseJsonOrString(input: string): unknown {
   const trimmed = input.trim();
   if (!trimmed) return undefined;
   if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
         return JSON.parse(trimmed);
      } catch {
         return trimmed;
      }
   }
   return trimmed;
}

function inferType(category: string): Scholarship['type'] {
   return /international/i.test(category) ? 'International' : 'Local';
}

function mapScholarshipsJsonToRows(payload: unknown): ScholarshipWithRaw[] {
   const root = payload as any;
   const categories: any[] = Array.isArray(root?.scholarships) ? root.scholarships : [];
   const rows: ScholarshipWithRaw[] = [];

   categories.forEach((categoryBlock, categoryIndex) => {
      const categoryName = String(categoryBlock?.category ?? 'Scholarships');
      const baseType = inferType(categoryName);

      if (Array.isArray(categoryBlock?.items)) {
         categoryBlock.items.forEach((item: any, itemIndex: number) => {
            const title = String(item?.name ?? categoryBlock?.name ?? categoryName);
            const value =
               normalizeValue(item?.benefits ?? item?.benefit ?? item?.merit_award ?? item?.general_award) ||
               normalizeValue(categoryBlock?.benefits ?? categoryBlock?.benefit);

            rows.push({
               id: `json-${categoryIndex}-${itemIndex}`,
               title,
               provider: categoryName,
               type: baseType,
               deadLine: '-',
               status: 'Open',
               value: value || '-',
               views: 0,
               clicks: 0,
               applications: 0,
               raw: { category: categoryName, ...item },
            });
         });
         return;
      }

      const title = String(categoryBlock?.name ?? categoryName);
      const value = normalizeValue(categoryBlock?.benefits ?? categoryBlock?.benefit) || '-';
      rows.push({
         id: `json-${categoryIndex}`,
         title,
         provider: categoryName,
         type: baseType,
         deadLine: '-',
         status: 'Open',
         value,
         views: 0,
         clicks: 0,
         applications: 0,
         raw: { ...categoryBlock },
      });
   });

   return rows;
}

function loadLocalScholarships(): ScholarshipWithRaw[] {
   try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as ScholarshipWithRaw[];
   } catch {
      return [];
   }
}

function saveLocalScholarships(items: ScholarshipWithRaw[]) {
   try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
   } catch {
      // ignore
   }
}

const Scholarships: React.FC = () => {
   const { colorScheme } = useMantineColorScheme();
   const isDark = colorScheme === 'dark';
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const [scholarships, setScholarships] = useState<ScholarshipWithRaw[]>([]);
   const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
   const [filterType, setFilterType] = useState('All');
   const [detailsOpen, setDetailsOpen] = useState(false);
   const [selected, setSelected] = useState<ScholarshipWithRaw | null>(null);

   const [analyticsOpen, setAnalyticsOpen] = useState(false);
   const [analyticsLoading, setAnalyticsLoading] = useState(false);
   const [analyticsError, setAnalyticsError] = useState<string | null>(null);
   const [analyticsScholarship, setAnalyticsScholarship] = useState<ScholarshipWithRaw | null>(null);
   const [analyticsData, setAnalyticsData] = useState<ScholarshipAnalytics | null>(null);

   useEffect(() => {
     const query = searchParams.get('search');
     if (query !== null) setSearchTerm(query);
   }, [searchParams]);

   useEffect(() => {
      let cancelled = false;
      const local = loadLocalScholarships();
      setScholarships(local);

      (async () => {
         try {
            const res = await fetch(SCHOLARSHIPS_PUBLIC_URL, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`Failed to load ${SCHOLARSHIPS_PUBLIC_URL} (${res.status})`);
            const json = await res.json();
            const mapped = mapScholarshipsJsonToRows(json);

            if (cancelled) return;
            // Local items first (so “Post Scholarship” shows on top)
            setScholarships((prev) => {
               const localNow = prev.filter((s) => String(s.id).startsWith('local-'));
               return [...localNow, ...mapped];
            });
         } catch {
            // If JSON can’t be loaded, keep local items only.
         }
      })();

      return () => {
         cancelled = true;
      };
   }, []);

   useEffect(() => {
      // Refresh local scholarships after creating on the separate page.
      return onAdminDataChanged((event: any) => {
         const source = event?.detail?.source;
         if (source !== 'scholarships') return;

         setScholarships((prev) => {
            const local = loadLocalScholarships();
            const nonLocal = prev.filter((s) => !String(s.id).startsWith('local-'));
            return [...local, ...nonLocal];
         });
      });
   }, []);

   const openAnalytics = async (sch: ScholarshipWithRaw) => {
      setAnalyticsScholarship(sch);
      setAnalyticsOpen(true);
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      setAnalyticsData(null);
      try {
         const res = await fetch(
            `${OpenAPI.BASE}/analytics/scholarships/${encodeURIComponent(String(sch.id))}`,
            { headers: { Accept: 'application/json' } },
         );
         if (!res.ok) {
            throw new Error(`Failed to load analytics (${res.status})`);
         }
         const json = (await res.json()) as ScholarshipAnalytics;
         setAnalyticsData(json);
      } catch (e) {
         setAnalyticsError((e as Error)?.message || 'Failed to load analytics');
      }
      setAnalyticsLoading(false);
   };

   const filtered = useMemo(() => {
      const term = searchTerm.trim().toLowerCase();
      return scholarships.filter((s) => {
         const matchesType = filterType === 'All' || s.type === filterType;
         if (!matchesType) return false;
         if (!term) return true;

         return (
            s.title.toLowerCase().includes(term) ||
            s.provider.toLowerCase().includes(term) ||
            normalizeValue((s as any).raw).toLowerCase().includes(term)
         );
      });
   }, [filterType, scholarships, searchTerm]);

   return (
      <Stack>
         <Group justify="space-between">
            <Box>
               <Title order={2}>Scholarships</Title>
               <Text c="dimmed" size="sm">Manage financial aid opportunities.</Text>
               
            </Box>
            <Button leftSection={<Plus size={16} />} onClick={() => navigate('/admin/scholarships/new')}>Post Scholarship</Button>
         </Group>

         <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            {[
               { label: 'Total Value', val: 'LKR 42.5M' },
               { label: 'Active', val: scholarships.filter(s => s.status === 'Open').length },
               { label: 'Success Rate', val: '14.2%' },
               { label: 'New', val: '12' },
            ].map((stat, i) => (
               <Card key={i} withBorder padding="md" radius="md">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">{stat.label}</Text>
                  <Text size="xl" fw={700}>{stat.val}</Text>
               </Card>
            ))}
         </SimpleGrid>

         <Card withBorder radius="md" padding="0">
            <Group p="md" justify="space-between">
               <TextInput 
                  placeholder="Search..." 
                  leftSection={<Search size={16} />} 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  w={300}
               />
               <SegmentedControl 
                  value={filterType} 
                  onChange={setFilterType} 
                  data={['All', 'Local', 'International']} 
                  size="xs"
               />
            </Group>
            <Table>
               <Table.Thead bg={isDark ? 'dark.6' : 'gray.0'}>
                  <Table.Tr>
                     <Table.Th>Opportunity</Table.Th>
                     <Table.Th>Type</Table.Th>
                     <Table.Th>Status</Table.Th>
                     <Table.Th style={{textAlign:'right'}}>Engagement</Table.Th>
                  </Table.Tr>
               </Table.Thead>
               <Table.Tbody>
                  {filtered.map(s => (
                     <Table.Tr key={s.id}>
                        <Table.Td>
                           <Text fw={500} size="sm">{s.title}</Text>
                           <Text size="xs" c="dimmed">{s.provider}</Text>
                        </Table.Td>
                        <Table.Td>
                           <Group gap={4}>
                              {s.type === 'International' ? <Globe size={14} color="blue" /> : <MapPin size={14} color="green" />}
                              <Text size="xs">{s.type}</Text>
                           </Group>
                        </Table.Td>
                        <Table.Td>
                           <Badge 
                              variant="light" 
                              color={s.status === 'Open' ? 'green' : s.status === 'Closed' ? 'red' : 'yellow'} 
                              leftSection={<Clock size={12} />}
                           >
                              {s.status}
                           </Badge>
                        </Table.Td>
                        <Table.Td style={{textAlign:'right'}}>
                           <Group gap="xs" justify="flex-end">
                              <Button
                                 variant="subtle"
                                 size="xs"
                                 rightSection={<BarChart3 size={14} />}
                                 onClick={() => void openAnalytics(s)}
                              >
                                 Analytics
                              </Button>
                              <Button
                                 variant="subtle"
                                 size="xs"
                                 onClick={() => {
                                    setSelected(s);
                                    setDetailsOpen(true);
                                 }}
                              >
                                 Details
                              </Button>
                           </Group>
                        </Table.Td>
                     </Table.Tr>
                  ))}
               </Table.Tbody>
            </Table>
         </Card>

         <Modal
            opened={analyticsOpen}
            onClose={() => {
               setAnalyticsOpen(false);
               setAnalyticsScholarship(null);
               setAnalyticsData(null);
               setAnalyticsError(null);
            }}
            title={analyticsScholarship ? `Analytics: ${analyticsScholarship.title}` : 'Scholarship Analytics'}
         >
            <Stack gap="sm">
               <Text size="sm" c="dimmed">
                  This shows real client-app users who opened scholarship details.
               </Text>

               {analyticsLoading && <Text size="sm">Loading…</Text>}
               {analyticsError && <Text size="sm" c="red">{analyticsError}</Text>}

               {analyticsData && (
                  <SimpleGrid cols={2}>
                     <Card withBorder padding="md" radius="md">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">Users Viewed</Text>
                        <Text size="xl" fw={700}>{analyticsData.total_unique_viewers ?? 0}</Text>
                     </Card>
                     <Card withBorder padding="md" radius="md">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">Total Detail Opens</Text>
                        <Text size="xl" fw={700}>{analyticsData.total_views ?? 0}</Text>
                     </Card>
                  </SimpleGrid>
               )}
            </Stack>
         </Modal>

         <Modal
            opened={detailsOpen}
            onClose={() => {
               setDetailsOpen(false);
               setSelected(null);
            }}
            title={selected?.title || 'Scholarship Details'}
            size="lg"
         >
            <Stack gap="xs">
               {selected ? (
                  <>
                     <Text size="sm" c="dimmed">Provider: {selected.provider}</Text>
                     <Text size="sm" c="dimmed">Type: {selected.type}</Text>
                     <Text size="sm" c="dimmed">Value: {selected.value}</Text>
                     <Text size="sm" c="dimmed">Deadline: {selected.deadLine}</Text>

                     {selected.raw && typeof selected.raw === 'object' && (
                        <Card withBorder radius="md" padding="sm">
                           {typeof (selected.raw as any)?.type === 'string' && (
                              <Text size="sm"><b>Scholarship Type:</b> {(selected.raw as any).type}</Text>
                           )}
                           {(selected.raw as any)?.eligibility && (
                              <>
                                 <Text size="xs" fw={700} c="dimmed" tt="uppercase">Eligibility</Text>
                                 <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{String((selected.raw as any).eligibility)}</Text>
                              </>
                           )}
                           {(selected.raw as any)?.benefits && (
                              <>
                                 <Text size="xs" fw={700} c="dimmed" tt="uppercase">Benefits</Text>
                                 <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{normalizeValue((selected.raw as any).benefits)}</Text>
                              </>
                           )}
                           {(selected.raw as any)?.application_process && (
                              <>
                                 <Text size="xs" fw={700} c="dimmed" tt="uppercase">Application Process</Text>
                                 <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{String((selected.raw as any).application_process)}</Text>
                              </>
                           )}
                           {(selected.raw as any)?.conditions && (
                              <>
                                 <Text size="xs" fw={700} c="dimmed" tt="uppercase">Conditions</Text>
                                 <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{String((selected.raw as any).conditions)}</Text>
                              </>
                           )}
                        </Card>
                     )}

                     <Card withBorder radius="md" padding="sm">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">Raw JSON</Text>
                        <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>
                           {safeStringify(selected.raw)}
                        </Text>
                     </Card>
                  </>
               ) : (
                  <Text size="sm" c="dimmed">No scholarship selected.</Text>
               )}
            </Stack>
         </Modal>
      </Stack>
   );
};

export default Scholarships;