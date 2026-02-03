import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { School, BookOpen, Users, GraduationCap, TrendingUp, AlertCircle } from 'lucide-react';
import { 
  Title, 
  Text, 
  SimpleGrid, 
  Card, 
  Group, 
  Select, 
  ThemeIcon, 
  Table, 
  Badge, 
  Button, 
  Box,
  Stack,
  Loader,
  Alert,
  useMantineTheme
} from '@mantine/core';

import { InstitutionsService } from '../types/services/InstitutionsService';
import { ProgramsService } from '../types/services/ProgramsService';
import type { Institution } from '../types/models/Institution';
import { onAdminDataChanged } from '../utils/adminEvents';

const SCHOLARSHIPS_PUBLIC_URL = '/scholarship.json';
const SCHOLARSHIPS_LOCAL_STORAGE_KEY = 'edupath_admin_scholarships_v1';
const STUDENT_REGISTRY_KEY = 'eduPath_registry';
const GOV_INSTITUTIONS_URL = '/government-institutions.json';
const GOV_PROGRAMS_URL = '/government-degree-programs.json';

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function stripBom(text: string) {
  return text && text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

async function fetchJsonLoose(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    return JSON.parse(stripBom(text));
  } catch {
    return null;
  }
}

function countGovInstitutions(payload: any): number {
  const list = Array.isArray(payload?.institutions) ? payload.institutions : [];
  return list.filter((x: any) => x && typeof x._id === 'string').length;
}

function countGovPrograms(payload: any): number {
  const list = Array.isArray(payload?.degreePrograms) ? payload.degreePrograms : [];
  const ids = new Set<string>();
  for (const p of list) {
    if (p && typeof p._id === 'string') ids.add(p._id);
  }
  return ids.size;
}

function countStudentsFromRegistry(): number {
  const users = safeParseJson<any[]>(localStorage.getItem(STUDENT_REGISTRY_KEY));
  if (!Array.isArray(users)) return 0;
  const ids = new Set<string>();
  for (const u of users) {
    const email = String((u as any)?.email || '').trim();
    if (email) ids.add(email.toLowerCase());
  }
  return ids.size;
}

function inferScholarshipType(category: string): 'Local' | 'International' {
  return /international/i.test(category) ? 'International' : 'Local';
}

function countScholarshipsFromJson(payload: unknown): { total: number; local: number; international: number } {
  const root = payload as any;
  const categories: any[] = Array.isArray(root?.scholarships) ? root.scholarships : [];
  let total = 0;
  let local = 0;
  let international = 0;

  for (const categoryBlock of categories) {
    const categoryName = String(categoryBlock?.category ?? 'Scholarships');
    const baseType = inferScholarshipType(categoryName);

    if (Array.isArray(categoryBlock?.items) && categoryBlock.items.length > 0) {
      total += categoryBlock.items.length;
      if (baseType === 'International') international += categoryBlock.items.length;
      else local += categoryBlock.items.length;
      continue;
    }

    // Single object scholarship entry
    total += 1;
    if (baseType === 'International') international += 1;
    else local += 1;
  }

  return { total, local, international };
}

const weeklyData = [
  { name: 'Mon', visits: 4000 }, { name: 'Tue', visits: 3000 },
  { name: 'Wed', visits: 2000 }, { name: 'Thu', visits: 2780 },
  { name: 'Fri', visits: 1890 }, { name: 'Sat', visits: 2390 },
  { name: 'Sun', visits: 3490 },
];

const monthlyData = [
  { name: 'W1', visits: 15400 }, { name: 'W2', visits: 18300 },
  { name: 'W3', visits: 16500 }, { name: 'W4', visits: 21000 },
  { name: 'W5', visits: 19500 },
];

type StudentLevelLabel = 'After O/L' | 'After A/L' | 'Diploma' | 'Degree' | 'PhD';
type StudentLevelDatum = { name: StudentLevelLabel; value: number; count: number; percent: number };

function normalizeStudentLevel(value: unknown, fallbackFromStudent: any): StudentLevelLabel {
  const raw = String(value || '').trim().toLowerCase();
  const compact = raw.replace(/\s+/g, '');

  if (
    compact === 'afterol' ||
    compact === 'aftero/l' ||
    compact === 'ol' ||
    compact === 'o/l' ||
    raw.includes('o/l') ||
    raw === 'ol'
  ) {
    return 'After O/L';
  }

  if (
    compact === 'afteral' ||
    compact === 'aftera/l' ||
    compact === 'al' ||
    compact === 'a/l' ||
    raw.includes('a/l') ||
    raw === 'al'
  ) {
    return 'After A/L';
  }

  if (raw.includes('diploma')) return 'Diploma';
  if (raw.includes('degree') || raw.includes('bsc') || raw.includes('ba') || raw.includes('undergraduate')) return 'Degree';
  if (raw.includes('phd') || raw.includes('doctorate')) return 'PhD';

  // If level isn't provided, infer a reasonable default.
  const stream = String(fallbackFromStudent?.studentDetails?.stream || '').trim();
  if (stream) return 'After A/L';
  return 'After O/L';
}

function computeStudentLevelCountsFromRegistry(): Record<StudentLevelLabel, number> {
  const users = safeParseJson<any[]>(localStorage.getItem(STUDENT_REGISTRY_KEY));
  const counts: Record<StudentLevelLabel, number> = {
    'After O/L': 0,
    'After A/L': 0,
    Diploma: 0,
    Degree: 0,
    PhD: 0,
  };

  if (!Array.isArray(users)) return counts;
  for (const u of users) {
    const levelRaw = (u as any)?.studentDetails?.level ?? (u as any)?.studentDetails?.educationLevel ?? (u as any)?.level;
    const label = normalizeStudentLevel(levelRaw, u);
    counts[label] += 1;
  }
  return counts;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const [timeRange, setTimeRange] = useState<string | null>('7d');
  const chartData = timeRange === '7d' ? weeklyData : monthlyData;

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [institutionsTotal, setInstitutionsTotal] = useState<number | null>(null);
  const [programsTotal, setProgramsTotal] = useState<number | null>(null);
  const [scholarshipsTotal, setScholarshipsTotal] = useState<number | null>(null);
  const [scholarshipSplit, setScholarshipSplit] = useState<{ local: number; international: number }>({ local: 0, international: 0 });
  const [studentsTotal, setStudentsTotal] = useState<number | null>(null);

  const [recentInstitutions, setRecentInstitutions] = useState<Institution[]>([]);

  // Dynamically get colors from theme
  const PIE_COLORS = [theme.colors.blue[6], theme.colors.teal[6], theme.colors.violet[6], theme.colors.orange[6], theme.colors.grape[6]];
  const pieStroke = theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white;

  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    return onAdminDataChanged(() => setRefreshTick((t) => t + 1));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    const load = async () => {
      try {
        const [instRes, progRes, govInstJson, govProgJson] = await Promise.all([
          InstitutionsService.listInstitutions(1, 3, undefined, undefined, 'updated_at:desc').catch(() => InstitutionsService.listInstitutions(1, 3)),
          ProgramsService.listPrograms(1, 1),
          fetchJsonLoose(GOV_INSTITUTIONS_URL),
          fetchJsonLoose(GOV_PROGRAMS_URL),
        ]);

        if (cancelled) return;
        setRecentInstitutions(instRes.data || []);

        const apiInstTotal = instRes.pagination?.total ?? (instRes.data ? instRes.data.length : 0);
        const apiProgTotal = progRes.pagination?.total ?? (progRes.data ? progRes.data.length : 0);
        const govInstTotal = countGovInstitutions(govInstJson);
        const govProgTotal = countGovPrograms(govProgJson);
        setInstitutionsTotal(apiInstTotal + govInstTotal);
        setProgramsTotal(apiProgTotal + govProgTotal);

        setStudentsTotal(countStudentsFromRegistry());

        // Scholarships: merge JSON file + locally posted items
        const localItems = safeParseJson<any[]>(localStorage.getItem(SCHOLARSHIPS_LOCAL_STORAGE_KEY)) || [];
        const localTotal = Array.isArray(localItems) ? localItems.length : 0;
        const localSplit = (Array.isArray(localItems) ? localItems : []).reduce(
          (acc, s) => {
            const t = String((s as any)?.type || 'Local');
            if (t === 'International') acc.international += 1;
            else acc.local += 1;
            return acc;
          },
          { local: 0, international: 0 }
        );

        let jsonCounts = { total: 0, local: 0, international: 0 };
        try {
          const res = await fetch(SCHOLARSHIPS_PUBLIC_URL, { cache: 'no-cache' });
          if (res.ok) {
            const json = await res.json();
            jsonCounts = countScholarshipsFromJson(json);
          }
        } catch {
          // ignore
        }

        if (cancelled) return;
        const total = localTotal + jsonCounts.total;
        const local = localSplit.local + jsonCounts.local;
        const international = localSplit.international + jsonCounts.international;
        setScholarshipsTotal(total);
        setScholarshipSplit({ local, international });
      } catch (e: any) {
        if (cancelled) return;
        setLoadError(e?.message || 'Failed to load dashboard data');
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  const studentLevelEngagement = useMemo<StudentLevelDatum[]>(() => {
    const counts = computeStudentLevelCountsFromRegistry();
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const order: StudentLevelLabel[] = ['After O/L', 'After A/L', 'Diploma', 'Degree', 'PhD'];
    return order.map((name) => {
      const count = counts[name];
      const percent = total ? Math.round((count / total) * 100) : 0;
      return { name, value: count, count, percent };
    });
  }, [refreshTick]);

  const studentLevelTotal = useMemo(() => {
    return studentLevelEngagement.reduce((sum, d) => sum + d.count, 0);
  }, [studentLevelEngagement]);

  const statsData = useMemo(() => {
    const fmt = (n: number | null) => (n == null ? '—' : n.toLocaleString());
    return [
      { label: 'Total Institutions', value: fmt(institutionsTotal), change: 'Live', icon: School, color: 'blue' },
      { label: 'Active Courses', value: fmt(programsTotal), change: 'Live', icon: BookOpen, color: 'teal' },
      { label: 'Registered Students', value: fmt(studentsTotal), change: 'Live', icon: Users, color: 'grape' },
      { label: 'Active Scholarships', value: fmt(scholarshipsTotal), change: 'Live', icon: GraduationCap, color: 'yellow' },
    ];
  }, [institutionsTotal, programsTotal, scholarshipsTotal, studentsTotal]);

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Box>
          <Title order={2}>Dashboard Overview</Title>
          <Text c="dimmed" size="sm">Welcome back, Administrator. Platform status is healthy.</Text>
        </Box>
        <Badge variant="light" color="green" size="lg" leftSection={<Box w={6} h={6} bg="green" style={{borderRadius:'50%'}} />}>
           Platform Status: Healthy
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
        {statsData.map((stat, i) => (
          <Card key={i} padding="lg" radius="md">
            <Group justify="space-between" mb="xs">
              <ThemeIcon variant="light" color={stat.color} size="lg" radius="md">
                <stat.icon size={20} />
              </ThemeIcon>
              <Badge variant="light" color={stat.change === 'Live' ? 'teal' : 'gray'}>{stat.change}</Badge>
            </Group>
            <Text c="dimmed" size="xs" fw={700} tt="uppercase">{stat.label}</Text>
            <Text fw={700} size="xl">{stat.value}</Text>
          </Card>
        ))}
      </SimpleGrid>

      {loadError && (
        <Alert color="red" mb="lg" title="Dashboard data unavailable">
          <Text size="sm">{loadError}</Text>
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" mb="lg">
        <Card radius="md" padding="lg" style={{ gridColumn: 'span 2' }}>
          <Group justify="space-between" mb="lg">
            <Group gap="xs">
              <TrendingUp size={20} color={theme.colors.blue[6]} />
              <Title order={4}>Student Activity Trends</Title>
            </Group>
            <Select 
              value={timeRange} 
              onChange={setTimeRange} 
              data={[{ value: '7d', label: 'Last 7 Days' }, { value: '30d', label: 'Last 30 Days' }]}
              size="xs"
              w={150}
            />
          </Group>
          <Box h={300}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.colors.blue[6]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.colors.blue[6]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.gray[3]} opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: theme.colors.gray[6], fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: theme.colors.gray[6], fontSize: 12}} />
                <Tooltip 
                    contentStyle={{ backgroundColor: theme.colors.dark[7], borderColor: theme.colors.dark[7], borderRadius: 8, color: 'white', boxShadow: theme.shadows.md }}
                    itemStyle={{ color: 'white' }}
                />
                <Area type="monotone" dataKey="visits" stroke={theme.colors.blue[6]} strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        <Card radius="md" padding="lg">
          <Group justify="space-between" mb="lg" wrap="wrap">
            <Title order={4}>Student Level Split</Title>
          </Group>
          <Box h={240} pos="relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentLevelEngagement}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke={pieStroke}
                  strokeWidth={2}
                >
                  {studentLevelEngagement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, _name: any, props: any) => {
                    const payload = props?.payload as StudentLevelDatum | undefined;
                    const percent = payload?.percent ?? 0;
                    return [`${percent}%`, 'Percentage'];
                  }}
                  contentStyle={{
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
                    borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[3],
                    borderRadius: 8,
                    color: theme.colorScheme === 'dark' ? 'white' : theme.black,
                    boxShadow: theme.shadows.md,
                  }}
                  itemStyle={{ color: theme.colorScheme === 'dark' ? 'white' : theme.black }}
                  labelStyle={{ color: theme.colorScheme === 'dark' ? 'white' : theme.black }}
                />
              </PieChart>
            </ResponsiveContainer>

            <Box
              pos="absolute"
              top="50%"
              left="50%"
              style={{ transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}
            >
              <Text fw={800} size="lg">
                {studentLevelTotal ? '100%' : '0%'}
              </Text>
              <Text size="xs" c="dimmed">
                Distribution
              </Text>
            </Box>
          </Box>
          <Stack gap="xs" mt="md">
             {studentLevelEngagement.map((item, idx) => (
               <Group key={idx} justify="space-between">
                  <Group gap="xs">
                     <Box w={10} h={10} bg={PIE_COLORS[idx]} style={{borderRadius:'50%'}} />
                     <Text size="sm">{item.name}</Text>
                  </Group>
                  <Text size="sm" fw={700}>
                    {item.percent}%
                  </Text>
               </Group>
             ))}
          </Stack>
          {loading && (
            <Group justify="center" mt="sm">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">Loading live metrics…</Text>
            </Group>
          )}
        </Card>
      </SimpleGrid>

      <Card radius="md" padding="lg">
         <Group justify="space-between" mb="md">
            <Group gap="xs">
               <AlertCircle size={20} color={theme.colors.yellow[6]} />
            <Title order={4}>Recent Institutions</Title>
            </Group>
            <Button variant="subtle" size="xs" onClick={() => navigate('/admin/institutions')}>View All</Button>
         </Group>
         <Table highlightOnHover>
            <Table.Thead>
               <Table.Tr>
                  <Table.Th>Institution</Table.Th>
              <Table.Th>Country</Table.Th>
              <Table.Th>Type</Table.Th>
                  <Table.Th style={{textAlign: 'right'}}>Action</Table.Th>
               </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
            {recentInstitutions.length === 0 ? (
              <Table.Tr>
               <Table.Td colSpan={4}>
                <Text size="sm" c="dimmed">No institutions loaded yet.</Text>
               </Table.Td>
              </Table.Tr>
            ) : (
              recentInstitutions.map((inst) => (
               <Table.Tr key={inst._id}>
                <Table.Td fw={500}>{inst.name}</Table.Td>
                <Table.Td>{inst.country || '—'}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color="blue">{inst.type?.[0] || '—'}</Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => navigate(`/admin/institutions/${inst._id}`)}
                  >
                    View
                  </Button>
                </Table.Td>
               </Table.Tr>
              ))
            )}
            </Table.Tbody>
         </Table>
      </Card>
    </Box>
  );
};

export default Dashboard;