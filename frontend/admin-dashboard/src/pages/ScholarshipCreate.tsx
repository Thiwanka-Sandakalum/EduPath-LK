import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { ArrowLeft, Plus } from 'lucide-react';
import { Scholarship } from '../types';
import { emitAdminDataChanged } from '../utils/adminEvents';

type ScholarshipWithRaw = Scholarship & { raw?: unknown };

const LOCAL_STORAGE_KEY = 'edupath_admin_scholarships_v1';

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === 'string' ? v : safeStringify(v)))
      .filter(Boolean)
      .join(', ');
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '';
    return entries
      .map(([k, v]) => `${k}: ${normalizeValue(v)}`)
      .filter(Boolean)
      .join(' | ');
  }

  return String(value);
}

function parseJsonOrString(input: string): unknown {
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

function loadLocalScholarships(): ScholarshipWithRaw[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ScholarshipWithRaw[];
  } catch {
    return [];
  }
}

function saveLocalScholarships(items: ScholarshipWithRaw[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

const ScholarshipCreate: React.FC = () => {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newSch, setNewSch] = useState<Partial<Scholarship>>({ type: 'Local', status: 'Open' });
  const [newDetails, setNewDetails] = useState<{
    category: string;
    scholarshipType: string;
    eligibility: string;
    benefits: string;
    applicationProcess: string;
    conditions: string;
  }>({
    category: '',
    scholarshipType: '',
    eligibility: '',
    benefits: '',
    applicationProcess: '',
    conditions: '',
  });

  const onSave = async () => {
    const title = (newSch.title || '').trim();
    if (!title) {
      setError('Title is required.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const category = (newDetails.category || newSch.provider || 'Scholarships').trim() || 'Scholarships';
      const benefitsParsed = parseJsonOrString(newDetails.benefits);
      const valueFromBenefits = normalizeValue(benefitsParsed);

      const created: ScholarshipWithRaw = {
        ...(newSch as Scholarship),
        id: `local-${Date.now()}`,
        title,
        provider: category,
        deadLine: newSch.deadLine || '-',
        status: (newSch.status || 'Open') as Scholarship['status'],
        value: newSch.value || valueFromBenefits || '-',
        views: 0,
        clicks: 0,
        applications: 0,
        raw: {
          category,
          name: title,
          type: newDetails.scholarshipType || undefined,
          eligibility: newDetails.eligibility || undefined,
          benefits: benefitsParsed,
          application_process: newDetails.applicationProcess || undefined,
          conditions: newDetails.conditions || undefined,
        },
      };

      const existing = loadLocalScholarships();
      const next = [created, ...existing];
      saveLocalScholarships(next);

      emitAdminDataChanged('scholarships');
      navigate('/admin/scholarships');
    } catch (e: any) {
      setError(String(e?.message || e || 'Failed to publish scholarship'));
      setSaving(false);
    }
  };

  return (
    <Box>
      <Group justify="space-between" mb="lg" wrap="wrap">
        <Group gap="sm" wrap="wrap">
          <Button variant="default" leftSection={<ArrowLeft size={16} />} onClick={() => navigate('/admin/scholarships')}>
            Back
          </Button>
          <Title order={2}>Post Scholarship</Title>
          <Badge variant="light" color="blue">
            Local only
          </Badge>
        </Group>
        <Group gap="sm">
          <Button variant="default" onClick={() => navigate('/admin/scholarships')}>
            Cancel
          </Button>
          <Button leftSection={<Plus size={16} />} loading={saving} onClick={onSave}>
            Publish
          </Button>
        </Group>
      </Group>

      <Card withBorder radius="md" p="lg">
        <Stack>
          {error ? (
            <Alert color="red" title="Can't publish scholarship" withCloseButton onClose={() => setError(null)}>
              <Text size="sm">{error}</Text>
            </Alert>
          ) : null}

          <TextInput
            label="Category"
            placeholder="e.g., SLIIT Scholarships"
            value={newDetails.category}
            onChange={(e) => setNewDetails((p) => ({ ...p, category: e.target.value }))}
          />

          <TextInput
            label="Title"
            required
            value={newSch.title || ''}
            onChange={(e) => setNewSch((p) => ({ ...p, title: e.target.value }))}
          />

          <TextInput
            label="Provider"
            description="Optional. If empty, Category will be used."
            value={newSch.provider || ''}
            onChange={(e) => setNewSch((p) => ({ ...p, provider: e.target.value }))}
          />

          <Group grow>
            <Select
              label="Type"
              data={['Local', 'International']}
              value={(newSch.type as any) || 'Local'}
              onChange={(val) => setNewSch((p) => ({ ...p, type: (val as any) || 'Local' }))}
            />
            <TextInput
              label="Value"
              placeholder="Full Tuition"
              value={newSch.value || ''}
              onChange={(e) => setNewSch((p) => ({ ...p, value: e.target.value }))}
            />
          </Group>

          <TextInput
            label="Deadline"
            type="date"
            value={newSch.deadLine || ''}
            onChange={(e) => setNewSch((p) => ({ ...p, deadLine: e.target.value }))}
          />

          <TextInput
            label="Scholarship Type"
            placeholder="e.g., Entrance Scholarship / Corporate Scholarship"
            value={newDetails.scholarshipType}
            onChange={(e) => setNewDetails((p) => ({ ...p, scholarshipType: e.target.value }))}
          />

          <Textarea
            label="Eligibility"
            minRows={2}
            autosize
            value={newDetails.eligibility}
            onChange={(e) => setNewDetails((p) => ({ ...p, eligibility: e.target.value }))}
          />

          <Textarea
            label="Benefits"
            description="You can paste JSON (object/array) or plain text."
            minRows={3}
            autosize
            value={newDetails.benefits}
            onChange={(e) => setNewDetails((p) => ({ ...p, benefits: e.target.value }))}
          />

          <Textarea
            label="Application Process"
            minRows={2}
            autosize
            value={newDetails.applicationProcess}
            onChange={(e) => setNewDetails((p) => ({ ...p, applicationProcess: e.target.value }))}
          />

          <Textarea
            label="Conditions"
            minRows={2}
            autosize
            value={newDetails.conditions}
            onChange={(e) => setNewDetails((p) => ({ ...p, conditions: e.target.value }))}
          />
        </Stack>
      </Card>
    </Box>
  );
};

export default ScholarshipCreate;
