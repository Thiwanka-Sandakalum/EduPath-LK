import React, { useState } from 'react';
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
  useMantineTheme
} from '@mantine/core';

const statsData = [
  { label: 'Total Institutions', value: '142', change: '+12%', icon: School, color: 'blue' },
  { label: 'Active Courses', value: '2,840', change: '+4.5%', icon: BookOpen, color: 'teal' },
  { label: 'Registered Students', value: '45.2k', change: '+18%', icon: Users, color: 'grape' },
  { label: 'Active Scholarships', value: '312', change: '+22%', icon: GraduationCap, color: 'yellow' },
];

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

const scholarshipEngagement = [
  { name: 'Local', value: 65 }, { name: 'International', value: 35 },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const [timeRange, setTimeRange] = useState<string | null>('7d');
  const chartData = timeRange === '7d' ? weeklyData : monthlyData;

  // Dynamically get colors from theme
  const PIE_COLORS = [theme.colors.blue[6], theme.colors.teal[6]];

  const handleReview = (id: number) => navigate('/admin/institutions');

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
              <Badge variant="light" color="teal">{stat.change}</Badge>
            </Group>
            <Text c="dimmed" size="xs" fw={700} tt="uppercase">{stat.label}</Text>
            <Text fw={700} size="xl">{stat.value}</Text>
          </Card>
        ))}
      </SimpleGrid>

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
          <Title order={4} mb="lg">Scholarship Split</Title>
          <Box h={240}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scholarshipEngagement}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {scholarshipEngagement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: theme.colors.dark[7], borderColor: theme.colors.dark[7], borderRadius: 8, color: 'white' }}
                   itemStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Stack gap="xs" mt="md">
             {scholarshipEngagement.map((item, idx) => (
               <Group key={idx} justify="space-between">
                  <Group gap="xs">
                     <Box w={10} h={10} bg={PIE_COLORS[idx]} style={{borderRadius:'50%'}} />
                     <Text size="sm">{item.name}</Text>
                  </Group>
                  <Text size="sm" fw={700}>{item.value}%</Text>
               </Group>
             ))}
          </Stack>
        </Card>
      </SimpleGrid>

      <Card radius="md" padding="lg">
         <Group justify="space-between" mb="md">
            <Group gap="xs">
               <AlertCircle size={20} color={theme.colors.yellow[6]} />
               <Title order={4}>Pending Verifications</Title>
            </Group>
            <Button variant="subtle" size="xs" onClick={() => navigate('/admin/institutions')}>View All</Button>
         </Group>
         <Table highlightOnHover>
            <Table.Thead>
               <Table.Tr>
                  <Table.Th>Institution</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th style={{textAlign: 'right'}}>Action</Table.Th>
               </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
               {[1, 2, 3].map((_, i) => (
                  <Table.Tr key={i}>
                     <Table.Td fw={500}>University of {['Colombo', 'Kelaniya', 'Moratuwa'][i]}</Table.Td>
                     <Table.Td>State</Table.Td>
                     <Table.Td><Badge color="yellow" variant="light">Pending</Badge></Table.Td>
                     <Table.Td style={{textAlign: 'right'}}>
                        <Button size="xs" variant="light" onClick={() => handleReview(i)}>Review</Button>
                     </Table.Td>
                  </Table.Tr>
               ))}
            </Table.Tbody>
         </Table>
      </Card>
    </Box>
  );
};

export default Dashboard;