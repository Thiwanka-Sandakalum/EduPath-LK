export interface Scholarship {
    id: string;
    title: string;
    provider: string;
    type: 'Local' | 'International';
    country: string;
    amount: string;
    deadline: string;
    field: string;
    eligibility: string[];
    benefits: string[];
    status: 'Open' | 'Closing Soon' | 'Closed' | 'Upcoming';
    level?: string;
    importantInfo?: string[];
    applicationSteps?: string[];
    applicationLink?: string;
}