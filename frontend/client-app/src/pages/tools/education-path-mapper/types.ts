export enum View {
  SIGN_IN = 'SIGN_IN',
  STREAM_SELECTION = 'STREAM_SELECTION',
  AL_FLOW = 'AL_FLOW',
  OL_FLOW = 'OL_FLOW',
  RESULTS = 'RESULTS'
}

export enum ALCategory {
  ARTS = 'Arts',
  TECHNOLOGY = 'Technology',
  MATHS = 'Maths',
  SCIENCE = 'Science',
  COMMERCE = 'Commerce'
}

export enum OLOption {
  DEGREES = 'Degrees',
  DIPLOMAS = 'Diplomas',
  CERTIFICATES = 'Certificates',
  VOCATIONAL = 'Vocational Courses'
}

export interface University {
  name: string;
  type: 'Public' | 'Private';
  location: string;
  programs: string[];
}
