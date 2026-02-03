import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { ArrowLeft, Building2 } from 'lucide-react';
import { InstitutionType } from '../types';
import { InstitutionsService } from '../types/services/InstitutionsService';
import { emitAdminDataChanged } from '../utils/adminEvents';

const getErrorMessage = (err: any): string => {
  return err?.body?.message || err?.message || err?.statusText || 'Request failed';
};

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

const InstitutionCreate: React.FC = () => {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
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

  const primaryType = useMemo(() => form.types[0] || InstitutionType.PRIVATE, [form.types]);

  const onSave = async () => {
    const name = form.name.trim();
    if (!name) {
      setError('Name is required.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      let recognition: any;
      let contact_info: any;

      try {
        recognition = parseFreeform(form.recognition_text);
      } catch {
        throw new Error('Recognition must be JSON (object/array) or a newline list.');
      }

      try {
        contact_info = parseFreeform(form.contact_info_text);
      } catch {
        throw new Error('Contact Info must be JSON (object/array) or a newline list.');
      }

      const requestBody: any = {
        name,
        institution_code: form.institution_code.trim() || undefined,
        description: form.description.trim() || undefined,
        type: form.types?.length ? form.types : undefined,
        country: form.country.trim() || undefined,
        website: form.website.trim() || undefined,
        recognition,
        contact_info,
        confidence_score: Number.isFinite(form.confidence_score) ? form.confidence_score : 0.5,
      };

      const imageUrl = form.image_url.trim();
      if (imageUrl) requestBody.image_url = imageUrl;

      const created = await InstitutionsService.createInstitution(requestBody);
      emitAdminDataChanged('institutions');

      // Go to details page after create (best feedback), or back to list.
      navigate(`/admin/institutions/${created._id}`);
    } catch (e: any) {
      setError(getErrorMessage(e));
      setSaving(false);
    }
  };

  return (
    <Box>
      <Group justify="space-between" mb="lg" wrap="wrap">
        <Group gap="sm" wrap="wrap">
          <Button variant="default" leftSection={<ArrowLeft size={16} />} onClick={() => navigate('/admin/institutions')}>
            Back
          </Button>
          <Title order={2}>Add Institution</Title>
          <Badge variant="light" color="blue">
            Private only
          </Badge>
        </Group>
        <Group gap="sm">
          <Button variant="default" onClick={() => navigate('/admin/institutions')}>
            Cancel
          </Button>
          <Button leftSection={<Building2 size={16} />} loading={saving} onClick={onSave}>
            Create
          </Button>
        </Group>
      </Group>

      <Card withBorder radius="md" p="lg">
        <Stack>
          {error ? (
            <Alert color="red" title="Can't create institution" withCloseButton onClose={() => setError(null)}>
              <Text size="sm">{error}</Text>
            </Alert>
          ) : null}

          <TextInput
            label="Name"
            placeholder="University of..."
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />

          <TextInput
            label="Institution Code"
            placeholder="UOC"
            value={form.institution_code}
            onChange={(e) => setForm((p) => ({ ...p, institution_code: e.target.value }))}
          />

          <TextInput
            label="Image URL"
            placeholder="https://..."
            value={form.image_url}
            onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
          />

          <Textarea
            label="Description"
            placeholder="Short overview about the institution"
            minRows={3}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />

          <Select
            label="Primary Type"
            data={Object.values(InstitutionType)}
            value={primaryType}
            onChange={(val) =>
              setForm((p) => ({ ...p, types: [((val as string) || InstitutionType.PRIVATE), ...p.types.filter((t) => t !== val)] }))
            }
          />

          <MultiSelect
            label="All Types"
            data={Object.values(InstitutionType)}
            value={form.types}
            onChange={(val) => setForm((p) => ({ ...p, types: val }))}
            searchable
            clearable
          />

          <TextInput
            label="Country"
            placeholder="Sri Lanka"
            value={form.country}
            onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
          />

          <TextInput
            label="Website"
            placeholder="https://example.edu"
            value={form.website}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
          />

          <NumberInput
            label="Confidence Score"
            description="0.0 to 1.0"
            min={0}
            max={1}
            step={0.05}
            decimalScale={2}
            value={form.confidence_score}
            onChange={(val) => setForm((p) => ({ ...p, confidence_score: typeof val === 'number' ? val : 0.5 }))}
          />

          <Divider my="xs" label="Contact Info" />
          <Textarea
            label="Contact Info (one per line or JSON)"
            placeholder={'495, Minuwangoda Road, Negombo\n+94 31 2224 422\ninfo@bci.lk'}
            minRows={3}
            value={form.contact_info_text}
            onChange={(e) => setForm((p) => ({ ...p, contact_info_text: e.target.value }))}
          />

          <Divider my="xs" label="Recognition" />
          <Textarea
            label="Recognition (one per line or JSON)"
            placeholder={'University Grants Commission\nMinistry of Education'}
            minRows={3}
            value={form.recognition_text}
            onChange={(e) => setForm((p) => ({ ...p, recognition_text: e.target.value }))}
          />
        </Stack>
      </Card>
    </Box>
  );
};

export default InstitutionCreate;
