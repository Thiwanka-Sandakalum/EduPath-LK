import type { ALStream, EducationLevel, OLField, OLPath, OLFieldId, ALStreamId } from './types';

export const EDUCATION_LEVELS: EducationLevel[] = [
  { id: 'ol', name: 'Ordinary Level (O/L)' },
  { id: 'al', name: 'Advanced Level (A/L)' },
];

export const OL_PATHS: OLPath[] = [
  { id: 'certificate', name: 'Certificate', description: 'Short-term skill course' },
  { id: 'diploma', name: 'Diploma', description: 'Mid-level practical qualification' },
  { id: 'degree', name: 'Degree Path', description: 'Degree through Foundation or Diploma' },
];

export const OL_FIELDS: OLField[] = [
  { id: 'it', name: 'IT / Computing' },
  { id: 'business', name: 'Business / Management' },
  { id: 'design', name: 'Design / Multimedia' },
  { id: 'language', name: 'Languages' },
  { id: 'engineering_tech', name: 'Engineering Technology' },
  { id: 'hospitality', name: 'Hospitality / Tourism' },
  { id: 'health', name: 'Health & Care' },
];

export const ARTS_MAJOR_SUBJECTS = [
  'Economics',
  'Geography',
  'History',
  'Home Economics',
  'Accounting',
  'Business Statistics',
  'Elements of Political Science',
  'Logic & Scientific Method',
  'Higher Mathematics',
  'Agricultural Science',
  'Mathematics',
  'Combined Mathematics',
  'Communication & Media Studies',
  'Information & Communication Technology',
] as const;

export const ARTS_THIRD_SUBJECTS = [
  'Civil Technology',
  'Mechanical Technology',
  'Electronic and Information Technology',
  'Food Technology',
  'Agro Technology',
  'Bio-Resource Technology',
  'Buddhism',
  'Hinduism',
  'Christianity',
  'Islam',
  'Greek & Roman Civilization',
] as const;

export const STREAMS: ALStream[] = [
  {
    id: 'physical',
    name: 'Physical Science',
    subjects: ['Combined Maths', 'Physics', 'Chemistry'],
  },
  {
    id: 'bio',
    name: 'Biological Science',
    subjects: ['Biology', 'Chemistry', 'Physics'],
  },
  {
    id: 'commerce',
    name: 'Commerce',
    subjects: ['Accounting', 'Business Studies', 'Economics'],
  },
  {
    id: 'tech',
    name: 'Technology',
    subjects: ['Science for Technology', 'Engineering Technology', 'ICT'],
  },
  {
    id: 'arts',
    name: 'Arts',
  },
];

export const STREAM_PROGRAM_KEYWORDS: Record<ALStreamId, string[]> = {
  physical: ['Engineering', 'Computer', 'Software', 'Data', 'ICT', 'Mathematics', 'Physics'],
  bio: ['Medicine', 'Medical', 'Nursing', 'Pharmacy', 'Biomedical', 'Biotechnology', 'Biology'],
  commerce: ['Business', 'Management', 'Accounting', 'Finance', 'Marketing', 'Economics'],
  tech: ['Technology', 'Engineering', 'Mechatronics', 'Industrial', 'ICT', 'Information'],
  arts: ['Law', 'Arts', 'Humanities', 'Social', 'Media', 'Communication', 'Political', 'History'],
};

export const OL_FIELD_KEYWORDS: Record<OLFieldId, string[]> = {
  it: ['Computer', 'IT', 'Software', 'Data', 'ICT', 'Cyber', 'Networking'],
  business: ['Business', 'Management', 'Accounting', 'Finance', 'Marketing', 'Economics'],
  design: ['Design', 'Multimedia', 'Graphic', 'Animation', 'UI', 'UX'],
  language: ['English', 'Language', 'Communication', 'TESL', 'Translation'],
  engineering_tech: ['Engineering', 'Technology', 'Electrical', 'Mechanical', 'Civil', 'Automobile'],
  hospitality: ['Tourism', 'Hospitality', 'Hotel', 'Culinary', 'Travel'],
  health: ['Nursing', 'Medical', 'Health', 'Care', 'Pharmacy', 'Physio'],
};
