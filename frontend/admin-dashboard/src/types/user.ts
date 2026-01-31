export interface AdditionalEducation {
  id: string;
  type: 'Diploma' | 'NVQ' | 'Certificate' | 'Professional Course' | 'Online Course' | 'Vocational' | 'Other';
  courseName: string;
  institute: string;
  nvqLevel?: string; // Level 1 - 7
  field: string;
  startYear: string;
  completionYear: string; // Year or "Ongoing"
  mode: 'Full-time' | 'Part-time' | 'Online';
  hasCertificate: boolean;
  description?: string;
}

export interface StudentDetails {
  fullName: string;
  mobile: string;
  dob: string;
  gender: string;
  district: string;

  eduLevel: string;
  schoolName: string;
  stream: string;
  subjects: string; // Comma separated for simplicity or JSON string
  results: string; // GPA or Z-Score
  completionYear: string;

  interestedField: string;
  skills: string;
  careerGoals: string;
  preferredCountry: string;

  additionalEducation?: AdditionalEducation[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  provider?: 'google' | 'email';
  studentDetails?: StudentDetails;
}

export interface UserApplication {
  id: string;
  courseId: string;
  courseTitle: string;
  institutionName: string;
  status: 'Pending' | 'Reviewing' | 'Accepted';
  submittedAt: string;
}

export interface UserInquiry {
  id: string;
  entityId: string; // Course or Institution ID
  entityName: string;
  message: string;
  sentAt: string;
}
