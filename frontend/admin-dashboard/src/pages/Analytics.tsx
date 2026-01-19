import React, { useState } from 'react';
import { Title, Text, Group, Button, SimpleGrid, Card, Select, Badge, Stack, Box, useMantineTheme } from '@mantine/core';
import { Download, Filter, TrendingUp, Sparkles } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const DATA = [
   { label: 'Jan', Medicine: 4000, Engineering: 2400, IT: 2400 },
   { label: 'Feb', Medicine: 3000, Engineering: 1398, IT: 2210 },
   { label: 'Mar', Medicine: 2000, Engineering: 9800, IT: 2290 },
   { label: 'Apr', Medicine: 2780, Engineering: 3908, IT: 2000 },
   { label: 'May', Medicine: 1890, Engineering: 4800, IT: 2181 },
   { label: 'Jun', Medicine: 2390, Engineering: 3800, IT: 2500 },
];
const ZSCORE = [
   { level: 'Bio', value: 380 }, { level: 'Math', value: 450 }, { level: 'Comm', value: 520 }, { level: 'Arts', value: 310 }
];

const Analytics: React.FC = () => {
   const theme = useMantineTheme();
   const [generating, setGenerating] = useState(false);
   const [report, setReport] = useState<string | null>(null);

   const generateAI = async () => {
      if(!process.env.API_KEY) { alert("No API Key configured in environment"); return; }
      setGenerating(true);
      try {
         const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
         const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: 'Analyze trends: Medicine rising.' });
         setReport(res.text || "No report.");
      } catch(e) { console.error(e); setReport("Failed to generate report."); }
      setGenerating(false);
   };

   const handleExport = () => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Month,Medicine,Engineering,IT\n"
        + DATA.map(e => `${e.label},${e.Medicine},${e.Engineering},${e.IT}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      window.open(encodedUri);
   };

   return (
      <Stack>
         <Group justify="space-between">
            <Box>
               <Title order={2}>Intelligence & Insights</Title>
               <Text c="dimmed" size="sm">Deep dive into user behavior.</Text>
            </Box>
            <Group>
               <Button variant="default" leftSection={<Filter size={16} />} onClick={() => alert("Date range filtering would appear here.")}>Filter</Button>
               <Button variant="default" leftSection={<Download size={16} />} onClick={handleExport}>Export</Button>
               <Button 
                  variant="gradient" 
                  gradient={{ from: 'blue', to: 'grape', deg: 90 }} 
                  leftSection={<Sparkles size={16} />}
                  onClick={generateAI}
                  loading={generating}
               >
                  Generate AI Report
               </Button>
            </Group>
         </Group>

         {report && (
            <Card withBorder radius="md" bg="blue.0" c="blue.9">
               <Text fw={700}>AI Summary</Text>
               <Text size="sm">{report}</Text>
            </Card>
         )}

         <SimpleGrid cols={{ base: 1, md: 3 }}>
            {[
               { label: 'Search Depth', val: '4.2 pages', trend: '+12%', good: true },
               { label: 'Bounce Rate', val: '24.5%', trend: '-2%', good: true },
               { label: 'AI Satisfaction', val: '92%', trend: '+5%', good: true },
            ].map((kpi, i) => (
               <Card key={i} withBorder padding="lg" radius="md">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">{kpi.label}</Text>
                  <Group align="flex-end" justify="space-between" mt="xs">
                     <Text size="xl" fw={700}>{kpi.val}</Text>
                     <Badge color={kpi.good ? 'green' : 'red'} variant="light">{kpi.trend}</Badge>
                  </Group>
               </Card>
            ))}
         </SimpleGrid>

         <SimpleGrid cols={{ base: 1, lg: 2 }}>
            <Card withBorder radius="md" padding="lg">
               <Title order={4} mb="lg">Stream Popularity</Title>
               <Box h={300}>
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.gray[3]} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Medicine" stroke={theme.colors.blue[6]} strokeWidth={3} />
                        <Line type="monotone" dataKey="Engineering" stroke={theme.colors.orange[6]} strokeWidth={3} />
                        <Line type="monotone" dataKey="IT" stroke={theme.colors.green[6]} strokeWidth={3} />
                     </LineChart>
                  </ResponsiveContainer>
               </Box>
            </Card>
            <Card withBorder radius="md" padding="lg">
               <Title order={4} mb="lg">Z-Score Usage</Title>
               <Box h={300}>
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={ZSCORE} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.colors.gray[3]} />
                        <XAxis type="number" axisLine={false} tickLine={false} />
                        <YAxis dataKey="level" type="category" axisLine={false} tickLine={false} width={50} />
                        <Tooltip />
                        <Bar dataKey="value" fill={theme.colors.blue[6]} radius={[0, 4, 4, 0]} barSize={30} />
                     </BarChart>
                  </ResponsiveContainer>
               </Box>
            </Card>
         </SimpleGrid>
      </Stack>
   );
};

export default Analytics;