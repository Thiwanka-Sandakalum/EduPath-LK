import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
   Title, Text, Group, Button, TextInput, SimpleGrid, Card, Table, Badge, Modal, Stack, SegmentedControl, NumberInput, Select, ActionIcon, Box, useMantineColorScheme
} from '@mantine/core';
import { Search, Plus, MapPin, Globe, Calendar, Clock, BarChart3 } from 'lucide-react';
import { Scholarship } from '../types';
import { mockScholarships } from '../data/mockData';

const Scholarships: React.FC = () => {
   const { colorScheme } = useMantineColorScheme();
   const isDark = colorScheme === 'dark';
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const [scholarships, setScholarships] = useState<Scholarship[]>(mockScholarships);
   const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
   const [filterType, setFilterType] = useState('All');
   const [modalOpen, setModalOpen] = useState(false);
   const [newSch, setNewSch] = useState<Partial<Scholarship>>({ type: 'Local', status: 'Open' });

   useEffect(() => {
     const query = searchParams.get('search');
     if (query !== null) setSearchTerm(query);
   }, [searchParams]);

   const filtered = scholarships.filter(s => 
      (filterType === 'All' || s.type === filterType) &&
      (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.provider.toLowerCase().includes(searchTerm.toLowerCase()))
   );

   const handleSave = () => {
      if(!newSch.title) return;
      setScholarships([{ ...newSch, id: Date.now().toString(), views: 0, clicks: 0, applications: 0 } as Scholarship, ...scholarships]);
      setModalOpen(false);
   };

   return (
      <Stack>
         <Group justify="space-between">
            <Box>
               <Title order={2}>Scholarships</Title>
               <Text c="dimmed" size="sm">Manage financial aid opportunities.</Text>
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
                        </Table.Td>
                     </Table.Tr>
                  ))}
               </Table.Tbody>
            </Table>
         </Card>

         <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Post Scholarship">
            <Stack>
               <TextInput label="Title" required value={newSch.title || ''} onChange={(e) => setNewSch({...newSch, title: e.target.value})} />
               <TextInput label="Provider" required value={newSch.provider || ''} onChange={(e) => setNewSch({...newSch, provider: e.target.value})} />
               <Group grow>
                  <Select label="Type" data={['Local', 'International']} value={newSch.type} onChange={(val) => setNewSch({...newSch, type: val as any})} />
                  <TextInput label="Value" placeholder="Full Tuition" value={newSch.value || ''} onChange={(e) => setNewSch({...newSch, value: e.target.value})} />
               </Group>
               <TextInput label="Deadline" type="date" value={newSch.deadLine || ''} onChange={(e) => setNewSch({...newSch, deadLine: e.target.value})} />
               <Button onClick={handleSave}>Publish</Button>
            </Stack>
         </Modal>
      </Stack>
   );
};

export default Scholarships;