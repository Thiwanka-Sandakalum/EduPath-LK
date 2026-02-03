import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { ArrowLeft, Plus } from 'lucide-react';
import { InstitutionsService } from '../types/services/InstitutionsService';
import { ProgramsService } from '../types/services/ProgramsService';
import type { Institution } from '../types/models/Institution';
import { emitAdminDataChanged } from '../utils/adminEvents';

const DELIVERY_MODES = ['On-campus', 'Online', 'Hybrid', 'Distance'];

const API_PAGE_LIMIT = 100;

const getErrorMessage = (err: any): string => {
  return err?.body?.message || err?.message || err?.statusText || 'Request failed';
};

const parseJsonOrEmpty = (value: string, fieldName: string): Record<string, any> | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    throw new Error('not an object');
  } catch {
    throw new Error(`${fieldName} must be valid JSON object. Example: {"years": 4}`);
  }
};

const parseListOrJsonArray = (value: string, fieldName: string): any[] | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      throw new Error('not array');
    } catch {
      throw new Error(`${fieldName} must be a JSON array or newline list.`);
    }
  }
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length ? lines : undefined;
};

const CourseCreate: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);

  const [form, setForm] = useState({
    institution_id: '',
    name: '',
    program_code: '',
    description: '',
    level: '',
    duration_json: '',
    delivery_mode: [] as string[],
    fees_json: '',
    eligibility_json: '',
    curriculum_summary: '',
    specializations_text: '',
    url: '',
    extensions_json: '',
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const all: Institution[] = [];
        let page = 1;
        let totalPages = 1;
        const maxPages = 50;

        while (page <= totalPages && page <= maxPages) {
          const res = await InstitutionsService.listInstitutions(page, API_PAGE_LIMIT, undefined, undefined, 'name:asc');
          const data = res.data || [];
          all.push(...data);

          const nextTotalPages = res.pagination?.total_pages;
          if (typeof nextTotalPages === 'number' && Number.isFinite(nextTotalPages) && nextTotalPages > 0) {
            totalPages = nextTotalPages;
          } else {
            if (data.length < API_PAGE_LIMIT) break;
          }

          page += 1;
        }

        if (!cancelled) setInstitutions(all);
      } catch {
        if (!cancelled) setInstitutions([]);
      }

      ProgramsService.getProgramDistinctValues('level')
        .then((res) => {
          if (cancelled) return;
          setAvailableLevels((res.values || []).filter(Boolean));
        })
        .catch(() => {
          if (cancelled) return;
          setAvailableLevels([]);
        });

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (form.institution_id) return;
    if (!institutions.length) return;
    setForm((p) => ({ ...p, institution_id: institutions[0]._id }));
  }, [institutions, form.institution_id]);

  const institutionOptions = useMemo(
    () => institutions.map((i) => ({ value: i._id, label: i.name })),
    [institutions]
  );

  const levelOptions = useMemo(() => {
    const fallback = ['Certificate', 'Diploma', 'Bachelor', 'Master', 'Doctorate', 'Postgraduate'];
    const list = availableLevels.length ? availableLevels : fallback;
    return list.map((v) => ({ value: v, label: v }));
  }, [availableLevels]);

  const onSave = async () => {
    const name = form.name.trim();
    const institution_id = form.institution_id;

    if (!name || !institution_id) {
      setError('Course name and Institution are required.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      let duration: Record<string, any> | undefined;
      let fees: Record<string, any> | undefined;
      let eligibility: Record<string, any> | undefined;
      let extensions: Record<string, any> | undefined;

      try {
        duration = parseJsonOrEmpty(form.duration_json, 'Duration');
        fees = parseJsonOrEmpty(form.fees_json, 'Fees');
        eligibility = parseJsonOrEmpty(form.eligibility_json, 'Eligibility');
        extensions = parseJsonOrEmpty(form.extensions_json, 'Extensions');
      } catch (e: any) {
        throw new Error(e?.message || 'Invalid JSON');
      }

      let specializations: any[] | undefined;
      try {
        specializations = parseListOrJsonArray(form.specializations_text, 'Specializations');
      } catch (e: any) {
        throw new Error(e?.message || 'Invalid specializations');
      }

      const payload: any = {
        institution_id,
        name,
        program_code: form.program_code.trim() || undefined,
        description: form.description.trim() || undefined,
        level: form.level || undefined,
        duration,
        delivery_mode: form.delivery_mode.length ? form.delivery_mode : undefined,
        fees,
        eligibility,
        curriculum_summary: form.curriculum_summary.trim() || undefined,
        specializations,
        url: form.url.trim() || undefined,
        extensions,
      };

      const created = await ProgramsService.createProgram(payload);
      emitAdminDataChanged('courses');
      navigate(`/admin/courses/${created._id}`);
    } catch (e: any) {
      setError(getErrorMessage(e));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Group justify="space-between" mb="lg" wrap="wrap">
          <Group gap="sm" wrap="wrap">
            <Button variant="default" leftSection={<ArrowLeft size={16} />} onClick={() => navigate('/admin/courses')}>
              Back
            </Button>
            <Title order={2}>Add Course</Title>
            <Badge variant="light" color="blue">
              Private only
            </Badge>
          </Group>
        </Group>

        <Card withBorder radius="md" p="lg">
          <Group gap="xs">
            <Loader size="sm" />
            <Text c="dimmed" size="sm">
              Loading form…
            </Text>
          </Group>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="lg" wrap="wrap">
        <Group gap="sm" wrap="wrap">
          <Button variant="default" leftSection={<ArrowLeft size={16} />} onClick={() => navigate('/admin/courses')}>
            Back
          </Button>
          <Title order={2}>Add Course</Title>
          <Badge variant="light" color="blue">
            Private only
          </Badge>
        </Group>
        <Group gap="sm">
          <Button variant="default" onClick={() => navigate('/admin/courses')}>
            Cancel
          </Button>
          <Button leftSection={<Plus size={16} />} loading={saving} onClick={onSave}>
            Create
          </Button>
        </Group>
      </Group>

      <Card withBorder radius="md" p="lg">
        <Stack>
          {error ? (
            <Alert color="red" title="Can't create course" withCloseButton onClose={() => setError(null)}>
              <Text size="sm">{error}</Text>
            </Alert>
          ) : null}

          <Select
            label="Institution"
            required
            searchable
            data={institutionOptions}
            value={form.institution_id || null}
            onChange={(val) => setForm((p) => ({ ...p, institution_id: val || '' }))}
          />

          <TextInput
            label="Course/Program Name"
            required
            placeholder="BSc..."
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />

          <Select
            label="Level"
            data={levelOptions}
            value={form.level || null}
            onChange={(val) => setForm((p) => ({ ...p, level: val || '' }))}
            clearable
          />

          <TextInput
            label="Program Code"
            value={form.program_code}
            onChange={(e) => setForm((p) => ({ ...p, program_code: e.target.value }))}
          />

          <Textarea
            label="Description"
            minRows={3}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />

          <MultiSelect
            label="Delivery Mode"
            data={DELIVERY_MODES}
            value={form.delivery_mode}
            onChange={(val) => setForm((p) => ({ ...p, delivery_mode: val }))}
            searchable
            clearable
          />

          <Textarea
            label="Specializations (one per line or JSON array)"
            minRows={3}
            value={form.specializations_text}
            onChange={(e) => setForm((p) => ({ ...p, specializations_text: e.target.value }))}
          />

          <TextInput
            label="URL"
            value={form.url}
            onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
          />

          <Textarea
            label="Curriculum Summary"
            minRows={3}
            value={form.curriculum_summary}
            onChange={(e) => setForm((p) => ({ ...p, curriculum_summary: e.target.value }))}
          />

          <Divider my="xs" label="JSON Fields" />

          <Textarea
            label="Duration (JSON object)"
            minRows={3}
            placeholder='{"years": 4}'
            value={form.duration_json}
            onChange={(e) => setForm((p) => ({ ...p, duration_json: e.target.value }))}
          />

          <Textarea
            label="Fees (JSON object)"
            minRows={3}
            placeholder='{"total": 2500000, "currency": "LKR"}'
            value={form.fees_json}
            onChange={(e) => setForm((p) => ({ ...p, fees_json: e.target.value }))}
          />

          <Textarea
            label="Eligibility (JSON object)"
            minRows={3}
            placeholder='{"subjects": ["Maths", "Physics"]}'
            value={form.eligibility_json}
            onChange={(e) => setForm((p) => ({ ...p, eligibility_json: e.target.value }))}
          />

          <Textarea
            label="Extensions (JSON object)"
            minRows={3}
            value={form.extensions_json}
            onChange={(e) => setForm((p) => ({ ...p, extensions_json: e.target.value }))}
          />
        </Stack>
      </Card>
    </Box>
  );
};

export default CourseCreate;
