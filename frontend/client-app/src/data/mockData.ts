import type { Institution } from '../types/institution';
import type { Course } from '../types/course';
import type { Scholarship } from '../types/scholarship';

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
  title: "Why Sri Lankan Students Struggle to Choose the Right University – and How Technology Can Fix It",
  summary: "University information is scattered and confusing. Here’s how a centralized digital platform can help students make better decisions.",
  content: `Choosing the right university is one of the most important decisions for Sri Lankan students, but it is also one of the most confusing. Information about universities, courses, entry requirements, scholarships, and loans is scattered across many websites, social media pages, and physical offices. Much of this information is outdated or unreliable, forcing students to rely on friends or unofficial online posts.

This situation is especially difficult for students in rural areas, where access to career guidance and counseling services is limited. As a result, many students miss suitable courses, scholarships, or admission deadlines, increasing stress and uncertainty during a critical stage of their education journey.

### 1. The Problem of Scattered Information
Students must visit multiple websites and sources to collect details about universities and courses. There is no single trusted place to find verified and up-to-date educational information in Sri Lanka.

### 2. Lack of Career Guidance
Many students do not have access to proper guidance counselors. They depend on friends, tuition teachers, or social media posts, which may not always provide accurate advice.

### 3. How Technology Can Solve This
A centralized digital platform can bring together verified details about government and private universities, available courses, fee structures, scholarships, and student loan schemes in one place.

### 4. Smart Tools for Smart Decisions
Features like Z-score eligibility calculators, admission deadline tracking, and AI-based career guidance can help students quickly understand their options and make confident decisions.

By using technology in this way, Sri Lankan students can save time, reduce confusion, and gain equal access to higher education opportunities regardless of their location.`,
  category: "Guidance",
  author: "Anjala Sewwandi",
  authorRole: "ICT Undergraduate | EduPath LK Team",
  authorAvatar: "https://ui-avatars.com/api/?name=Anjala+Sewwandi&background=0D8ABC&color=fff",
  readTime: "4 min read",
  image: "https://img.freepik.com/premium-photo/clever-arabian-indian-male-student-freelancer-stylish-casual-clothes-library_255667-47878.jpg",
  date: "Jan 02, 2026",
  tags: ["University Selection", "Career Guidance", "Sri Lanka", "Technology in Education"]
},

  {
  id: 2,
  title: "Understanding the Sri Lankan A/L Z-Score: A Simple Guide for Students",
  summary: "Not sure how the Z-score works? Here’s a clear explanation of how it’s calculated and why it matters for university selection.",
  content: `The Sri Lankan A/L Z-score is a standard method used to select students for government universities. Instead of looking only at raw marks, the Z-score shows how well a student has performed compared to other students in the same examination stream and year. This system ensures fairness because different subjects and streams can have different difficulty levels.

The University Grants Commission (UGC) uses the Z-score to rank students and decide eligibility for various university courses.

### 1. What Is a Z-Score?
A Z-score represents how a student’s performance compares to the national average of students in the same stream. It is not just your total marks, but your position among all candidates.

### 2. How Is It Calculated?
The Z-score is calculated using:
- Your subject marks
- The average (mean) marks of all students
- The standard deviation of those marks

In simple terms, it measures how far your results are above or below the national average.

### 3. Why Is It Important?
A higher Z-score means better performance compared to others. Students with higher Z-scores have more opportunities to enter competitive university degree programs.

### 4. How Students Can Use This Knowledge
Understanding the Z-score helps students:
- Choose suitable degree programs
- Set realistic targets
- Plan their education path with confidence

Knowing how the Z-score works removes confusion and helps students make smarter university choices.`,
  category: "Guidance",
  author: "Sonduruwani Wickramarathna",
  authorRole: "ICT Undergraduate | EduPath LK Team",
  authorAvatar: "https://ui-avatars.com/api/?name=Sonduruwani+Wickramarathna&background=0D8ABC&color=fff",
  readTime: "3 min read",
  image: "https://navi.com/blog/wp-content/uploads/2022/12/Z-Score.jpg",
  date: "Jan 10, 2026",
  tags: ["Z-Score", "A/L Students", "University Admission", "Sri Lanka"]
}
,
  {
  id: 3,
  title: "How to Choose the Right Degree After A/Ls in Sri Lanka",
  summary: "Finished A/Ls and feeling confused? Follow this simple step-by-step method to pick a degree that matches your interests, results, and career goals.",
  content: `Finishing your A/Ls is exciting… but also confusing. Suddenly, the big question hits: “What should I study next?” For many students in Sri Lanka, especially those in rural areas, finding reliable information about universities, courses, and career options can feel overwhelming.

Choosing the right degree isn’t just about marks or what your friends are picking. It’s about finding something that fits your interests, skills, and future goals.

### 1. Start With Yourself
Before you look at courses or universities, understand yourself.

Ask:
- Which subjects did I enjoy most?
- What am I naturally good at?
- Do I prefer people, numbers, or technology?

A degree that matches your interests makes studying easier and more enjoyable.

### 2. Check Your A/L Stream and Results
Your stream and results decide what you are eligible for.

- Science → Medicine, Engineering, IT, Science
- Commerce → Management, Accounting, Finance
- Arts → Humanities, Law, Education, Social Sciences

Choose something that fits both your strengths and eligibility.

### 3. Research All Your Options
Don’t focus only on popular degrees. Sri Lanka offers many fields:
- Tourism and Hospitality
- Agriculture and Environment
- Logistics and Supply Chain
- Biotechnology
- Education and Teaching

Compare universities, courses, and scholarships using trusted platforms like EduPath.lk.

### 4. Think About Career Opportunities
Ask:
- Are there jobs in this field in Sri Lanka?
- Is this career growing?
- Can I work abroad?

Fields like IT, healthcare, engineering, education, and tourism have strong demand.

### 5. Government vs Private Universities
Both options are valid.

- Government: Low cost, high competition
- Private: Higher cost, easier entry, international pathways

Explore all options before deciding.

### 6. Consider Practical Factors
Think about:
- Course cost
- Location
- Duration
- Scholarships and loans

These factors are very important, especially for rural students.

### 7. Seek Advice — But Decide for Yourself
Listen to teachers, parents, and seniors. But remember, this is your future.

### 8. Avoid Common Mistakes
Avoid:
- Following friends blindly
- Choosing only for money or status
- Ignoring career demand
- Missing alternative pathways

Take your time. Research well.

### Final Thoughts
Choosing a degree after A/Ls doesn’t have to be stressful. Focus on your interests, strengths, and future goals. With the right information and planning, you can make a smart decision that builds a strong future.`,
  category: "Guidance",
  author: "Anjala Sewwandi",
  authorRole: "ICT Undergraduate | EduPath LK Team",
  authorAvatar: "https://ui-avatars.com/api/?name=Anjala+Sewwandi&background=0D8ABC&color=fff",
  readTime: "6 min read",
  image: "https://th.bing.com/th/id/R.2092ab1b1060e5ceca61d8f5009ad004?rik=XcySBw9qDaY49A&pid=ImgRaw&r=0",
  date: "Jan 20, 2026",
  tags: ["Degree Selection", "A/L Students", "Career Planning", "Sri Lanka"]
}
,
  {
  id: 4,
  title: "How Rural Students Can Access Higher Education Opportunities in Sri Lanka",
  summary: "Living far from cities shouldn’t limit your dreams. Learn how rural students can find universities, scholarships, and guidance using the right tools.",
  content: `For many students in rural Sri Lanka, finishing A/Ls is just the beginning of a new challenge. Even with good results, finding reliable information about universities, courses, scholarships, and career paths can be difficult. Limited guidance, fewer resources, and low awareness often make the process stressful.

Today, this gap can be reduced with the help of technology and centralized platforms.

### 1. Understand Your Goals and Interests
Start with yourself.

Ask:
- Which subjects do I enjoy?
- What am I naturally good at?
- What career do I want?

Knowing this helps you focus on suitable degree programs.

### 2. Use Centralized Platforms
Instead of searching many places, use trusted platforms like EduPath.lk that provide:
- University and institute details
- Degree programs and entry requirements
- Scholarships, bursaries, and education loans
- Course comparisons and career guidance

This saves time, travel, and confusion.

### 3. Explore Scholarships and Financial Support
Financial problems should not stop your education. Look for:
- Government scholarships (Mahapola)
- Bursaries for underprivileged students
- Education loans
- Private and international scholarships

### 4. Plan for Distance and Location
If you live far from cities:
- Check for hostel facilities
- Consider online or blended learning options
- Compare travel and living costs

### 5. Seek Guidance and Mentorship
You can still get guidance by:
- Talking to teachers
- Connecting with seniors online
- Using reliable online resources

### 6. Stay Motivated and Persistent
Rural location is a challenge, but not a limitation. With proper planning and the right information, you can achieve the same opportunities as city students.

### Final Thoughts
Rural students in Sri Lanka face extra difficulties, but these can be overcome. With the right tools, research, and determination, higher education opportunities are within reach for everyone.`,
  category: "Guidance",
  author: "Lakshani",
  authorRole: "ICT Undergraduate | EduPath LK Team",
  authorAvatar: "https://ui-avatars.com/api/?name=Lakshani&background=0D8ABC&color=fff",
  readTime: "5 min read",
  image: "https://th.bing.com/th/id/R.05ddc62ca200d7a77412a4ca8ddb6507?rik=TAzX1UW9fdVfCQ&pid=ImgRaw&r=0",
  date: "Jan 25, 2026",
  tags: ["Rural Students", "Higher Education", "Scholarships", "Sri Lanka"]
},
{
  id: 5,
  title: "Private vs Government Universities in Sri Lanka: Which One Is Right for You?",
  summary: "Not sure whether to choose a government or private university? Here’s a clear comparison to help you decide based on cost, entry, and career goals.",
  content: `After finishing your A/Ls, one of the biggest decisions you’ll face is choosing where to study next. In Sri Lanka, students often wonder: “Should I go to a government university or a private university?” Both options have their advantages and challenges. The right choice depends on your goals, budget, results, and future plans.

Let’s break it down so you can make an informed decision.

### 1. Government Universities: Low Cost, High Competition
Government universities in Sri Lanka are funded by the state. Entry is mainly based on A/L Z-scores and district ranks.

Advantages
- Low tuition fees: Most courses are free or very affordable
- Recognized degrees: Widely respected in Sri Lanka and abroad
- Strong academic programs: Many offer research opportunities and established faculties

Challenges
- Limited seats: Only a small number of students are accepted each year
- High competition: Admission is extremely competitive
- Location constraints: Some students need to relocate to major cities

### 2. Private Universities: Flexible Entry, Higher Cost
Private universities are funded through tuition fees. Some are local, and others are affiliated with international universities.

Advantages
- Easier entry: Less competitive than government universities
- International programs: Many offer degrees recognized abroad
- Modern facilities: Up-to-date labs, libraries, and student services

Challenges
- Higher tuition fees: Can be expensive, especially for international degrees
- Varied recognition: Not all private degrees are valued equally
- Limited campus culture: Some institutions have fewer clubs and activities

### 3. How to Choose What’s Best for You
Consider these points:
- Budget: Can you afford private fees? Are scholarships or loans available?
- Results: Do your A/L results meet government university cutoffs?
- Career goals: Do you prefer a local path or an international program?
- Location: Are you ready to relocate, or do you need a nearby option?

### 4. How EduPath.lk Helps
Choosing between private and government universities can be confusing. EduPath.lk makes it easier by:
- Listing government and private universities in one place
- Comparing courses, fees, and entry requirements
- Showing scholarship and financial support options
- Helping students plan based on career goals

### Final Thoughts
There’s no one-size-fits-all answer. Government universities are ideal if you want a low-cost, respected degree and can compete academically. Private universities are a good option if you need flexibility, international programs, or faster entry.

The right university is the one that fits your goals, your budget, and your future plans.`,
  category: "Guidance",
  author: "Sithumini Vibhasha",
  authorRole: "ICT Undergraduate | EduPath LK Team",
  authorAvatar: "https://ui-avatars.com/api/?name=Sithumini+Vibhasha&background=0D8ABC&color=fff",
  readTime: "6 min read",
  image: "https://cdn.unischolarz.com/blog/wp-content/uploads/2024/01/20105850/PRIVATE-VS-PUBLIC.webp",
  date: "Feb 01, 2026",
  tags: ["Private Universities", "Government Universities", "Higher Education", "Sri Lanka"]
},
{
  id: 6,
  title: "Why Students Need Smart Digital Platforms to Plan Their Education",
  summary: "From scattered info to smart guidance — see how digital platforms help students choose courses, track deadlines, and make confident decisions.",
  content: `For many students, deciding what to study and where to study is more confusing than the exams themselves. Universities, private institutes, scholarships, and education loans all come with different requirements, deadlines, and eligibility criteria. The information exists — but not always in a way that supports confident decisions.

Smart digital platforms are changing this experience.

### 1. The Traditional Approach Is Broken
Many students still:
- Search random websites for details
- Rely on social media posts
- Ask friends or seniors for advice
- Manually track deadlines

This often leads to outdated info, missed opportunities, and late applications.

### 2. From Static Websites to Intelligent Systems
Modern platforms are not just course lists. They provide:
- Searchable databases of institutions and programs
- Filters based on results and interests
- Real-time updates on admissions and scholarships

Students are guided step by step instead of reading endless pages.

### 3. Eligibility-Based Guidance Reduces Uncertainty
A common problem is not knowing what you qualify for. Smart systems:
- Accept academic performance details
- Apply eligibility rules automatically
- Show only relevant options

This saves time and reduces disappointment.

### 4. AI as a First Line of Career Guidance
Not every student has access to counselors. AI chat tools can:
- Answer questions instantly
- Explain courses and career paths simply
- Suggest options based on interests

AI becomes a helpful first step for guidance.

### 5. Automation Keeps Information Accurate
Education data changes often. Modern platforms use:
- Automated data collection
- Admin verification dashboards
- Cloud databases

This ensures students always see up-to-date information.

### 6. Accessibility for Everyone
A good platform must support:
- Rural students
- First-time applicants
- Parents helping their children

Mobile-friendly design makes guidance available anytime, anywhere.

### Final Thoughts
Education planning should reduce stress, not create it. With structured data, intelligent tools, AI support, and automation, digital platforms make education guidance smarter, fairer, and more accessible for all students.`,
  category: "Guidance",
  author: "Sonduruwani Wickramarathna",
  authorRole: "ICT Undergraduate | EduPath LK Team",
  authorAvatar: "https://ui-avatars.com/api/?name=Sonduruwani+Wickramarathna&background=0D8ABC&color=fff",
  readTime: "5 min read",
  image: "https://www.orhp.com/hubfs/ChatGPT_1200x628.jpg",
  date: "Feb 02, 2026",
  tags: ["Digital Education", "Career Guidance", "Students", "Sri Lanka"]
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
