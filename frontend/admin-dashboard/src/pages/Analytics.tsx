import React, { useEffect, useMemo, useState } from 'react';
import { Title, Text, Group, Button, SimpleGrid, Card, Badge, Stack, Box, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { Download } from 'lucide-react';
import {
   ResponsiveContainer,
   BarChart,
   Bar,
   LineChart,
   Line,
   XAxis,
   YAxis,
   Tooltip,
   CartesianGrid,
   LabelList,
   PieChart,
   Pie,
   Cell,
} from 'recharts';
import { onAdminDataChanged } from '../utils/adminEvents';

const COURSE_VIEWS = [
   { course: 'Computer Science', views: 1240 },
   { course: 'Medicine', views: 1132 },
   { course: 'Civil Engineering', views: 990 },
   { course: 'Software Engineering', views: 945 },
   { course: 'Business Management', views: 870 },
   { course: 'Accounting', views: 808 },
   { course: 'Law', views: 760 },
   { course: 'Architecture', views: 725 },
   { course: 'Nursing', views: 680 },
   { course: 'IT', views: 640 },
];

const COURSE_SHORT_LABEL: Record<string, string> = {
   'Computer Science': 'CompSci',
   'Medicine': 'Med',
   'Civil Engineering': 'Civil Eng',
   'Software Engineering': 'Soft Eng',
   'Business Management': 'Biz Mgmt',
   'Accounting': 'Acc',
   'Law': 'Law',
   'Architecture': 'Arch',
   'Nursing': 'Nursing',
   'IT': 'IT',
};

const TOOLS_USAGE = [
   { tool: 'Z-Score Analysis', uses: 420 },
   { tool: 'Education Path Mapper', uses: 310 },
   { tool: 'Scholarship Resolver', uses: 260 },
   { tool: 'Degree & Career Explorer', uses: 220 },
   { tool: 'AI Career Advisor', uses: 180 },
   { tool: 'Course Comparison', uses: 140 },
   { tool: 'Admission Sync', uses: 95 },
];

const INSTITUTION_USAGE = [
   { name: 'University of Colombo', size: 260 },
   { name: 'University of Peradeniya', size: 230 },
   { name: 'University of Moratuwa', size: 210 },
   { name: 'University of Kelaniya', size: 160 },
   { name: 'University of Sri Jayewardenepura', size: 155 },
   { name: 'Rajarata University', size: 120 },
   { name: 'Sabaragamuwa University', size: 110 },
   { name: 'Eastern University', size: 95 },
   { name: 'South Eastern University', size: 85 },
   { name: 'Uva Wellassa University', size: 75 },
];

const PIE_COLORS = ['#5c7cfa', '#9775fa', '#ff922b', '#40c057', '#fa5252', '#15aabf', '#fab005'];

const TOOL_SHORT_LABEL: Record<string, string> = {
   'Z-Score Analysis': 'Z-Score',
   'Education Path Mapper': 'Path Mapper',
   'Scholarship Resolver': 'Scholarships',
   'Degree & Career Explorer': 'Degree/Career',
   'AI Career Advisor': 'AI Advisor',
   'Course Comparison': 'Comparison',
   'Admission Sync': 'Admission',
};

function shortInstitutionLabel(value: unknown, max = 14) {
   const s = String(value ?? '').trim();
   if (!s) return '';
   if (s.length <= max) return s;

   const cleaned = s.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
   const words = cleaned.split(' ').filter(Boolean);
   const lower = words.map((w) => w.toLowerCase());

   // University of X (and multi-word X) -> UoX / UoSJ, etc.
   if (lower[0] === 'university' && lower[1] === 'of' && words.length >= 3) {
      const restInitials = words.slice(2).map((w) => w[0]?.toUpperCase() ?? '').join('');
      const acr = `Uo${restInitials}`;
      if (acr.length >= 3 && acr.length <= 8) return acr;
   }

   // General acronym, excluding common stop-words.
   const stop = new Set(['of', 'the', 'and', 'for']);
   const initials = words
      .filter((w) => !stop.has(w.toLowerCase()))
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');

   if (initials.length >= 2 && initials.length <= 6) return initials;
   return truncateLabel(s, max);
}

function shortCourseLabel(value: unknown, max = 10) {
   const s = String(value ?? '').trim();
   if (!s) return '';
   return COURSE_SHORT_LABEL[s] ?? truncateLabel(s, max);
}

function TwoLineTick({
   x,
   y,
   payload,
   fill,
   fontSize,
   getLabel,
}: {
   x?: number;
   y?: number;
   payload?: any;
   fill: string;
   fontSize: number;
   getLabel: (raw: unknown) => string;
}) {
   const raw = payload?.value;
   const label = getLabel(raw);
   const parts = label.split(' ').filter(Boolean);

   const line1 = parts[0] ?? '';
   const line2 = parts.length > 1 ? parts.slice(1).join(' ') : '';
   const px = Number.isFinite(Number(x)) ? Number(x) : 0;
   const py = Number.isFinite(Number(y)) ? Number(y) : 0;

   return (
      <g transform={`translate(${px},${py})`}>
         <text
            x={0}
            y={0}
            textAnchor="middle"
            fill={fill}
            fontSize={fontSize}
            fontWeight={700}
         >
            <tspan x="0" dy="12">{line1}</tspan>
            {line2 ? <tspan x="0" dy="12">{line2}</tspan> : null}
         </text>
      </g>
   );
}

function truncateLabel(value: unknown, max = 12) {
   const s = String(value ?? '');
   if (s.length <= max) return s;
   return `${s.slice(0, Math.max(0, max - 1))}…`;
}

function formatNumber(n: unknown) {
   const num = typeof n === 'number' ? n : Number(n);
   if (!Number.isFinite(num)) return String(n ?? '');
   return new Intl.NumberFormat().format(num);
}

function ChartTooltip({
   active,
   label,
   payload,
   title,
   valueLabel,
   valueKey,
   nameKey,
   dark,
}: {
   active?: boolean;
   label?: unknown;
   payload?: any[];
   title?: string;
   valueLabel: string;
   valueKey: string;
   nameKey?: string;
   dark: boolean;
}) {
   if (!active || !payload?.length) return null;
   const p0 = payload[0];
   const row = p0?.payload ?? {};
   const name = nameKey ? row?.[nameKey] : (label ?? row?.name ?? row?.tool ?? row?.course);
   const value = row?.[valueKey] ?? p0?.value;
   const bg = dark ? 'rgba(17, 17, 17, 0.92)' : 'rgba(255, 255, 255, 0.96)';
   const border = dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)';
   const fg = dark ? '#f1f3f5' : '#212529';

   return (
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 12px', color: fg, maxWidth: 240 }}>
         <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 6 }}>{title ?? 'Details'}</div>
         <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>{String(name ?? '')}</div>
         <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
            <span style={{ opacity: 0.8 }}>{valueLabel}</span>
            <span style={{ fontWeight: 700 }}>{formatNumber(value)}</span>
         </div>
      </div>
   );
}

function ToolUsageTooltip({
   active,
   payload,
   dark,
   total,
}: {
   active?: boolean;
   payload?: any[];
   dark: boolean;
   total: number;
}) {
   if (!active || !payload?.length) return null;
   const p0 = payload[0];
   const row = p0?.payload ?? {};
   const rawName = row?.tool;
   const name = TOOL_SHORT_LABEL[String(rawName ?? '')] ?? rawName;
   const uses = typeof row?.uses === 'number' ? row.uses : Number(p0?.value);
   const pct = total > 0 && Number.isFinite(uses) ? Math.round((uses / total) * 100) : 0;

   const bg = dark ? 'rgba(17, 17, 17, 0.92)' : 'rgba(255, 255, 255, 0.96)';
   const border = dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)';
   const fg = dark ? '#f1f3f5' : '#212529';

   return (
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 12px', color: fg, maxWidth: 260 }}>
         <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 6 }}>Tool</div>
         <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>{String(name ?? '')}</div>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, fontSize: 13 }}>
            <span style={{ opacity: 0.8 }}>Usage</span>
            <span style={{ fontWeight: 700 }}>{pct}%</span>
         </div>
      </div>
   );
}

function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
   const blob = new Blob([content], { type: mime });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = filename;
   document.body.appendChild(a);
   a.click();
   a.remove();
   URL.revokeObjectURL(url);
}

const Analytics: React.FC = () => {
   const theme = useMantineTheme();
   const { colorScheme } = useMantineColorScheme();
   const dark = colorScheme === 'dark';
   const [, setRefreshTick] = useState(0);
   const topCourses = useMemo(() => {
      return [...COURSE_VIEWS].sort((a, b) => b.views - a.views).slice(0, 10);
   }, []);

   const totalToolUses = useMemo(() => TOOLS_USAGE.reduce((sum, t) => sum + t.uses, 0), []);
   const toolLegendItems = useMemo(() => {
      return TOOLS_USAGE.map((t, idx) => {
         const color = PIE_COLORS[idx % PIE_COLORS.length];
         const pct = totalToolUses > 0 ? Math.round((t.uses / totalToolUses) * 100) : 0;
         const shortTool = TOOL_SHORT_LABEL[t.tool] ?? t.tool;
         return { ...t, color, pct, shortTool };
      });
   }, [totalToolUses]);

   const institutionSeries = useMemo(() => {
      return [...INSTITUTION_USAGE]
         .sort((a, b) => b.size - a.size)
         .map((row) => ({
            ...row,
            shortLabel: shortInstitutionLabel(row.name, 14),
         }));
   }, []);

   useEffect(() => {
      return onAdminDataChanged(() => setRefreshTick((t) => t + 1));
   }, []);

   const handleExport = () => {
      const csvContent = [
         'Course,Views',
         ...topCourses.map((e) => `${JSON.stringify(e.course)},${e.views}`),
      ].join('\n');
      downloadTextFile('analytics-top-courses-by-views.csv', csvContent, 'text/csv;charset=utf-8');
   };

   return (
      <Stack>
         <Group justify="space-between">
            <Box>
               <Title order={2}>Intelligence & Insights</Title>
               <Text c="dimmed" size="sm">Deep dive into user behavior.</Text>
            </Box>
            <Group>
               <Button variant="default" leftSection={<Download size={16} />} onClick={handleExport}>Export</Button>
            </Group>
         </Group>

         <SimpleGrid cols={{ base: 1, md: 3 }}>
            {[
               { label: 'Top Course Views', val: String(topCourses[0]?.views ?? 0), trend: 'Top 1', good: true },
               { label: 'Tools Usage', val: String(totalToolUses), trend: 'Total', good: true },
               { label: 'Institutions Used', val: String(INSTITUTION_USAGE.length), trend: 'Tracked', good: true },
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
               <Title order={4} mb="lg">Top 10 Courses by Views</Title>
               <Box h={340}>
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={topCourses} margin={{ top: 26, right: 16, left: 0, bottom: 26 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? theme.colors.dark[4] : theme.colors.gray[3]} />
                        <XAxis
                           dataKey="course"
                           axisLine={false}
                           tickLine={false}
                           interval={0}
                           angle={0}
                           height={62}
                           padding={{ left: 10, right: 10 }}
                           tick={(props: any) => (
                              <TwoLineTick
                                 {...props}
                                 fill={dark ? theme.colors.gray[4] : theme.colors.gray[7]}
                                 fontSize={11}
                                 getLabel={(raw) => shortCourseLabel(raw, 10)}
                              />
                           )}
                        />
                        <YAxis
                           allowDecimals={false}
                           axisLine={false}
                           tickLine={false}
                           tick={{ fill: dark ? theme.colors.gray[4] : theme.colors.gray[7], fontSize: 12 }}
                        />
                        <Tooltip
                           cursor={{ fill: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                           content={(props) => (
                              <ChartTooltip
                                 {...props}
                                 dark={dark}
                                 title="Course"
                                 valueLabel="Views"
                                 valueKey="views"
                              />
                           )}
                        />
                        <Bar dataKey="views" fill={theme.colors.blue[6]} radius={[8, 8, 0, 0]} maxBarSize={48}>
                           <LabelList dataKey="views" position="top" fill={dark ? theme.colors.gray[2] : theme.colors.gray[8]} fontSize={12} formatter={(v: any) => formatNumber(v)} />
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </Box>
               <Text size="xs" c="dimmed">Tip: hover a bar to see the full course name.</Text>
            </Card>

            <Card withBorder radius="md" padding="lg">
               <Title order={4} mb="lg">Tools Usage</Title>
               <Box h={300}>
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Tooltip
                           content={(props) => <ToolUsageTooltip {...props} dark={dark} total={totalToolUses} />}
                        />
                        <Pie
                           data={TOOLS_USAGE}
                           dataKey="uses"
                           nameKey="tool"
                           cx="50%"
                           cy="50%"
                           innerRadius={70}
                           outerRadius={110}
                           paddingAngle={2}
                        >
                           {TOOLS_USAGE.map((_, idx) => (
                              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                           ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
               </Box>
               <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px 14px',
                  marginTop: 10,
               }}>
                  {toolLegendItems.map((t) => (
                     <div
                        key={t.tool}
                        style={{
                           display: 'flex',
                           alignItems: 'center',
                           gap: 8,
                           minWidth: 220,
                           flex: '1 1 220px',
                        }}
                     >
                        <span style={{ width: 10, height: 10, borderRadius: 999, background: t.color, flex: '0 0 10px' }} />
                        <span style={{
                           color: dark ? theme.colors.gray[2] : theme.colors.gray[8],
                           fontSize: 12,
                           fontWeight: 700,
                           lineHeight: 1.2,
                        }}>
                           {truncateLabel(t.shortTool, 16)}
                        </span>
                        <span style={{
                           marginLeft: 'auto',
                           color: dark ? theme.colors.gray[4] : theme.colors.gray[6],
                           fontSize: 12,
                           fontWeight: 700,
                        }}>
                           {t.pct}%
                        </span>
                     </div>
                  ))}
               </div>
               <Text size="xs" c="dimmed" mt={8}>Shows module usage distribution.</Text>
            </Card>
         </SimpleGrid>

         <Card withBorder radius="md" padding="lg">
            <Title order={4} mb="lg">Institution Usage</Title>
            <Box h={360}>
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={institutionSeries} margin={{ top: 16, right: 18, left: 0, bottom: 26 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? theme.colors.dark[4] : theme.colors.gray[3]} />
                     <XAxis
                        dataKey="shortLabel"
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={0}
                        height={62}
                        padding={{ left: 10, right: 10 }}
                        tick={(props: any) => (
                           <TwoLineTick
                              {...props}
                              fill={dark ? theme.colors.gray[4] : theme.colors.gray[7]}
                              fontSize={11}
                              getLabel={(raw) => String(raw ?? '')}
                           />
                        )}
                     />
                     <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: dark ? theme.colors.gray[4] : theme.colors.gray[7], fontSize: 12 }}
                     />
                     <Tooltip
                        cursor={{ stroke: dark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.16)' }}
                        content={(props) => (
                           <ChartTooltip
                              {...props}
                              dark={dark}
                              title="Institution"
                              valueLabel="Uses"
                              valueKey="size"
                              nameKey="name"
                           />
                        )}
                     />
                     <Line
                        type="monotone"
                        dataKey="size"
                        stroke={theme.colors.grape[6]}
                        strokeWidth={3}
                        dot={{ r: 4, stroke: theme.colors.grape[6], strokeWidth: 2, fill: dark ? theme.colors.dark[7] : theme.white }}
                        activeDot={{ r: 6 }}
                     />
                  </LineChart>
               </ResponsiveContainer>
            </Box>
            <Text size="xs" c="dimmed">Sorted by usage (highest → lowest). Hover to see full name.</Text>
         </Card>
      </Stack>
   );
};

export default Analytics;