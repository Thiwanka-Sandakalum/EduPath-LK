import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Title, Text, Group, Button, TextInput, SimpleGrid, Card, Table, Badge, Avatar, Pagination, Menu, ActionIcon, Stack, Box, Modal, Select, Collapse, useMantineColorScheme } from '@mantine/core';
import { Search, Download, Filter, MoreHorizontal, Mail, Pencil, Trash2, X } from 'lucide-react';

const initialStudents = [
  { id: 1, name: 'Kasun Perera', email: 'kasun.p@gmail.com', stream: 'Bio Science', zScore: '1.85', interest: 'Medicine', status: 'Active', location: 'Gampaha' },
  { id: 2, name: 'Amaya Silva', email: 'amaya.s@yahoo.com', stream: 'Physical Science', zScore: '2.10', interest: 'Engineering', status: 'Active', location: 'Colombo' },
  { id: 3, name: 'Mohamed Riaz', email: 'm.riaz@outlook.com', stream: 'Commerce', zScore: '1.65', interest: 'Management', status: 'Inactive', location: 'Kandy' },
  { id: 4, name: 'Thenuka Dissanayake', email: 'thenuka.d@gmail.com', stream: 'Technology', zScore: '1.45', interest: 'IT', status: 'Active', location: 'Kurunegala' },
];

const Students: React.FC = () => {
   const { colorScheme } = useMantineColorScheme();
   const isDark = colorScheme === 'dark';
   const [searchParams] = useSearchParams();
   const [students, setStudents] = useState(initialStudents);
   const [search, setSearch] = useState(searchParams.get('search') || '');
   const [page, setPage] = useState(1);
   const [filtersOpen, setFiltersOpen] = useState(false);
   const [streamFilter, setStreamFilter] = useState<string | null>(null);

   const [modalOpen, setModalOpen] = useState(false);
   const [editingStudent, setEditingStudent] = useState<any>(null);

   useEffect(() => {
     const query = searchParams.get('search');
     if (query !== null) setSearch(query);
   }, [searchParams]);

   const filtered = students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
      const matchesStream = streamFilter ? s.stream === streamFilter : true;
      return matchesSearch && matchesStream;
   });
   
   const paginated = filtered.slice((page - 1) * 5, page * 5);

   const exportCSV = () => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Name,Email,Stream,Interest,Location,Status\n"
        + students.map(s => `${s.name},${s.email},${s.stream},${s.interest},${s.location},${s.status}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      window.open(encodedUri);
   };

   const handleEdit = (student: any) => {
      setEditingStudent({...student});
      setModalOpen(true);
   };

   const handleDelete = (id: number) => {
      if(confirm("Are you sure you want to delete this student?")) {
          setStudents(prev => prev.filter(s => s.id !== id));
      }
   };

   const handleSave = () => {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
      setModalOpen(false);
   };

   return (
      <Stack>
         <Group justify="space-between">
            <Box>
               <Title order={2}>Student Directory</Title>
               <Text c="dimmed" size="sm">Manage profiles and academic progress.</Text>
            </Box>
            <Button variant="default" leftSection={<Download size={16} />} onClick={exportCSV}>Export CSV</Button>
         </Group>

         <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            {[
               { label: 'Total Students', value: students.length, color: 'blue' },
               { label: 'Active', value: students.filter(s => s.status === 'Active').length, color: 'green' },
               { label: 'Premium', value: '890', color: 'grape' },
               { label: 'Avg Z-Score', value: '1.62', color: 'orange' },
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
                        data={['Bio Science', 'Physical Science', 'Commerce', 'Technology', 'Arts']}
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
                              <Avatar color="blue" radius="xl">{s.name.charAt(0)}</Avatar>
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