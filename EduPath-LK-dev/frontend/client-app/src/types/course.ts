export interface Course {
  id: string;
  institutionId: string;
  title: string;
  level: 'Undergraduate' | 'Postgraduate' | 'Diploma' | 'Certificate';
  duration: string;
  fees: string;
  deadline: string;
  entryRequirements: string;
  description: string;
  whatYouLearn: string[];
  careerOpportunities: string[];
  field: 'Engineering' | 'IT' | 'Business' | 'Medicine' | 'Arts' | 'Science';
}
