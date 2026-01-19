
export enum VerificationStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  REJECTED = 'Rejected'
}

export enum InstitutionType {
  STATE = 'State',
  PRIVATE = 'Private',
  VOCATIONAL = 'Vocational'
}

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  location: string;
  status: VerificationStatus;
  courses: number;
  updated: string;
}

export interface Course {
  id: string;
  name: string;
  uni: string;
  feeDisplay: string;
  numericFee: number;
  requirements: string;
  duration: string;
  level: string;
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  type: 'Local' | 'International';
  deadLine: string;
  status: 'Open' | 'Closing Soon' | 'Closed';
  value: string;
  views: number;
  clicks: number;
  applications: number;
}

export interface AIUsageLog {
  id: string;
  timestamp: string;
  query: string;
  category: string;
  tokenCount: number;
}
