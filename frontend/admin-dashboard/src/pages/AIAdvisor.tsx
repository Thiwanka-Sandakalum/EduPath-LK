import React, { useState } from 'react';
import { Title, Text, Group, Button, Grid, Card, Textarea, Switch, Badge, Table, Stack, Box, TextInput, LoadingOverlay } from '@mantine/core';
import { Bot, Save, Play, Zap, ShieldAlert, Check } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const AIAdvisor: React.FC = () => {
   const [prompt, setPrompt] = useState('You are the EduPath AI Advisor...');
   const [testQ, setTestQ] = useState('');
   const [testRes, setTestRes] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const [saved, setSaved] = useState(false);

   const handleSave = () => {
       setSaved(true);
       setTimeout(() => setSaved(false), 2000);
   };

   const handleTest = async () => {
      if(!process.env.API_KEY) { alert("Missing API Key"); return; }
      setLoading(true);
      try {
         const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
         const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: testQ });
         setTestRes(res.text || "No response");
      } catch(e) { setTestRes("Error"); }
      setLoading(false);
   };

   return (
      <Stack>
         <Box>
            <Group>
               <Bot size={24} color="blue" />
               <Title order={2}>AI Advisor Control</Title>
            </Group>
            <Text c="dimmed">Configure Gemini-powered guidance.</Text>
         </Box>

         <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 8 }}>
               <Card withBorder radius="md" mb="lg">
                  <Group justify="space-between" mb="md">
                     <Group gap="xs">
                        <Zap size={16} color="orange" />
                        <Text fw={600}>System Instruction Engine</Text>
                     </Group>
                     <Badge>Gemini 3 Flash</Badge>
                  </Group>
                  <Textarea 
                     minRows={8} 
                     value={prompt} 
                     onChange={(e) => setPrompt(e.currentTarget.value)} 
                     mb="md"
                  />
                  <Group justify="space-between">
                     <Text size="xs" c="dimmed">Changes impact immediately.</Text>
                     <Button 
                         leftSection={saved ? <Check size={16}/> : <Save size={16} />} 
                         color={saved ? "green" : "blue"}
                         onClick={handleSave}
                     >
                         {saved ? "Saved" : "Save Changes"}
                     </Button>
                  </Group>
               </Card>

               <Card withBorder radius="md" pos="relative">
                  <LoadingOverlay visible={loading} />
                  <Group mb="md">
                     <Play size={16} color="green" />
                     <Text fw={600}>Simulator</Text>
                  </Group>
                  <Group mb="md">
                     <TextInput 
                        placeholder="Test student query..." 
                        style={{ flex: 1 }} 
                        value={testQ} 
                        onChange={(e) => setTestQ(e.target.value)} 
                     />
                     <Button onClick={handleTest}>Test</Button>
                  </Group>
                  {testRes && (
                     <Card bg="var(--mantine-color-gray-0)">
                        <Group align="flex-start">
                           <Bot size={20} />
                           <Text size="sm">{testRes}</Text>
                        </Group>
                     </Card>
                  )}
               </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
               <Stack>
                  <Card withBorder radius="md">
                     <Text fw={600} mb="md">Guardrails</Text>
                     <Stack>
                        <Switch label="Academic Integrity" defaultChecked description="Prevent plagiarism advice" />
                        <Switch label="Fee Accuracy" defaultChecked description="Mandatory 'Estimated' tag" />
                        <Switch label="Z-Score Buffer" description="Disclaimer on fluctuations" />
                     </Stack>
                  </Card>

                  <Card withBorder radius="md" bg="red.0" c="red.9" style={{borderColor: 'var(--mantine-color-red-2)'}}>
                     <Group mb="xs">
                        <ShieldAlert size={18} />
                        <Text fw={600}>Safety Flags</Text>
                     </Group>
                     <Text size="sm">14 blocked prompts this month.</Text>
                  </Card>
               </Stack>
            </Grid.Col>
         </Grid>
      </Stack>
   );
};

export default AIAdvisor;