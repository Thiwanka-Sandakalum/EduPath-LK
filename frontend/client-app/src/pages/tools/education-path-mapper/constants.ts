import { ALCategory, University } from './types';

export const AL_SUBJECTS: Record<ALCategory, string[]> = {
  [ALCategory.ARTS]: ['History', 'Sinhala', 'Geography', 'Logic'],
  [ALCategory.MATHS]: ['Combined Maths', 'Physics', 'Chemistry'],
  [ALCategory.SCIENCE]: ['Biology', 'Chemistry', 'Physics'],
  [ALCategory.TECHNOLOGY]: ['ICT', 'Engineering Technology', 'Bio Systems Technology'],
  [ALCategory.COMMERCE]: ['Accounting', 'Economics', 'Business Studies'],
};

export const UNIVERSITIES: University[] = [
  {
    name: 'University of Colombo',
    type: 'Public',
    location: 'Colombo',
    programs: ['Computer Science', 'Medicine', 'Arts', 'Management'],
  },
  {
    name: 'University of Moratuwa',
    type: 'Public',
    location: 'Moratuwa',
    programs: ['Engineering', 'Architecture', 'IT', 'Quantity Surveying'],
  },
  {
    name: 'University of Sri Jayewardenepura',
    type: 'Public',
    location: 'Nugegoda',
    programs: ['Management', 'Applied Sciences', 'Medicine'],
  },
  {
    name: 'NSBM Green University',
    type: 'Private',
    location: 'Homagama',
    programs: ['Business', 'Computing', 'Engineering', 'Multimedia'],
  },
  {
    name: 'SLIIT',
    type: 'Private',
    location: 'Malabe',
    programs: ['Computing', 'Business', 'Engineering', 'Architecture'],
  },
  {
    name: 'University of Peradeniya',
    type: 'Public',
    location: 'Kandy',
    programs: ['Engineering', 'Medicine', 'Agriculture', 'Arts'],
  },
  {
    name: 'IIT (Informatics Institute of Technology)',
    type: 'Private',
    location: 'Colombo',
    programs: ['Software Engineering', 'Business Information Systems'],
  },
];
