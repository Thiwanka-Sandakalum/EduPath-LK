import { Institution, InstitutionType, VerificationStatus, Course, Scholarship } from '../types';

export const mockInstitutions: Institution[] = [
  { id: '1', name: 'University of Moratuwa', type: InstitutionType.STATE, location: 'Katubedda', status: VerificationStatus.VERIFIED, courses: 85, updated: '2023-10-12' },
  { id: '2', name: 'SLIIT', type: InstitutionType.PRIVATE, location: 'Malabe', status: VerificationStatus.VERIFIED, courses: 112, updated: '2023-10-10' },
  { id: '3', name: 'University of Colombo', type: InstitutionType.STATE, location: 'Colombo 03', status: VerificationStatus.VERIFIED, courses: 145, updated: '2023-10-08' },
  { id: '4', name: 'NIBM', type: InstitutionType.VOCATIONAL, location: 'Colombo 07', status: VerificationStatus.PENDING, courses: 42, updated: '2023-10-15' },
  { id: '5', name: 'General Sir John Kotelawala Defence University', type: InstitutionType.STATE, location: 'Ratmalana', status: VerificationStatus.VERIFIED, courses: 68, updated: '2023-10-05' },
];

export const mockCourses: Course[] = [
  { id: '1', name: 'BSc (Hons) Software Engineering', uni: 'SLIIT', feeDisplay: '1,200,000 LKR', numericFee: 1200000, requirements: '3 Passes in A/L', duration: '4 Years', level: 'Undergraduate' },
  { id: '2', name: 'MBBS - Medicine', uni: 'University of Colombo', feeDisplay: 'State Funded', numericFee: 0, requirements: 'Top 0.1% Z-Score', duration: '5 Years', level: 'Undergraduate' },
  { id: '3', name: 'BSc Engineering (Civil)', uni: 'University of Moratuwa', feeDisplay: 'State Funded', numericFee: 0, requirements: 'Z-Score 2.45+', duration: '4 Years', level: 'Undergraduate' },
  { id: '4', name: 'Diploma in Information Technology', uni: 'NIBM', feeDisplay: '350,000 LKR', numericFee: 350000, requirements: 'Pass O/L', duration: '1 Year', level: 'Diploma' },
  { id: '5', name: 'BSc in Management & IT', uni: 'KDU', feeDisplay: '1,500,000 LKR', numericFee: 1500000, requirements: '2 Passes A/L', duration: '4 Years', level: 'Undergraduate' },
  { id: '6', name: 'MSc in Data Science', uni: 'UCSC', feeDisplay: '650,000 LKR', numericFee: 650000, requirements: 'BSc Degree', duration: '2 Years', level: 'Postgraduate' },
  { id: '7', name: 'NVQ Level 4 - Electrician', uni: 'VTA', feeDisplay: 'Free', numericFee: 0, requirements: 'O/L Completion', duration: '6 Months', level: 'Vocational' },
];

export const mockScholarships: Scholarship[] = [
  { id: '1', title: 'Commonwealth Scholarship 2024', provider: 'UK Government', type: 'International', deadLine: '2024-03-15', status: 'Open', value: 'Full Tuition + Stipend', views: 1240, clicks: 850, applications: 342 },
  { id: '2', title: 'Presidential Scholarship Fund', provider: 'Ministry of Education SL', type: 'Local', deadLine: '2023-12-01', status: 'Closing Soon', value: 'LKR 50,000 / month', views: 3500, clicks: 2100, applications: 1890 },
  { id: '3', title: 'Erasmus Mundus Scholarship', provider: 'European Union', type: 'International', deadLine: '2024-01-20', status: 'Open', value: '€1,400 / month', views: 980, clicks: 450, applications: 120 },
  { id: '4', title: 'SLIIT Merit Based Award', provider: 'SLIIT', type: 'Local', deadLine: '2023-11-15', status: 'Closed', value: '50% Tuition Waiver', views: 2100, clicks: 1200, applications: 85 },
];
