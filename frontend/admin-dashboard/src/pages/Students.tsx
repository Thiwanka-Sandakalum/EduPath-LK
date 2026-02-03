import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  FileInput,
  Group,
  Menu,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { Download, Filter, Mail, MoreHorizontal, RefreshCw, Search, Trash2, Upload } from 'lucide-react';
import { emitAdminDataChanged } from '../utils/adminEvents';

const STUDENT_REGISTRY_KEY = 'eduPath_registry';

const SEEDED_STUDENT_COUNT = 20;

type RegistryStudentDetails = {
  fullName?: string;
  district?: string;
  stream?: string;
  results?: string;
  interestedField?: string;
  level?: string; // After O/L | After A/L | Diploma | Degree | PhD
};

type RegistryUser = {
  name?: string;
  email: string;
  avatarUrl?: string;
  provider?: string;
  studentDetails?: RegistryStudentDetails;
  status?: 'Active' | 'Inactive';
};

type StudentRow = {
  id: string;
  name: string;
  email: string;
  stream: string;
  level: string;
  zScore: string;
  interest: string;
  status: 'Active' | 'Inactive';
  location: string;
  avatarUrl?: string;
  raw: RegistryUser;
};

const SEEDED_REGISTRY_USERS: RegistryUser[] = [
  {
    name: 'Kavindu Perera',
    email: 'kavindu.perera@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Kavindu Perera',
      district: 'Colombo',
      stream: 'Physical Science',
      results: '1.74',
      interestedField: 'Software Engineering',
      level: 'After A/L',
    },
  },
  {
    name: 'Nethmi Silva',
    email: 'nethmi.silva@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Nethmi Silva',
      district: 'Gampaha',
      stream: 'Bio Science',
      results: '1.63',
      interestedField: 'Medicine',
      level: 'After A/L',
    },
  },
  {
    name: 'Sahan Jayasinghe',
    email: 'sahan.jayasinghe@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Sahan Jayasinghe',
      district: 'Kandy',
      stream: 'Commerce',
      results: '1.28',
      interestedField: 'Accounting',
      level: 'After A/L',
    },
  },
  {
    name: 'Tharushi Fernando',
    email: 'tharushi.fernando@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Tharushi Fernando',
      district: 'Kalutara',
      stream: 'Arts',
      results: '1.12',
      interestedField: 'Law',
      level: 'After A/L',
    },
  },
  {
    name: 'Dinuka Wijesinghe',
    email: 'dinuka.wijesinghe@student.edupath.lk',
    provider: 'seed',
    status: 'Inactive',
    studentDetails: {
      fullName: 'Dinuka Wijesinghe',
      district: 'Matara',
      stream: 'Technology',
      results: '1.05',
      interestedField: 'Civil Engineering',
      level: 'Diploma',
    },
  },
  {
    name: 'Ishara Abeysekara',
    email: 'ishara.abeysekara@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Ishara Abeysekara',
      district: 'Galle',
      stream: 'Physical Science',
      results: '1.56',
      interestedField: 'Data Science',
      level: 'Degree',
    },
  },
  {
    name: 'Malith Hewage',
    email: 'malith.hewage@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Malith Hewage',
      district: 'Kurunegala',
      stream: 'Commerce',
      results: '1.41',
      interestedField: 'Business Management',
      level: 'After A/L',
    },
  },
  {
    name: 'Sevindi Rathnayake',
    email: 'sevindi.rathnayake@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Sevindi Rathnayake',
      district: 'Kegalle',
      stream: 'Bio Science',
      results: '1.22',
      interestedField: 'Nursing',
      level: 'Diploma',
    },
  },
  {
    name: 'Pasindu Ekanayake',
    email: 'pasindu.ekanayake@student.edupath.lk',
    provider: 'seed',
    status: 'Inactive',
    studentDetails: {
      fullName: 'Pasindu Ekanayake',
      district: 'Anuradhapura',
      stream: 'Technology',
      results: '0.92',
      interestedField: 'IT',
      level: 'After O/L',
    },
  },
  {
    name: 'Thisuri Bandara',
    email: 'thisuri.bandara@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Thisuri Bandara',
      district: 'Badulla',
      stream: 'Arts',
      results: '1.08',
      interestedField: 'Teaching',
      level: 'After A/L',
    },
  },
  {
    name: 'Chathura Gunasekara',
    email: 'chathura.gunasekara@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Chathura Gunasekara',
      district: 'Ratnapura',
      stream: 'Physical Science',
      results: '1.33',
      interestedField: 'Electrical Engineering',
      level: 'Degree',
    },
  },
  {
    name: 'Sachini Karunaratne',
    email: 'sachini.karunaratne@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Sachini Karunaratne',
      district: 'Matale',
      stream: 'Bio Science',
      results: '1.49',
      interestedField: 'Pharmacy',
      level: 'Degree',
    },
  },
  {
    name: 'Ravindu Weerasinghe',
    email: 'ravindu.weerasinghe@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Ravindu Weerasinghe',
      district: 'Puttalam',
      stream: 'Commerce',
      results: '1.11',
      interestedField: 'Marketing',
      level: 'Diploma',
    },
  },
  {
    name: 'Hiruni Samarawickrama',
    email: 'hiruni.samarawickrama@student.edupath.lk',
    provider: 'seed',
    status: 'Inactive',
    studentDetails: {
      fullName: 'Hiruni Samarawickrama',
      district: 'Hambantota',
      stream: 'Arts',
      results: '0.88',
      interestedField: 'Mass Communication',
      level: 'After O/L',
    },
  },
  {
    name: 'Shehan Dias',
    email: 'shehan.dias@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Shehan Dias',
      district: 'Colombo',
      stream: 'Technology',
      results: '1.37',
      interestedField: 'Cybersecurity',
      level: 'Degree',
    },
  },
  {
    name: 'Hasini Wickramasinghe',
    email: 'hasini.wickramasinghe@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Hasini Wickramasinghe',
      district: 'Gampaha',
      stream: 'Commerce',
      results: '1.26',
      interestedField: 'Finance',
      level: 'After A/L',
    },
  },
  {
    name: 'Mihindu Dissanayake',
    email: 'mihindu.dissanayake@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Mihindu Dissanayake',
      district: 'Polonnaruwa',
      stream: 'Physical Science',
      results: '1.18',
      interestedField: 'Architecture',
      level: 'After A/L',
    },
  },
  {
    name: 'Anjali Peris',
    email: 'anjali.peris@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Anjali Peris',
      district: 'Negombo',
      stream: 'Bio Science',
      results: '1.09',
      interestedField: 'Biomedical Science',
      level: 'Diploma',
    },
  },
  {
    name: 'Kasun Ranatunga',
    email: 'kasun.ranatunga@student.edupath.lk',
    provider: 'seed',
    status: 'Inactive',
    studentDetails: {
      fullName: 'Kasun Ranatunga',
      district: 'Jaffna',
      stream: 'Arts',
      results: '0.95',
      interestedField: 'Languages',
      level: 'After O/L',
    },
  },
  {
    name: 'Dinithi Jayawardena',
    email: 'dinithi.jayawardena@student.edupath.lk',
    provider: 'seed',
    status: 'Active',
    studentDetails: {
      fullName: 'Dinithi Jayawardena',
      district: 'Batticaloa',
      stream: 'Technology',
      results: '1.02',
      interestedField: 'Information Systems',
      level: 'PhD',
    },
  },
];

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadRegistryUsers(): RegistryUser[] {
  const parsed = safeParseJson<unknown>(localStorage.getItem(STUDENT_REGISTRY_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(Boolean) as RegistryUser[];
}

function saveRegistryUsers(users: RegistryUser[]) {
  localStorage.setItem(STUDENT_REGISTRY_KEY, JSON.stringify(users));
}

function ensureSeededRegistry(): RegistryUser[] {
  const existing = loadRegistryUsers();
  if (existing.length) {
    // Backfill missing levels so the dashboard + table can show Degree/Diploma/etc
    // without overwriting any user-provided values.
    const hasAnyLevel = existing.some((u) => Boolean(u?.studentDetails?.level));
    if (!hasAnyLevel) {
      const levelCycle: NonNullable<RegistryStudentDetails['level']>[] = [
        'After O/L',
        'After A/L',
        'Diploma',
        'Degree',
        'PhD',
      ];
      const migrated = existing.map((u, idx) => {
        const details = u.studentDetails || {};
        if (details.level) return u;
        return {
          ...u,
          studentDetails: {
            ...details,
            level: levelCycle[idx % levelCycle.length],
          },
        } satisfies RegistryUser;
      });
      saveRegistryUsers(migrated);
      return migrated;
    }

    return existing;
  }

  const seeded = SEEDED_REGISTRY_USERS.slice(0, SEEDED_STUDENT_COUNT);
  saveRegistryUsers(seeded);
  return seeded;
}

function mapRegistryToRows(users: RegistryUser[]): StudentRow[] {
  return users
    .filter((u) => typeof u?.email === 'string' && u.email.trim())
    .map((u) => {
      const details = u.studentDetails || {};
      const name = String((details.fullName || u.name || u.email) ?? '').trim() || u.email;
      const status: 'Active' | 'Inactive' = u.status || 'Active';
      return {
        id: u.email,
        name,
        email: u.email,
        stream: details.stream || '—',
        level: details.level || '—',
        zScore: details.results || '—',
        interest: details.interestedField || '—',
        status,
        location: details.district || '—',
        avatarUrl: u.avatarUrl,
        raw: u,
      };
    });
}

const Students: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchParams] = useSearchParams();

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [streamFilter, setStreamFilter] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [importFile, setImportFile] = useState<File | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) setSearch(query);
  }, [searchParams]);

  const reloadFromRegistry = () => {
    try {
      const users = ensureSeededRegistry();
      setStudents(mapRegistryToRows(users));
      setLoadError(null);
      setPage(1);
    } catch (e: any) {
      setLoadError(e?.message || 'Failed to load students');
      setStudents([]);
    }
  };

  useEffect(() => {
    reloadFromRegistry();
  }, []);

  useEffect(() => {
    if (!importFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error('Invalid file: expected an array of users');
        saveRegistryUsers(parsed as RegistryUser[]);
        setImportFile(null);
        reloadFromRegistry();
        emitAdminDataChanged('students');
      } catch (e: any) {
        setLoadError(e?.message || 'Import failed');
        setImportFile(null);
      }
    };
    reader.readAsText(importFile);
  }, [importFile]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch = !term || s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
      const matchesStream = streamFilter ? s.stream === streamFilter : true;
      return matchesSearch && matchesStream;
    });
  }, [students, search, streamFilter]);

  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Name,Email,Level,Stream,Interest,Location,Status\n' +
      students
        .map((s) => `${s.name},${s.email},${s.level},${s.stream},${s.interest},${s.location},${s.status}`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  };

  const exportRegistryJson = () => {
    const users = loadRegistryUsers();
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eduPath_registry.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    const users = loadRegistryUsers().filter((u) => u.email !== id);
    saveRegistryUsers(users);
    reloadFromRegistry();
    emitAdminDataChanged('students');
  };

  const streamOptions = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.stream))).filter((x) => x && x !== '—');
  }, [students]);

  return (
    <Stack>
      <Group justify="space-between">
        <Box>
          <Title order={2}>Student Directory</Title>
          <Text c="dimmed" size="sm">
            Manage profiles and academic progress.
          </Text>
          <Text c="dimmed" size="xs">
            Source: localStorage key <b>{STUDENT_REGISTRY_KEY}</b> (shared with client-app when hosted on same domain)
          </Text>
        </Box>
        <Group gap="xs" wrap="wrap">
          <Button variant="default" leftSection={<RefreshCw size={16} />} onClick={reloadFromRegistry}>
            Refresh
          </Button>
          <FileInput
            ref={importInputRef as any}
            placeholder="Import registry JSON"
            value={importFile}
            onChange={setImportFile}
            accept="application/json"
            leftSection={<Upload size={16} />}
            clearable
          />
          <Button variant="default" leftSection={<Download size={16} />} onClick={exportCSV}>
            Export CSV
          </Button>
          <Button variant="default" leftSection={<Download size={16} />} onClick={exportRegistryJson}>
            Export Registry
          </Button>
        </Group>
      </Group>

      {loadError && (
        <Alert color="red" title="Students not loaded">
          <Text size="sm">{loadError}</Text>
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        {[
          { label: 'Total Students', value: students.length, color: 'blue' },
          { label: 'Active', value: students.filter((s) => s.status === 'Active').length, color: 'green' },
          { label: 'Inactive', value: students.filter((s) => s.status === 'Inactive').length, color: 'gray' },
          { label: 'Streams', value: new Set(students.map((s) => s.stream).filter(Boolean)).size, color: 'orange' },
        ].map((stat, i) => (
          <Card key={i} withBorder padding="md" radius="md">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              {stat.label}
            </Text>
            <Text size="xl" fw={700} c={stat.color as any}>
              {stat.value}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card withBorder radius="md" padding="0">
        <Group p="md" justify="space-between" wrap="wrap">
          <TextInput
            placeholder="Search students..."
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            w={300}
          />
          <Button
            variant={filtersOpen ? 'filled' : 'default'}
            size="xs"
            leftSection={<Filter size={14} />}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filter
          </Button>
        </Group>

        <Collapse in={filtersOpen}>
          <Group px="md" pb="md" bg={isDark ? 'dark.7' : 'gray.0'}>
            <Select
              placeholder="Filter by Stream"
              data={streamOptions}
              value={streamFilter}
              onChange={setStreamFilter}
              clearable
              size="xs"
            />
          </Group>
        </Collapse>

        <Table>
          <Table.Thead bg={isDark ? 'dark.6' : 'gray.0'}>
            <Table.Tr>
              <Table.Th>Profile</Table.Th>
              <Table.Th>Level</Table.Th>
              <Table.Th>Stream</Table.Th>
              <Table.Th>Interest</Table.Th>
              <Table.Th>Contact</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginated.map((s) => (
              <Table.Tr key={s.id}>
                <Table.Td>
                  <Group>
                    <Avatar color="blue" radius="xl" src={s.avatarUrl}>
                      {s.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Text size="sm" fw={500}>
                        {s.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {s.location}
                      </Text>
                    </Box>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color={s.level === 'Degree' ? 'grape' : s.level === 'Diploma' ? 'cyan' : 'gray'}>
                    {s.level}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge variant="outline" color="gray">
                    {s.stream}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    Z: {s.zScore}
                  </Text>
                </Table.Td>
                <Table.Td>{s.interest}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Mail size={12} />
                    <Text size="xs">{s.email}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge color={s.status === 'Active' ? 'green' : 'gray'} variant="dot">
                    {s.status}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <MoreHorizontal size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={() => handleDelete(s.id)}>
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Group p="md" justify="space-between">
          <Text size="xs" c="dimmed">
            Showing page {page} of {totalPages}
          </Text>
          <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
        </Group>
      </Card>
    </Stack>
  );
};

export default Students;

/*
 * NOTE:
 * A second, corrupted copy of this file was accidentally appended below.
 * It is intentionally commented out to restore a successful build.
 *
 * TODO: Remove this entire commented block once confirmed stable.
 * (Comment intentionally left open; closed at EOF.)
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
   Title,
   Text,
   Group,
   Button,
   TextInput,
   SimpleGrid,
   Card,
   Table,
   Badge,
   Avatar,
   Pagination,
   Menu,
   ActionIcon,
   Stack,
   Box,
   Modal,
   Select,
   Collapse,
   Alert,
   FileInput,
   useMantineColorScheme,
} from '@mantine/core';
import { Search, Download, Filter, MoreHorizontal, Mail, Pencil, Trash2, RefreshCw, Upload } from 'lucide-react';
import { emitAdminDataChanged } from '../utils/adminEvents';

const STUDENT_REGISTRY_KEY = 'eduPath_registry';

const SEEDED_STUDENT_COUNT = 20;

const SEEDED_REGISTRY_USERS: RegistryUser[] = [
   {
      name: 'Kavindu Perera',
      email: 'kavindu.perera@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Kavindu Perera',
         district: 'Colombo',
         stream: 'Physical Science',
         results: '1.74',
         interestedField: 'Software Engineering',
      },
   },
   {
      name: 'Nethmi Silva',
      email: 'nethmi.silva@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Nethmi Silva',
         district: 'Gampaha',
         stream: 'Bio Science',
         results: '1.63',
         interestedField: 'Medicine',
      },
   },
   {
      name: 'Sahan Jayasinghe',
      email: 'sahan.jayasinghe@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Sahan Jayasinghe',
         district: 'Kandy',
         stream: 'Commerce',
         results: '1.28',
         interestedField: 'Accounting',
      },
   },
   {
      name: 'Tharushi Fernando',
      email: 'tharushi.fernando@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Tharushi Fernando',
         district: 'Kalutara',
         stream: 'Arts',
         results: '1.12',
         interestedField: 'Law',
      },
   },
   {
      name: 'Dinuka Wijesinghe',
      email: 'dinuka.wijesinghe@student.edupath.lk',
      provider: 'seed',
      status: 'Inactive',
      studentDetails: {
         fullName: 'Dinuka Wijesinghe',
         district: 'Matara',
         stream: 'Technology',
         results: '1.05',
         interestedField: 'Civil Engineering',
      },
   },
   {
      name: 'Ishara Abeysekara',
      email: 'ishara.abeysekara@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Ishara Abeysekara',
         district: 'Galle',
         stream: 'Physical Science',
         results: '1.56',
         interestedField: 'Data Science',
      },
   },
   {
      name: 'Malith Hewage',
      email: 'malith.hewage@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Malith Hewage',
         district: 'Kurunegala',
         stream: 'Commerce',
         results: '1.41',
         interestedField: 'Business Management',
      },
   },
   {
      name: 'Sevindi Rathnayake',
      email: 'sevindi.rathnayake@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Sevindi Rathnayake',
         district: 'Kegalle',
         stream: 'Bio Science',
         results: '1.22',
         interestedField: 'Nursing',
      },
   },
   {
      name: 'Pasindu Ekanayake',
      email: 'pasindu.ekanayake@student.edupath.lk',
      provider: 'seed',
      status: 'Inactive',
      studentDetails: {
         fullName: 'Pasindu Ekanayake',
         district: 'Anuradhapura',
         stream: 'Technology',
         results: '0.92',
         interestedField: 'IT',
      },
   },
   {
      name: 'Thisuri Bandara',
      email: 'thisuri.bandara@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Thisuri Bandara',
         district: 'Badulla',
         stream: 'Arts',
         results: '1.08',
         interestedField: 'Teaching',
      },
   },
   {
      name: 'Chathura Gunasekara',
      email: 'chathura.gunasekara@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Chathura Gunasekara',
         district: 'Ratnapura',
         stream: 'Physical Science',
         results: '1.33',
         interestedField: 'Electrical Engineering',
      },
   },
   {
      name: 'Sachini Karunaratne',
      email: 'sachini.karunaratne@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Sachini Karunaratne',
         district: 'Matale',
         stream: 'Bio Science',
         results: '1.49',
         interestedField: 'Pharmacy',
      },
   },
   {
      name: 'Ravindu Weerasinghe',
      email: 'ravindu.weerasinghe@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Ravindu Weerasinghe',
         district: 'Puttalam',
         stream: 'Commerce',
         results: '1.11',
         interestedField: 'Marketing',
      },
   },
   {
      name: 'Hiruni Samarawickrama',
      email: 'hiruni.samarawickrama@student.edupath.lk',
      provider: 'seed',
      status: 'Inactive',
      studentDetails: {
         fullName: 'Hiruni Samarawickrama',
         district: 'Hambantota',
         stream: 'Arts',
         results: '0.88',
         interestedField: 'Mass Communication',
      },
   },
   {
      name: 'Shehan Dias',
      email: 'shehan.dias@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Shehan Dias',
         district: 'Colombo',
         stream: 'Technology',
         results: '1.37',
         interestedField: 'Cybersecurity',
      },
   },
   {
      name: 'Hasini Wickramasinghe',
      email: 'hasini.wickramasinghe@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Hasini Wickramasinghe',
         district: 'Gampaha',
         stream: 'Commerce',
         results: '1.26',
         interestedField: 'Finance',
      },
   },
   {
      name: 'Mihindu Dissanayake',
      email: 'mihindu.dissanayake@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Mihindu Dissanayake',
         district: 'Polonnaruwa',
         stream: 'Physical Science',
         results: '1.18',
         interestedField: 'Architecture',
      },
   },
   {
      name: 'Anjali Peris',
      email: 'anjali.peris@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Anjali Peris',
         district: 'Negombo',
         stream: 'Bio Science',
         results: '1.09',
         interestedField: 'Biomedical Science',
      },
   },
   {
      name: 'Kasun Ranatunga',
      email: 'kasun.ranatunga@student.edupath.lk',
      provider: 'seed',
      status: 'Inactive',
      studentDetails: {
         fullName: 'Kasun Ranatunga',
         district: 'Jaffna',
         stream: 'Arts',
         results: '0.95',
         interestedField: 'Languages',
      },
   },
   {
      name: 'Dinithi Jayawardena',
      email: 'dinithi.jayawardena@student.edupath.lk',
      provider: 'seed',
      status: 'Active',
      studentDetails: {
         fullName: 'Dinithi Jayawardena',
         district: 'Batticaloa',
         stream: 'Technology',
         results: '1.02',
         interestedField: 'Information Systems',
      },
   },
];

type RegistryStudentDetails = {
   fullName?: string;
   district?: string;
   stream?: string;
   results?: string;
   interestedField?: string;
   level?: string;
};

type RegistryUser = {
   name?: string;
   email: string;
   avatarUrl?: string;
   provider?: string;
   studentDetails?: RegistryStudentDetails;
   status?: 'Active' | 'Inactive';
};

type StudentRow = {
   id: string;
   name: string;
   email: string;
   stream: string;
   zScore: string;
   interest: string;
   status: 'Active' | 'Inactive';
   location: string;
   avatarUrl?: string;
   raw: RegistryUser;
};

function safeParseJson<T>(raw: string | null): T | null {
   if (!raw) return null;
   try {
      return JSON.parse(raw) as T;
   } catch {
            level: 'After A/L',
      return null;
   }
}

function loadRegistryUsers(): RegistryUser[] {
   const parsed = safeParseJson<unknown>(localStorage.getItem(STUDENT_REGISTRY_KEY));
   if (!Array.isArray(parsed)) return [];
   return parsed.filter(Boolean) as RegistryUser[];
}

function saveRegistryUsers(users: RegistryUser[]) {
   localStorage.setItem(STUDENT_REGISTRY_KEY, JSON.stringify(users));
}
            level: 'After A/L',

function ensureSeededRegistry(): RegistryUser[] {
   const existing = loadRegistryUsers();
   if (existing.length) return existing;
   // Only seed if registry is empty.
   const seeded = SEEDED_REGISTRY_USERS.slice(0, SEEDED_STUDENT_COUNT);
   saveRegistryUsers(seeded);
   return seeded;
}

function mapRegistryToRows(users: RegistryUser[]): StudentRow[] {
   return users
      .filter((u) => typeof u?.email === 'string' && u.email.trim())
            level: 'After A/L',
      .map((u) => {
         const details = u.studentDetails || {};
         const name = (details.fullName || u.name || u.email).trim();
         const status: 'Active' | 'Inactive' = u.status || 'Active';
         return {
            id: u.email,
            name,
            email: u.email,
            stream: details.stream || '—',
            zScore: details.results || '—',
            interest: details.interestedField || '—',
            status,
            location: details.district || '—',
            level: 'After A/L',
            avatarUrl: u.avatarUrl,
            raw: u,
         };
      });
}

const Students: React.FC = () => {
   const { colorScheme } = useMantineColorScheme();
   const isDark = colorScheme === 'dark';
   const [searchParams] = useSearchParams();
    const [students, setStudents] = useState<StudentRow[]>([]);
   const [search, setSearch] = useState(searchParams.get('search') || '');
   const [page, setPage] = useState(1);
            level: 'Diploma',
   const [filtersOpen, setFiltersOpen] = useState(false);
   const [streamFilter, setStreamFilter] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [importFile, setImportFile] = useState<File | null>(null);
    const importInputRef = useRef<HTMLInputElement | null>(null);

   const [modalOpen, setModalOpen] = useState(false);
   const [editingStudent, setEditingStudent] = useState<any>(null);

   useEffect(() => {
     const query = searchParams.get('search');
     if (query !== null) setSearch(query);
   }, [searchParams]);
            level: 'After A/L',

   const reloadFromRegistry = () => {
      try {
         const users = ensureSeededRegistry();
         setStudents(mapRegistryToRows(users));
         setLoadError(null);
         setPage(1);
      } catch (e: any) {
         setLoadError(e?.message || 'Failed to load students');
         setStudents([]);
      }
   };

            level: 'After A/L',
   useEffect(() => {
      reloadFromRegistry();
   }, []);

   const filtered = useMemo(() => {
      const term = search.trim().toLowerCase();
      return students.filter((s) => {
         const matchesSearch = !term || s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
         const matchesStream = streamFilter ? s.stream === streamFilter : true;
         return matchesSearch && matchesStream;
      });
   }, [students, search, streamFilter]);
   
            level: 'Diploma',
   const paginated = filtered.slice((page - 1) * 5, page * 5);

   const exportCSV = () => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Name,Email,Stream,Interest,Location,Status\n"
        + students.map(s => `${s.name},${s.email},${s.stream},${s.interest},${s.location},${s.status}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      window.open(encodedUri);
   };

   const exportRegistryJson = () => {
      const users = loadRegistryUsers();
      const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
            level: 'After O/L',
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'eduPath_registry.json';
      a.click();
      URL.revokeObjectURL(url);
   };

   useEffect(() => {
      if (!importFile) return;
      const reader = new FileReader();
      reader.onload = () => {
         try {
            level: 'After A/L',
            const text = String(reader.result || '');
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) throw new Error('Invalid file: expected an array of users');
            saveRegistryUsers(parsed as RegistryUser[]);
            setImportFile(null);
            reloadFromRegistry();
            emitAdminDataChanged('students');
         } catch (e: any) {
            setLoadError(e?.message || 'Import failed');
            setImportFile(null);
         }
      };
      reader.readAsText(importFile);
            level: 'Degree',
   }, [importFile]);

   const handleEdit = (student: any) => {
      setEditingStudent({...student});
      setModalOpen(true);
   };

   const handleDelete = (id: string) => {
      if(confirm("Are you sure you want to delete this student?")) {
          const users = loadRegistryUsers().filter((u) => u.email !== id);
          saveRegistryUsers(users);
          reloadFromRegistry();
           emitAdminDataChanged('students');
            level: 'Degree',
      }
   };

   const handleSave = () => {
      const users = loadRegistryUsers();
      const idx = users.findIndex((u) => u.email === editingStudent.id);
      if (idx >= 0) {
         const existing = users[idx];
         const updated: RegistryUser = {
            ...existing,
            name: editingStudent.name,
            email: editingStudent.email,
            status: editingStudent.status,
            level: 'Diploma',
            studentDetails: {
               ...(existing.studentDetails || {}),
               fullName: editingStudent.name,
               district: editingStudent.location,
               stream: editingStudent.stream,
               results: editingStudent.zScore,
               interestedField: editingStudent.interest,
            },
         };
         users[idx] = updated;
         saveRegistryUsers(users);
      }
      reloadFromRegistry();
            level: 'After O/L',
      emitAdminDataChanged('students');
      setModalOpen(false);
   };

   return (
      <Stack>
         <Group justify="space-between">
            <Box>
               <Title order={2}>Student Directory</Title>
               <Text c="dimmed" size="sm">Manage profiles and academic progress.</Text>
               <Text c="dimmed" size="xs">Source: localStorage key <b>{STUDENT_REGISTRY_KEY}</b> (shared with client-app when hosted on same domain)</Text>
            </Box>
            <Group gap="xs">
            level: 'Degree',
               <Button variant="default" leftSection={<RefreshCw size={16} />} onClick={reloadFromRegistry}>Refresh</Button>
               <FileInput
                  ref={importInputRef as any}
                  placeholder="Import registry JSON"
                  value={importFile}
                  onChange={setImportFile}
                  accept="application/json"
                  leftSection={<Upload size={16} />}
                  clearable
               />
               <Button variant="default" leftSection={<Download size={16} />} onClick={exportCSV}>Export CSV</Button>
               <Button variant="default" leftSection={<Download size={16} />} onClick={exportRegistryJson}>Export Registry</Button>
            </Group>
            level: 'After A/L',
         </Group>

         {loadError && (
            <Alert color="red" title="Students not loaded">
               <Text size="sm">{loadError}</Text>
            </Alert>
         )}

         <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            {[
               { label: 'Total Students', value: students.length, color: 'blue' },
               { label: 'Active', value: students.filter(s => s.status === 'Active').length, color: 'green' },
               { label: 'Inactive', value: students.filter(s => s.status === 'Inactive').length, color: 'gray' },
            level: 'After A/L',
               { label: 'Streams', value: new Set(students.map(s => s.stream).filter(Boolean)).size, color: 'orange' },
            ].map((stat, i) => (
               <Card key={i} withBorder padding="md" radius="md">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">{stat.label}</Text>
                  <Text size="xl" fw={700} c={stat.color}>{stat.value}</Text>
               </Card>
            ))}
         </SimpleGrid>

         <Card withBorder radius="md" padding="0">
            <Group p="md" justify="space-between">
               <TextInput 
                  placeholder="Search students..." 
            level: 'Diploma',
                  leftSection={<Search size={16} />} 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  w={300} 
               />
               <Button 
                   variant={filtersOpen ? "filled" : "default"} 
                   size="xs" 
                   leftSection={<Filter size={14} />}
                   onClick={() => setFiltersOpen(!filtersOpen)}
               >
                   Filter
               </Button>
            level: 'After O/L',
            </Group>
            
            <Collapse in={filtersOpen}>
                <Group px="md" pb="md" bg={isDark ? 'dark.7' : 'gray.0'}>
                    <Select 
                        placeholder="Filter by Stream" 
                     data={Array.from(new Set(students.map(s => s.stream))).filter((x) => x && x !== '—')}
                        value={streamFilter}
                        onChange={setStreamFilter}
                        clearable
                        size="xs"
                    />
                </Group>
            level: 'PhD',
            </Collapse>

            <Table>
               <Table.Thead bg={isDark ? 'dark.6' : 'gray.0'}>
                  <Table.Tr>
                     <Table.Th>Profile</Table.Th>
                     <Table.Th>Stream</Table.Th>
                     <Table.Th>Interest</Table.Th>
                     <Table.Th>Contact</Table.Th>
                     <Table.Th>Status</Table.Th>
                     <Table.Th style={{textAlign:'right'}}>Action</Table.Th>
                  </Table.Tr>
               </Table.Thead>
               <Table.Tbody>
                  {paginated.map(s => (
                     <Table.Tr key={s.id}>
                        <Table.Td>
                           <Group>
                              <Avatar color="blue" radius="xl" src={s.avatarUrl}>{s.name.charAt(0)}</Avatar>
                              <Box>
                                 <Text size="sm" fw={500}>{s.name}</Text>
                                 <Text size="xs" c="dimmed">{s.location}</Text>
                              </Box>
                           </Group>
                        </Table.Td>
                        <Table.Td>
                           <Badge variant="outline" color="gray">{s.stream}</Badge>
                           <Text size="xs" c="dimmed">Z: {s.zScore}</Text>
                        </Table.Td>
                        <Table.Td>{s.interest}</Table.Td>
                        <Table.Td>
                           <Group gap="xs">
                              <Mail size={12} />
                              <Text size="xs">{s.email}</Text>
                           </Group>
                        </Table.Td>
                        <Table.Td>
                           <Badge color={s.status === 'Active' ? 'green' : 'gray'} variant="dot">{s.status}</Badge>
                        </Table.Td>
                        <Table.Td style={{textAlign:'right'}}>
                           <Menu position="bottom-end">
                              <Menu.Target>
                                 <ActionIcon variant="subtle" color="gray"><MoreHorizontal size={16} /></ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                 <Menu.Item leftSection={<Pencil size={14}/>} onClick={() => handleEdit(s)}>Edit Profile</Menu.Item>
                                 <Menu.Item color="red" leftSection={<Trash2 size={14}/>} onClick={() => handleDelete(s.id)}>Delete</Menu.Item>
                              </Menu.Dropdown>
                           </Menu>
                        </Table.Td>
                     </Table.Tr>
                  ))}
               </Table.Tbody>
            </Table>
            <Group p="md" justify="space-between">
               <Text size="xs" c="dimmed">Showing page {page} of {Math.ceil(filtered.length / 5)}</Text>
               <Pagination total={Math.ceil(filtered.length / 5)} value={page} onChange={setPage} size="sm" />
            </Group>
         </Card>

         <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Edit Student">
            {editingStudent && (
                <Stack>
                    <TextInput label="Full Name" value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} />
                    <Group grow>
                        <TextInput label="Email" value={editingStudent.email} onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})} />
                        <TextInput label="Location" value={editingStudent.location} onChange={(e) => setEditingStudent({...editingStudent, location: e.target.value})} />
                    </Group>
                    <Select 
                        label="Stream" 
                        data={['Bio Science', 'Physical Science', 'Commerce', 'Technology', 'Arts']} 
                        value={editingStudent.stream}
                        onChange={(val) => setEditingStudent({...editingStudent, stream: val})}
                    />
                    <Group grow>
                        <TextInput label="Z-Score" value={editingStudent.zScore} onChange={(e) => setEditingStudent({...editingStudent, zScore: e.target.value})} />
                        <Select 
                            label="Status" 
                            data={['Active', 'Inactive']} 
                            value={editingStudent.status} 
                            onChange={(val) => setEditingStudent({...editingStudent, status: val})}
                        />
                    </Group>
                  <TextInput label="Interested Field" value={editingStudent.interest} onChange={(e) => setEditingStudent({ ...editingStudent, interest: e.target.value })} />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </Group>
                </Stack>
            )}
         </Modal>
      </Stack>
   );
};

export default Students;

*/