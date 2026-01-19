import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
   Title, Text, Group, Button, TextInput, Grid, Card, Checkbox, RangeSlider, Stack, Modal, NumberInput, Select, Box, ThemeIcon, ActionIcon, useMantineColorScheme
} from '@mantine/core';
import { Search, Plus, ExternalLink, GraduationCap, Award, DollarSign, Filter, Pencil } from 'lucide-react';
import { Course } from '../types';
import { mockCourses } from '../data/mockData';

const LEVELS = ['Undergraduate', 'Postgraduate', 'Diploma', 'Vocational'];

const Courses: React.FC = () => {
   const { colorScheme } = useMantineColorScheme();
   const isDark = colorScheme === 'dark';
   const [searchParams] = useSearchParams();
   const [courses, setCourses] = useState<Course[]>(mockCourses);
   const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
   const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
   const [maxFee, setMaxFee] = useState(2500000);
   const [modalOpen, setModalOpen] = useState(false);
   const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({});

   useEffect(() => {
     const query = searchParams.get('search');
     if (query !== null) setSearchTerm(query);
   }, [searchParams]);

   const filteredCourses = courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level);
      const matchesFee = course.numericFee <= maxFee;
      return matchesSearch && matchesLevel && matchesFee;
   });

   const toggleLevel = (lvl: string) => {
      setSelectedLevels(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);
   };

   const handleSave = () => {
      if(!currentCourse.name) return;
      
      if (currentCourse.id) {
          // Edit existing
          setCourses(prev => prev.map(c => c.id === currentCourse.id ? { ...c, ...currentCourse } as Course : c));
      } else {
          // Add new
          const newCourse = { ...currentCourse, id: Date.now().toString(), numericFee: currentCourse.numericFee || 0 } as Course;
          setCourses([newCourse, ...courses]);
      }
      setModalOpen(false);
   };

   const openEdit = (course: Course) => {
       setCurrentCourse({ ...course });
       setModalOpen(true);
   };

   const openNew = () => {
       setCurrentCourse({});
       setModalOpen(true);
   };

   return (
      <Stack>
         <Group justify="space-between">
            <Box>
               <Title order={2}>Courses</Title>
               <Text c="dimmed" size="sm">Manage degree programs and requirements.</Text>
            </Box>
            <Button leftSection={<Plus size={16} />} onClick={openNew}>New Course</Button>
         </Group>

         <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 3 }}>
               <Card withBorder radius="md" p="md">
                  <Group gap="xs" mb="md" c="dimmed">
                     <Filter size={14} />
                     <Text size="xs" fw={700} tt="uppercase">Filters</Text>
                  </Group>
                  <TextInput 
                     placeholder="Search..." 
                     mb="lg" 
                     leftSection={<Search size={14} />} 
                     value={searchTerm} 
                     onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                  
                  <Stack gap="xs" mb="lg">
                     <Text size="sm" fw={500}>Level</Text>
                     {LEVELS.map(lvl => (
                        <Checkbox 
                           key={lvl} 
                           label={lvl} 
                           checked={selectedLevels.includes(lvl)} 
                           onChange={() => toggleLevel(lvl)} 
                        />
                     ))}
                  </Stack>

                  <Box>
                     <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500}>Max Fee</Text>
                        <Text size="xs" fw={700} c="blue">{maxFee >= 1000000 ? (maxFee/1000000).toFixed(1)+'M' : (maxFee/1000).toFixed(0)+'k'}</Text>
                     </Group>
                     <RangeSlider 
                        min={0} 
                        max={5000000} 
                        step={100000} 
                        value={[0, maxFee]} 
                        onChange={(val) => setMaxFee(val[1])} 
                        color="blue"
                     />
                  </Box>
               </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 9 }}>
               <Grid>
                  {filteredCourses.map(course => (
                     <Grid.Col key={course.id} span={{ base: 12, md: 6 }}>
                        <Card withBorder radius="md" p="lg">
                           <Group align="flex-start" mb="md" justify="space-between">
                              <Group>
                                 <ThemeIcon size={40} radius="md" variant="light" color="blue">
                                    <GraduationCap size={24} />
                                 </ThemeIcon>
                                 <Box>
                                    <Text fw={700} lineClamp={1}>{course.name}</Text>
                                    <Text size="xs" c="dimmed">{course.uni}</Text>
                                 </Box>
                              </Group>
                              <ActionIcon variant="subtle" color="gray" component="a" href="#" onClick={(e) => e.preventDefault()}>
                                 <ExternalLink size={16} />
                              </ActionIcon>
                           </Group>
                           
                           <Grid gutter="xs" mb="md">
                              <Grid.Col span={6}>
                                 <Card bg={isDark ? 'dark.6' : 'gray.0'} p="xs" radius="sm">
                                    <Group gap={4} mb={4}>
                                       <Award size={14} />
                                       <Text size="xs" c="dimmed">Entry</Text>
                                    </Group>
                                    <Text size="xs" fw={600} lineClamp={1}>{course.requirements}</Text>
                                 </Card>
                              </Grid.Col>
                              <Grid.Col span={6}>
                                 <Card bg={isDark ? 'dark.6' : 'gray.0'} p="xs" radius="sm">
                                    <Group gap={4} mb={4}>
                                       <DollarSign size={14} />
                                       <Text size="xs" c="dimmed">Fees</Text>
                                    </Group>
                                    <Text size="xs" fw={600}>{course.feeDisplay}</Text>
                                 </Card>
                              </Grid.Col>
                           </Grid>

                           <Group justify="space-between">
                              <Stack gap={0}>
                                 <Text size="xs" fw={700} c="dimmed" tt="uppercase">{course.duration}</Text>
                                 <Text size="xs" c="blue">{course.level}</Text>
                              </Stack>
                              <Button variant="light" size="xs" leftSection={<Pencil size={12}/>} onClick={() => openEdit(course)}>Edit Details</Button>
                           </Group>
                        </Card>
                     </Grid.Col>
                  ))}
               </Grid>
               {filteredCourses.length === 0 && (
                  <Text ta="center" c="dimmed" mt="xl">No courses found.</Text>
               )}
            </Grid.Col>
         </Grid>

         <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={currentCourse.id ? "Edit Course" : "Add New Course"}>
            <Stack>
               <TextInput label="Course Name" placeholder="BSc..." value={currentCourse.name || ''} onChange={(e) => setCurrentCourse({...currentCourse, name: e.target.value})} />
               <TextInput label="University" value={currentCourse.uni || ''} onChange={(e) => setCurrentCourse({...currentCourse, uni: e.target.value})} />
               <Group grow>
                  <Select label="Level" data={LEVELS} value={currentCourse.level} onChange={(val) => setCurrentCourse({...currentCourse, level: val || ''})} />
                  <NumberInput label="Fee (Numeric)" value={currentCourse.numericFee} onChange={(val) => setCurrentCourse({...currentCourse, numericFee: Number(val)})} />
               </Group>
               <TextInput label="Requirements" value={currentCourse.requirements || ''} onChange={(e) => setCurrentCourse({...currentCourse, requirements: e.target.value})} />
               <Group grow>
                  <TextInput label="Duration" value={currentCourse.duration || ''} onChange={(e) => setCurrentCourse({...currentCourse, duration: e.target.value})} />
                  <TextInput label="Fee Display" value={currentCourse.feeDisplay || ''} onChange={(e) => setCurrentCourse({...currentCourse, feeDisplay: e.target.value})} />
               </Group>
               <Button onClick={handleSave}>{currentCourse.id ? "Update Course" : "Save Course"}</Button>
            </Stack>
         </Modal>
      </Stack>
   );
};

export default Courses;