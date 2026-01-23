import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Title, Text, Group, Button, TextInput, Table, Badge, Menu, ActionIcon, Modal, Select, Stack, Box, Card, Collapse, useMantineColorScheme
} from '@mantine/core';
import { Search, Filter, Plus, MoreVertical, ShieldCheck, Trash2, Building2 } from 'lucide-react';
import { InstitutionType, VerificationStatus } from '../types';
import { mockInstitutions } from '../data/mockData';

const Institutions: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchParams] = useSearchParams();
  const [institutions, setInstitutions] = useState(mockInstitutions);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newInstitution, setNewInstitution] = useState({ name: '', type: InstitutionType.PRIVATE, location: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) setSearchTerm(query);
  }, [searchParams]);

  const filteredInstitutions = institutions.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter ? item.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  const handleAddSubmit = () => {
    if (!newInstitution.name || !newInstitution.location) return;
    const newItem = {
      id: Date.now().toString(),
      name: newInstitution.name,
      type: newInstitution.type,
      location: newInstitution.location,
      status: VerificationStatus.PENDING,
      courses: 0,
      updated: new Date().toISOString().split('T')[0]
    };
    setInstitutions(prev => [newItem, ...prev]);
    setAddModalOpen(false);
    setNewInstitution({ name: '', type: InstitutionType.PRIVATE, location: '' });
  };

  const toggleVerify = (id: string) => {
    setInstitutions(prev => prev.map(i => i.id === id ? { ...i, status: i.status === VerificationStatus.VERIFIED ? VerificationStatus.PENDING : VerificationStatus.VERIFIED } : i));
  };

  const handleDelete = (id: string) => {
    if(confirm('Are you sure?')) setInstitutions(prev => prev.filter(i => i.id !== id));
  };

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Box>
           <Title order={2}>Institutions</Title>
           <Text c="dimmed" size="sm">Manage state, private, and vocational educational bodies.</Text>
        </Box>
        <Group>
           <Button 
               variant={filtersOpen ? "filled" : "default"} 
               leftSection={<Filter size={16} />} 
               onClick={() => setFiltersOpen(!filtersOpen)}
            >
               Filters
            </Button>
           <Button leftSection={<Plus size={16} />} onClick={() => setAddModalOpen(true)}>Add Institution</Button>
        </Group>
      </Group>

      <Card radius="md" padding="0">
         <Group p="md" justify="space-between">
            <TextInput 
               placeholder="Search institutions..." 
               leftSection={<Search size={16} />} 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               w={300}
            />
            <Text size="xs" c="dimmed">Showing {filteredInstitutions.length} institutions</Text>
         </Group>

         <Collapse in={filtersOpen}>
            <Group px="md" pb="md" bg={isDark ? 'dark.7' : 'gray.0'}>
                <Select 
                    placeholder="Filter by Type"
                    data={Object.values(InstitutionType)}
                    value={typeFilter}
                    onChange={setTypeFilter}
                    clearable
                    size="xs"
                />
            </Group>
         </Collapse>

         <Table>
            <Table.Thead bg={isDark ? 'dark.6' : 'gray.0'}>
               <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Courses</Table.Th>
                  <Table.Th style={{textAlign: 'right'}}>Action</Table.Th>
               </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
               {filteredInstitutions.map((item) => (
                  <Table.Tr key={item.id}>
                     <Table.Td fw={500}>{item.name}</Table.Td>
                     <Table.Td><Badge variant="outline">{item.type}</Badge></Table.Td>
                     <Table.Td>{item.location}</Table.Td>
                     <Table.Td>
                        <Badge color={item.status === VerificationStatus.VERIFIED ? 'green' : 'yellow'} variant="light">
                           {item.status}
                        </Badge>
                     </Table.Td>
                     <Table.Td>{item.courses}</Table.Td>
                     <Table.Td style={{textAlign: 'right'}}>
                        <Menu position="bottom-end">
                           <Menu.Target>
                              <ActionIcon variant="subtle" color="gray"><MoreVertical size={16} /></ActionIcon>
                           </Menu.Target>
                           <Menu.Dropdown>
                              <Menu.Item leftSection={<ShieldCheck size={14} />} onClick={() => toggleVerify(item.id)}>
                                 {item.status === VerificationStatus.VERIFIED ? 'Unverify' : 'Verify'}
                              </Menu.Item>
                              <Menu.Item leftSection={<Trash2 size={14} />} color="red" onClick={() => handleDelete(item.id)}>
                                 Delete
                              </Menu.Item>
                           </Menu.Dropdown>
                        </Menu>
                     </Table.Td>
                  </Table.Tr>
               ))}
               {filteredInstitutions.length === 0 && (
                  <Table.Tr>
                     <Table.Td colSpan={6} align="center" py="xl" c="dimmed">No institutions found</Table.Td>
                  </Table.Tr>
               )}
            </Table.Tbody>
         </Table>
      </Card>

      <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title={<Group><Building2 size={20} /><Text fw={700}>New Institution</Text></Group>}>
         <Stack>
            <TextInput 
               label="Name" 
               placeholder="University of..." 
               required
               value={newInstitution.name}
               onChange={(e) => setNewInstitution({...newInstitution, name: e.target.value})} 
            />
            <Select 
               label="Type"
               data={Object.values(InstitutionType)}
               value={newInstitution.type}
               onChange={(val) => setNewInstitution({...newInstitution, type: val as InstitutionType})}
            />
            <TextInput 
               label="Location"
               placeholder="City"
               required
               value={newInstitution.location}
               onChange={(e) => setNewInstitution({...newInstitution, location: e.target.value})} 
            />
            <Group justify="flex-end" mt="md">
               <Button variant="default" onClick={() => setAddModalOpen(false)}>Cancel</Button>
               <Button onClick={handleAddSubmit}>Register</Button>
            </Group>
         </Stack>
      </Modal>
    </Box>
  );
};

export default Institutions;