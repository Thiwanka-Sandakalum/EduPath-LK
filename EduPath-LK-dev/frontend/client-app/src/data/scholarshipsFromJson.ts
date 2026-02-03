import scholarshipJson from './scholarship.json';

type JsonBenefits = string | Record<string, unknown>;
type JsonEligibility = string | Record<string, unknown>;

type JsonScholarshipItem = {
  name?: string;
  type?: string | string[];
  types?: string[];
  eligibility?: JsonEligibility;
  benefits?: JsonBenefits;
  benefit?: string;
  application_process?: string;
  conditions?: string;
  duration?: string;
  fields?: string[];
  examples?: string[];
  merit_award?: string;
  general_award?: string;
  amount_per_year?: number;
  monthly_amount?: string;
};

type JsonScholarshipCategory = {
  category: string;
  items?: JsonScholarshipItem[];
} & Record<string, unknown>;

type Scholarship = {
  id: string;
  title: string;
  provider: string;
  type: 'Local' | 'International';
  country: string;
  amount: string;
  deadline: string;
  field: string;
  eligibility: string[];
  benefits: string[];
  status: 'Open' | 'Closing Soon' | 'Closed' | 'Upcoming';
  level: string;
  importantInfo?: string[];
  applicationSteps?: string[];
  applicationLink?: string;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function recordToLines(value: Record<string, unknown>): string[] {
  return Object.entries(value)
    .map(([key, val]) => {
      const label = key.replace(/_/g, ' ');
      if (val === null || val === undefined) return undefined;
      if (Array.isArray(val)) return `${label}: ${val.join(', ')}`;
      if (typeof val === 'object') return `${label}: ${JSON.stringify(val)}`;
      return `${label}: ${String(val)}`;
    })
    .filter((line): line is string => Boolean(line));
}

function normalizeEligibility(value: JsonEligibility | undefined): string[] {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  return recordToLines(value);
}

function normalizeBenefits(benefits: JsonBenefits | undefined, benefit: string | undefined): string[] {
  const out: string[] = [];
  if (typeof benefits === 'string') out.push(benefits);
  if (benefits && typeof benefits === 'object' && !Array.isArray(benefits)) {
    out.push(...recordToLines(benefits as Record<string, unknown>));
  }
  if (benefit) out.push(benefit);
  return out;
}

function pickType(categoryName: string): 'Local' | 'International' {
  if (/international/i.test(categoryName)) return 'International';
  return 'Local';
}

function guessFieldFromText(text: string): string | undefined {
  const t = text.toLowerCase();

  if (/(medicine|medical|mbbs|nursing|pharmacy|dent)/.test(t)) return 'Medicine';
  if (/(business|commerce|management|accounting|finance|economics|marketing|cima|acca|ca sri lanka)/.test(t)) return 'Business';
  if (/(it|ict|information technology|computer|software|cyber|network|data science)/.test(t)) return 'IT';
  if (/(engineering|mechanical|electronic|electrical|civil|mechatronics)/.test(t)) return 'Engineering';
  if (/(law|legal)/.test(t)) return 'Law';
  if (/(science|biology|chemistry|physics|mathematics|math|statistics|stem)/.test(t)) return 'Science';
  if (/(technology|agro|food technology|bio-resource|bioresource)/.test(t)) return 'Technology';

  return undefined;
}

function pickField(category: JsonScholarshipCategory, item?: JsonScholarshipItem): string {
  const cat = category.category;
  if (typeof item?.fields?.[0] === 'string') return item.fields[0];

  const title = item?.name ?? (category.name as string | undefined) ?? '';
  const fromText = guessFieldFromText(`${cat} ${title}`);
  if (fromText) return fromText;

  if (/government/i.test(cat)) return 'All Fields';
  return 'All Fields';
}

function pickAmount(category: JsonScholarshipCategory, item?: JsonScholarshipItem): string {
  if (!item) {
    // Some categories are single objects (no items array)
    const monthly = category.monthly_amount as string | undefined;
    if (monthly) return monthly;
  }

  if (item?.monthly_amount) return item.monthly_amount;
  if (item?.merit_award) return `Merit: ${item.merit_award}`;
  if (item?.general_award) return `General: ${item.general_award}`;
  if (typeof item?.amount_per_year === 'number') return `${item.amount_per_year} per year`;

  const benefits = item?.benefits;
  if (typeof benefits === 'string') return benefits;
  if (benefits && typeof benefits === 'object' && !Array.isArray(benefits)) {
    const lines = recordToLines(benefits as Record<string, unknown>);
    if (lines.length) return lines.join(' | ');
  }

  const benefit = item?.benefit;
  if (benefit) return benefit;

  return 'N/A';
}

function toScholarship(category: JsonScholarshipCategory, item?: JsonScholarshipItem): Scholarship {
  const provider = category.category;
  const title = item?.name ?? (category.name as string | undefined) ?? category.category;

  const type = pickType(category.category);
  const country = type === 'International' ? 'International' : 'Sri Lanka';

  const eligibility: string[] = [];
  eligibility.push(...normalizeEligibility(item?.eligibility ?? (category.eligibility as JsonEligibility | undefined)));

  // Extra structured fields from categories (e.g., universities, selection basis) become eligibility/important info
  const categoryExtras: string[] = [];
  for (const [key, value] of Object.entries(category)) {
    if (['category', 'items', 'eligibility', 'benefits', 'name'].includes(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' || typeof value === 'number') categoryExtras.push(`${key.replace(/_/g, ' ')}: ${String(value)}`);
    else if (Array.isArray(value)) categoryExtras.push(`${key.replace(/_/g, ' ')}: ${value.join(', ')}`);
  }

  const benefits = normalizeBenefits(item?.benefits, item?.benefit);
  const applicationSteps: string[] = [];
  const importantInfo: string[] = [];

  const applicationProcess = item?.application_process ?? (category.application_process as string | undefined);
  if (applicationProcess) applicationSteps.push(applicationProcess);

  const conditions = item?.conditions ?? (category.conditions as string | undefined);
  if (conditions) importantInfo.push(conditions);

  if (item?.duration) importantInfo.push(`Duration: ${item.duration}`);
  if (item?.examples?.length) importantInfo.push(`Examples: ${item.examples.join(', ')}`);
  if (item?.types?.length) importantInfo.push(`Types: ${item.types.join(', ')}`);

  // If category has useful extras, keep them as important info (so expanded view shows something)
  importantInfo.push(...categoryExtras);

  const id = slugify(`${provider}-${title}`) || `sch-${Math.random().toString(36).slice(2)}`;

  return {
    id,
    title,
    provider,
    type,
    country,
    amount: pickAmount(category, item),
    deadline: 'N/A',
    field: pickField(category, item),
    eligibility: eligibility.length ? eligibility : ['See details'],
    benefits: benefits.length ? benefits : ['See details'],
    status: 'Open',
    level: 'Undergraduate',
    importantInfo: importantInfo.length ? importantInfo : undefined,
    applicationSteps: applicationSteps.length ? applicationSteps : undefined,
    applicationLink: undefined
  };
}

export const scholarships: Scholarship[] = (
  (scholarshipJson as unknown as { scholarships?: JsonScholarshipCategory[] }).scholarships ?? []
).flatMap((category) => {
  if (Array.isArray(category.items) && category.items.length) {
    return category.items.map((item) => toScholarship(category, item));
  }
  return [toScholarship(category)];
});
