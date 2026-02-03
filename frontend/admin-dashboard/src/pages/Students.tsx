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

type RegistryStudentDetails = {
   fullName?: string;
   district?: string;
   stream?: string;
   results?: string;
   interestedField?: string;
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

function mapRegistryToRows(users: RegistryUser[]): StudentRow[] {
   return users
      .filter((u) => typeof u?.email === 'string' && u.email.trim())
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

   const [modalOpen, setModalOpen] = useState(false);
   const [editingStudent, setEditingStudent] = useState<any>(null);

   useEffect(() => {
     const query = searchParams.get('search');
     if (query !== null) setSearch(query);
   }, [searchParams]);

   const reloadFromRegistry = () => {
      try {
         const users = loadRegistryUsers();
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

   const filtered = useMemo(() => {
      const term = search.trim().toLowerCase();
      return students.filter((s) => {
         const matchesSearch = !term || s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
         const matchesStream = streamFilter ? s.stream === streamFilter : true;
         return matchesSearch && matchesStream;
      });
   }, [students, search, streamFilter]);
   
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