import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
   Title, Text, Group, Button, TextInput, SimpleGrid, Card, Table, Badge, Modal, Stack, SegmentedControl, Select, Box, Textarea, useMantineColorScheme
} from '@mantine/core';
import { Search, Plus, MapPin, Globe, Calendar, Clock, BarChart3 } from 'lucide-react';
import { Scholarship } from '../types';

type ScholarshipWithRaw = Scholarship & { raw?: unknown };

const SCHOLARSHIPS_PUBLIC_URL = '/scholarship.json';
const LOCAL_STORAGE_KEY = 'edupath_admin_scholarships_v1';

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
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const [scholarships, setScholarships] = useState<ScholarshipWithRaw[]>([]);
   const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
   const [filterType, setFilterType] = useState('All');
   const [modalOpen, setModalOpen] = useState(false);
   const [newSch, setNewSch] = useState<Partial<Scholarship>>({ type: 'Local', status: 'Open' });
   const [newDetails, setNewDetails] = useState<{
      category: string;
      scholarshipType: string;
      eligibility: string;
      benefits: string;
      applicationProcess: string;
      conditions: string;
   }>({
      category: '',
      scholarshipType: '',
      eligibility: '',
      benefits: '',
      applicationProcess: '',
      conditions: '',
   });
   const [detailsOpen, setDetailsOpen] = useState(false);
   const [selected, setSelected] = useState<ScholarshipWithRaw | null>(null);

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

   const handleSave = () => {
      if(!newSch.title) return;

      const category = (newDetails.category || newSch.provider || 'Scholarships').trim() || 'Scholarships';
      const benefitsParsed = parseJsonOrString(newDetails.benefits);
      const valueFromBenefits = normalizeValue(benefitsParsed);

      const created: ScholarshipWithRaw = {
         ...(newSch as Scholarship),
         id: `local-${Date.now()}`,
         provider: category,
         deadLine: newSch.deadLine || '-',
         status: (newSch.status || 'Open') as Scholarship['status'],
         value: newSch.value || valueFromBenefits || '-',
         views: 0,
         clicks: 0,
         applications: 0,
         raw: {
            category,
            name: newSch.title,
            type: newDetails.scholarshipType || undefined,
            eligibility: newDetails.eligibility || undefined,
            benefits: benefitsParsed,
            application_process: newDetails.applicationProcess || undefined,
            conditions: newDetails.conditions || undefined,
         },
      };

      setScholarships((prev) => {
         const next = [created, ...prev];
         const locals = next.filter((s) => String(s.id).startsWith('local-'));
         saveLocalScholarships(locals);
         return next;
      });
      setModalOpen(false);
      setNewSch({ type: 'Local', status: 'Open' });
      setNewDetails({
         category: '',
         scholarshipType: '',
         eligibility: '',
         benefits: '',
         applicationProcess: '',
         conditions: '',
      });
   };

   return (
      <Stack>
         <Group justify="space-between">
            <Box>
               <Title order={2}>Scholarships</Title>
               <Text c="dimmed" size="sm">Manage financial aid opportunities.</Text>
               <Text c="dimmed" size="xs">Source: {SCHOLARSHIPS_PUBLIC_URL}</Text>
            </Box>
            <Button leftSection={<Plus size={16} />} onClick={() => setModalOpen(true)}>Post Scholarship</Button>
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
                     <Table.Th>Deadline</Table.Th>
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
                           <Group gap={4}>
                              <Calendar size={14} />
                              <Text size="xs">{s.deadLine}</Text>
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
                           <Button 
                                variant="subtle" 
                                size="xs" 
                                rightSection={<BarChart3 size={14} />}
                                onClick={() => navigate('/admin/analytics')}
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
                        </Table.Td>
                     </Table.Tr>
                  ))}
               </Table.Tbody>
            </Table>
         </Card>

         <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Post Scholarship">
            <Stack>
               <TextInput
                  label="Category"
                  placeholder="e.g., SLIIT Scholarships"
                  value={newDetails.category}
                  onChange={(e) => setNewDetails({ ...newDetails, category: e.target.value })}
               />
               <TextInput label="Title" required value={newSch.title || ''} onChange={(e) => setNewSch({...newSch, title: e.target.value})} />
               <TextInput
                  label="Provider"
                  description="Optional. If empty, Category will be used."
                  value={newSch.provider || ''}
                  onChange={(e) => setNewSch({ ...newSch, provider: e.target.value })}
               />
               <Group grow>
                  <Select label="Type" data={['Local', 'International']} value={newSch.type} onChange={(val) => setNewSch({...newSch, type: val as any})} />
                  <TextInput label="Value" placeholder="Full Tuition" value={newSch.value || ''} onChange={(e) => setNewSch({...newSch, value: e.target.value})} />
               </Group>
               <TextInput label="Deadline" type="date" value={newSch.deadLine || ''} onChange={(e) => setNewSch({...newSch, deadLine: e.target.value})} />

               <TextInput
                  label="Scholarship Type"
                  placeholder="e.g., Entrance Scholarship / Corporate Scholarship"
                  value={newDetails.scholarshipType}
                  onChange={(e) => setNewDetails({ ...newDetails, scholarshipType: e.target.value })}
               />
               <Textarea
                  label="Eligibility"
                  minRows={2}
                  autosize
                  value={newDetails.eligibility}
                  onChange={(e) => setNewDetails({ ...newDetails, eligibility: e.target.value })}
               />
               <Textarea
                  label="Benefits"
                  description="You can paste JSON (object/array) or plain text."
                  minRows={3}
                  autosize
                  value={newDetails.benefits}
                  onChange={(e) => setNewDetails({ ...newDetails, benefits: e.target.value })}
               />
               <Textarea
                  label="Application Process"
                  minRows={2}
                  autosize
                  value={newDetails.applicationProcess}
                  onChange={(e) => setNewDetails({ ...newDetails, applicationProcess: e.target.value })}
               />
               <Textarea
                  label="Conditions"
                  minRows={2}
                  autosize
                  value={newDetails.conditions}
                  onChange={(e) => setNewDetails({ ...newDetails, conditions: e.target.value })}
               />
               <Button onClick={handleSave}>Publish</Button>
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