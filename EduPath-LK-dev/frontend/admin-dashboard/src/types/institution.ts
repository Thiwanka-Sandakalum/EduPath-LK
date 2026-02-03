export interface Institution {
  id: string;
  name: string;
  type: 'Government' | 'Private' | 'Semi-Government' | 'Vocational';
  location: string;
  district: string;
  imageUrl: string;
  overview: string;
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  accreditation: string[];
  categories: string[]; // Added for tag badges
  rating: number;
  // New fields for comparison
  established?: string;
  studentCount?: string;
  feeRange?: string;
  facilities?: string[];
  admissionProcess?: string;
}
