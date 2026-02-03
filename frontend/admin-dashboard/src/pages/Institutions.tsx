import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
   ActionIcon,
   Alert,
   Badge,
   Box,
   Button,
   Card,
   Code,
   Divider,
   Group,
   Loader,
   Menu,
   Modal,
   MultiSelect,
   NumberInput,
   Select,
   SimpleGrid,
   Stack,
   Table,
   Text,
   TextInput,
   Textarea,
   Title,
   useMantineColorScheme,
} from '@mantine/core';
import { Building2, Eye, Globe, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';
import { InstitutionType } from '../types';
import { InstitutionsService } from '../types/services/InstitutionsService';
import type { Institution as ApiInstitution } from '../types/models/Institution';
import { emitAdminDataChanged } from '../utils/adminEvents';

const getErrorMessage = (err: any): string => {
   return (
      err?.body?.message ||
      err?.message ||
      err?.statusText ||
      'Failed to load institutions'
   );
};

type GovernmentInstitution = {
   _id: string;
   name: string;
   type?: string;
   location?: string;
   abbreviation?: string;
   image_url?: string;
   contact?: {
      address?: string;
      phone?: string[];
      website?: string;
   };
};

type GovernmentInstitutionsPayload = {
   updatedAt?: string;
   institutions?: GovernmentInstitution[];
};

const API_PAGE_LIMIT = 100;

const getGovernmentInstitutionsPublicUrl = () => {
   const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/') ;
   const origin = typeof window !== 'undefined' ? window.location.origin : '';
   // Example: origin=http://localhost:3001, basePath=/, result=http://localhost:3001/government-institutions.json
   // Example: basePath=/admin/, result=http://localhost:3001/admin/government-institutions.json
   return `${origin}${basePath}government-institutions.json`;
};

const stripBom = (text: string) => (text && text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);

const normalizeWebsiteUrl = (website?: string) => {
   const w = (website || '').trim();
   if (!w) return undefined;
   if (w.startsWith('http://') || w.startsWith('https://')) return w;
   return `https://${w}`;
};

const getWebsiteLabel = (url?: string) => {
   const raw = (url || '').trim();
   if (!raw) return undefined;
   try {
      const u = new URL(raw);
      return u.hostname.replace(/^www\./i, '');
   } catch {
      // Fallback for any odd/non-absolute URLs
      return raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] || 'Website';
   }
};

const getVerificationStatus = (inst: ApiInstitution, isGovernment: boolean) => {
   if (isGovernment) return { label: 'Verified', color: 'green' as const };
   const score = inst.confidence_score ?? 0;
   if (score >= 0.75) return { label: 'Verified', color: 'green' as const };
   if (score >= 0.5) return { label: 'Review', color: 'yellow' as const };
   return { label: 'Unverified', color: 'red' as const };
};

const toIsoDate = (yyyyMmDd?: string) => {
   const raw = (yyyyMmDd || '').trim();
   if (!raw) return new Date().toISOString();
   const d = new Date(`${raw}T00:00:00.000Z`);
   return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
};

const Institutions: React.FC = () => {
   const { colorScheme } = useMantineColorScheme();
   const isDark = colorScheme === 'dark';
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();

   const [apiInstitutions, setApiInstitutions] = useState<ApiInstitution[]>([]);
   const [governmentInstitutions, setGovernmentInstitutions] = useState<ApiInstitution[]>([]);
   const [loading, setLoading] = useState(false);
   const [loadError, setLoadError] = useState<string | null>(null);
   const [governmentLoadError, setGovernmentLoadError] = useState<string | null>(null);
   const [refreshTick, setRefreshTick] = useState(0);

   const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
   const [typeFilter, setTypeFilter] = useState<string | null>(null);

   const [addModalOpen, setAddModalOpen] = useState(false);
   const [newInstitution, setNewInstitution] = useState({
      name: '',
      institution_code: '',
      image_url: '',
      description: '',
      types: [InstitutionType.PRIVATE] as string[],
      country: 'Sri Lanka',
      website: '',
      confidence_score: 0.5,
      contact_info_text: '',
      recognition_text: '',
   });
   const [addError, setAddError] = useState<string | null>(null);

   const parseFreeform = (value: string): any => {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
         return JSON.parse(trimmed);
      }
      const lines = trimmed
         .split(/\r?\n/)
         .map((l) => l.trim())
         .filter(Boolean);
      return lines.length ? lines : undefined;
   };

   useEffect(() => {
      const query = searchParams.get('search');
      if (query !== null) setSearchTerm(query);
   }, [searchParams]);

   useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setLoadError(null);

      setGovernmentLoadError(null);

      const apiPromise = (async () => {
         try {
            const all: ApiInstitution[] = [];
            let page = 1;
            let totalPages = 1;

            // Page through the API (backend enforces limit <= 100).
            // Safety cap to avoid infinite loops if pagination is missing.
            const maxPages = 50;
            while (page <= totalPages && page <= maxPages) {
               const res = await InstitutionsService.listInstitutions(page, API_PAGE_LIMIT, undefined, undefined, 'name:asc');
               const data = res.data || [];
               all.push(...data);

               const nextTotalPages = res.pagination?.total_pages;
               if (typeof nextTotalPages === 'number' && Number.isFinite(nextTotalPages) && nextTotalPages > 0) {
                  totalPages = nextTotalPages;
               } else {
                  // If pagination metadata is missing, stop when we get less than the page limit.
                  if (data.length < API_PAGE_LIMIT) break;
               }

               page += 1;
            }

            return all;
         } catch (err: any) {
            if (!cancelled) setLoadError(getErrorMessage(err));
            return [] as ApiInstitution[];
         }
      })();

      const govUrl = getGovernmentInstitutionsPublicUrl();
      const govPromise = fetch(govUrl, { cache: 'no-store' })
         .then(async (r) => {
            if (!r.ok) throw new Error(`Failed to load government institutions (${r.status})`);
            const text = await r.text();
            return JSON.parse(stripBom(text)) as GovernmentInstitutionsPayload;
         })
         .then((payload) => {
            const updatedAtIso = toIsoDate(payload.updatedAt);
            const list = Array.isArray(payload.institutions) ? payload.institutions : [];
            return list
               .filter((g) => g && typeof g._id === 'string' && typeof g.name === 'string')
               .map((g): ApiInstitution => {
                  const website = normalizeWebsiteUrl(g.contact?.website);
                  const contact_info = {
                     address: g.contact?.address,
                     phone: g.contact?.phone,
                     website: website || undefined,
                     location: g.location,
                  };

                  return {
                     _id: g._id,
                     name: g.name,
                     institution_code: g.abbreviation,
                     description: undefined,
                     type: [InstitutionType.STATE, g.type || ''].filter(Boolean),
                     country: 'Sri Lanka',
                     website,
                     recognition: undefined,
                     contact_info,
                     confidence_score: 1,
                     created_at: updatedAtIso,
                     updated_at: updatedAtIso,
                  };
               });
         })
         .catch((err: any) => {
            if (!cancelled) setGovernmentLoadError(err?.message || 'Failed to load government institutions');
            return [] as ApiInstitution[];
         });

      Promise.all([apiPromise, govPromise])
         .then(([api, gov]) => {
            if (cancelled) return;
            setApiInstitutions(api);
            setGovernmentInstitutions(gov);
         })
         .finally(() => {
            if (cancelled) return;
            setLoading(false);
         });

      return () => {
         cancelled = true;
      };
   }, [refreshTick]);

   const governmentInstitutionById = useMemo(() => {
      const map = new Map<string, ApiInstitution>();
      for (const g of governmentInstitutions) map.set(g._id, g);
      return map;
   }, [governmentInstitutions]);

   const mergedInstitutions = useMemo(() => {
      const map = new Map<string, ApiInstitution>();
      for (const inst of apiInstitutions) map.set(inst._id, inst);
      for (const inst of governmentInstitutions) {
         if (!map.has(inst._id)) map.set(inst._id, inst);
      }
      return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
   }, [apiInstitutions, governmentInstitutions]);

   const filteredInstitutions = useMemo(() => {
      const q = searchTerm.trim().toLowerCase();
      const byType = typeFilter
         ? mergedInstitutions.filter((inst) => {
            const isGovernment = governmentInstitutionById.has(inst._id);
            if (typeFilter === 'Government') return isGovernment;
            if (typeFilter === 'Private') return !isGovernment;
            return true;
         })
         : mergedInstitutions;
      if (!q) return byType;
      return byType.filter((inst) => {
         const hay = `${inst.name} ${(inst.country || '')} ${(Array.isArray(inst.type) ? inst.type.join(' ') : '')}`.toLowerCase();
         return hay.includes(q);
      });
   }, [mergedInstitutions, searchTerm, typeFilter, governmentInstitutionById]);

   const handleAddSubmit = () => {
      const name = newInstitution.name.trim();
      if (!name) return;

      setAddError(null);

      let recognition: any;
      let contact_info: any;
      try {
         recognition = parseFreeform(newInstitution.recognition_text);
      } catch {
         setAddError('Recognition must be JSON (object/array) or a newline list.');
         return;
      }
      try {
         contact_info = parseFreeform(newInstitution.contact_info_text);
      } catch {
         setAddError('Contact Info must be JSON (object/array) or a newline list.');
         return;
      }

      const requestBody: any = {
         name,
         institution_code: newInstitution.institution_code.trim() || undefined,
         description: newInstitution.description.trim() || undefined,
         type: newInstitution.types?.length ? newInstitution.types : undefined,
         country: newInstitution.country.trim() || undefined,
         website: newInstitution.website.trim() || undefined,
         recognition,
         contact_info,
         confidence_score: Number.isFinite(newInstitution.confidence_score) ? newInstitution.confidence_score : 0.5,
      };

      // Not present in the generated InstitutionCreate model, but supported by backend schema.
      const imageUrl = newInstitution.image_url.trim();
      if (imageUrl) requestBody.image_url = imageUrl;

      InstitutionsService.createInstitution(requestBody)
         .then((created) => {
            setApiInstitutions((prev) => [created, ...prev]);
            emitAdminDataChanged('institutions');
            setAddModalOpen(false);
            setNewInstitution({
               name: '',
               institution_code: '',
               image_url: '',
               description: '',
               types: [InstitutionType.PRIVATE],
               country: 'Sri Lanka',
               website: '',
               confidence_score: 0.5,
               contact_info_text: '',
               recognition_text: '',
            });
         })
         .catch((err: any) => {
            setAddError(getErrorMessage(err) || 'Failed to create institution');
         });
   };

   const handleDelete = (id: string) => {
      if (governmentInstitutionById.has(id)) {
         alert('Government (State) institutions are read-only here.');
         return;
      }
      if (!confirm('Are you sure?')) return;
      InstitutionsService.deleteInstitution(id)
         .then(() => {
            setApiInstitutions((prev) => prev.filter((i) => i._id !== id));
            emitAdminDataChanged('institutions');
         })
         .catch((err: any) => {
            alert(err?.message || 'Failed to delete institution');
         });
   };

   const openDetails = (id: string) => {
      navigate(`/admin/institutions/${id}`);
   };

   return (
      <Box>
         <Group justify="space-between" mb="lg">
            <Box>
               <Title order={2}>Institutions</Title>
               <Text c="dimmed" size="sm">Manage educational institutions and view related programs.</Text>
            </Box>
            <Group>
               <Button leftSection={<Plus size={16} />} onClick={() => navigate('/admin/institutions/new')}>
                  Add Institution
               </Button>
            </Group>
         </Group>

         <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            {[
               { label: 'Total', val: mergedInstitutions.length },
               { label: 'Private', val: apiInstitutions.length },
               { label: 'Government', val: governmentInstitutions.length },
               { label: 'Showing', val: filteredInstitutions.length },
            ].map((stat, i) => (
               <Card key={i} withBorder padding="md" radius="md">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">{stat.label}</Text>
                  <Text size="xl" fw={700}>{stat.val}</Text>
               </Card>
            ))}
         </SimpleGrid>

         <Card withBorder radius="md" padding="0" mt="md">
            <Group p="md" justify="space-between" wrap="wrap">
               <Group wrap="wrap" gap="sm">
                  <TextInput
                     placeholder="Search..."
                     leftSection={<Search size={16} />}
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     w={300}
                  />
                  <Select
                     placeholder="Type"
                     data={['Government', 'Private']}
                     value={typeFilter}
                     onChange={setTypeFilter}
                     clearable
                     w={200}
                     size="xs"
                  />
               </Group>
               <Group gap="xs" wrap="wrap">
                  <Button variant="default" size="xs" onClick={() => setRefreshTick((t) => t + 1)}>
                     Refresh
                  </Button>
               </Group>
            </Group>

            {loadError ? (
               <Box px="md" pb="md">
                  <Alert
                     color="red"
                     title="Unable to load institutions"
                     withCloseButton
                     onClose={() => setLoadError(null)}
                  >
                     <Stack gap={6}>
                        <Text size="sm">{loadError}</Text>
                        <Group justify="flex-end" gap="xs">
                           <Button variant="default" size="xs" onClick={() => setRefreshTick((t) => t + 1)}>
                              Retry
                           </Button>
                        </Group>
                     </Stack>
                  </Alert>
               </Box>
            ) : null}

            {governmentLoadError ? (
               <Box px="md" pb="md">
                  <Alert
                     color="yellow"
                     title="Government institutions not loaded"
                     withCloseButton
                     onClose={() => setGovernmentLoadError(null)}
                  >
                     <Stack gap={6}>
                        <Text size="sm">{governmentLoadError}</Text>
                        <Text size="sm" c="dimmed">
                           Expected file: <Code>{getGovernmentInstitutionsPublicUrl()}</Code>
                        </Text>
                     </Stack>
                  </Alert>
               </Box>
            ) : null}

            <Table>
               <Table.Thead bg={isDark ? 'dark.6' : 'gray.0'}>
                  <Table.Tr>
                     <Table.Th>Institution</Table.Th>
                     <Table.Th>Type</Table.Th>
                     <Table.Th>Verification</Table.Th>
                     <Table.Th style={{ textAlign: 'right' }}>Action</Table.Th>
                  </Table.Tr>
               </Table.Thead>
               <Table.Tbody>
                  {loading ? (
                     <Table.Tr>
                        <Table.Td colSpan={4} align="center" py="xl">
                           <Group justify="center" gap="xs">
                              <Loader size="sm" />
                              <Text c="dimmed" size="sm">Loading institutions…</Text>
                           </Group>
                        </Table.Td>
                     </Table.Tr>
                  ) : filteredInstitutions.length === 0 ? (
                     <Table.Tr>
                        <Table.Td colSpan={4} align="center" py="xl" c="dimmed">
                           No institutions found
                        </Table.Td>
                     </Table.Tr>
                  ) : (
                     filteredInstitutions.map((item) => {
                        const isGovernment = governmentInstitutionById.has(item._id);
                        const verification = getVerificationStatus(item, isGovernment);
                        return (
                           <Table.Tr key={item._id}>
                              <Table.Td>
                                 <Text fw={600} size="sm">{item.name}</Text>
                                 <Group gap={8} mt={4} wrap="wrap">
                                    {item.website ? (
                                       <Text
                                          size="xs"
                                          component="a"
                                          href={item.website}
                                          target="_blank"
                                          rel="noreferrer"
                                          c="dimmed"
                                          title={item.website}
                                          style={{ textDecoration: 'none' }}
                                       >
                                          <Group gap={6} wrap="nowrap">
                                             <Globe size={14} />
                                             <Text span size="xs" c="dimmed">
                                                {getWebsiteLabel(item.website) || 'Website'}
                                             </Text>
                                          </Group>
                                       </Text>
                                    ) : null}
                                 </Group>
                              </Table.Td>
                              <Table.Td>
                                 <Badge variant={isGovernment ? 'light' : 'outline'} color={isGovernment ? 'gray' : 'blue'}>
                                    {isGovernment ? 'Government' : 'Private'}
                                 </Badge>
                              </Table.Td>
                              <Table.Td>
                                 <Badge variant="light" color={verification.color}>
                                    {verification.label}
                                 </Badge>
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right' }}>
                                 <Menu position="bottom-end">
                                    <Menu.Target>
                                       <ActionIcon variant="subtle" color="gray">
                                          <MoreVertical size={16} />
                                       </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                       <Menu.Item leftSection={<Eye size={14} />} onClick={() => openDetails(item._id)}>
                                          View Details
                                       </Menu.Item>
                                       <Menu.Item
                                          leftSection={<Trash2 size={14} />}
                                          color="red"
                                          disabled={isGovernment}
                                          onClick={() => handleDelete(item._id)}
                                       >
                                          Delete
                                       </Menu.Item>
                                    </Menu.Dropdown>
                                 </Menu>
                              </Table.Td>
                           </Table.Tr>
                        );
                     })
                  )}
               </Table.Tbody>
            </Table>
         </Card>

         <Modal
            opened={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            title={
               <Group>
                  <Building2 size={20} />
                  <Text fw={700}>New Institution</Text>
               </Group>
            }
         >
            <Stack>
               {addError ? (
                  <Alert color="red" title="Can't create institution" withCloseButton onClose={() => setAddError(null)}>
                     <Text size="sm">{addError}</Text>
                  </Alert>
               ) : null}
               <TextInput
                  label="Name"
                  placeholder="University of..."
                  required
                  value={newInstitution.name}
                  onChange={(e) => setNewInstitution({ ...newInstitution, name: e.target.value })}
               />
               <TextInput
                  label="Institution Code"
                  placeholder="UOC"
                  value={newInstitution.institution_code}
                  onChange={(e) => setNewInstitution({ ...newInstitution, institution_code: e.target.value })}
               />
               <TextInput
                  label="Image URL"
                  placeholder="https://..."
                  value={newInstitution.image_url}
                  onChange={(e) => setNewInstitution({ ...newInstitution, image_url: e.target.value })}
               />
               <Textarea
                  label="Description"
                  placeholder="Short overview about the institution"
                  minRows={3}
                  value={newInstitution.description}
                  onChange={(e) => setNewInstitution({ ...newInstitution, description: e.target.value })}
               />
               <Select
                  label="Primary Type"
                  data={Object.values(InstitutionType)}
                  value={newInstitution.types[0] || null}
                  onChange={(val) => setNewInstitution({ ...newInstitution, types: [(val as string) || InstitutionType.PRIVATE] })}
               />
               <MultiSelect
                  label="All Types"
                  data={Object.values(InstitutionType)}
                  value={newInstitution.types}
                  onChange={(val) => setNewInstitution({ ...newInstitution, types: val })}
                  searchable
                  clearable
               />
               <TextInput
                  label="Country"
                  placeholder="Sri Lanka"
                  value={newInstitution.country}
                  onChange={(e) => setNewInstitution({ ...newInstitution, country: e.target.value })}
               />
               <TextInput
                  label="Website"
                  placeholder="https://example.edu"
                  value={newInstitution.website}
                  onChange={(e) => setNewInstitution({ ...newInstitution, website: e.target.value })}
               />
               <NumberInput
                  label="Confidence Score"
                  description="0.0 to 1.0"
                  min={0}
                  max={1}
                  step={0.05}
                  decimalScale={2}
                  value={newInstitution.confidence_score}
                  onChange={(val) => setNewInstitution({ ...newInstitution, confidence_score: typeof val === 'number' ? val : 0.5 })}
               />

               <Divider my="xs" label="Contact Info" />
               <Textarea
                  label="Contact Info (one per line or JSON)"
                  placeholder={"495, Minuwangoda Road, Negombo\n+94 31 2224 422\ninfo@bci.lk"}
                  minRows={3}
                  value={newInstitution.contact_info_text}
                  onChange={(e) => setNewInstitution({ ...newInstitution, contact_info_text: e.target.value })}
               />

               <Divider my="xs" label="Recognition (JSON)" />
               <Textarea
                  label="Recognition (one per line or JSON)"
                  placeholder={"University Grants Commission\nMinistry of Education"}
                  minRows={3}
                  value={newInstitution.recognition_text}
                  onChange={(e) => setNewInstitution({ ...newInstitution, recognition_text: e.target.value })}
               />
               <Group justify="flex-end" mt="md">
                  <Button variant="default" onClick={() => setAddModalOpen(false)}>
                     Cancel
                  </Button>
                  <Button onClick={handleAddSubmit}>Register</Button>
               </Group>
            </Stack>
         </Modal>
      </Box>
   );
};

export default Institutions;