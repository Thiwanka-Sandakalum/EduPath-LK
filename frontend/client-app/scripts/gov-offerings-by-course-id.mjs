import fs from 'node:fs';
import path from 'node:path';

const normalizeId = (v) => String(v ?? '').trim().toUpperCase();

const readJsonFile = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const cleaned = raw.replace(/^\uFEFF/, '');
  return JSON.parse(cleaned);
};

const extractArrayFromJson = (json, keys) => {
  if (Array.isArray(json)) return json;
  if (!json || typeof json !== 'object') return [];
  for (const k of keys) {
    const v = json[k];
    if (Array.isArray(v)) return v;
  }
  return [];
};

const courseIdArg = process.argv[2];
if (!courseIdArg) {
  console.error('Usage: node scripts/gov-offerings-by-course-id.mjs <COURSE_ID>');
  console.error('Example: node scripts/gov-offerings-by-course-id.mjs C001');
  process.exit(1);
}

const courseId = normalizeId(courseIdArg);

const root = process.cwd();
const offeringsPath = path.join(root, 'public', 'government-course-offerings.json');
const programsPath = path.join(root, 'public', 'government-degree-programs.json');
const institutionsPath = path.join(root, 'public', 'government-institutions.json');

const offeringsJson = readJsonFile(offeringsPath);
const offeringsRaw = extractArrayFromJson(offeringsJson, ['offerings', 'course_offerings', 'data']);
const offerings = offeringsRaw
  .filter((o) => o && typeof o === 'object')
  .map((o) => ({
    degree_program_id: normalizeId(o.degree_program_id),
    university_id: String(o.university_id ?? '').trim(),
    proposed_intake: typeof o.proposed_intake === 'number' ? o.proposed_intake : undefined,
    academic_year: typeof o.academic_year === 'string' ? o.academic_year.trim() : undefined,
    cutoff_marks: o.cutoff_marks && typeof o.cutoff_marks === 'object' ? o.cutoff_marks : undefined,
  }))
  .filter((o) => o.degree_program_id && o.university_id);

const programsJson = readJsonFile(programsPath);
const programsRaw = extractArrayFromJson(programsJson, ['degreePrograms', 'degree_programs', 'programs', 'data']);
const program = programsRaw
  .filter((p) => p && typeof p === 'object')
  .find((p) => normalizeId(p._id) === courseId);

const instJson = readJsonFile(institutionsPath);
const instRaw = extractArrayFromJson(instJson, ['institutions', 'data', 'universities']);
const instById = new Map(
  instRaw
    .filter((i) => i && typeof i === 'object' && typeof i._id === 'string')
    .map((i) => [String(i._id), i])
);

const matched = offerings.filter((o) => o.degree_program_id === courseId);

// Merge duplicates (some datasets split cutoff marks across multiple rows)
const mergedByUni = new Map();
for (const o of matched) {
  const key = `${o.university_id}`;
  const existing = mergedByUni.get(key);
  if (!existing) {
    mergedByUni.set(key, o);
    continue;
  }
  mergedByUni.set(key, {
    ...existing,
    proposed_intake:
      typeof existing.proposed_intake === 'number' && typeof o.proposed_intake === 'number'
        ? Math.max(existing.proposed_intake, o.proposed_intake)
        : (existing.proposed_intake ?? o.proposed_intake),
    cutoff_marks: {
      ...(existing.cutoff_marks || {}),
      ...(o.cutoff_marks || {}),
    },
    academic_year: existing.academic_year ?? o.academic_year,
  });
}

const mergedOfferings = Array.from(mergedByUni.values());

console.log(JSON.stringify({
  courseId,
  courseTitle: program ? (program.title || program.name || program._id) : undefined,
  offeringsCount: mergedOfferings.length,
  offerings: mergedOfferings
    .map((o) => {
      const uni = instById.get(o.university_id);
      return {
        university_id: o.university_id,
        university_name: uni?.name ?? undefined,
        academic_year: o.academic_year,
        proposed_intake: o.proposed_intake,
        cutoff_marks: o.cutoff_marks,
      };
    })
    .sort((a, b) => String(a.university_name || a.university_id).localeCompare(String(b.university_name || b.university_id)))
}, null, 2));
