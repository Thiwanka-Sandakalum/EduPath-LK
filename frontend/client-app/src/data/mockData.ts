
import { Institution, Course, Scholarship } from '../types';

export interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  readTime: string;
  image: string;
  date: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "How to Choose the Right Degree for You",
    summary: "Confused between Engineering and IT? Here is a step-by-step guide to finding your passion.",
    content: `Choosing a degree is one of the most significant decisions you'll make in your early life. It's not just about what you'll study for the next 3 or 4 years; it's about the foundation of your career.

In Sri Lanka, the pressure often mounts around A/L results. Many students feel pushed towards traditional paths like Medicine or Engineering simply because their Z-score allows it. But is that where your passion lies?

### 1. Identify Your Interests
Start by listing subjects you genuinely enjoyed in school. Did you love the logic of Mathematics? Or the creativity in Arts? Understanding your core interests is the first step.

### 2. Research the Industry
Don't just look at the degree; look at the job market. The IT sector in Sri Lanka is booming, with high demand for software engineers and data scientists. Conversely, fields like Civil Engineering offer stability and physical impact on the country's infrastructure.

### 3. Talk to Professionals
Reach out to seniors or mentors through platforms like LinkedIn. Ask them about their day-to-day work. Often, the reality of a job is quite different from the classroom theory.`,
    category: "Guidance",
    author: "Dr. K. Perera",
    authorRole: "Education Consultant",
    authorAvatar: "https://ui-avatars.com/api/?name=K+Perera&background=0D8ABC&color=fff",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    date: "Oct 24, 2025",
    tags: ["Higher Education", "Career Advice", "Sri Lanka"]
  },
  {
    id: 2,
    title: "Top 5 Scholarships for 2025",
    summary: "Don't miss these fully funded opportunities for undergraduate studies in Sri Lanka and abroad.",
    content: "Scholarships can turn dreams into reality. For many Sri Lankan students, the cost of higher education—especially international degrees—can be prohibitive. Here are the top 5 opportunities to watch in 2025...",
    category: "Scholarships",
    author: "Sarah J.",
    authorRole: "Scholarship Researcher",
    authorAvatar: "https://ui-avatars.com/api/?name=Sarah+J&background=random",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1627556592933-ffe99c1cd9eb?q=80&w=800&auto=format&fit=crop",
    date: "Oct 22, 2025",
    tags: ["Funding", "Abroad Studies", "UGC"]
  },
  {
    id: 3,
    title: "The Future of IT Jobs in Sri Lanka",
    summary: "An analysis of the growing tech industry and what skills are in highest demand right now.",
    content: "The tech landscape is evolving rapidly. From AI to Cloud Computing, Sri Lankan graduates have a unique opportunity to work with global giants from the comfort of their home...",
    category: "Career",
    author: "M. Dilshan",
    authorRole: "Tech Recruiter",
    authorAvatar: "https://ui-avatars.com/api/?name=M+Dilshan&background=random",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
    date: "Oct 18, 2025",
    tags: ["Technology", "Jobs", "Economy"]
  },
  {
    id: 4,
    title: "A/L Z-Score Explained",
    summary: "Everything you need to know about how the UGC calculates your university admission score.",
    content: "Z-score calculations can seem like black magic to the uninitiated. This guide breaks down the standard deviation and mean score logic used by the University Grants Commission...",
    category: "Guidance",
    author: "Prof. S. Silva",
    authorRole: "University Professor",
    authorAvatar: "https://ui-avatars.com/api/?name=S+Silva&background=random",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    date: "Oct 15, 2025",
    tags: ["Exams", "Admissions", "Statistics"]
  }
];

export const institutions: Institution[] = [
  {
    id: 'uni-colombo',
    name: 'University of Colombo',
    type: 'Government',
    location: 'Colombo 03',
    district: 'Colombo',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop',
    overview: 'The oldest university in Sri Lanka, offering a wide range of undergraduate and postgraduate programs with a legacy of academic excellence.',
    contact: { phone: '+94 11 200 0000', email: 'info@cmb.ac.lk', website: 'cmb.ac.lk' },
    accreditation: ['UGC', 'Commonwealth Universities'],
    categories: ['Medicine', 'Law', 'Science', 'Arts', 'Management'],
    rating: 4.8,
    established: '1921',
    studentCount: '11,000+',
    feeRange: 'Free (State Funded)',
    facilities: ['Library', 'Research Labs', 'Sports Complex', 'Medical Center', 'Hostels'],
    admissionProcess: 'UGC Z-Score System'
  },
  {
    id: 'uni-moratuwa',
    name: 'University of Moratuwa',
    type: 'Government',
    location: 'Moratuwa',
    district: 'Colombo',
    imageUrl: 'https://images.unsplash.com/photo-1592280771800-bcf9de231e58?q=80&w=1000&auto=format&fit=crop',
    overview: 'Sri Lanka’s leading technological university, renowned for its Engineering, Architecture, and Information Technology degree programs.',
    contact: { phone: '+94 11 265 0301', email: 'info@mrt.ac.lk', website: 'mrt.ac.lk' },
    accreditation: ['UGC', 'IESL', 'RIBA'],
    categories: ['Engineering', 'IT', 'Architecture', 'Quantity Surveying'],
    rating: 4.9,
    established: '1972',
    studentCount: '9,500+',
    feeRange: 'Free (State Funded)',
    facilities: ['Engineering Labs', 'IT Parks', 'Auditorium', 'Gymnasium', 'Workshops'],
    admissionProcess: 'UGC Z-Score & Aptitude Test'
  },
  {
    id: 'sliit',
    name: 'SLIIT',
    type: 'Private',
    location: 'Malabe',
    district: 'Colombo',
    imageUrl: 'https://images.unsplash.com/photo-1555547844-3d12052d308f?q=80&w=1000&auto=format&fit=crop',
    overview: 'A leading non-state higher education institute in Sri Lanka, specializing in IT, Business, and Engineering with modern facilities.',
    contact: { phone: '+94 11 754 4801', email: 'info@sliit.lk', website: 'sliit.lk' },
    accreditation: ['UGC', 'IET', 'Engineers Australia'],
    categories: ['IT', 'Engineering', 'Business', 'Humanities'],
    rating: 4.6,
    established: '1999',
    studentCount: '15,000+',
    feeRange: 'LKR 800k - 2.5M',
    facilities: ['Modern Lecture Halls', 'PC Labs', 'Swimming Pool', 'Student Lounge', 'Shuttle Service'],
    admissionProcess: 'Direct Application & Interview'
  },
  {
    id: 'nsbm-green',
    name: 'NSBM Green University',
    type: 'Private',
    location: 'Homagama',
    district: 'Colombo',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop',
    overview: 'South Asia’s first green university, offering world-class infrastructure and a unique campus experience for undergraduates.',
    contact: { phone: '+94 11 544 5000', email: 'inquiries@nsbm.ac.lk', website: 'nsbm.ac.lk' },
    accreditation: ['UGC', 'Plymouth University (UK)'],
    categories: ['Business', 'IT', 'Engineering', 'Science'],
    rating: 4.7,
    established: '2016',
    studentCount: '12,000+',
    feeRange: 'LKR 1.2M - 3M',
    facilities: ['Green Campus', 'Swimming Pool', 'Open Air Theatre', 'Recreation Area', 'Library'],
    admissionProcess: 'A/L Results & Direct Entry'
  },
  {
    id: 'iit',
    name: 'IIT',
    type: 'Private',
    location: 'Colombo 06',
    district: 'Colombo',
    imageUrl: 'https://images.unsplash.com/photo-1497294815431-9365093b7331?q=80&w=1000&auto=format&fit=crop',
    overview: 'A pioneer in private higher education in Sri Lanka, known for producing highly employable graduates in the IT and Business sectors.',
    contact: { phone: '+94 11 236 0212', email: 'admissions@iit.ac.lk', website: 'iit.ac.lk' },
    accreditation: ['UGC', 'University of Westminster (UK)'],
    categories: ['IT', 'Software Engineering', 'Business', 'Data Science'],
    rating: 4.5,
    established: '1990',
    studentCount: '5,000+',
    feeRange: 'LKR 1.5M - 3.5M',
    facilities: ['Computing Labs', 'Lecture Rooms', 'Study Areas', 'Cafeteria'],
    admissionProcess: 'Application & Selection Interview'
  },
  {
    id: 'vta',
    name: 'Vocational Training Authority',
    type: 'Vocational',
    location: 'Colombo',
    district: 'Colombo',
    imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?q=80&w=1000&auto=format&fit=crop',
    overview: 'The premier national body for vocational training, providing skills development for youth across various technical trades.',
    contact: { phone: '+94 11 258 1234', email: 'info@vta.lk', website: 'vta.lk' },
    accreditation: ['TVEC'],
    categories: ['Vocational', 'Technical', 'Hospitality', 'Automobile'],
    rating: 4.3,
    established: '1995',
    studentCount: '30,000+ (Islandwide)',
    feeRange: 'Free or Low Cost',
    facilities: ['Workshops', 'Training Centers', 'Career Guidance Units'],
    admissionProcess: 'Open Enrollment / NVQ System'
  },
  {
    id: 'uni-peradeniya',
    name: 'University of Peradeniya',
    type: 'Government',
    location: 'Peradeniya',
    district: 'Kandy',
    imageUrl: 'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?q=80&w=1000&auto=format&fit=crop',
    overview: 'Renowned for its natural beauty and academic excellence, specifically in Agriculture, Engineering, Medicine, and Dental Sciences.',
    contact: { phone: '+94 81 239 2000', email: 'info@pdn.ac.lk', website: 'pdn.ac.lk' },
    accreditation: ['UGC'],
    categories: ['Medicine', 'Agriculture', 'Engineering', 'Arts', 'Science'],
    rating: 4.9,
    established: '1942',
    studentCount: '12,500+',
    feeRange: 'Free (State Funded)',
    facilities: ['Botanical Garden', 'Health Center', 'Senate Building', 'Hostels', 'Sports Ground'],
    admissionProcess: 'UGC Z-Score System'
  },
  {
    id: 'apiit',
    name: 'APIIT',
    type: 'Private',
    location: 'Colombo 02',
    district: 'Colombo',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop',
    overview: 'A leading provider of higher education in the Asia Pacific region, offering degrees in Law, Computing, and Business.',
    contact: { phone: '+94 11 767 5100', email: 'info@apiit.lk', website: 'apiit.lk' },
    accreditation: ['UGC', 'Staffordshire University (UK)'],
    categories: ['Law', 'IT', 'Business', 'Management'],
    rating: 4.4,
    established: '1999',
    studentCount: '4,000+',
    feeRange: 'LKR 2M - 4M',
    facilities: ['Moot Court', 'IT Labs', 'Library', 'Auditorium'],
    admissionProcess: 'Direct Application'
  }
];

export const courses: Course[] = [
  {
    id: 'bsc-cs-colombo',
    institutionId: 'uni-colombo',
    title: 'BSc Computer Science',
    level: 'Undergraduate',
    duration: '3-4 Years',
    fees: 'Free (Government funded)',
    deadline: '2024-09-30',
    entryRequirements: 'G.C.E A/L Physical Science Stream',
    description: 'A rigorous program covering the foundations of computing, algorithms, and system design at Sri Lanka\'s oldest university.',
    whatYouLearn: ['Algorithms', 'Software Engineering', 'AI', 'Database Systems'],
    careerOpportunities: ['Software Engineer', 'Data Scientist', 'System Architect'],
    field: 'IT'
  },
  {
    id: 'bsc-eng-civil-mrt',
    institutionId: 'uni-moratuwa',
    title: 'BSc Engineering (Civil)',
    level: 'Undergraduate',
    duration: '4 Years',
    fees: 'Free (Government funded)',
    deadline: '2024-09-01',
    entryRequirements: 'G.C.E A/L Physical Science Stream',
    description: 'A premier engineering degree focusing on structural analysis, construction management, and sustainable development.',
    whatYouLearn: ['Structural Analysis', 'Fluid Mechanics', 'Surveying', 'Geotechnics'],
    careerOpportunities: ['Civil Engineer', 'Structural Engineer', 'Project Manager'],
    field: 'Engineering'
  },
  {
    id: 'bsc-se-sliit',
    institutionId: 'sliit',
    title: 'BSc Software Engineering',
    level: 'Undergraduate',
    duration: '4 Years',
    fees: 'LKR 850,000 per year',
    deadline: '2024-10-15',
    entryRequirements: '3 Passes in G.C.E A/L (Any Stream)',
    description: 'Specialized degree designed to produce industry-ready software engineers with practical experience in modern technologies.',
    whatYouLearn: ['Full Stack Dev', 'Cloud Computing', 'DevOps', 'Mobile App Dev'],
    careerOpportunities: ['Software Engineer', 'Full Stack Developer', 'QA Engineer'],
    field: 'IT'
  },
  {
    id: 'bba-mgmt-nsbm',
    institutionId: 'nsbm-green',
    title: 'BBA Business Management',
    level: 'Undergraduate',
    duration: '3 Years',
    fees: 'LKR 600,000 per year',
    deadline: '2024-08-30',
    entryRequirements: '3 Passes in G.C.E A/L (Any Stream)',
    description: 'Comprehensive business program covering marketing, finance, HR, and strategic management in a global context.',
    whatYouLearn: ['Marketing Strategy', 'Financial Accounting', 'HR Management', 'Business Law'],
    careerOpportunities: ['Business Analyst', 'Marketing Executive', 'HR Manager'],
    field: 'Business'
  },
  {
    id: 'mbbs-pera',
    institutionId: 'uni-peradeniya',
    title: 'MBBS Medicine',
    level: 'Undergraduate',
    duration: '5 Years',
    fees: 'Free (Government funded)',
    deadline: '2024-09-15',
    entryRequirements: 'G.C.E A/L Bio Science Stream (Z-Score Merit)',
    description: 'One of the most prestigious medical degrees in South Asia, offering clinical training at teaching hospitals.',
    whatYouLearn: ['Anatomy', 'Physiology', 'Pathology', 'Clinical Medicine', 'Surgery'],
    careerOpportunities: ['Medical Doctor', 'Surgeon', 'Researcher'],
    field: 'Medicine'
  },
  {
    id: 'nvq-it-vta',
    institutionId: 'vta',
    title: 'NVQ Level 5 IT',
    level: 'Diploma',
    duration: '18 Months',
    fees: 'LKR 45,000 (Total)',
    deadline: '2024-11-01',
    entryRequirements: 'NVQ Level 4 or G.C.E A/L',
    description: 'Advanced national vocational qualification in Information and Communication Technology.',
    whatYouLearn: ['Network Admin', 'Hardware Maintenance', 'Web Development', 'ICT Management'],
    careerOpportunities: ['IT Technician', 'Network Assistant', 'IT Support'],
    field: 'IT'
  }
];

export const scholarships: Scholarship[] = [
  {
    id: 'gov-stem-2024',
    title: 'Presidential Scholarship for STEM',
    provider: 'Government of Sri Lanka',
    type: 'Local',
    country: 'Sri Lanka',
    amount: 'LKR 50,000 / month',
    deadline: '2024-12-31',
    field: 'Science',
    eligibility: ['Z-score > 2.0', 'Family income < LKR 500k/year', 'Age under 25'],
    benefits: ['Monthly Stipend of LKR 50,000', 'One-time Laptop Allowance', 'Exam fee coverage'],
    status: 'Open',
    level: 'Undergraduate',
    importantInfo: ['Applicants must be citizens of Sri Lanka', 'Documents must be certified by a JP'],
    applicationSteps: ['Register on the online portal', 'Fill out the application form', 'Upload certified documents', 'Submit and download acknowledgement', 'Attend the interview if shortlisted'],
    applicationLink: 'https://www.presidentsoffice.gov.lk/'
  },
  {
    id: 'nsbm-merit',
    title: 'NSBM Merit Based Scholarship',
    provider: 'NSBM Green University',
    type: 'Local',
    country: 'Sri Lanka',
    amount: '50% Tuition Waiver',
    deadline: '2024-10-01',
    field: 'IT',
    eligibility: ['3 As in A/L', 'Sports Achievements at National Level', 'Good conduct certificate'],
    benefits: ['50% Tuition fee reduction', 'Access to research grants', 'Priority internship placement'],
    status: 'Closing Soon',
    level: 'Undergraduate',
    importantInfo: ['Scholarship renewable based on GPA', 'Must maintain 80% attendance'],
    applicationSteps: ['Apply for the degree program', 'Submit the scholarship form with results', 'Interview with the Dean'],
    applicationLink: 'https://www.nsbm.ac.lk/'
  },
  {
    id: 'chevening-2025',
    title: 'Chevening Scholarship',
    provider: 'UK Government',
    type: 'International',
    country: 'United Kingdom',
    amount: 'Full Funding',
    deadline: '2024-11-05',
    field: 'All Fields',
    eligibility: ['Undergraduate degree', '2 years work experience', 'Return to home country for 2 years'],
    benefits: ['Full tuition fees', 'Monthly living allowance', 'Return economy flight to UK'],
    status: 'Open',
    level: 'Postgraduate',
    importantInfo: ['English language requirement must be met', 'Unconditional offer from UK university required by July'],
    applicationSteps: ['Submit online application', 'References submission', 'Interview at British High Commission'],
    applicationLink: 'https://www.chevening.org/scholarship/sri-lanka/'
  },
  {
    id: 'monash-intl',
    title: 'Monash International Merit Scholarship',
    provider: 'Monash University',
    type: 'International',
    country: 'Australia',
    amount: 'AUD 10,000 / year',
    deadline: '2024-10-15',
    field: 'Business',
    eligibility: ['High academic achievement', 'International student status', 'Not a recipient of other scholarships'],
    benefits: ['Tuition fee deduction of AUD 10,000 per year'],
    status: 'Upcoming',
    level: 'Undergraduate',
    importantInfo: ['Based on academic merit', 'No separate application required'],
    applicationSteps: ['Apply for a course at Monash', 'Automatically assessed for scholarship'],
    applicationLink: 'https://www.monash.edu/study/fees-scholarships/scholarships'
  },
  {
    id: 'adbi-japan',
    title: 'ADB-Japan Scholarship Program',
    provider: 'Asian Development Bank',
    type: 'International',
    country: 'Japan',
    amount: 'Full Scholarship',
    deadline: '2024-09-01',
    field: 'Economics',
    eligibility: ['Bachelor degree', '2 years work experience', 'Age under 35'],
    benefits: ['Full Tuition', 'Monthly Subsistence', 'Travel expenses', 'Books and instructional materials'],
    status: 'Closed',
    level: 'Postgraduate',
    importantInfo: ['Must return to home country', 'Commit to development of home country'],
    applicationSteps: ['Request info from partner institution', 'Send application to institution', 'Institution ranks and sends to ADB'],
    applicationLink: 'https://www.adb.org/work-with-us/careers/japan-scholarship-program'
  }
];
